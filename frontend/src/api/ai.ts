import type { ActivityReport } from "../types";
import { apiRequest } from "./client";

export type AIReport = ActivityReport & {
  id: string;
  animal: string;
  animal_name: string;
  period_start: string;
  period_end: string;
  metrics: Record<string, number>;
  anomalies: string[];
  summary: string;
  daily_score: number;
  created_at: string;
};

export function getAnimalAIReport(animalId: string) {
  return apiRequest<AIReport>(`/ai/animals/${animalId}/report/`);
}

export function analyzeAnimal(animalId: string) {
  return apiRequest<AIReport>(`/ai/animals/${animalId}/analyze/`, { method: "POST" });
}
