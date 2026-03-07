export type MCPTool = "search_engine" | "scrape_as_markdown" | "scrape_batch";

export interface MCPResult {
  success: boolean;
  data: string | null;
  source: "brightdata" | "mock";
  error?: string;
}

export async function mcpCall(
  tool: MCPTool,
  params: Record<string, unknown>
): Promise<MCPResult> {
  try {
    const res = await fetch("/api/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool, params }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return await res.json();
  } catch (err) {
    return {
      success: false,
      data: null,
      source: "mock",
      error: err instanceof Error ? err.message : "MCP call failed",
    };
  }
}

export async function enrichParcel(parcelId: string, address: string): Promise<MCPResult> {
  return mcpCall("scrape_as_markdown", { query: `Montgomery AL property ${address} redevelopment`, parcelId });
}

export async function searchContext(query: string): Promise<MCPResult> {
  return mcpCall("search_engine", { query: `Montgomery Alabama ${query} urban planning` });
}
