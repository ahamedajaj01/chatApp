# documentation: chatapp/serializers.py
"""
This file contains serializers for the chat application.
It handles user registration, user data, messages, and conversations.
Serializers are used to convert Django model data into JSON and
validate incoming data from API requests.
"""


from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, ConversationParticipant, Message

# Get the default User model
User = get_user_model()


# Serializer used for user registration
class RegisterSerializer(serializers.ModelSerializer):
     # Password field should not be shown in response and must be at least 6 characters
     password = serializers.CharField(write_only=True, min_length=6)

     class Meta:
         model = User
         fields = ("id", "username", "password")

     # Create a new user with hashed password
     def create(self, validated_data):
        user = User(username=validated_data["username"])
        user.set_password(validated_data["password"])  # hash password
        user.save()
        return user


# Serializer to show basic user details
class UserSerializer(serializers.ModelSerializer):
    is_online = serializers.SerializerMethodField() # Custom field to show online status
    class Meta:
        model = User
        fields = ('id','username','first_name','last_name','is_online')
    
    def get_is_online(self, obj):
        from django.core.cache import cache
        return cache.get(f"online:{obj.id}") is not None


# Serializer for chat messages
class MessageSerializer(serializers.ModelSerializer):
    # Show sender details using UserSerializer
    sender = UserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ('id','conversation','sender','content','timestamp')


# Serializer for showing conversation list
class ConversationListSerializer(serializers.ModelSerializer):
    # Custom fields calculated using methods
    last_message = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            'id',
            'slug',
            'type',
            'created_at',
            'last_message',
            'participants',
            'unread_count'
        ]
     
    # Get the most recent message of the conversation
    def get_last_message(self, obj):
        msg = obj.messages.order_by('-timestamp').first()
        if not msg:
            return None
        return MessageSerializer(msg).data
    
    # Get usernames of all participants in the conversation
    def get_participants(self, obj):
        user = [p.user for p in obj.participants.select_related('user').all()]
        return UserSerializer(user, many=True).data
    
    # Get unread message count for the logged-in user
    def get_unread_count(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        participant = obj.participants.filter(user=request.user).first()
        if not participant:
            return 0
        return participant.unread_count


# Serializer used to create a conversation using username
class ConversationCreateSerializer(serializers.Serializer):
    username = serializers.CharField(write_only=True)


# Serializer for conversation detail page
class ConversationDetailSerializer(serializers.ModelSerializer):
    # Show participants and messages in detail view
    participants = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True, read_only=True)

    class Meta:
        model = Conversation
        fields = [
            'id',
            'slug',
            'type',
            'created_at',
            'participants',
            'messages'
        ]

    # Get full user details of participants
    def get_participants(self, obj):
        return UserSerializer(
            [p.user for p in obj.participants.all()],
            many=True
        ).data


# Serializer used for searching users
class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username')
