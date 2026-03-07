export interface MontgomeryGISResult {
  available: boolean;
  source: string;
  citationUrl: string;
  note: string;
}

export async function fetchMontgomeryParcels(): Promise<MontgomeryGISResult> {
  return {
    available: false,
    source: "Montgomery, Alabama GIS — Parcel Layer",
    citationUrl: "https://www.montgomeryal.gov/city-government/departments/information-technology/gis",
    note: "Montgomery city GIS parcel REST API is not publicly documented. Using curated sample dataset as primary parcel layer. For live data, contact IT Department at mongomeryal.gov/gis.",
  };
}

export async function fetchMontgomeryZoning(): Promise<MontgomeryGISResult> {
  return {
    available: false,
    source: "Montgomery, Alabama GIS — Zoning Layer",
    citationUrl: "https://www.montgomeryal.gov/community/planning-department",
    note: "Zoning shapefiles available on request from Montgomery Planning Department. Using curated zone context as fallback.",
  };
}
