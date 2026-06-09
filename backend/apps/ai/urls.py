from django.urls import path

from .views import AnimalAIAnalyzeView, AnimalAIReportView

urlpatterns = [
    path("animals/<uuid:animal_id>/report/", AnimalAIReportView.as_view(), name="ai-report"),
    path("animals/<uuid:animal_id>/analyze/", AnimalAIAnalyzeView.as_view(), name="ai-analyze"),
]
