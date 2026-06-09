from rest_framework import serializers

from .models import AIActivityReport


class AIActivityReportSerializer(serializers.ModelSerializer):
    animal_name = serializers.CharField(source="animal.name", read_only=True)

    class Meta:
        model = AIActivityReport
        fields = "__all__"
