import type { Animal, Vaccination } from "../types";
import { apiRequest } from "./client";

export function listAnimals() {
  return apiRequest<Animal[]>("/animals/");
}

export function getAnimal(id: string) {
  return apiRequest<Animal>(`/animals/${id}/`);
}

export function createAnimal(data: Partial<Animal>) {
  return apiRequest<Animal>("/animals/", { method: "POST", body: data });
}

export function updateAnimal(id: string, data: Partial<Animal>) {
  return apiRequest<Animal>(`/animals/${id}/`, { method: "PATCH", body: data });
}

export function deleteAnimal(id: string) {
  return apiRequest<void>(`/animals/${id}/`, { method: "DELETE" });
}

export function getMedical(id: string) {
  return apiRequest<{ medical_notes: string; vaccinations: Vaccination[] }>(`/animals/${id}/medical/`);
}

export function addVaccination(animalId: string, data: Partial<Vaccination>) {
  return apiRequest<Vaccination>(`/animals/${animalId}/vaccinations/`, { method: "POST", body: data });
}
