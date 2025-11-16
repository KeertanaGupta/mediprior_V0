# mediprior_backend/asgi.py
import os
from django.core.asgi import get_asgi_application
from channels.routing import ProtocolTypeRouter, URLRouter

# --- THIS IS THE CHANGE ---
from core.middleware import TokenAuthMiddlewareStack
# ---------------------------

import core.routing

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mediprior_backend.settings')

application = ProtocolTypeRouter({
    "http": get_asgi_application(),
    "websocket": TokenAuthMiddlewareStack( # <-- USE OUR NEW MIDDLEWARE
        URLRouter(
            core.routing.websocket_urlpatterns
        )
    ),
})