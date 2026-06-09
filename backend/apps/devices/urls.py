from django.urls import path
from rest_framework.routers import DefaultRouter

from .views import ClaimDeviceView, DeviceViewSet

router = DefaultRouter()
router.register("", DeviceViewSet, basename="devices")

urlpatterns = [
    path("claim/", ClaimDeviceView.as_view(), name="claim-device"),
] + router.urls

