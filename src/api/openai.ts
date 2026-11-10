import type { ClinicStats } from "@/utils/build-clinic-stats";
import type { AnalysisResponse } from "@/app/api/openai/route";

// Client-side helper: sends aggregate stats to our own server route (/api/openai).
export const analyzeData = async (stats: ClinicStats): Promise<AnalysisResponse> => {
  const response = await fetch("/api/openai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(stats),
  });
  if (!response.ok) {
    throw new Error("Failed to analyze data");
  }
  return response.json();
};
