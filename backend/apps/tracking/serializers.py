from rest_framework import serializers

from .models import Location


class LocationSerializer(serializers.ModelSerializer):
    animal_id = serializers.SerializerMethodField()
    animal_name = serializers.SerializerMethodField()
    device_serial = serializers.CharField(source="device.serial_number", read_only=True)
    online = serializers.SerializerMethodField()

    class Meta:
        model = Location
        fields = "__all__"
        read_only_fields = ("device",)

    def get_animal_id(self, location):
        assignment = location.device.assignments.filter(is_active=True).select_related("animal").first()
        return str(assignment.animal_id) if assignment else None

    def get_animal_name(self, location):
        assignment = location.device.assignments.filter(is_active=True).select_related("animal").first()
        return assignment.animal.name if assignment else None

    def get_online(self, location):
        from apps.devices.services import is_device_online

        return is_device_online(location.device)


class IoTLocationSerializer(serializers.Serializer):
    device_id = serializers.CharField()
    timestamp = serializers.DateTimeField()
    lat = serializers.DecimalField(max_digits=9, decimal_places=6)
    lng = serializers.DecimalField(max_digits=9, decimal_places=6)
    accuracy = serializers.FloatField(required=False)
    speed = serializers.FloatField(required=False)
    altitude = serializers.FloatField(required=False)
    battery = serializers.IntegerField(min_value=0, max_value=100)
    signal = serializers.IntegerField(required=False)
    mode = serializers.CharField(required=False, default="normal")
    firmware = serializers.CharField(required=False, allow_blank=True)
    nonce = serializers.CharField()
    signature = serializers.CharField(required=False, allow_blank=True)

