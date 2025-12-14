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
from .models import Conversation,ConversationParticipant,Message, MessageDeletion
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

User = get_user_model()

def make_private_slug(a_id,b_id):
    low, high = sorted([int(a_id), int(b_id)])
    return f"prv_{low}_{high}"

# Create your views here.
class RegisterView(APIView):
    permission_classes = (AllowAny,)

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response({"id": user.id, "username": user.username}, status=201)


class ConversationListCreateView(APIView):
    """
    GET: list conversations for current user
    POST: create (or return) a private conversation with another user by username
    """
    permission_classes = (permissions.IsAuthenticated,)

    def get(self,request):
        qs = Conversation.objects.filter(participants__user = request.user).distinct()
        serializer = ConversationListSerializer(qs, many=True, context ={"request":request})
        return Response(serializer.data)
    
    def post(self,request):
         # create or return private conversation with username
         serializer = ConversationCreateSerializer(data = request.data)
         serializer.is_valid(raise_exception=True)
         username = serializer.validated_data["username"]
         try:
             other = User.objects.get(username=username)
         except User.DoesNotExist:
             return Response({"detail":'User not found'}, status=status.HTTP_400_NOT_FOUND)
         
         if other.id == request.user.id:
             return Response({"detail":'Cannot create conversation with self'}, status=status.HTTP_400_BAD_REQUEST)
         
         slug = make_private_slug(request.user.id, other.id)
         conv, created= Conversation.objects.get_or_create(slug=slug, defaults={'type': Conversation.TYPE_PRIVATE})
         # ensure participants exist
         ConversationParticipant.objects.get_or_create(conversation = conv, user=request.user)
         ConversationParticipant.objects.get_or_create(conversation = conv, user=other)

         data = ConversationDetailSerializer(conv, context = {'request':request}).data
         return Response(data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)
    

class ConversationMessageView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def get_conversation(self,pk):
        return get_object_or_404(Conversation, pk=pk)
    
    def get(self,request,pk):
        conv = self.get_conversation(pk)
        # check membership for private conversations
        if conv.type == Conversation.TYPE_PRIVATE and not conv.participants.filter(user=request.user).exists():
            return Response({'detail':'Forbidden'}, status=status.HTTP_403_FORBIDDEN)

        # Ensure user is a participant row (we rely on participant.deleted_at)
        try:
            participant = conv.participants.get(user=request.user)
        except ConversationParticipant.DoesNotExist:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        
        # Base queryset: chronological order, with sender prefetched for fewer queries
        msgs_qs = conv.messages.select_related('sender').order_by('timestamp')

         # Exclude messages explicitly deleted by this user (MessageDeletion)
        msgs_qs = msgs_qs.exclude(deletions__user=request.user)

        # If this user hid the conversation previously, hide older messages
        if participant.deleted_at:
            msgs_qs = msgs_qs.filter(timestamp__gt=participant.deleted_at)

        serializer = MessageSerializer(msgs_qs, many=True, context={"request":request})
        return Response({"ok":True, "messages":serializer.data})
    
    def post(self, request, pk):
        conv = self.get_conversation(pk)
        if conv.type == Conversation.TYPE_PRIVATE and not conv.participants.filter(user=request.user).exists():
            return Response({"detail":"Forbidden"}, status=status.HTTP_403_FORBIDDEN)
        
        content = request.data.get('content','').strip()
        if not content:
            return Response({"detail":"Empty Message"}, status=status.HTTP_400_BAD_REQUEST)
        if len(content)>5000:
            return Response({"detail":"Message too long"}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            msg = Message.objects.create(conversation=conv, sender = request.user, content=content)
            # increment unread for other participants
            for p in conv.participants.exclude(user=request.user):
                p.unread_count = p.unread_count +1
                p.save()
            # Broadcast to WebSocket
            channel_layer = get_channel_layer()
            group_name = f"chat_{conv.slug}"
            async_to_sync(channel_layer.group_send)(
                group_name,
                {
                    "type": "chat_message_broadcast",
                    "message": MessageSerializer(msg).data
                }
            )
            return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)


class MarkReadView(APIView):
    permission_classes= (permissions.IsAuthenticated,)

    def post(self, request, pk):
        conv = get_object_or_404(Conversation, pk=pk)
        try:
            p = conv.participants.get(user= request.user)
        except ConversationParticipant.DoesNotExist:
            return Response({'detail': 'Forbidden'}, status=status.HTTP_403_FORBIDDEN)
        p.unread_count = 0
        p.last_read = timezone.now()
        p.save()
        return Response({"ok":True})
    
# GET /api/users/me/  -> returns current authenticated user
class CurrentUserView(generics.RetrieveAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user
    
# POST /api/logout/  -> expects {"refresh": "<refresh_token>"} and blacklists it
class LogoutView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self,request,*args,**kwargs):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({"detail": "refresh token required"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # lazy import to avoid issues if token_blacklist not enabled
            from rest_framework_simplejwt.tokens import RefreshToken
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({"detail": "token blacklisted"}, status=status.HTTP_200_OK)
        except Exception:
            # generic error — don't leak internal details
            return Response({"detail": "invalid token or already blacklisted"}, status=status.HTTP_400_BAD_REQUEST)


class UserSearchView(generics.ListAPIView):
    permission_classes = (permissions.IsAuthenticated,)
    serializer_class = UserSearchSerializer

    def get_queryset(self):
        query = self.request.query_params.get('query','').strip()
        if not query:
            return User.objects.none()
        return User.objects.filter(
            Q(username__icontains=query)
        ).exclude(id=self.request.user.id)

class MessageDeleteForMeView(APIView):
    permission_classes = [permissions.IsAuthenticated,]

    def post(self,request,pk):
        msg = Message.objects.filter(pk=pk).select_related("conversation").first()
        if not msg:
            return Response({'detail': 'Message not found'}, status=404)
        
        if not ConversationParticipant.objects.filter(conversation=msg.conversation, user=request.user).exists():
            return Response({'detail': 'Forbidden'}, status=403)

        MessageDeletion.objects.get_or_create(message=msg, user=request.user)
        return Response({'ok': True})
    
    
class ConversationHideView(APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, pk):
        try:
            participant = ConversationParticipant.objects.get(conversation_id=pk, user=request.user)
        except ConversationParticipant.DoesNotExist:
            return Response({'detail': 'Forbidden'}, status=403)

        participant.deleted_at = timezone.now()
        participant.save(update_fields=['deleted_at'])
        return Response({'ok': True})

