from django.urls import path

from .views import AnimalHistoryView, AnimalRouteView, LiveLocationsView

urlpatterns = [
    path("live/", LiveLocationsView.as_view(), name="live-locations"),
    path("animals/<uuid:animal_id>/history/", AnimalHistoryView.as_view(), name="animal-history"),
    path("animals/<uuid:animal_id>/route/", AnimalRouteView.as_view(), name="animal-route"),
]

