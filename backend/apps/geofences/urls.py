from rest_framework.routers import DefaultRouter

from .views import GeofenceViewSet

router = DefaultRouter()
router.register("", GeofenceViewSet, basename="geofences")

urlpatterns = router.urls

