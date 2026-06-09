import uuid

from django.db import models

from apps.animals.models import Animal


class AIActivityReport(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    animal = models.ForeignKey(Animal, on_delete=models.CASCADE, related_name="ai_reports")
    period_start = models.DateTimeField()
    period_end = models.DateTimeField()
    daily_score = models.PositiveSmallIntegerField(default=50)
    metrics = models.JSONField(default=dict)
    summary = models.TextField(blank=True)
    anomalies = models.JSONField(default=list, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-period_end"]
