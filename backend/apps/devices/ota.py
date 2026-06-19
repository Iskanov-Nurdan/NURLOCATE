import hashlib
import os

from django.core.files.storage import default_storage
from rest_framework import permissions
from rest_framework.parsers import MultiPartParser
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Device


class OTAUploadView(APIView):
    """SuperAdmin uploads new firmware binary."""
    parser_classes = [MultiPartParser]

    def get_permissions(self):
        from apps.admin_panel.views import IsSuperAdmin
        return [IsSuperAdmin()]

    def post(self, request):
        firmware_file = request.FILES.get("firmware")
        version = request.data.get("version", "")
        if not firmware_file or not version:
            return Response({"detail": "firmware file and version required."}, status=400)
        path = f"firmware/{version}/{firmware_file.name}"
        saved_path = default_storage.save(path, firmware_file)
        sha256 = ""
        try:
            with default_storage.open(saved_path, "rb") as f:
                sha256 = hashlib.sha256(f.read()).hexdigest()
        except Exception:
            pass
        return Response({
            "version": version,
            "path": saved_path,
            "sha256": sha256,
            "url": default_storage.url(saved_path),
        }, status=201)


class OTACheckView(APIView):
    """Device checks if new firmware is available. No auth required."""
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def get(self, request, serial_number):
        device = Device.objects.filter(serial_number=serial_number).first()
        if not device:
            return Response({"detail": "Device not found."}, status=404)
        latest_version = os.getenv("LATEST_FIRMWARE_VERSION", "1.0.0")
        current = device.firmware_version or "0.0.0"
        needs_update = latest_version != current
        return Response({
            "current_version": current,
            "latest_version": latest_version,
            "needs_update": needs_update,
            "download_url": os.getenv("FIRMWARE_DOWNLOAD_URL", "") if needs_update else "",
            "sha256": os.getenv("FIRMWARE_SHA256", "") if needs_update else "",
        })
