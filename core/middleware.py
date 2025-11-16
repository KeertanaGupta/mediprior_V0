# core/middleware.py
import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from urllib.parse import parse_qs

User = get_user_model()

@database_sync_to_async
def get_user(token_key):
    try:
        payload = jwt.decode(token_key, settings.SECRET_KEY, algorithms=["HS256"])
        user = User.objects.get(id=payload['user_id'])
        return user
    except (jwt.ExpiredSignatureError, jwt.exceptions.DecodeError, User.DoesNotExist, KeyError):
        # Return AnonymousUser if token is bad or user_id is missing
        return AnonymousUser()

class TokenAuthMiddleware:
    """
    Custom WebSocket middleware to authenticate users via a JWT token
    in the query string.
    """
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        query_string = scope.get('query_string', b'').decode('utf-8')
        query_params = parse_qs(query_string)
        token = query_params.get('token', [None])[0]

        if token:
            scope['user'] = await get_user(token)
        else:
            scope['user'] = AnonymousUser()
        
        return await self.inner(scope, receive, send)

# Helper function to wrap the middleware
def TokenAuthMiddlewareStack(inner):
    return TokenAuthMiddleware(inner)