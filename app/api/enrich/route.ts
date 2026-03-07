import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.BRIGHTDATA_API_KEY;
const UNLOCKER_ZONE = process.env.BRIGHTDATA_UNLOCKER_ZONE || "web_unlocker1";

export async function POST(request: NextRequest) {
  let body: { tool?: string; params?: Record<string, unknown> };

  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!API_KEY) {
    return NextResponse.json({
      success: false,
      data: null,
      source: "mock",
      error: "BRIGHTDATA_API_KEY not configured — add it to Secrets to enable live enrichment",
    });
  }

  const { tool, params } = body;

  try {
    if (tool === "search_engine") {
      const query = params?.query as string;
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;

      const response = await fetch("https://api.brightdata.com/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zone: UNLOCKER_ZONE,
          url: searchUrl,
          format: "raw",
        }),
      });

      if (!response.ok) {
        throw new Error(`Bright Data error: ${response.status}`);
      }

      const html = await response.text();
      const snippet = html.slice(0, 2000);

      return NextResponse.json({
        success: true,
        data: snippet,
        source: "brightdata",
      });
    }

    if (tool === "scrape_as_markdown" || tool === "scrape_batch") {
      const query = params?.query as string;
      const targetUrl = `https://www.montgomeryal.gov/search?q=${encodeURIComponent(query)}`;

      const response = await fetch("https://api.brightdata.com/request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          zone: UNLOCKER_ZONE,
          url: targetUrl,
          format: "raw",
        }),
      });

      if (!response.ok) {
        throw new Error(`Bright Data error: ${response.status}`);
      }

      const html = await response.text();
      return NextResponse.json({
        success: true,
        data: html.slice(0, 3000),
        source: "brightdata",
      });
    }

    return NextResponse.json({ success: false, data: null, source: "mock", error: `Unknown tool: ${tool}` });
  } catch (error) {
    return NextResponse.json({
      success: false,
      data: null,
      source: "mock",
      error: error instanceof Error ? error.message : "Enrichment failed",
    });
  }
}
