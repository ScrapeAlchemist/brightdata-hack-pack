import type { VacancyParcel, InfrastructureItem } from "@/app/lib/types";
import type { CensusMetrics } from "./census";
import type { OsmSummary } from "./osm";
import vacancyFallback from "@/app/data/vacancy_sample.json";
import infraFallback from "@/app/data/infrastructure_sample.json";

export interface NormalizedDataset {
  parcels: VacancyParcel[];
  infrastructure: InfrastructureItem[];
  parkCount: number;
  schoolCount: number;
  busStopCount: number;
  vacantUnits?: number;
  vacancyRate?: number;
  povertyRate?: number;
  medianIncome?: number;
  population?: number;
  dataStatus: {
    parcels: "live" | "fallback";
    infrastructure: "live" | "fallback";
    census: "live" | "fallback";
    osm: "live" | "fallback";
  };
  censusSource?: string;
  osmSource?: string;
  fetchedAt: string;
}

export function normalizeParcels(raw: unknown[]): VacancyParcel[] {
  return raw as VacancyParcel[];
}

export function buildNormalizedDataset(
  census: CensusMetrics | null,
  osm: OsmSummary | null
): NormalizedDataset {
  const parcels = vacancyFallback as VacancyParcel[];
  const infrastructure = infraFallback as InfrastructureItem[];

  return {
    parcels,
    infrastructure,
    parkCount: osm?.parks.length ?? 0,
    schoolCount: osm?.schools.length ?? 0,
    busStopCount: osm?.busStops.length ?? 0,
    vacantUnits: census?.vacantUnits,
    vacancyRate: census?.vacancyRate,
    povertyRate: census?.povertyRate,
    medianIncome: census?.medianIncome,
    population: census?.population,
    dataStatus: {
      parcels: "fallback",
      infrastructure: "fallback",
      census: census?.isLive ? "live" : "fallback",
      osm: osm?.isLive ? "live" : "fallback",
    },
    censusSource: census?.source,
    osmSource: osm?.source,
    fetchedAt: new Date().toISOString(),
  };
}
