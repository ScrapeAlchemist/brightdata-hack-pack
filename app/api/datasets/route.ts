import { NextResponse } from "next/server";
import { fetchMontgomeryMetrics } from "@/app/lib/datasets/census";
import { fetchMontgomeryAmenities } from "@/app/lib/datasets/osm";
import vacancyData from "@/app/data/vacancy_sample.json";
import infraData from "@/app/data/infrastructure_sample.json";
import type { VacancyParcel, InfrastructureItem, LiveMetrics } from "@/app/lib/types";

export async function GET() {
  const [census, osm] = await Promise.allSettled([
    fetchMontgomeryMetrics(),
    fetchMontgomeryAmenities(),
  ]);

  const censusResult = census.status === "fulfilled" ? census.value : null;
  const osmResult = osm.status === "fulfilled" ? osm.value : null;

  const parcels = vacancyData as VacancyParcel[];
  const infra = infraData as InfrastructureItem[];

  const metrics: LiveMetrics = {
    vacantLots: parcels.length,
    highPriority: parcels.filter((p) => p.priority === "high").length,
    parkGaps: Math.max(
      parcels.filter((p) => p.recommended_use.toLowerCase().includes("park")).length,
      osmResult ? Math.max(0, 12 - osmResult.parks.length) : 4
    ),
    activePermits: infra.filter((i) => i.status === "active").length,
    censusVacancyRate: censusResult?.vacancyRate,
    censusPovertyRate: censusResult?.povertyRate,
    censusMedianIncome: censusResult?.medianIncome,
    osmParkCount: osmResult?.parks.length,
    osmSchoolCount: osmResult?.schools.length,
    osmBusStopCount: osmResult?.busStops.length,
    dataStatus: {
      parcels: "fallback",
      census: censusResult?.isLive ? "live" : "fallback",
      osm: osmResult?.isLive ? "live" : "fallback",
    },
    censusSource: censusResult?.source ?? "US Census ACS (unavailable)",
    osmSource: osmResult?.source ?? "OpenStreetMap (unavailable)",
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(metrics, {
    headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=600" },
  });
}
