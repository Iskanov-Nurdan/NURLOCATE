import type { Subscription, SubscriptionPlan } from "../types";
import { apiRequest } from "./client";

export function listPlans() {
  return apiRequest<SubscriptionPlan[]>("/billing/plans/", { auth: false });
}

export function checkout(plan_code: string) {
  return apiRequest<{
    subscription: Subscription;
    payment_id: string;
    checkout_url: string;
  }>("/billing/checkout/", { method: "POST", body: { plan_code } });
}

export function listSubscriptions() {
  return apiRequest<Subscription[]>("/billing/subscriptions/");
}

export function updateSubscription(id: string, auto_renew: boolean) {
  return apiRequest<Subscription>(`/billing/subscriptions/${id}/`, {
    method: "PATCH",
    body: { auto_renew }
  });
}
