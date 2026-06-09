import type { Notification, NotificationSettings } from "../types";
import { apiRequest } from "./client";

export function listNotifications() {
  return apiRequest<Notification[]>("/notifications/");
}

export function markNotificationRead(id: string, is_read = true) {
  return apiRequest<Notification>(`/notifications/${id}/`, { method: "PATCH", body: { is_read } });
}

export function getNotificationSettings() {
  return apiRequest<NotificationSettings>("/notifications/settings/");
}

export function updateNotificationSettings(data: Partial<NotificationSettings>) {
  return apiRequest<NotificationSettings>("/notifications/settings/", { method: "PATCH", body: data });
}
