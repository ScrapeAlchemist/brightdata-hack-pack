import type { VacancyParcel } from "./types";

export interface CommunityNeedResult {
  score: number;
  label: "High" | "Moderate" | "Low";
  context: string;
}

export function computeCommunityNeedScore(
  parcel: Pick<VacancyParcel, "permit_inactive_years" | "priority" | "infrastructure_context">,
  povertyRate: number = 0.212
): CommunityNeedResult {
  const inactivityScore =
    parcel.permit_inactive_years >= 10 ? 40 :
    parcel.permit_inactive_years >= 6  ? 32 :
    parcel.permit_inactive_years >= 3  ? 22 :
    parcel.permit_inactive_years >= 1  ? 12 : 4;

  const povertyScore = Math.min(30, Math.round((povertyRate / 0.25) * 30));

  const ctx = parcel.infrastructure_context.toLowerCase();
  const contextScore =
    (ctx.includes("abandoned") || ctx.includes("blight") || ctx.includes("neglect")) ? 15 :
    (ctx.includes("vacant") || ctx.includes("underuse") || ctx.includes("deteriorat")) ? 10 :
    5;

  const priorityBonus = parcel.priority === "high" ? 15 : parcel.priority === "medium" ? 9 : 4;

  const score = Math.min(100, inactivityScore + povertyScore + contextScore + priorityBonus);
  const label: "High" | "Moderate" | "Low" = score >= 65 ? "High" : score >= 40 ? "Moderate" : "Low";

  const povertyPct = Math.round(povertyRate * 100);
  const context =
    `Community need score ${score}/100 (${label}). ` +
    `Based on: ${parcel.permit_inactive_years} years permit inactivity, ` +
    `City of Montgomery poverty rate ${povertyPct}% (Census ACS), ` +
    `${parcel.priority} redevelopment priority. ` +
    `Source: U.S. Census ACS 2022 (City of Montgomery) + Montgomery City Building Permits.`;

  return { score, label, context };
}

export function computeOpportunityScore(
  parcel: Pick<VacancyParcel, "permit_inactive_years" | "priority" | "zoning" | "infrastructure_context" | "community_need_score">
): number {
  const vacancyYears = parcel.permit_inactive_years;
  const vacancyScore =
    vacancyYears >= 10 ? 35 :
    vacancyYears >= 6  ? 28 :
    vacancyYears >= 3  ? 19 :
    vacancyYears >= 1  ? 11 : 4;

  const favorableZones = ["R-2", "R-3", "B-2", "CBD", "M-1", "PD", "B-1"];
  const zoningScore = favorableZones.some((z) => parcel.zoning.includes(z)) ? 25 : 10;

  const ctx = parcel.infrastructure_context.toLowerCase();
  const infraScore =
    (ctx.includes("adjacent") || ctx.includes("nearby") || ctx.includes("transit") || ctx.includes("upgraded")) ? 15 :
    (ctx.includes("planned") || ctx.includes("project") || ctx.includes("grant")) ? 10 : 5;

  const priorityScore = parcel.priority === "high" ? 15 : parcel.priority === "medium" ? 9 : 4;

  const needScore = parcel.community_need_score ?? 50;
  const communityBonus =
    needScore >= 70 ? 10 :
    needScore >= 50 ? 7  :
    needScore >= 30 ? 4  : 1;

  return Math.min(100, vacancyScore + zoningScore + infraScore + priorityScore + communityBonus);
}

export function getPriorityColor(priority: VacancyParcel["priority"]): string {
  return priority === "high" ? "#dc2626" : priority === "medium" ? "#ea580c" : "#ca8a04";
}

export function getCommunityNeedColor(score: number): string {
  if (score >= 65) return "#dc2626";
  if (score >= 40) return "#f97316";
  return "#eab308";
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
