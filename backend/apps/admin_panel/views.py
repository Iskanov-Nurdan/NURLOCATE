from django.contrib.auth import get_user_model
from django.db.models import Count, Sum
from rest_framework import permissions, response, status
from rest_framework.views import APIView

from apps.accounts.serializers import UserSerializer
from apps.audit.models import AuditLog
from apps.billing.models import Payment, Subscription
from apps.billing.serializers import SubscriptionSerializer
from apps.devices.models import Device
from apps.devices.serializers import DeviceSerializer
from apps.tracking.models import Location

User = get_user_model()


class IsStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_staff)


class IsSuperAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return bool(request.user and request.user.is_superuser)


def log_audit(actor, action, target_type="", target_id="", metadata=None):
    AuditLog.objects.create(
        actor=actor,
        action=action,
        target_type=target_type,
        target_id=str(target_id),
        metadata=metadata or {},
    )


class AnalyticsOverviewView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        mrr_cents = Payment.objects.filter(status="succeeded").aggregate(total=Sum("amount_cents"))["total"] or 0
        return response.Response({
            "users": User.objects.count(),
            "active_devices": Device.objects.filter(status=Device.Status.ACTIVE).count(),
            "offline_devices": Device.objects.filter(status=Device.Status.OFFLINE).count(),
            "active_subscriptions": Subscription.objects.filter(status="active").count(),
            "mrr_cents": mrr_cents,
            "locations_today": Location.objects.count(),
            "devices_by_status": list(Device.objects.values("status").annotate(count=Count("id"))),
        })


class AdminUsersView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        users = User.objects.order_by("-date_joined")
        return response.Response(UserSerializer(users, many=True).data)


class AdminUserBlockView(APIView):
    permission_classes = [IsStaff]

    def patch(self, request, user_id):
        user = User.objects.filter(id=user_id).first()
        if not user:
            return response.Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        if user.is_superuser and not request.user.is_superuser:
            return response.Response({"detail": "Forbidden."}, status=status.HTTP_403_FORBIDDEN)
        is_active = request.data.get("is_active", False)
        user.is_active = bool(is_active)
        user.save(update_fields=["is_active"])
        log_audit(request.user, "user.block" if not is_active else "user.unblock", "user", user.id)
        return response.Response(UserSerializer(user).data)


class AdminDevicesView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        devices = Device.objects.order_by("-created_at")
        return response.Response(DeviceSerializer(devices, many=True).data)


class AdminDeviceBlockView(APIView):
    permission_classes = [IsStaff]

    def patch(self, request, device_id):
        device = Device.objects.filter(id=device_id).first()
        if not device:
            return response.Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        blocked = request.data.get("blocked", True)
        device.status = Device.Status.BLOCKED if blocked else Device.Status.ACTIVE
        device.save(update_fields=["status"])
        log_audit(request.user, "device.block" if blocked else "device.unblock", "device", device.id)
        return response.Response(DeviceSerializer(device).data)


class AdminSubscriptionsView(APIView):
    permission_classes = [IsStaff]

    def get(self, request):
        qs = Subscription.objects.select_related("plan", "user").order_by("-starts_at")
        data = []
        for sub in qs:
            item = SubscriptionSerializer(sub).data
            item["username"] = sub.user.username
            data.append(item)
        return response.Response(data)


class AdminStaffView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        staff = User.objects.filter(is_staff=True).order_by("username")
        return response.Response(UserSerializer(staff, many=True).data)

    def post(self, request):
        user_id = request.data.get("user_id")
        user = User.objects.filter(id=user_id).first()
        if not user:
            return response.Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        user.is_staff = True
        user.save(update_fields=["is_staff"])
        log_audit(request.user, "admin.grant", "user", user.id)
        return response.Response(UserSerializer(user).data)


class AdminStaffRevokeView(APIView):
    permission_classes = [IsSuperAdmin]

    def patch(self, request, user_id):
        user = User.objects.filter(id=user_id).first()
        if not user:
            return response.Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        if user.is_superuser:
            return response.Response({"detail": "Cannot revoke super admin."}, status=status.HTTP_400_BAD_REQUEST)
        user.is_staff = False
        user.save(update_fields=["is_staff"])
        log_audit(request.user, "admin.revoke", "user", user.id)
        return response.Response(UserSerializer(user).data)


class SystemStatusView(APIView):
    permission_classes = [IsSuperAdmin]

    def get(self, request):
        from django.conf import settings

        ws_backend = settings.CHANNEL_LAYERS["default"]["BACKEND"]
        return response.Response({
            "api": "healthy",
            "websocket_gateway": "active" if "Redis" in ws_backend or "InMemory" in ws_backend else "offline",
            "celery": "active" if not getattr(settings, "CELERY_TASK_ALWAYS_EAGER", False) else "eager",
            "redis": "connected" if settings.CACHES["default"]["BACKEND"].endswith("RedisCache") else "locmem",
            "iot_ingestion": "active",
            "active_devices": Device.objects.filter(status=Device.Status.ACTIVE).count(),
            "locations_total": Location.objects.count(),
        })
