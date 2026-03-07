export interface AlabamaDataResult {
  available: boolean;
  source: string;
  note: string;
}

export async function fetchAlabamaInfrastructureProjects(): Promise<AlabamaDataResult> {
  return {
    available: false,
    source: "Alabama Open Data Portal",
    note: "Alabama infrastructure project data requires direct API access. Using local sample data as fallback. Live integration available via data.alabama.gov.",
  };
}

export async function fetchMontgomeryPermits(): Promise<AlabamaDataResult> {
  return {
    available: false,
    source: "Montgomery, AL City Permits",
    note: "Montgomery permit data is not available via a public REST API. Contact Montgomery Community Development at montgomeryal.gov for bulk permit datasets.",
  };
}
