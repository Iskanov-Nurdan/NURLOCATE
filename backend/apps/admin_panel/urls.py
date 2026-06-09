from django.urls import path

from .views import (
    AdminDeviceBlockView,
    AdminDevicesView,
    AdminStaffRevokeView,
    AdminStaffView,
    AdminSubscriptionsView,
    AdminUserBlockView,
    AdminUsersView,
    AnalyticsOverviewView,
    SystemStatusView,
)

urlpatterns = [
    path("analytics/overview/", AnalyticsOverviewView.as_view(), name="admin-analytics-overview"),
    path("users/", AdminUsersView.as_view(), name="admin-users"),
    path("users/<int:user_id>/block/", AdminUserBlockView.as_view(), name="admin-user-block"),
    path("devices/", AdminDevicesView.as_view(), name="admin-devices"),
    path("devices/<uuid:device_id>/block/", AdminDeviceBlockView.as_view(), name="admin-device-block"),
    path("subscriptions/", AdminSubscriptionsView.as_view(), name="admin-subscriptions"),
    path("staff/", AdminStaffView.as_view(), name="admin-staff"),
    path("staff/<int:user_id>/revoke/", AdminStaffRevokeView.as_view(), name="admin-staff-revoke"),
    path("system/status/", SystemStatusView.as_view(), name="admin-system-status"),
]
