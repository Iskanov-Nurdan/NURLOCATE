from django.urls import path

from .views import IoTBatchLocationView, IoTLocationView

urlpatterns = [
    path("locations/",       IoTLocationView.as_view(),      name="iot-locations"),
    path("locations/batch/", IoTBatchLocationView.as_view(), name="iot-locations-batch"),
]

