"""
This file contains the routing configuration for WebSocket connections
in the chat application. It maps URL patterns to their corresponding consumers.
"""
from django.urls import re_path
from . import consumers

# WebSocket URL patterns for chat application
websocket_urlpatterns = [
re_path(r'ws/chat/(?P<conversation_id>[\w-]+)/$', consumers.ChatConsumer.as_asgi()),
]