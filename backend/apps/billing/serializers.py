from rest_framework import serializers

from .models import Invoice, Payment, Subscription, SubscriptionPlan


class SubscriptionPlanSerializer(serializers.ModelSerializer):
    class Meta:
        model = SubscriptionPlan
        fields = "__all__"


class SubscriptionSerializer(serializers.ModelSerializer):
    plan = SubscriptionPlanSerializer(read_only=True)

    class Meta:
        model = Subscription
        fields = "__all__"
        read_only_fields = ("user",)


class CheckoutSerializer(serializers.Serializer):
    plan_code = serializers.CharField()
    device_id = serializers.UUIDField(required=False)


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = "__all__"


class InvoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Invoice
        fields = "__all__"
        read_only_fields = ("id", "user", "payment", "number", "issued_at")

