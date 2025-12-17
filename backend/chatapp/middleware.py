"""
This file contains custom middleware for JWT authentication in WebSocket connections.
It extracts the JWT token from the query parameters, validates it, and attaches the
corresponding user to the connection scope for use in consumers.

"""

from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken, TokenError
# Get the default User model
User = get_user_model()

# Custom middleware for JWT authentication in WebSocket connections
class JWTAuthMiddleware:
    """Fully ASGI-compliant middleware that receives (scope, receive, send) directly."""
    def __init__(self, app):
        self.app = app # The ASGI application to wrap

    # Handle incoming connection
    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode() # Decode query string
        query_params = parse_qs(query_string) # Parse query parameters
        token = query_params.get("token", [None])[0] # Extract token

        print(f"DEBUG: WebSocket Connection Attempt. Token found: {bool(token)}")
        # Validate token and get user
        if token:
            user = await self.get_user_from_token(token)
        else:
            user = AnonymousUser()

        print(f"DEBUG: User resolved: {user}")
        # Attach user to connection scope
        scope["user"] = user

        return await self.app(scope, receive, send)

    # Helper method to get user from token
    @database_sync_to_async
    def get_user_from_token(self, token):
        # Validate token and retrieve user
        try:
            access_token = AccessToken(token) 
            user_id = access_token["user_id"] # Extract user ID from token
            user = User.objects.get(id=user_id) # Get user from database
            return user
        except TokenError as e:
            return AnonymousUser() # Invalid token
        except User.DoesNotExist:
            return AnonymousUser() # User not found
