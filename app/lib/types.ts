export type Priority = "high" | "medium" | "low";
export type LayerName = "vacancy" | "zoning" | "infrastructure";

export interface VacancyParcel {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  priority: Priority;
  zoning: string;
  permit_inactive_years: number;
  recommended_use: string;
  opportunity_score: number;
  infrastructure_context: string;
  neighborhood: string;
}

export interface InfrastructureItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  status: "active" | "planned" | "completed";
  description: string;
}

export interface ZoneArea {
  id: string;
  name: string;
  lat: number;
  lng: number;
  zone_code: string;
  zone_type: string;
  compatibility: "high" | "medium" | "low";
  notes: string;
}

export interface DashboardMetrics {
  vacantLots: number;
  highPriority: number;
  parkGaps: number;
  activePermits: number;
}

export interface CopilotResponse {
  answer: string;
  highlightedParcels: string[];
  reasoning: string;
  mcpNote: string;
}
