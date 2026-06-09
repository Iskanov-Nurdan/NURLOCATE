from django.urls import path

from .views import NotificationReadView, NotificationSettingsView, NotificationsView

urlpatterns = [
    path("settings/", NotificationSettingsView.as_view(), name="notification-settings"),
    path("<uuid:notification_id>/", NotificationReadView.as_view(), name="notification-read"),
    path("", NotificationsView.as_view(), name="notifications"),
]
