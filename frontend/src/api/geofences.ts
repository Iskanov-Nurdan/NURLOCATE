import type { Geofence, GeofenceEvent } from "../types";
import { apiRequest } from "./client";

export function listGeofences() {
  return apiRequest<Geofence[]>("/geofences/");
}

export function createGeofence(data: Partial<Geofence>) {
  return apiRequest<Geofence>("/geofences/", { method: "POST", body: data });
}

export function updateGeofence(id: string, data: Partial<Geofence>) {
  return apiRequest<Geofence>(`/geofences/${id}/`, { method: "PATCH", body: data });
}

export function deleteGeofence(id: string) {
  return apiRequest<void>(`/geofences/${id}/`, { method: "DELETE" });
}

export function listGeofenceEvents() {
  return apiRequest<GeofenceEvent[]>("/geofences/events/");
}
