from rest_framework import permissions, response
from rest_framework.views import APIView

from apps.animals.models import Animal
from apps.billing.services import user_has_ai

from .models import AIActivityReport
from .serializers import AIActivityReportSerializer
from .services import analyze_animal_activity


class AnimalAIReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, animal_id):
        animal = Animal.objects.filter(id=animal_id).first()
        if not animal:
            return response.Response({"detail": "Not found."}, status=404)
        if not request.user.is_staff and animal.owner_id != request.user.id:
            return response.Response({"detail": "Forbidden."}, status=403)
        if not user_has_ai(request.user):
            return response.Response({"detail": "AI analytics requires Premium plan."}, status=403)

        report = AIActivityReport.objects.filter(animal=animal).first()
        if not report:
            report = analyze_animal_activity(animal)
        return response.Response(AIActivityReportSerializer(report).data)


class AnimalAIAnalyzeView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, animal_id):
        animal = Animal.objects.filter(id=animal_id).first()
        if not animal:
            return response.Response({"detail": "Not found."}, status=404)
        if not request.user.is_staff and animal.owner_id != request.user.id:
            return response.Response({"detail": "Forbidden."}, status=403)
        if not user_has_ai(request.user):
            return response.Response({"detail": "AI analytics requires Premium plan."}, status=403)
        report = analyze_animal_activity(animal)
        return response.Response(AIActivityReportSerializer(report).data)
