from rest_framework import serializers

from .models import Animal, MedicalRecord, Vaccination


class VaccinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaccination
        fields = "__all__"
        read_only_fields = ("animal",)


class MedicalRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = MedicalRecord
        fields = "__all__"
        read_only_fields = ("animal", "created_at")


class AnimalSerializer(serializers.ModelSerializer):
    vaccinations = VaccinationSerializer(many=True, read_only=True)
    medical_records = MedicalRecordSerializer(many=True, read_only=True)

    class Meta:
        model = Animal
        fields = "__all__"
        read_only_fields = ("owner",)

