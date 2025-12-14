from django.db import models
from django.conf import settings
from django.utils import timezone

User = settings.AUTH_USER_MODEL

# Create your models here.
class Conversation (models.Model):
    TYPE_GLOBAL = 'global'
    TYPE_PRIVATE = 'private'
    TYPE_CHOICES = [
        (TYPE_GLOBAL, 'Global'),
        (TYPE_PRIVATE, 'Private'),
    ]
    slug = models.CharField(max_length=128,unique=True) # deterministic id: 'global' or 'prv_min_max'
    type= models.CharField(max_length=20,choices=TYPE_CHOICES,default=TYPE_GLOBAL)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.slug} ({self.type})"
    

class ConversationParticipant(models.Model):
    conversation = models.ForeignKey(Conversation,related_name='participants',on_delete=models.CASCADE)
    user = models.ForeignKey(User, related_name='conversations', on_delete=models.CASCADE)
    unread_count= models.IntegerField(default=0)
    last_read = models.DateTimeField(null=True, blank=True)
    deleted_at = models.DateTimeField(null=True, blank=True)

    
    class Meta:
        unique_together = ('conversation', 'user')

    def __str__(self):
        return f"{self.user} in {self.conversation.slug}"

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='messages',on_delete=models.CASCADE)
    sender = models.ForeignKey(User, related_name='sent_messages', on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        ordering = ['timestamp']
    
    def __str__(self):
        return f"{self.sender}: {self.content[:40]}"

class MessageDeletion(models.Model):
     """
    Tracks a per-user deletion (hide) of a message.
    If present, that message should not appear for that user.
    """
     message = models.ForeignKey(Message, related_name="deletions",on_delete=models.CASCADE)
     user = models.ForeignKey(User,on_delete=models.CASCADE)
     deleted_at= models.DateTimeField(default=timezone.now)

     class Meta:
         unique_together = ('message','user')
         indexes = [
             models.Index(fields=['user','deleted_at'])
         ]


