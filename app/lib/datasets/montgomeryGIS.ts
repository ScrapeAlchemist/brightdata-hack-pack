import type { InfrastructureItem, ParcelLookupResult, PermitRecord, ParkItem } from "@/app/lib/types";
import { cacheGet, cacheSet, TTL } from "@/app/lib/cache";

const ORG = "xNUwUjOJqYE54USz";
const BASE = `https://services7.arcgis.com/${ORG}/arcgis/rest/services`;

const CITATION_INFRA = `${BASE}/INFRASTRUCTURE_IMPROVEMENT_PROJECTS/FeatureServer`;
const CITATION_PARKS = `${BASE}/Park_and_Trail/FeatureServer`;
const CITATION_PERMITS = `${BASE}/Building_Permit_viewlayer/FeatureServer`;
const CITATION_PARCELS = `${BASE}/Parcels_Owner/FeatureServer`;

function normalizeStatus(raw: string): "active" | "planned" | "completed" {
  const s = (raw ?? "").toUpperCase().trim();
  if (s === "COMPLETE" || s === "COMPLETED") return "completed";
  if (s.startsWith("CONSTRUCTION")) return "active";
  return "planned";
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/\bOf\b/g, "of")
    .replace(/\bFrom\b/g, "from")
    .replace(/\bTo\b/g, "to")
    .replace(/\bAnd\b/g, "and");
}

export async function fetchLiveInfrastructureProjects(): Promise<InfrastructureItem[]> {
  const cacheKey = "gis_infrastructure";
  const cached = cacheGet<InfrastructureItem[]>(cacheKey);
  if (cached) return cached;

  const url =
    `${BASE}/INFRASTRUCTURE_IMPROVEMENT_PROJECTS/FeatureServer/0/query` +
    `?where=1%3D1` +
    `&outFields=PROJECT_TI,CURRENT_ST,CITY_FUNDS,OTHER_FUND` +
    `&returnCentroid=true&returnGeometry=false` +
    `&outSR=4326` +
    `&resultRecordCount=200` +
    `&f=json`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`GIS HTTP ${res.status}`);

    const data = await res.json();
    if (data.error) throw new Error(`GIS error: ${data.error.message}`);

    const items: InfrastructureItem[] = [];
    for (const f of data.features ?? []) {
      const { PROJECT_TI, CURRENT_ST, CITY_FUNDS, OTHER_FUND } = f.attributes ?? {};
      const centroid = f.centroid;
      if (!centroid?.x || !centroid?.y) continue;
      if (centroid.y < 32.0 || centroid.y > 32.7) continue;
      if (centroid.x < -86.6 || centroid.x > -85.9) continue;

      const status = normalizeStatus(CURRENT_ST);
      const funding = [CITY_FUNDS, OTHER_FUND].filter(Boolean).join(" + ");

      items.push({
        id: `MGIS-INFRA-${items.length + 1}`,
        name: toTitleCase(PROJECT_TI ?? "Infrastructure Project"),
        lat: centroid.y,
        lng: centroid.x,
        type: "city_infrastructure",
        status,
        description: `${CURRENT_ST ?? "Status unknown"}${funding ? ` · Funding: ${funding}` : ""}`,
        source: "Montgomery, AL City GIS (live)",
        dataset_name: "Infrastructure Improvement Projects",
        citation_url: CITATION_INFRA,
        is_live: true,
      });
    }

    cacheSet(cacheKey, items, TTL.INFRASTRUCTURE);
    return items;
  } catch (err) {
    console.warn("fetchLiveInfrastructureProjects failed:", err);
    return [];
  }
}

export async function fetchLiveParks(): Promise<ParkItem[]> {
  const cacheKey = "gis_parks";
  const cached = cacheGet<ParkItem[]>(cacheKey);
  if (cached) return cached;

  const url =
    `${BASE}/Park_and_Trail/FeatureServer/0/query` +
    `?where=1%3D1` +
    `&outFields=FULLADDR,FACILITYTYPE,OPERDAYS,FACILITYID` +
    `&returnGeometry=true` +
    `&outSR=4326` +
    `&resultRecordCount=100` +
    `&f=json`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) throw new Error(`GIS Parks HTTP ${res.status}`);

    const data = await res.json();
    if (data.error) throw new Error(`GIS Parks error: ${data.error.message}`);

    const parks: ParkItem[] = [];
    for (const f of data.features ?? []) {
      const { FULLADDR, FACILITYTYPE, OPERDAYS, FACILITYID } = f.attributes ?? {};
      const geom = f.geometry;
      let lat: number | undefined;
      let lng: number | undefined;

      if (geom?.x && geom?.y) {
        lat = geom.y;
        lng = geom.x;
      } else if (geom?.rings) {
        let sumX = 0;
        let sumY = 0;
        let count = 0;
        for (const ring of geom.rings) {
          for (const [x, y] of ring) {
            sumX += x;
            sumY += y;
            count++;
          }
        }
        if (count > 0) { lat = sumY / count; lng = sumX / count; }
      }

      if (!lat || !lng) continue;
      if (lat < 32.0 || lat > 32.7) continue;
      if (lng < -86.6 || lng > -85.9) continue;

      parks.push({
        id: `MGIS-PARK-${parks.length + 1}`,
        name: FACILITYID || FULLADDR || "Montgomery Park",
        lat,
        lng,
        address: FULLADDR || "",
        facilityType: FACILITYTYPE || "Park",
        operDays: OPERDAYS || "Daily",
        source: "Montgomery, AL City GIS — Parks & Trail (live)",
        citation: CITATION_PARKS,
        is_live: true,
      });
    }

    cacheSet(cacheKey, parks, TTL.PARKS);
    return parks;
  } catch (err) {
    console.warn("fetchLiveParks failed:", err);
    return [];
  }
}

export async function fetchPermitsByParcelNo(parcelNo: string): Promise<{ zoning: string; permits: PermitRecord[]; count: number }> {
  if (!parcelNo) return { zoning: "", permits: [], count: 0 };

  const cacheKey = `permits_parcel_${parcelNo}`;
  const cached = cacheGet<{ zoning: string; permits: PermitRecord[]; count: number }>(cacheKey);
  if (cached) return cached;

  const where = encodeURIComponent(`ParcelNo='${parcelNo}'`);
  const url =
    `${BASE}/Building_Permit_viewlayer/FeatureServer/0/query` +
    `?where=${where}` +
    `&outFields=PermitNo,IssuedDate,PermitStatus,PermitCode,ProjectType,EstimatedCost,Zoning` +
    `&orderByFields=IssuedDate+DESC` +
    `&resultRecordCount=6` +
    `&f=json`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Permits HTTP ${res.status}`);

    const data = await res.json();
    if (data.error) throw new Error(`Permits error: ${data.error.message}`);

    const features = data.features ?? [];
    let zoningCode = "";

    const permits: PermitRecord[] = features.map((f: { attributes: Record<string, unknown> }) => {
      const a = f.attributes;
      if (!zoningCode && a.Zoning) zoningCode = String(a.Zoning);
      const issuedMs = typeof a.IssuedDate === "number" ? a.IssuedDate : null;
      const issuedDate = issuedMs
        ? new Date(issuedMs).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })
        : "Unknown";
      return {
        permitNo: String(a.PermitNo ?? ""),
        issuedDate,
        status: String(a.PermitStatus ?? ""),
        type: String(a.PermitCode ?? ""),
        projectType: String(a.ProjectType ?? ""),
        estimatedCost: typeof a.EstimatedCost === "number" ? a.EstimatedCost : 0,
        zoning: String(a.Zoning ?? ""),
        citationUrl: CITATION_PERMITS,
      };
    });

    const result = { zoning: zoningCode, permits, count: features.length };
    cacheSet(cacheKey, result, TTL.PARCEL_LOOKUP);
    return result;
  } catch (err) {
    console.warn("fetchPermitsByParcelNo failed:", err);
    return { zoning: "", permits: [], count: 0 };
  }
}

export async function lookupParcelByAddress(address: string): Promise<ParcelLookupResult | null> {
  const cacheKey = `parcel_lookup_${address.toLowerCase().trim()}`;
  const cached = cacheGet<ParcelLookupResult>(cacheKey);
  if (cached) return cached;

  const keywords = address
    .toUpperCase()
    .replace(/[,\.]/g, " ")
    .split(/\s+/)
    .filter((w) => /\d/.test(w) || w.length > 3)
    .slice(0, 3);

  if (keywords.length < 2) return null;

  const whereClause = keywords
    .map((k) => `UPPER(PropertyAddr1) LIKE '%${k}%'`)
    .join(" AND ");

  const url =
    `${BASE}/Parcels_Owner/FeatureServer/0/query` +
    `?where=${encodeURIComponent(whereClause)}` +
    `&outFields=ParcelNo,PropertyAddr1,PropertyCity,OwnerName,Neighborhood,AssessmentClass,LandUseCode,TotalValue,Calc_Acre` +
    `&outSR=4326` +
    `&resultRecordCount=1` +
    `&f=json`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error(`Parcels HTTP ${res.status}`);

    const data = await res.json();
    const f = data.features?.[0];
    if (!f) return null;

    const a = f.attributes;
    const parcelNo = (a.ParcelNo ?? "").trim();

    const permitData = await fetchPermitsByParcelNo(parcelNo);

    const result: ParcelLookupResult = {
      parcelNo,
      address: (a.PropertyAddr1 ?? "").trim(),
      city: (a.PropertyCity ?? "Montgomery").trim(),
      owner: (a.OwnerName ?? "").trim(),
      neighborhood: (a.Neighborhood ?? "").trim(),
      assessmentClass: (a.AssessmentClass ?? "").trim(),
      landUseCode: (a.LandUseCode ?? "").trim(),
      liveZoning: permitData.zoning,
      totalValue: a.TotalValue ?? 0,
      acreage: a.Calc_Acre ?? 0,
      recentPermits: permitData.permits,
      permitCount: permitData.count,
      source: "Montgomery, AL City Assessor — Parcels_Owner (live)",
      citationUrl: CITATION_PARCELS,
      is_live: true,
    };

    cacheSet(cacheKey, result, TTL.PARCEL_LOOKUP);
    return result;
  } catch (err) {
    console.warn("lookupParcelByAddress failed:", err);
    return null;
  }
}
