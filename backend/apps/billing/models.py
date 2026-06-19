import uuid

from django.conf import settings
from django.db import models


class SubscriptionPlan(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.SlugField(unique=True)
    name = models.CharField(max_length=120)
    price_cents = models.PositiveIntegerField(default=0)
    billing_interval = models.CharField(max_length=24, default="month")
    features = models.JSONField(default=dict)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class Subscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="subscriptions")
    plan = models.ForeignKey(SubscriptionPlan, on_delete=models.PROTECT)
    status = models.CharField(max_length=32, default="active")
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    auto_renew = models.BooleanField(default=True)


class DeviceSubscription(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    device = models.ForeignKey("devices.Device", on_delete=models.CASCADE, related_name="device_subscriptions")
    subscription = models.ForeignKey(Subscription, on_delete=models.CASCADE, related_name="device_subscriptions")
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["device"],
                condition=models.Q(is_active=True),
                name="one_active_device_subscription",
            )
        ]


class Payment(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="payments")
    subscription = models.ForeignKey(Subscription, on_delete=models.SET_NULL, null=True, blank=True)
    amount_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="USD")
    status = models.CharField(max_length=32, default="pending")
    provider_reference = models.CharField(max_length=120, blank=True)
    stripe_session_id = models.CharField(max_length=256, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)


class Invoice(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name="invoices")
    payment = models.OneToOneField(Payment, on_delete=models.CASCADE, related_name="invoice")
    number = models.CharField(max_length=32, unique=True)
    amount_cents = models.PositiveIntegerField()
    currency = models.CharField(max_length=3, default="USD")
    issued_at = models.DateTimeField(auto_now_add=True)
    description = models.CharField(max_length=255, blank=True)

    def __str__(self):
        return self.number

