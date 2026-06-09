from django.urls import path

from .views import CheckoutView, PaymentWebhookView, PlansView, SubscriptionDetailView, SubscriptionsView

urlpatterns = [
    path("plans/", PlansView.as_view(), name="plans"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("subscriptions/", SubscriptionsView.as_view(), name="subscriptions"),
    path("subscriptions/<uuid:subscription_id>/", SubscriptionDetailView.as_view(), name="subscription-detail"),
    path("webhooks/payment/", PaymentWebhookView.as_view(), name="payment-webhook"),
]

