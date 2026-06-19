import logging
from datetime import timedelta

import stripe
from django.conf import settings as django_settings
from django.utils import timezone
from rest_framework import permissions, response
from rest_framework.views import APIView

from apps.devices.models import Device

from .models import Invoice, Payment, Subscription, SubscriptionPlan
from .serializers import CheckoutSerializer, InvoiceSerializer, SubscriptionPlanSerializer, SubscriptionSerializer
from .services import link_device_subscription

logger = logging.getLogger(__name__)


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

        invoice_number = f"INV-{timezone.now().strftime('%Y%m%d')}-{str(payment.id)[:8].upper()}"
        Invoice.objects.create(
            user=request.user,
            payment=payment,
            number=invoice_number,
            amount_cents=plan.price_cents,
            currency="USD",
            description=f"Подписка {plan.name}",
        )

        if device_id:
            device = Device.objects.filter(id=device_id).first()
            if device:
                link_device_subscription(device, subscription)

        checkout_url = ""
        if plan.price_cents == 0:
            subscription.status = "active"
            subscription.save(update_fields=["status"])
        else:
            checkout_url = _create_stripe_session(payment, plan, subscription)

        return response.Response({
            "subscription": SubscriptionSerializer(subscription).data,
            "payment_id": str(payment.id),
            "checkout_url": checkout_url,
        }, status=201)


def _create_stripe_session(payment: Payment, plan: SubscriptionPlan, subscription: Subscription) -> str:
    secret_key = django_settings.STRIPE_SECRET_KEY
    if not secret_key:
        return f"/billing/pay/{payment.id}/"
    try:
        stripe.api_key = secret_key
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[{
                "price_data": {
                    "currency": django_settings.STRIPE_CURRENCY,
                    "unit_amount": plan.price_cents,
                    "product_data": {"name": plan.name},
                },
                "quantity": 1,
            }],
            mode="payment",
            success_url=django_settings.STRIPE_SUCCESS_URL + f"?payment_id={payment.id}",
            cancel_url=django_settings.STRIPE_CANCEL_URL,
            metadata={"payment_id": str(payment.id), "subscription_id": str(subscription.id)},
        )
        payment.stripe_session_id = session.id
        payment.save(update_fields=["stripe_session_id"])
        return session.url or ""
    except Exception:
        logger.exception("Stripe session creation failed for payment %s", payment.id)
        return ""


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
        stripe_secret = django_settings.STRIPE_WEBHOOK_SECRET
        if stripe_secret:
            return self._handle_stripe_webhook(request, stripe_secret)
        return self._handle_simple_webhook(request)

    def _handle_stripe_webhook(self, request, webhook_secret: str):
        sig_header = request.META.get("HTTP_STRIPE_SIGNATURE", "")
        try:
            stripe.api_key = django_settings.STRIPE_SECRET_KEY
            event = stripe.Webhook.construct_event(
                payload=request.body,
                sig_header=sig_header,
                secret=webhook_secret,
            )
        except stripe.error.SignatureVerificationError:
            logger.warning("Invalid Stripe webhook signature")
            return response.Response({"detail": "Invalid signature."}, status=400)

        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            payment_id = session.get("metadata", {}).get("payment_id")
            self._activate_payment(payment_id)

        return response.Response({"detail": "Webhook accepted."})

    def _handle_simple_webhook(self, request):
        payment_id = request.data.get("payment_id")
        payment_status = request.data.get("status", "succeeded")
        self._activate_payment(payment_id, payment_status)
        return response.Response({"detail": "Webhook accepted."})

    def _activate_payment(self, payment_id: str | None, status: str = "succeeded") -> None:
        if not payment_id:
            return
        payment = Payment.objects.filter(id=payment_id).select_related("subscription").first()
        if not payment:
            return
        payment.status = status
        payment.save(update_fields=["status"])
        if payment.subscription and status == "succeeded":
            sub = payment.subscription
            sub.status = "active"
            sub.starts_at = timezone.now()
            sub.ends_at = timezone.now() + timedelta(days=30)
            sub.save(update_fields=["status", "starts_at", "ends_at"])


class InvoicesView(APIView):
    def get(self, request):
        invoices = Invoice.objects.filter(user=request.user).order_by("-issued_at")
        return response.Response(InvoiceSerializer(invoices, many=True).data)


class AdminPlansView(APIView):
    """SuperAdmin: CRUD subscription plans."""

    def get_permissions(self):
        from apps.admin_panel.views import IsSuperAdmin
        return [IsSuperAdmin()]

    def get(self, request):
        plans = SubscriptionPlan.objects.all().order_by("price_cents")
        return response.Response(SubscriptionPlanSerializer(plans, many=True).data)

    def post(self, request):
        serializer = SubscriptionPlanSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        plan = serializer.save()
        return response.Response(SubscriptionPlanSerializer(plan).data, status=201)


class AdminPlanDetailView(APIView):
    def get_permissions(self):
        from apps.admin_panel.views import IsSuperAdmin
        return [IsSuperAdmin()]

    def patch(self, request, plan_id):
        plan = SubscriptionPlan.objects.filter(id=plan_id).first()
        if not plan:
            return response.Response({"detail": "Not found."}, status=404)
        serializer = SubscriptionPlanSerializer(plan, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return response.Response(SubscriptionPlanSerializer(plan).data)

    def delete(self, request, plan_id):
        plan = SubscriptionPlan.objects.filter(id=plan_id).first()
        if not plan:
            return response.Response({"detail": "Not found."}, status=404)
        plan.is_active = False
        plan.save(update_fields=["is_active"])
        return response.Response({"detail": "Plan deactivated."})


class AdminInvoicesView(APIView):
    """SuperAdmin: all invoices."""

    def get_permissions(self):
        from apps.admin_panel.views import IsStaff
        return [IsStaff()]

    def get(self, request):
        invoices = Invoice.objects.select_related("user", "payment").order_by("-issued_at")[:200]
        return response.Response(InvoiceSerializer(invoices, many=True).data)
