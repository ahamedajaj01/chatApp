from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Conversation, ConversationParticipant, Message

User = get_user_model()

class RegisterSerializer(serializers.ModelSerializer):
     password = serializers.CharField(write_only=True, min_length=6)

     class Meta:
         model = User
         fields = ("id", "username", "password")

     def create(self, validated_data):
        user = User(username=validated_data["username"])
        user.set_password(validated_data["password"])
        user.save()
        return user

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username','first_name','last_name')

class MessageSerializer(serializers.ModelSerializer):
    sender = UserSerializer(read_only=True)
    class Meta:
        model = Message
        fields = ('id','conversation','sender','content','timestamp')

class ConversationListSerializer(serializers.ModelSerializer):
    last_message = serializers.SerializerMethodField()
    participants = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = ['id','slug','type','created_at','last_message','participants','unread_count']
     
    #  Method to get last message
    def get_last_message(self,obj):
        msg = obj.messages.order_by('-timestamp').first()
        if not msg:
            return None
        return MessageSerializer(msg).data
    
    # Method to get participants usernames
    def get_participants(self,obj):
        return [p.user.username for p in obj.participants.select_related('user').all()]
    
    # Method to get unread count for requesting user
    def get_unread_count(self,obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return 0
        participant = obj.participants.filter(user=request.user).first()
        if not participant:
            return 0
        return participant.unread_count

class ConversationCreateSerializer(serializers.Serializer):
    username = serializers.CharField(write_only=True)

class ConversationDetailSerializer(serializers.ModelSerializer):
    participants = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True,read_only=True)

    class Meta:
        model = Conversation
        fields = ['id','slug','type','created_at','participants','messages']

    def get_participants(self,obj):
        return UserSerializer([p.user for p in obj.participants.all()], many=True).data

class UserSearchSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id','username')
    