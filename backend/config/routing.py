from django.urls import path

from apps.tracking.consumers import TrackingConsumer

websocket_urlpatterns = [
    path("ws/tracking/", TrackingConsumer.as_asgi()),
]
