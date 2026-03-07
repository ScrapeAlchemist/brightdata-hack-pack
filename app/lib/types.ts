export type Priority = "high" | "medium" | "low";
export type LayerName = "vacancy" | "zoning" | "infrastructure";
export type DataStatus = "live" | "fallback" | "enriched";

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
  source?: string;
  sourceType?: string;
  dataset_name?: string;
  citation_url?: string;
  community_need_context?: string;
  is_live?: boolean;
}

export interface InfrastructureItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  type: string;
  status: "active" | "planned" | "completed";
  description: string;
  source?: string;
  dataset_name?: string;
  citation_url?: string;
  is_live?: boolean;
}

export interface ParkItem {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  facilityType: string;
  operDays: string;
  source: string;
  citation: string;
  is_live: boolean;
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

export interface CitationItem {
  title: string;
  url: string;
  domain: string;
}

export interface EnrichmentResult {
  bullets: string[];
  citations: CitationItem[];
  source: "brightdata_openai" | "brightdata" | "openai" | "local";
  timestamp: string;
  query?: string;
  success: boolean;
  error?: string;
}

export interface ParcelLookupResult {
  parcelNo: string;
  address: string;
  city: string;
  owner: string;
  neighborhood: string;
  assessmentClass: string;
  landUseCode: string;
  totalValue: number;
  acreage: number;
  source: string;
  citationUrl: string;
  is_live: boolean;
}

export interface LiveMetrics {
  vacantLots: number;
  highPriority: number;
  parkGaps: number;
  activePermits: number;
  censusVacancyRate?: number;
  censusPovertyRate?: number;
  censusMedianIncome?: number;
  osmParkCount?: number;
  osmSchoolCount?: number;
  osmBusStopCount?: number;
  gisParkCount?: number;
  gisInfraCount?: number;
  gisPermitCount?: number;
  liveInfrastructure?: InfrastructureItem[];
  liveParks?: ParkItem[];
  dataStatus: {
    parcels: DataStatus;
    census: DataStatus;
    osm: DataStatus;
    infrastructure: DataStatus;
    parks: DataStatus;
    permits: DataStatus;
  };
  censusSource?: string;
  osmSource?: string;
  gisInfraSource?: string;
  gisParksSource?: string;
  gisPermitsSource?: string;
  fetchedAt: string;
}

export interface DashboardMetrics {
  vacantLots: number;
  highPriority: number;
  parkGaps: number;
  activePermits: number;
}
