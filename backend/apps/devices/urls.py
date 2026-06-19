from django.urls import path
from rest_framework.routers import DefaultRouter

from .ota import OTACheckView, OTAUploadView
from .views import ClaimDeviceView, DeviceViewSet

router = DefaultRouter()
router.register("", DeviceViewSet, basename="devices")

urlpatterns = [
    path("claim/", ClaimDeviceView.as_view(), name="claim-device"),
    path("ota/upload/", OTAUploadView.as_view(), name="ota-upload"),
    path("ota/check/<str:serial_number>/", OTACheckView.as_view(), name="ota-check"),
] + router.urls

