from django.urls import path

from .views import IoTLocationView

urlpatterns = [
    path("locations/", IoTLocationView.as_view(), name="iot-locations"),
]

