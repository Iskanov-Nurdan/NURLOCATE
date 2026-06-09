import type { Device } from "../types";
import { apiRequest } from "./client";

export function listDevices() {
  return apiRequest<Device[]>("/devices/");
}

export function claimDevice(serial_number: string, animal_id: string) {
  return apiRequest<Device>("/devices/claim/", {
    method: "POST",
    body: { serial_number, animal_id }
  });
}

export function setDeviceMode(id: string, mode: Device["mode"]) {
  return apiRequest<Device>(`/devices/${id}/mode/`, { method: "PATCH", body: { mode } });
}

export function triggerSos(id: string) {
  return apiRequest<Device>(`/devices/${id}/sos/`, { method: "POST" });
}

export function releaseDevice(id: string) {
  return apiRequest<{ detail: string }>(`/devices/${id}/release/`, { method: "POST" });
}
