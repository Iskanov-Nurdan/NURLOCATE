from rest_framework import decorators, permissions, response, viewsets
from rest_framework.exceptions import PermissionDenied

from apps.billing.services import max_animals

from .models import Animal
from .serializers import AnimalSerializer, VaccinationSerializer


class AnimalViewSet(viewsets.ModelViewSet):
    serializer_class = AnimalSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Animal.objects.all().order_by("name")
        return Animal.objects.filter(owner=self.request.user).order_by("name")

    def perform_create(self, serializer):
        if not self.request.user.is_staff:
            current = Animal.objects.filter(owner=self.request.user).count()
            if current >= max_animals(self.request.user):
                raise PermissionDenied(
                    f"Animal limit reached ({max_animals(self.request.user)})."
                )
        serializer.save(owner=self.request.user)

    @decorators.action(detail=True, methods=["get"])
    def medical(self, request, pk=None):
        animal = self.get_object()
        return response.Response({
            "medical_notes": animal.medical_notes,
            "vaccinations": VaccinationSerializer(animal.vaccinations.all(), many=True).data,
        })

    @decorators.action(detail=True, methods=["post"])
    def vaccinations(self, request, pk=None):
        animal = self.get_object()
        serializer = VaccinationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(animal=animal)
        return response.Response(serializer.data, status=201)

