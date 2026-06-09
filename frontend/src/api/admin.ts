import type { AnalyticsOverview, AuditLog, Device, Subscription, SystemStatus, User } from "../types";
import { apiRequest } from "./client";

export function getAnalyticsOverview() {
  return apiRequest<AnalyticsOverview>("/admin/analytics/overview/");
}

export function listAdminUsers() {
  return apiRequest<User[]>("/admin/users/");
}

export function blockUser(userId: number, is_active: boolean) {
  return apiRequest<User>(`/admin/users/${userId}/block/`, { method: "PATCH", body: { is_active } });
}

export function listAdminDevices() {
  return apiRequest<Device[]>("/admin/devices/");
}

export function blockDevice(deviceId: string, blocked: boolean) {
  return apiRequest<Device>(`/admin/devices/${deviceId}/block/`, { method: "PATCH", body: { blocked } });
}

export function listAdminSubscriptions() {
  return apiRequest<Subscription[]>("/admin/subscriptions/");
}

export function listStaff() {
  return apiRequest<User[]>("/admin/staff/");
}

export function grantStaff(user_id: number) {
  return apiRequest<User>("/admin/staff/", { method: "POST", body: { user_id } });
}

export function revokeStaff(user_id: number) {
  return apiRequest<User>(`/admin/staff/${user_id}/revoke/`, { method: "PATCH" });
}

export function getSystemStatus() {
  return apiRequest<SystemStatus>("/admin/system/status/");
}

export function listAuditLogs() {
  return apiRequest<AuditLog[]>("/audit/");
}
