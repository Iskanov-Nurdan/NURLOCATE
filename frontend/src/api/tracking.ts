import type { Location } from "../types";
import { apiRequest } from "./client";

function historyPath(animalId: string, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return `/tracking/animals/${animalId}/history/${query ? `?${query}` : ""}`;
}

export function getLiveLocations() {
  return apiRequest<Location[]>("/tracking/live/");
}

export function getAnimalHistory(animalId: string, from?: string, to?: string) {
  return apiRequest<Location[]>(historyPath(animalId, from, to));
}

export function getAnimalRoute(animalId: string, from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const query = params.toString();
  return apiRequest<Location[]>(`/tracking/animals/${animalId}/route/${query ? `?${query}` : ""}`);
}
