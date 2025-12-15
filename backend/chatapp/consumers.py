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
        self.conversation_id = self.scope['url_route']['kwargs'].get('conversation_id')
        if not self.conversation_id:
            print("DEBUG: Connection rejected - No conversation_id")
            await self.close(code=4000)
            return
        
        # Determine if conversation_id is an int (ID) or string (slug)
        self.is_id = False
        try:
            self.conversation_id = int(self.conversation_id)
            self.is_id = True
        except (ValueError, TypeError):
            self.is_id = False

        except (ValueError, TypeError):
            self.is_id = False

        self.user = self.scope['user']
      

         # Reject anonymous users
        if self.user.is_anonymous:
            print(f"DEBUG: Connection rejected - Anonymous user. Scope user: {self.user}")
            await self.close(code=4001)
            return
        
        # Verify user is participant in this conversation
      # Resolve room_name -> Conversation and check permissions (handles 'global' too)
        try:
            self.conversation = await self.get_conversation_for_user(self.conversation_id, self.user)
        except PermissionDenied as e:
            print(f"DEBUG: Connection rejected - PermissionDenied: {e}")
            await self.close(code=4003)
            return
        except Exception as e:
            print(f"DEBUG: Connection rejected - Unexpected error: {e}")
            await self.close(code=4000)
            return
        
        # Join room group
        self.group_name = f"chat_{self.conversation_id}"
        await self.channel_layer.group_add(
            self.group_name,
            self.channel_name
        )
        
        await self.accept()
        print(f"DEBUG: Connection ACCEPTED for user {self.user} in conversation {self.conversation_id}")
        print(f"DEBUG: Joined group {self.group_name}")

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
    def get_conversation_for_user(self,conversation_id, user):
        """
        Map room_name (slug) -> Conversation object.
        Accepts:
        - 'global' -> returns (or creates) the global Conversation
        - any slug for private conversations -> returns Conversation after permission check
        Raises PermissionDenied if user should not join.
        """   
        # Try to find conversation by ID or slug
        try:
            if isinstance(conversation_id, int):
                convo = Conversation.objects.get(id=conversation_id)
            else:
                convo = Conversation.objects.get(slug=conversation_id)
        except Conversation.DoesNotExist:
            # If not found by slug, maybe it's a private chat slug pattern that needs creation or specific handling?
            # For now, assuming it must exist.
            raise PermissionDenied("Conversation does not exist")
     
        # must be private -> verify membership
        if convo.type == Conversation.TYPE_PRIVATE:
            if not ConversationParticipant.objects.filter(conversation=convo, user=user).exists():
                raise PermissionDenied("Not a participant")
            return convo
        
        # If it's global, anyone can join (assuming global type logic if needed, though code above handles TYPE_PRIVATE check)
        if convo.type == Conversation.TYPE_GLOBAL:
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

    @database_sync_to_async
    def delete_message(self, message_id):
        """
        Delete a message for the current user (sender-only delete).
        """
        try:
            message = Message.objects.get(
                id=message_id,
                sender=self.user,
                conversation=self.conversation
            )
            message.delete()
            return True
        except Message.DoesNotExist:
            return False

