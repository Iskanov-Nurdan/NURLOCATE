from rest_framework import serializers

from .models import Device, DeviceAssignment


class DeviceSerializer(serializers.ModelSerializer):
    animal_id = serializers.SerializerMethodField()
    animal_name = serializers.SerializerMethodField()

    class Meta:
        model = Device
        exclude = ("device_token_hash",)

    def get_animal_id(self, device):
        assignment = device.assignments.filter(is_active=True).select_related("animal").first()
        return str(assignment.animal_id) if assignment else None

    def get_animal_name(self, device):
        assignment = device.assignments.filter(is_active=True).select_related("animal").first()
        return assignment.animal.name if assignment else None


class ClaimDeviceSerializer(serializers.Serializer):
    serial_number = serializers.CharField()
    animal_id = serializers.UUIDField()


class DeviceModeSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=Device.Mode.choices)

