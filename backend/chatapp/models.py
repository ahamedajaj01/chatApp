"""
This file defines database models for the chat application.
It includes models for conversations, participants, messages,
and message deletion tracking. These models store and manage
chat-related data in the database.
"""

from django.db import models
from django.conf import settings
from django.utils import timezone

# Reference to the custom or default User model
User = settings.AUTH_USER_MODEL

# Model for chat conversations
class Conversation(models.Model):
    # Conversation types
    TYPE_GLOBAL = 'global'
    TYPE_PRIVATE = 'private'

    # Choices for conversation type
    TYPE_CHOICES = [
        (TYPE_GLOBAL, 'Global'),
        (TYPE_PRIVATE, 'Private'),
    ]

    # Unique identifier for conversation (example: global or private slug)
    slug = models.CharField(max_length=128, unique=True)

    # Type of conversation (global or private)
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        default=TYPE_GLOBAL
    )

    # Time when conversation was created
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return f"{self.slug} ({self.type})"


# Model to connect users with conversations
class ConversationParticipant(models.Model):
    # Related conversation
    conversation = models.ForeignKey(
        Conversation,
        related_name='participants',
        on_delete=models.CASCADE
    )

    # User who participates in the conversation
    user = models.ForeignKey(
        User,
        related_name='conversations',
        on_delete=models.CASCADE
    )

    # Count of unread messages for this user
    unread_count = models.IntegerField(default=0)

    # Last time user read messages
    last_read = models.DateTimeField(null=True, blank=True)

    # Marks when user removed the conversation
    deleted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        # One user can join a conversation only once
        unique_together = ('conversation', 'user')

    def __str__(self):
        return f"{self.user} in {self.conversation.slug}"


# Model for storing chat messages
class Message(models.Model):
    # Conversation to which message belongs
    conversation = models.ForeignKey(
        Conversation,
        related_name='messages',
        on_delete=models.CASCADE
    )

    # User who sent the message
    sender = models.ForeignKey(
        User,
        related_name='sent_messages',
        on_delete=models.CASCADE
    )

    # Message text
    content = models.TextField()

    # Time when message was sent
    timestamp = models.DateTimeField(default=timezone.now)

    class Meta:
        # Messages ordered by time
        ordering = ['timestamp']

    def __str__(self):
        return f"{self.sender}: {self.content[:40]}"


# Model to track deleted messages per user
class MessageDeletion(models.Model):
    """
    Stores which messages are hidden for a specific user.
    Deleted messages are not shown again to that user.
    """

    # Message that was deleted
    message = models.ForeignKey(
        Message,
        related_name="deletions",
        on_delete=models.CASCADE
    )

    # User who deleted the message
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Time when message was deleted
    deleted_at = models.DateTimeField(default=timezone.now)

    class Meta:
        # One delete record per user per message
        unique_together = ('message', 'user')

        # Index to improve query speed
        indexes = [
            models.Index(fields=['user', 'deleted_at'])
        ]
