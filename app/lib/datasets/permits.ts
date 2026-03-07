const ORG = "xNUwUjOJqYE54USz";
const BASE = `https://services7.arcgis.com/${ORG}/arcgis/rest/services`;

export interface PermitStats {
  total: number;
  isLive: boolean;
  source: string;
  citationUrl: string;
  fetchedAt: string;
}

export async function fetchBuildingPermitStats(): Promise<PermitStats> {
  const url =
    `${BASE}/Building_Permit_viewlayer/FeatureServer/0/query` +
    `?where=1%3D1` +
    `&outStatistics=%5B%7B%22statisticType%22%3A%22count%22%2C%22onStatisticField%22%3A%22OBJECTID%22%2C%22outStatisticFieldName%22%3A%22total%22%7D%5D` +
    `&f=json`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) throw new Error(`Permits HTTP ${res.status}`);

    const data = await res.json();
    if (data.error) throw new Error(`Permits error: ${data.error.message}`);

    const total = data.features?.[0]?.attributes?.total ?? 0;

    return {
      total,
      isLive: true,
      source: "Montgomery, AL Building Permits (live)",
      citationUrl: `${BASE}/Building_Permit_viewlayer/FeatureServer`,
      fetchedAt: new Date().toISOString(),
    };
  } catch (err) {
    console.warn("fetchBuildingPermitStats failed:", err);
    return {
      total: 0,
      isLive: false,
      source: "Montgomery, AL Building Permits (fallback)",
      citationUrl: `${BASE}/Building_Permit_viewlayer/FeatureServer`,
      fetchedAt: new Date().toISOString(),
    };
  }
}
