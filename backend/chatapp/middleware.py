from urllib.parse import parse_qs
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from rest_framework_simplejwt.tokens import AccessToken, TokenError

User = get_user_model()

class JWTAuthMiddleware:
    """Fully ASGI-compliant middleware that receives (scope, receive, send) directly."""
    def __init__(self, app):
        self.app = app

    async def __call__(self, scope, receive, send):
        query_string = scope.get("query_string", b"").decode()
        query_params = parse_qs(query_string)
        token = query_params.get("token", [None])[0]

        print(f"DEBUG: WebSocket Connection Attempt. Token found: {bool(token)}")

        if token:
            user = await self.get_user_from_token(token)
        else:
            user = AnonymousUser()

        print(f"DEBUG: User resolved: {user}")
        scope["user"] = user

        return await self.app(scope, receive, send)

    @database_sync_to_async
    def get_user_from_token(self, token):
        try:
            access_token = AccessToken(token)
            user_id = access_token["user_id"]
            return User.objects.get(id=user_id)
        except (TokenError, User.DoesNotExist):
            return AnonymousUser()
