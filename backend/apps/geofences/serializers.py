from rest_framework import serializers

from .models import Geofence, GeofenceEvent


class GeofenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Geofence
        fields = "__all__"
        read_only_fields = ("owner",)


class GeofenceEventSerializer(serializers.ModelSerializer):
    geofence_name = serializers.CharField(source="geofence.name", read_only=True)
    device_serial = serializers.CharField(source="device.serial_number", read_only=True)

    class Meta:
        model = GeofenceEvent
        fields = "__all__"

