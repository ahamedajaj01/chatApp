import json
import logging
logger = logging.getLogger(__name__)
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Conversation, Message, ConversationParticipant, MessageDeletion
from .serializers import MessageSerializer
from django.core.exceptions import PermissionDenied

User = get_user_model()

class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for real-time chat messaging.

    URL: ws://localhost:8000/ws/chat/<conversation_id>/
    """
    async def connect(self):
        """ Handle websocket connection """
        self.room_name = self.scope['url_route']['kwargs'].get('room_name')
        if not self.room_name:
            await self.close(code=4000)
            return
        self.group_name=f'chat_{self.room_name}'
        self.user = self.scope['user']
      

         # Reject anonymous users
        if self.user.is_anonymous:
            await self.close(code=4001)
            return
        
        # Verify user is participant in this conversation
      # Resolve room_name -> Conversation and check permissions (handles 'global' too)
        try:
            self.conversation = await self.get_conversation_for_room(self.room_name, self.user)
        except PermissionDenied:
            await self.close(code=4003)
            return
        except Exception:
            await self.close(code=4000)
            return
        
        #join room group
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        await self.accept()

        # Send connection confirmation
        await self.send(text_data=json.dumps({
            'type':'connection_established',
            'message':'Connected to chat'
        }))
    
    async def disconnect(self, close_code):
        """Handle WebSocket disconnection"""
        # leave room group
        if hasattr(self, 'group_name'):
            await self.channel_layer.group_discard(
                self.group_name,
                self.channel_name
            )
    
    async def receive(self, text_data):
        """
        Receive message from WebSocket client
        
        Expected format:
        {
            "type": "chat_message",
            "content": "Hello world"
        }
        
        OR
        
        {
            "type": "delete_message",
            "message_id": 123
        }
        
        OR
        
        {
            "type": "typing",
            "is_typing": true
        }
        """
        try:
            data = json.loads(text_data)
            message_type = data.get('type')

            if message_type == "chat_message":
                await self.handle_chat_message(data)
            elif message_type == "delete_message":
                await self.handle_delete_message(data)
            elif message_type == "typing":
                await self.handle_typing(data)
            else:
                await self.send_error("unknown message type")
        except json.JSONDecodeError:
            await self.send_error("Invalid json")
        except Exception:
            logger.exception("Unexpected error in receive")
            await self.send_error('Server Error')

    async def handle_chat_message(self, data):
        """Handle incoming chat message"""
        print(f"DEBUG: consumers.py received message: {data}")
        content = data.get('content', '').strip()

        if not content:
            await self.send_error("Message content cannot be empty")
            return
        if len(content) > 5000:
            await self.send_error("Message content exceeds maximum length")
            return
        
        # Save message to database
        message = await self.save_message(content)

        if message:
            print(f"DEBUG: Message saved. Broadcasting to group {self.group_name}")
            # Broadcast serialized message to group
            await self.channel_layer.group_send(
                self.group_name,
                {
                    'type': 'chat_message_broadcast',
                    'message': message,
                }
            )

    async def handle_delete_message(self, data):
        """Handle message deletion"""
        message_id = data.get('message_id')
        if not message_id:
            await self.send_error("message_id is required for deletion")
            return
        
        success = await self.delete_message(message_id)
        if success:
             # Notify only this user (not broadcast)
            await self.send(
                text_data=json.dumps({
                    'type': 'message_deleted',
                    'message_id': message_id,
                })
            )
        else:
            await self.send_error("Failed to delete message")
    
    async def handle_typing(self, data):
        """Handle typing indicator"""
        is_typing = data.get('is_typing', False)
        # Broadcast typing status to room group
        await self.channel_layer.group_send(
            self.group_name,
            {
                'type': 'typing_indicator',
                'user_id': self.user.id,
                'username': self.user.username,
                'is_typing': is_typing,
            }
        )
    
    async def chat_message_broadcast(self, event):
        """Send message to WebSocket (called by group_send)"""
        await self.send(text_data=json.dumps({
            'type': 'new_message',
            'message': event['message'],
        }))

    async def typing_indicator(self, event):
        """Send typing indicator to WebSocket (called by group_send)"""
        # Avoid typing indicator who typing
        if event['user_id'] != self.user.id:
            await self.send(text_data=json.dumps({
                'type': 'typing_indicator',
                'user_id': event['user_id'],
                'username': event['username'],
                'is_typing': event['is_typing'],
            }))

    async def send_error(self, error_message):
        """Send error message to WebSocket/client"""
        await self.send(text_data=json.dumps({
            'type': 'error',
            'message': error_message,
        }))
    
    # Database operations wrapped with database_sync_to_async
    @database_sync_to_async
    def get_conversation_for_room(self, room_name, user):
        """
        Map room_name (slug) -> Conversation object.
        Accepts:
        - 'global' -> returns (or creates) the global Conversation
        - any slug for private conversations -> returns Conversation after permission check
        Raises PermissionDenied if user should not join.
        """   
        # Try to find  conversation by slug
        try:
            convo = Conversation.objects.get(slug=room_name)
        except Conversation.DoesNotExist:
            # If asked for global, create if not exist
            if room_name == Conversation.TYPE_GLOBAL or room_name == "global":
                convo, _ = Conversation.objects.get_or_create(
                    slug=Conversation.TYPE_GLOBAL,
                    defaults={'type': Conversation.TYPE_GLOBAL}
                )
            else:
                # Unknown slug
                raise PermissionDenied("Conversation does not exist")
            
        # If this is a global conversation, anyone authenticated may join
        if convo.type == Conversation.TYPE_GLOBAL:
            return convo
        
        # Otherwise must be private -> verify membership
        if  convo.type == Conversation.TYPE_PRIVATE:
            if not ConversationParticipant.objects.filter(conversation=convo, user=user).exists():
                raise PermissionDenied("Not a participant")
            return convo
        
        # fallback deny
        raise PermissionDenied("Cannot join room")
    
    @database_sync_to_async
    def save_message(self,content):
        """
        Save message for self.conversation (set during connect) and return serialized data.
        """
        try:
            conversation = self.conversation
            message = Message.objects.create(
                conversation=conversation,
                sender = self.user,
                content=content,
            )
            # Update unread for private conversations only
            try:
                if conversation.type == Conversation.TYPE_PRIVATE:
                    from django.db import models
                    ConversationParticipant.objects.filter(conversation=conversation).exclude(user=self.user).update(
                        unread_count=models.F('unread_count') + 1
                    )
            except Exception:
            # don't crash on unread_count errors
                pass

            serializer = MessageSerializer(message)
            return serializer.data
        except Exception as e:
            logger.exception("Error saving message")
            return None

        
