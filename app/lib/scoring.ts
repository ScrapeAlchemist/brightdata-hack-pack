import type { VacancyParcel } from "./types";

export function computeOpportunityScore(parcel: Pick<VacancyParcel, "permit_inactive_years" | "priority" | "zoning" | "infrastructure_context">): number {
  const vacancyYears = parcel.permit_inactive_years;
  const vacancyScore =
    vacancyYears >= 10 ? 40 :
    vacancyYears >= 6  ? 32 :
    vacancyYears >= 3  ? 22 :
    vacancyYears >= 1  ? 12 : 4;

  const favorableZones = ["R-2", "R-3", "B-2", "CBD", "M-1", "PD", "B-1"];
  const zoningScore = favorableZones.some((z) => parcel.zoning.includes(z)) ? 25 : 10;

  const ctx = parcel.infrastructure_context.toLowerCase();
  const infraScore =
    (ctx.includes("adjacent") || ctx.includes("nearby") || ctx.includes("transit") || ctx.includes("upgraded")) ? 20 :
    (ctx.includes("planned") || ctx.includes("project") || ctx.includes("grant")) ? 13 : 6;

  const priorityScore = parcel.priority === "high" ? 15 : parcel.priority === "medium" ? 9 : 4;

  return Math.min(100, vacancyScore + zoningScore + infraScore + priorityScore);
}

export function getPriorityColor(priority: VacancyParcel["priority"]): string {
  return priority === "high" ? "#dc2626" : priority === "medium" ? "#ea580c" : "#ca8a04";
}

export function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 65) return "Good";
  if (score >= 50) return "Moderate";
  return "Low";
}

export function getScoreColor(score: number): string {
  if (score >= 80) return "#16a34a";
  if (score >= 65) return "#0d9488";
  if (score >= 50) return "#ea580c";
  return "#6b7280";
}

export function rankParcels(parcels: VacancyParcel[]): VacancyParcel[] {
  return [...parcels].sort((a, b) => b.opportunity_score - a.opportunity_score);
}
