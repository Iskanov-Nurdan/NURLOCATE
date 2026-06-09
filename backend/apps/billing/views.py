from datetime import timedelta

from django.utils import timezone
from rest_framework import permissions, response
from rest_framework.views import APIView

from apps.devices.models import Device

from .models import Payment, Subscription, SubscriptionPlan
from .serializers import CheckoutSerializer, SubscriptionPlanSerializer, SubscriptionSerializer
from .services import link_device_subscription


class PlansView(APIView):
    permission_classes = [permissions.AllowAny]

    def get(self, request):
        plans = SubscriptionPlan.objects.filter(is_active=True).order_by("price_cents")
        return response.Response(SubscriptionPlanSerializer(plans, many=True).data)


class CheckoutView(APIView):
    def post(self, request):
        serializer = CheckoutSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = SubscriptionPlan.objects.get(code=serializer.validated_data["plan_code"])
        device_id = serializer.validated_data.get("device_id")

        subscription = Subscription.objects.create(
            user=request.user,
            plan=plan,
            starts_at=timezone.now(),
            ends_at=timezone.now() + timedelta(days=30),
            status="active" if plan.price_cents == 0 else "pending",
        )
        payment = Payment.objects.create(
            user=request.user,
            subscription=subscription,
            amount_cents=plan.price_cents,
            status="succeeded" if plan.price_cents == 0 else "pending",
        )

        if device_id:
            device = Device.objects.filter(id=device_id).first()
            if device:
                link_device_subscription(device, subscription)

        if plan.price_cents == 0:
            subscription.status = "active"
            subscription.save(update_fields=["status"])

        return response.Response({
            "subscription": SubscriptionSerializer(subscription).data,
            "payment_id": str(payment.id),
            "checkout_url": f"https://payments.example/checkout/{payment.id}",
        }, status=201)


class SubscriptionsView(APIView):
    def get(self, request):
        qs = Subscription.objects.filter(user=request.user).select_related("plan")
        return response.Response(SubscriptionSerializer(qs, many=True).data)


class SubscriptionDetailView(APIView):
    def patch(self, request, subscription_id):
        subscription = Subscription.objects.filter(user=request.user, id=subscription_id).first()
        if not subscription:
            return response.Response({"detail": "Not found."}, status=404)
        if "auto_renew" in request.data:
            subscription.auto_renew = bool(request.data["auto_renew"])
            subscription.save(update_fields=["auto_renew"])
        return response.Response(SubscriptionSerializer(subscription).data)


class PaymentWebhookView(APIView):
    authentication_classes = []
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        payment_id = request.data.get("payment_id")
        payment_status = request.data.get("status", "succeeded")
        payment = Payment.objects.filter(id=payment_id).select_related("subscription").first()
        if not payment:
            return response.Response({"detail": "Payment not found."}, status=404)

        payment.status = payment_status
        payment.save(update_fields=["status"])

        if payment.subscription and payment_status == "succeeded":
            sub = payment.subscription
            sub.status = "active"
            sub.starts_at = timezone.now()
            sub.ends_at = timezone.now() + timedelta(days=30)
            sub.save(update_fields=["status", "starts_at", "ends_at"])

        return response.Response({"detail": "Webhook accepted.", "subscription_status": payment.subscription.status if payment.subscription else None})
