"""
This file contains views for the chat application.
It includes API endpoints for user registration, conversation management,
message handling, message deletion and conversation hiding.

""" 

from django.shortcuts import render, get_object_or_404
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from django.contrib.auth import get_user_model
from django.db import transaction
from rest_framework import status, permissions, generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from .models import Conversation, ConversationParticipant, Message, MessageDeletion
from django.utils import timezone
from django.db.models import Q
from .serializers import (
    ConversationListSerializer,
    ConversationCreateSerializer,
    ConversationDetailSerializer,
    MessageSerializer,
    UserSearchSerializer,
    UserSerializer,
    RegisterSerializer,
)

# Get the default User model
User = get_user_model()

# Helper function to create a unique slug for private conversations
def make_private_slug(a_id, b_id):
    low, high = sorted([int(a_id), int(b_id)])
    return f"prv_{low}_{high}"


# Create your views here.

# User registration view
class RegisterView(APIView):
    permission_classes = (AllowAny,) # Allow any user (authenticated or not) to access this view

    # Handle POST request for user registration
    def post(self, request):
        serializer = RegisterSerializer(data=request.data) # Deserialize incoming data
        serializer.is_valid(raise_exception=True) # Validate data or raise error
        user = serializer.save()
        return Response({"id": user.id, "username": user.username}, status=201)


class UserDetailView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]


# Conversation list and creation view
class ConversationListCreateView(APIView):
    """
    GET: list conversations for current user
    POST: create (or return) a private conversation with another user by username
    """

    permission_classes = (permissions.IsAuthenticated,) # Only authenticated users can access
    # List conversations for current user
    def get(self, request):
        qs = Conversation.objects.filter(participants__user=request.user).distinct() # User's conversations
        serializer = ConversationListSerializer(
            qs, many=True, context={"request": request} # pass request context
        )
        return Response(serializer.data)
    
# Create or return private conversation with another user
    def post(self, request):
        serializer = ConversationCreateSerializer(data=request.data) # Deserialize incoming data
        serializer.is_valid(raise_exception=True)
        username = serializer.validated_data["username"] # target username
        # Find the other user
        try:
            other = User.objects.get(username=username) # find user
        except User.DoesNotExist:
            return Response(
                {"detail": "User not found"}, status=status.HTTP_400_NOT_FOUND
            )

# Prevent creating conversation with self
        if other.id == request.user.id:
            return Response(
                {"detail": "Cannot create conversation with self"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        slug = make_private_slug(request.user.id, other.id) # unique slug for private convo
        # Get or create the private conversation
        conv, created = Conversation.objects.get_or_create(
            slug=slug, defaults={"type": Conversation.TYPE_PRIVATE}
        )
        # ensure participants exist
        ConversationParticipant.objects.get_or_create(
            conversation=conv, user=request.user
        )
        # ensure other participant exists
        ConversationParticipant.objects.get_or_create(conversation=conv, user=other)
        # Serialize and return the conversation data
        data = ConversationDetailSerializer(conv, context={"request": request}).data
        return Response(
            data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK
        )


# View for handling messages in a conversation
class ConversationMessageView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
# Retrieve the conversation object or return 404
    def get_conversation(self, pk):
        return get_object_or_404(Conversation, pk=pk)
# Handle GET request to list messages
    def get(self, request, pk):
        conv = self.get_conversation(pk)
        # check membership for private conversations
        if (
            conv.type == Conversation.TYPE_PRIVATE
            and not conv.participants.filter(user=request.user).exists()
        ):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        # Ensure user is a participant row (we rely on participant.deleted_at)
        try:
            participant = conv.participants.get(user=request.user)
        except ConversationParticipant.DoesNotExist:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)

        # Base queryset: chronological order, with sender prefetched for fewer queries
        msgs_qs = conv.messages.select_related("sender").order_by("timestamp")

        # Exclude messages explicitly deleted by this user (MessageDeletion)
        msgs_qs = msgs_qs.exclude(deletions__user=request.user)

        # If this user hid the conversation previously, hide older messages
        if participant.deleted_at:
            msgs_qs = msgs_qs.filter(timestamp__gt=participant.deleted_at)
        
        # Serialize and return messages
        serializer = MessageSerializer(msgs_qs, many=True, context={"request": request})
        return Response({"ok": True, "messages": serializer.data})

# Handle POST request to send a new message
    def post(self, request, pk):
        conv = self.get_conversation(pk) # get conversation
        # check membership for private conversations
        if (
            conv.type == Conversation.TYPE_PRIVATE
            and not conv.participants.filter(user=request.user).exists() 
        ):
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        # Validate message content
        content = request.data.get("content", "").strip()
        if not content:
            return Response(
                {"detail": "Empty Message"}, status=status.HTTP_400_BAD_REQUEST
            )
        if len(content) > 5000:
            return Response(
                {"detail": "Message too long"}, status=status.HTTP_400_BAD_REQUEST
            )
        # Create message inside transaction(means do with unread count increment)
        with transaction.atomic():
            msg = Message.objects.create(
                conversation=conv, sender=request.user, content=content
            )
            # Update unread counts
            channel_layer = get_channel_layer()
            # increment unread for other participants
            for p in conv.participants.exclude(user=request.user):
                p.unread_count +=  1
                p.save(update_fields=["unread_count"])
                # Notify via WebSocket
                async_to_sync(channel_layer.group_send)(
                    f"user_{p.user.id}",
                    {
                        "type": "chat_list_update",
                        "conversation_id": conv.id,
                        "unread_count": p.unread_count,
                    },
                )

            # Broadcast to WebSocket
            channel_layer = get_channel_layer()
            group_name = f"chat_{conv.id}"
            try:
                async_to_sync(channel_layer.group_send)(
                    group_name,
                    {
                        "type": "conversation_updated",
                        "conversation_id": conv.id,
                    },
                )
            except Exception as e:
                print(f"Error broadcasting message to group {group_name}: {e}")
            return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)

# View for marking a conversation as read
class MarkReadView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
# Handle POST request to mark conversation as read
    def post(self, request, pk):
        conv = get_object_or_404(Conversation, pk=pk) # get conversation
        # Ensure user is a participant
        try:
            p = conv.participants.get(user=request.user) # get participant row
        except ConversationParticipant.DoesNotExist:
            return Response({"detail": "Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        # Mark as read
        p.unread_count = 0
        p.last_read = timezone.now()
        p.save()
        return Response({"ok": True})


# GET /api/users/me/  -> returns current authenticated user
class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer
    # simply return the logged-in user
    def get_object(self):
        return self.request.user


# POST /api/logout/  -> expects {"refresh": "<refresh_token>"} and blacklists it
class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
    # Handle POST request to logout and blacklist token (blacklist means invalidate/revoke it)
    def post(self, request, *args, **kwargs):
        refresh_token = request.data.get("refresh") # get refresh token from request
        if not refresh_token:
            return Response(
                {"detail": "refresh token required"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            # lazy import to avoid issues if token_blacklist not enabled
            from rest_framework_simplejwt.tokens import RefreshToken

            token = RefreshToken(refresh_token) # create token instance
            token.blacklist() # blacklist the token
            return Response({"detail": "token blacklisted"}, status=status.HTTP_200_OK)
        except Exception:
            # generic error — don't leak internal details
            return Response(
                {"detail": "invalid token or already blacklisted"},
                status=status.HTTP_400_BAD_REQUEST,
            )

# View for searching users by username
class UserSearchView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSearchSerializer # use UserSearchSerializer
# Define the queryset based on search query
    def get_queryset(self):
        query = self.request.query_params.get("query", "").strip() # get search query
        if not query:
            return User.objects.none()
        # Search users by username, excluding self
        return User.objects.filter(Q(username__icontains=query)).exclude(
            id=self.request.user.id
        )

# View for deleting a message for the current user
class MessageDeleteForMeView(APIView):
    permission_classes = [
        permissions.IsAuthenticated,
    ]
# Handle POST request to delete message for current user
    def post(self, request, pk):
        msg = Message.objects.filter(pk=pk).select_related("conversation").first() #get message
        if not msg:
            return Response({"detail": "Message not found"}, status=404)
        
        # Ensure user is participant in the conversation
        if not ConversationParticipant.objects.filter(
            conversation=msg.conversation, user=request.user
        ).exists():
            return Response({"detail": "Forbidden"}, status=403) 

        MessageDeletion.objects.get_or_create(message=msg, user=request.user) # create deletion record
        return Response({"ok": True})

# View for hiding a conversation for the current user
class ConversationHideView(APIView):
    permission_classes = (permissions.IsAuthenticated,)
# Handle POST request to hide conversation
    def post(self, request, pk):
        try:
            participant = ConversationParticipant.objects.get(
                conversation_id=pk, user=request.user
            )
        except ConversationParticipant.DoesNotExist:
            return Response({"detail": "Forbidden"}, status=403)

        participant.deleted_at = timezone.now()
        participant.save(update_fields=["deleted_at"])
        return Response({"ok": True})
