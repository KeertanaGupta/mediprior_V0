# core/routing.py
from django.urls import re_path
from . import consumers

websocket_urlpatterns = [
    # We will make this URL more specific later
    re_path(r'ws/chat/(?P<connection_id>\d+)/$', consumers.ChatConsumer.as_asgi()),
]