from rest_framework import permissions, response, status
from rest_framework.views import APIView

from .models import Notification, NotificationSettings
from .serializers import NotificationSerializer, NotificationSettingsSerializer


class NotificationsView(APIView):
    def get(self, request):
        qs = Notification.objects.filter(user=request.user).order_by("-created_at")[:100]
        return response.Response(NotificationSerializer(qs, many=True).data)

    def post(self, request):
        serializer = NotificationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(user=request.user)
        return response.Response(serializer.data, status=status.HTTP_201_CREATED)


class NotificationReadView(APIView):
    def patch(self, request, notification_id):
        notification = Notification.objects.filter(user=request.user, id=notification_id).first()
        if not notification:
            return response.Response({"detail": "Not found."}, status=status.HTTP_404_NOT_FOUND)
        notification.is_read = request.data.get("is_read", True)
        notification.save(update_fields=["is_read"])
        return response.Response(NotificationSerializer(notification).data)


class NotificationSettingsView(APIView):
    def get(self, request):
        settings_obj, _ = NotificationSettings.objects.get_or_create(user=request.user)
        return response.Response(NotificationSettingsSerializer(settings_obj).data)

    def patch(self, request):
        settings_obj, _ = NotificationSettings.objects.get_or_create(user=request.user)
        serializer = NotificationSettingsSerializer(settings_obj, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response(serializer.data)
