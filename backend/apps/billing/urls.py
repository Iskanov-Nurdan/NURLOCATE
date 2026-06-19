from django.urls import path

from .views import (
    AdminInvoicesView,
    AdminPlanDetailView,
    AdminPlansView,
    CheckoutView,
    InvoicesView,
    PaymentWebhookView,
    PlansView,
    SubscriptionDetailView,
    SubscriptionsView,
)

urlpatterns = [
    path("plans/", PlansView.as_view(), name="plans"),
    path("checkout/", CheckoutView.as_view(), name="checkout"),
    path("subscriptions/", SubscriptionsView.as_view(), name="subscriptions"),
    path("subscriptions/<uuid:subscription_id>/", SubscriptionDetailView.as_view(), name="subscription-detail"),
    path("webhooks/payment/", PaymentWebhookView.as_view(), name="payment-webhook"),
    path("invoices/", InvoicesView.as_view(), name="invoices"),
    path("admin/plans/", AdminPlansView.as_view(), name="admin-plans"),
    path("admin/plans/<uuid:plan_id>/", AdminPlanDetailView.as_view(), name="admin-plan-detail"),
    path("admin/invoices/", AdminInvoicesView.as_view(), name="admin-invoices"),
]

