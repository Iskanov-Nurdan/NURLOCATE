from rest_framework.routers import DefaultRouter

from .views import AnimalViewSet

router = DefaultRouter()
router.register("", AnimalViewSet, basename="animals")

urlpatterns = router.urls

