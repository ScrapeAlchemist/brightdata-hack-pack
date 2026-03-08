import { NextResponse } from "next/server";
import { fetchMontgomeryMetrics } from "@/app/lib/datasets/census";
import { fetchMontgomeryAmenities } from "@/app/lib/datasets/osm";
import { fetchLiveInfrastructureProjects, fetchLiveParks } from "@/app/lib/datasets/montgomeryGIS";
import { fetchBuildingPermitStats } from "@/app/lib/datasets/permits";
import { computeCommunityNeedScore, computeOpportunityScore } from "@/app/lib/scoring";
import vacancyData from "@/app/data/vacancy_sample.json";
import type { VacancyParcel, LiveMetrics } from "@/app/lib/types";

export async function GET() {
  const [censusResult, osmResult, infraResult, parksResult, permitsResult] =
    await Promise.allSettled([
      fetchMontgomeryMetrics(),
      fetchMontgomeryAmenities(),
      fetchLiveInfrastructureProjects(),
      fetchLiveParks(),
      fetchBuildingPermitStats(),
    ]);

  const census = censusResult.status === "fulfilled" ? censusResult.value : null;
  const osm = osmResult.status === "fulfilled" ? osmResult.value : null;
  const infra = infraResult.status === "fulfilled" ? infraResult.value : [];
  const parks = parksResult.status === "fulfilled" ? parksResult.value : [];
  const permits = permitsResult.status === "fulfilled" ? permitsResult.value : null;

  const povertyRate = census?.povertyRate ?? 0.197;

  const parcels: VacancyParcel[] = (vacancyData as VacancyParcel[]).map((p) => {
    const need = computeCommunityNeedScore(p, povertyRate);
    const enriched: VacancyParcel = {
      ...p,
      community_need_score: need.score,
      community_need_label: need.label,
      community_need_context: need.context,
    };
    enriched.opportunity_score = computeOpportunityScore(enriched);
    return enriched;
  });

  const infraIsLive = Array.isArray(infra) && infra.length > 0 && infra[0]?.is_live === true;
  const parksIsLive = Array.isArray(parks) && parks.length > 0 && parks[0]?.is_live === true;

  const metrics: LiveMetrics = {
    vacantLots: parcels.length,
    highPriority: parcels.filter((p) => p.priority === "high").length,
    parkGaps: Math.max(
      parcels.filter((p) =>
        p.recommended_use.toLowerCase().includes("park") ||
        p.recommended_use.toLowerCase().includes("garden") ||
        p.recommended_use.toLowerCase().includes("green")
      ).length,
      parksIsLive ? Math.max(0, 12 - parks.length) : 4
    ),
    activePermits: permits?.isLive ? permits.total : 5,
    censusVacancyRate: census?.vacancyRate,
    censusPovertyRate: census?.povertyRate,
    censusMedianIncome: census?.medianIncome,
    osmParkCount: osm?.parks.length,
    osmSchoolCount: osm?.schools.length,
    osmBusStopCount: osm?.busStops.length,
    gisParkCount: parks.length,
    gisInfraCount: infra.length,
    gisPermitCount: permits?.total,
    liveInfrastructure: infra,
    liveParks: parks,
    liveParcels: parcels,
    dataStatus: {
      parcels: "fallback",
      census: census?.isLive ? "live" : "fallback",
      osm: osm?.isLive ? "live" : "fallback",
      infrastructure: infraIsLive ? "live" : "fallback",
      parks: parksIsLive ? "live" : "fallback",
      permits: permits?.isLive ? "live" : "fallback",
      communityNeed: census?.isLive ? "live" : "fallback",
    },
    censusSource: census?.source ?? "US Census ACS (unavailable)",
    osmSource: osm?.source ?? "OpenStreetMap (unavailable)",
    gisInfraSource: infraIsLive
      ? "Montgomery, AL City GIS — Infrastructure Improvement Projects (live)"
      : "Infrastructure (fallback)",
    gisParksSource: parksIsLive
      ? "Montgomery, AL City GIS — Parks & Trail (live)"
      : "Parks (fallback)",
    gisPermitsSource: permits?.source,
    fetchedAt: new Date().toISOString(),
  };

  return NextResponse.json(metrics, {
    headers: { "Cache-Control": "public, s-maxage=900, stale-while-revalidate=300" },
  });
}
