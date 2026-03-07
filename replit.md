# RevitaVibe Montgomery

AI Civic Land Intelligence Platform for Montgomery, Alabama.

## Overview

A Next.js 15 civic planning dashboard showing vacant parcels, infrastructure projects, parks, and zoning data for Montgomery, AL, with live US Census + Montgomery City GIS integration and AI-powered parcel enrichment.

## Architecture

**Framework**: Next.js 15 (App Router) · TypeScript  
**Map**: Leaflet (client-only, `ssr:false` dynamic import)  
**Port**: 5000 (0.0.0.0) — configured for Replit

### Component Structure
```
app/
  page.tsx                  — Dashboard shell; fetches live metrics on load; uses live infra/parks for map
  components/
    HeaderBar.tsx           — Top title bar with live status
    MetricCards.tsx         — 4 metric cards (live Census + City GIS aware)
    CityMap.tsx             — Leaflet map; accepts live infrastructure + parks props
    LayerControls.tsx       — Layer toggle buttons (vacancy / zoning / infrastructure)
    ParcelDetailPanel.tsx   — Parcel detail + auto-enrichment + city records lookup on click
    CopilotPanel.tsx        — AI Copilot with 3 preset questions + map highlighting
    SummaryPanel.tsx        — Mayor summary panel + Export JSON + live data status row
  api/
    datasets/route.ts       — Aggregates all live sources: Census + GIS Infra + GIS Parks + Permits + OSM
    enrich/route.ts         — Parcel enrichment pipeline: Bright Data → OpenAI → deterministic
    copilot/route.ts        — Copilot query handler
    parcel-lookup/route.ts  — Live city parcel records lookup by address (Parcels_Owner)
  lib/
    types.ts                — Shared types (LiveMetrics, InfrastructureItem, ParkItem, EnrichmentResult, etc.)
    scoring.ts              — Opportunity score logic
    copilot.ts              — Copilot analysis logic
    mcpClient.ts            — Bright Data MCP abstraction
    datasets/
      census.ts             — US Census ACS 5-Year API (Montgomery County, AL — FIPS 01-101)
      osm.ts                — OpenStreetMap Overpass API (parks, schools, bus stops)
      montgomeryGIS.ts      — Montgomery City GIS: infrastructure projects, parks, parcel lookup
      permits.ts            — Building Permit count from Montgomery City GIS FeatureServer
      normalize.ts          — Normalization helpers
      alabamaOpenData.ts    — Alabama Open Data (stub — limited public API)
      transportation.ts     — ALDOT transportation (stub)
  data/
    vacancy_sample.json     — 20 curated Montgomery, AL opportunity parcels (sample)
    infrastructure_sample.json — 12 infrastructure items (fallback if GIS unavailable)
    zoning_sample.json      — 8 zone areas (sample)
```

## Live Data Sources

| Source | Status | Notes |
|--------|--------|-------|
| **US Census ACS 5-Year 2022** | **LIVE** | No auth needed. Real vacancy (14.9%), poverty (19.6%), income ($56,707) for Montgomery County, AL |
| **Montgomery City GIS — Infrastructure Improvement Projects** | **LIVE** | ArcGIS FeatureServer. 97 real projects (centroid query returns ~23 with valid coords). Road resurfacing, streetscapes, ROW acquisition. |
| **Montgomery City GIS — Parks & Trail** | **LIVE** | ArcGIS FeatureServer. 96 real Montgomery parks as points in WGS84. Shown as 🌳 on map. |
| **Montgomery City GIS — Building Permits** | **LIVE** | ArcGIS FeatureServer. 24,016 total permits in system. |
| **Montgomery City GIS — Parcels_Owner** | **LIVE (lookup only)** | ArcGIS FeatureServer. Address-based lookup for parcel detail panel. |
| OpenStreetMap Overpass API | Rate-limited | 429/504 from Replit IP. Graceful fallback. |
| Vacancy/Zoning/Opportunity parcels | Sample JSON | 20 curated parcels with scores. No public REST API for city parcels. |
| Alabama Open Data / ALDOT | Stubs | Limited machine-readable coverage. Documented with contact info. |

## Montgomery City GIS FeatureServer URLs

Organization ID: `xNUwUjOJqYE54USz`  
Base: `https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/`

- Infrastructure: `INFRASTRUCTURE_IMPROVEMENT_PROJECTS/FeatureServer/0`
- Parks: `Park_and_Trail/FeatureServer/0`
- Permits: `Building_Permit_viewlayer/FeatureServer/0`
- Parcels: `Parcels_Owner/FeatureServer/0` (fields: ParcelNo, PropertyAddr1, OwnerName, Neighborhood, TotalValue, LandUseCode, Calc_Acre)

## Auto-Enrichment + City Lookup Workflow

```
User clicks parcel on map
  → selectedParcel state updates
  → ParcelDetailPanel renders immediately
  → useEffect fires on parcel.id change (TWO background calls)
      ① /api/enrich (AI enrichment with citations)
      ② /api/parcel-lookup (city assessor records)
  → Loading indicators shown for both
  → Results update independently as they return
  → Never blocks the UI
```

Enrichment chain:
1. **Bright Data MCP** (`BRIGHTDATA_API_KEY`) → Google search → web context
2. **OpenAI** (`OPENAI_API_KEY`) → Summarize into bullets
3. **Local deterministic** → Rich parcel-specific insights with real Montgomery citations

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `BRIGHTDATA_API_KEY` | Optional | Enables live web enrichment via Bright Data |
| `OPENAI_API_KEY` | Optional | Enables AI summarization |
| `BRIGHTDATA_UNLOCKER_ZONE` | Optional | Defaults to `web_unlocker1` |

## Workflow

**Start application**: `npm run dev` (port 5000, 0.0.0.0)

## Key Design Decisions

- Maryland datasets explicitly excluded (geography mismatch documented)
- OSM graceful fallback (rate-limited from Replit; works in production environments)
- Census live data works without any API key
- City GIS live data (ArcGIS REST) works without any API key
- Parcel layer stays curated sample (no public full-city GIS parcel export API)
- All enrichment failures show user-friendly messages, never break the demo
- Citations always link to real Montgomery/Alabama sources
