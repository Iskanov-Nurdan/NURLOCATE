import type { Invoice, Subscription, SubscriptionPlan } from "../types";
import { apiRequest } from "./client";

export function listPlans() {
  return apiRequest<SubscriptionPlan[]>("/billing/plans/", { auth: false });
}

export function checkout(plan_code: string, device_id?: string) {
  return apiRequest<{
    subscription: Subscription;
    payment_id: string;
    checkout_url: string;
  }>("/billing/checkout/", { method: "POST", body: { plan_code, device_id } });
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

export function listInvoices() {
  return apiRequest<Invoice[]>("/billing/invoices/");
}

export function listAdminPlans() {
  return apiRequest<SubscriptionPlan[]>("/billing/admin/plans/");
}

export function createAdminPlan(data: Partial<SubscriptionPlan>) {
  return apiRequest<SubscriptionPlan>("/billing/admin/plans/", { method: "POST", body: data });
}

export function updateAdminPlan(id: string, data: Partial<SubscriptionPlan>) {
  return apiRequest<SubscriptionPlan>(`/billing/admin/plans/${id}/`, { method: "PATCH", body: data });
}

export function listAdminInvoices() {
  return apiRequest<Invoice[]>("/billing/admin/invoices/");
}
