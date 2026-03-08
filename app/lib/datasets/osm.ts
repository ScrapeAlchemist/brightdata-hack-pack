import { cacheGet, cacheSet, TTL } from "@/app/lib/cache";

const OVERPASS_URL = "https://overpass-api.de/api/interpreter";
const MONTGOMERY_BBOX = "32.27,-86.47,32.52,-86.10";
const CACHE_KEY = "osm_montgomery_amenities";

export interface OsmFeature {
  id: string;
  name: string;
  lat: number;
  lng: number;
  featureType: "park" | "school" | "bus_stop" | "community_centre" | "library" | "other";
  source: string;
  citation: string;
  isLive: boolean;
}

export interface OsmSummary {
  parks: OsmFeature[];
  schools: OsmFeature[];
  busStops: OsmFeature[];
  total: number;
  isLive: boolean;
  fetchedAt: string;
  source: string;
}

function featureTypeFromTags(tags: Record<string, string>): OsmFeature["featureType"] {
  if (tags.leisure === "park") return "park";
  if (tags.amenity === "school") return "school";
  if (tags.highway === "bus_stop") return "bus_stop";
  if (tags.amenity === "community_centre") return "community_centre";
  if (tags.amenity === "library") return "library";
  return "other";
}

export async function fetchMontgomeryAmenities(): Promise<OsmSummary> {
  const cached = cacheGet<OsmSummary>(CACHE_KEY);
  if (cached) return cached;

  const query = `
[out:json][timeout:30];
(
  way["leisure"="park"](${MONTGOMERY_BBOX});
  node["amenity"="school"](${MONTGOMERY_BBOX});
  node["amenity"="college"](${MONTGOMERY_BBOX});
  node["highway"="bus_stop"](${MONTGOMERY_BBOX});
  node["amenity"="community_centre"](${MONTGOMERY_BBOX});
  node["amenity"="library"](${MONTGOMERY_BBOX});
);
out center 300;
`.trim();

  try {
    const res = await fetch(OVERPASS_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: AbortSignal.timeout(12000),
    });

    if (!res.ok) throw new Error(`Overpass HTTP ${res.status}`);

    const data = await res.json();
    const elements: OsmFeature[] = [];

    for (const el of data.elements || []) {
      const lat = el.center?.lat ?? el.lat;
      const lng = el.center?.lon ?? el.lon;
      if (!lat || !lng) continue;

      const tags = el.tags || {};
      elements.push({
        id: `OSM-${el.id}`,
        name: tags.name || `${tags.amenity || tags.leisure || tags.highway || "Feature"} #${el.id}`,
        lat,
        lng,
        featureType: featureTypeFromTags(tags),
        source: "OpenStreetMap (live)",
        citation: `https://www.openstreetmap.org/${el.type}/${el.id}`,
        isLive: true,
      });
    }

    const result: OsmSummary = {
      parks: elements.filter((e) => e.featureType === "park"),
      schools: elements.filter((e) => e.featureType === "school"),
      busStops: elements.filter((e) => e.featureType === "bus_stop"),
      total: elements.length,
      isLive: true,
      fetchedAt: new Date().toISOString(),
      source: "OpenStreetMap via Overpass API — City of Montgomery, AL",
    };

    cacheSet(CACHE_KEY, result, TTL.OSM);
    return result;
  } catch (err) {
    console.warn("OSM Overpass unavailable, using fallback:", err);
    return {
      parks: [],
      schools: [],
      busStops: [],
      total: 0,
      isLive: false,
      fetchedAt: new Date().toISOString(),
      source: "OpenStreetMap (fallback — API unavailable)",
    };
  }
}
