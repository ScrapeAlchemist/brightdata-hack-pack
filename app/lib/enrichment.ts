import { mcpCall, searchContext } from "./mcpClient";
import type { VacancyParcel } from "./types";

export interface EnrichmentResult {
  parcelId: string;
  context: string;
  source: "brightdata" | "mock";
  timestamp: string;
}

export async function enrichParcelContext(parcel: VacancyParcel): Promise<EnrichmentResult> {
  const result = await mcpCall("search_engine", {
    query: `${parcel.address} Montgomery Alabama redevelopment zoning property`,
    parcelId: parcel.id,
  });

  const timestamp = new Date().toLocaleString();

  if (result.success && result.data) {
    return {
      parcelId: parcel.id,
      context: result.data,
      source: "brightdata",
      timestamp,
    };
  }

  return {
    parcelId: parcel.id,
    context: `Local dataset: ${parcel.name} — ${parcel.recommended_use} candidate with ${parcel.permit_inactive_years} years of permit inactivity. ${parcel.infrastructure_context}`,
    source: "mock",
    timestamp,
  };
}

export async function getCopilotContext(question: string): Promise<string> {
  const result = await searchContext(question);
  if (result.success && result.data) return result.data;
  return "";
}
