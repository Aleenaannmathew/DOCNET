# config/routing.py
from channels.auth import AuthMiddlewareStack
from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application
from django.urls import re_path
from . import consumers

application = ProtocolTypeRouter({
    # Handle HTTP requests (for Socket.IO polling)
    'http': get_asgi_application(),
    
    # Handle WebSocket connections
    'websocket': AuthMiddlewareStack(
        URLRouter([
            re_path(r'ws/notifications/$', consumers.NotificationConsumer.as_asgi()),
            re_path(r'ws/chat/$', consumers.ChatConsumer.as_asgi()),
            re_path(r'ws/videocall/(?P<room_name>\w+)/$', consumers.VideoCallConsumer.as_asgi()),
            re_path(r'ws/emergency/(?P<room_name>\w+)/$', consumers.VideoCallConsumer.as_asgi()),
        ])
    ),
})
