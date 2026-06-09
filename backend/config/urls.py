from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("apps.accounts.urls")),
    path("api/animals/", include("apps.animals.urls")),
    path("api/devices/", include("apps.devices.urls")),
    path("api/tracking/", include("apps.tracking.urls")),
    path("api/iot/", include("apps.tracking.iot_urls")),
    path("api/geofences/", include("apps.geofences.urls")),
    path("api/billing/", include("apps.billing.urls")),
    path("api/notifications/", include("apps.notifications.urls")),
    path("api/audit/", include("apps.audit.urls")),
    path("api/admin/", include("apps.admin_panel.urls")),
    path("api/ai/", include("apps.ai.urls")),
]

