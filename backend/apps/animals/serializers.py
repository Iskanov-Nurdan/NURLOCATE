from rest_framework import serializers

from .models import Animal, Vaccination


class VaccinationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vaccination
        fields = "__all__"
        read_only_fields = ("animal",)


class AnimalSerializer(serializers.ModelSerializer):
    vaccinations = VaccinationSerializer(many=True, read_only=True)

    class Meta:
        model = Animal
        fields = "__all__"
        read_only_fields = ("owner",)

