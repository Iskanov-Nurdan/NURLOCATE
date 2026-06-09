from rest_framework import permissions, response
from rest_framework.views import APIView

from .models import AuditLog
from .serializers import AuditLogSerializer


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


class AuditLogListView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        qs = AuditLog.objects.select_related("actor").order_by("-created_at")[:200]
        return response.Response(AuditLogSerializer(qs, many=True).data)
