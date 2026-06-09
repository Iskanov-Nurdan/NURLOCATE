from datetime import timedelta

from celery import shared_task
from django.utils import timezone

from .models import Subscription


@shared_task
def expire_subscriptions_task() -> int:
    grace_days = 7
    now = timezone.now()
    expired = Subscription.objects.filter(status="active", ends_at__lt=now - timedelta(days=grace_days))
    count = expired.update(status="expired")
    return count
