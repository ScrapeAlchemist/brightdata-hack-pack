export interface TransportationResult {
  available: boolean;
  source: string;
  citationUrl: string;
  note: string;
}

export async function fetchALDOTProjects(): Promise<TransportationResult> {
  return {
    available: false,
    source: "Alabama Department of Transportation (ALDOT)",
    citationUrl: "https://www.dot.state.al.us/",
    note: "ALDOT project GIS data requires ALDOT GIS Services access. Using local infrastructure sample as fallback. Transit data for Montgomery Transit available at montgomeryal.gov/transportation.",
  };
}
