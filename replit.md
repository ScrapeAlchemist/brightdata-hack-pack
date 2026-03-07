# RevitaVibe Montgomery

AI Civic Land Intelligence Platform for Montgomery, Alabama.

## Overview

A Next.js 15 civic planning dashboard showing vacant parcels, infrastructure projects, and zoning data for Montgomery, AL, with live Census data integration and AI-powered parcel enrichment.

## Architecture

**Framework**: Next.js 15 (App Router) · TypeScript  
**Map**: Leaflet (client-only, `ssr:false` dynamic import)  
**Port**: 5000 (0.0.0.0) — configured for Replit

### Component Structure
```
app/
  page.tsx                  — Dashboard shell, fetches live metrics on load
  components/
    HeaderBar.tsx           — Top title bar with live status
    MetricCards.tsx         — 4 metric cards (live data aware)
    CityMap.tsx             — Leaflet map (static import, no SSR)
    LayerControls.tsx       — Layer toggle buttons
    ParcelDetailPanel.tsx   — Parcel detail + auto-enrichment on click
    CopilotPanel.tsx        — AI Copilot with 3 preset questions
    SummaryPanel.tsx        — Mayor summary panel + export
  api/
    datasets/route.ts       — Live Census ACS + OSM metrics endpoint
    enrich/route.ts         — Parcel enrichment (Bright Data → OpenAI → local)
    copilot/route.ts        — Copilot query handler
  lib/
    types.ts                — Shared types (LiveMetrics, EnrichmentResult, etc.)
    scoring.ts              — Opportunity score logic
    copilot.ts              — Copilot analysis logic
    mcpClient.ts            — Bright Data MCP abstraction
    datasets/
      census.ts             — US Census ACS 5-Year API (Montgomery County, AL)
      osm.ts                — OpenStreetMap Overpass API (parks, schools, bus stops)
      normalize.ts          — Merge all sources into normalized dataset
      alabamaOpenData.ts    — Alabama Open Data (stub — no public REST API)
      montgomeryGIS.ts      — Montgomery GIS (stub — no public REST API)
      transportation.ts     — ALDOT transportation (stub)
  data/
    vacancy_sample.json     — 20 curated Montgomery, AL parcels (sample)
    infrastructure_sample.json — 12 infrastructure projects (sample)
    zoning_sample.json      — 8 zone areas (sample)
```

## Live Data Sources

| Source | Status | Notes |
|--------|--------|-------|
| US Census ACS 5-Year 2022 | **LIVE** | No API key needed. Real vacancy/poverty/income for Montgomery County, AL (FIPS 01-101) |
| OpenStreetMap Overpass API | Fallback | Rate-limited/504 from Replit IP. Graceful fallback enabled |
| Montgomery, AL Parcels | Sample JSON | No public REST API. 20 curated parcels as primary parcel layer |
| Alabama Open Data | Stub | Limited machine-readable coverage; documented in code |
| ALDOT Transportation | Stub | Requires ALDOT GIS Services access |

## Auto-Enrichment Workflow

```
User clicks parcel on map
  → selectedParcel state updates
  → ParcelDetailPanel renders immediately
  → useEffect fires on parcel.id change
  → Calls /api/enrich in background
  → Loading spinner shown
  → Returns bullets + citations
  → Panel updates (no blocking)
```

Enrichment chain (in order of priority):
1. **Bright Data MCP** (if `BRIGHTDATA_API_KEY` set) — Google search → extract context
2. **OpenAI** (if `OPENAI_API_KEY` set) — Summarize into bullets with citations
3. **Local deterministic** — Rich parcel-specific insights with real Montgomery citations

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `BRIGHTDATA_API_KEY` | Optional | Enables live web enrichment via Bright Data |
| `OPENAI_API_KEY` | Optional | Enables AI summarization of enrichment |
| `BRIGHTDATA_UNLOCKER_ZONE` | Optional | Defaults to `web_unlocker1` |

## Workflow

**Start application**: `npm run dev` (port 5000, 0.0.0.0)

## Key Design Decisions

- Maryland datasets explicitly excluded (wrong geography — see comment in code)
- OSM fallback is silent and graceful (504 from Replit IP is expected)
- Census live data is the primary real-data layer (no auth needed, reliable)
- Parcel layer stays as curated sample JSON (no public Montgomery GIS REST API exists)
- All enrichment failures show user-friendly messages, never break the demo
- Citations always shown with real URLs to montgomeryal.gov, adeca.alabama.gov, data.census.gov, etc.
