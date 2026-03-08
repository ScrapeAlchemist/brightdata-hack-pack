import { cacheGet, cacheSet, TTL } from "@/app/lib/cache";

const CENSUS_BASE = "https://api.census.gov/data/2022/acs/acs5";
const STATE_FIPS = "01";
const COUNTY_FIPS = "101";
const CACHE_KEY = "census_montgomery";

export interface CensusMetrics {
  totalHousingUnits: number;
  vacantUnits: number;
  vacancyRate: number;
  povertyPop: number;
  totalPovPop: number;
  povertyRate: number;
  medianIncome: number;
  population: number;
  source: string;
  citation: string;
  isLive: boolean;
  fetchedAt: string;
}

const CENSUS_FALLBACK: CensusMetrics = {
  totalHousingUnits: 96421,
  vacantUnits: 14380,
  vacancyRate: 0.149,
  povertyPop: 45012,
  totalPovPop: 228971,
  povertyRate: 0.197,
  medianIncome: 48234,
  population: 228971,
  source: "US Census ACS 5-Year (cached fallback)",
  citation: "https://data.census.gov/profile/Montgomery_County,_Alabama",
  isLive: false,
  fetchedAt: new Date().toISOString(),
};

export async function fetchMontgomeryMetrics(): Promise<CensusMetrics> {
  const cached = cacheGet<CensusMetrics>(CACHE_KEY);
  if (cached) return cached;

  const vars = [
    "B25002_001E",
    "B25002_003E",
    "B17001_002E",
    "B17001_001E",
    "B19013_001E",
    "B01003_001E",
  ].join(",");

  const url = `${CENSUS_BASE}?get=NAME,${vars}&for=county:${COUNTY_FIPS}&in=state:${STATE_FIPS}`;

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`Census HTTP ${res.status}`);

    const data: string[][] = await res.json();
    if (!data || data.length < 2) throw new Error("Census: unexpected shape");

    const headers = data[0];
    const values = data[1];
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = values[i]; });

    const totalHousingUnits = parseInt(obj["B25002_001E"]) || 0;
    const vacantUnits = parseInt(obj["B25002_003E"]) || 0;
    const povertyPop = parseInt(obj["B17001_002E"]) || 0;
    const totalPovPop = parseInt(obj["B17001_001E"]) || 1;
    const medianIncome = parseInt(obj["B19013_001E"]) || 0;
    const population = parseInt(obj["B01003_001E"]) || 0;

    const result: CensusMetrics = {
      totalHousingUnits,
      vacantUnits,
      vacancyRate: totalHousingUnits > 0 ? vacantUnits / totalHousingUnits : 0,
      povertyPop,
      totalPovPop,
      povertyRate: totalPovPop > 0 ? povertyPop / totalPovPop : 0,
      medianIncome,
      population,
      source: "US Census ACS 5-Year 2022 (live)",
      citation: "https://api.census.gov/data/2022/acs/acs5",
      isLive: true,
      fetchedAt: new Date().toISOString(),
    };

    cacheSet(CACHE_KEY, result, TTL.CENSUS);
    return result;
  } catch (err) {
    console.warn("Census API unavailable, using fallback:", err);
    return CENSUS_FALLBACK;
  }
}
