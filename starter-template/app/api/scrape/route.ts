import { NextRequest, NextResponse } from "next/server";

const API_KEY = process.env.BRIGHTDATA_API_KEY;
const UNLOCKER_ZONE = process.env.BRIGHTDATA_UNLOCKER_ZONE || "web_unlocker1";

export async function POST(request: NextRequest) {
  if (!API_KEY) {
    return NextResponse.json(
      { error: "BRIGHTDATA_API_KEY not configured. Copy .env.example to .env and add your key." },
      { status: 500 }
    );
  }

  const { url } = await request.json();

  if (!url || typeof url !== "string") {
    return NextResponse.json({ error: "URL is required" }, { status: 400 });
  }

  try {
    const response = await fetch("https://api.brightdata.com/request", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        zone: UNLOCKER_ZONE,
        url,
        format: "raw",
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Bright Data error: ${response.status} - ${text}` },
        { status: response.status }
      );
    }

    const html = await response.text();
    return NextResponse.json({ html, url, length: html.length });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Scrape failed" },
      { status: 500 }
    );
  }
}
