# RevitaVibe Montgomery

AI Civic Land Intelligence Platform for Montgomery, Alabama.

## Overview

A Next.js 15 civic planning dashboard showing vacant parcels, infrastructure projects, parks, and zoning data for Montgomery, AL, with live US Census + Montgomery City GIS integration, Community Need scoring, and AI-powered parcel enrichment.

## Architecture

**Framework**: Next.js 15 (App Router) · TypeScript  
**Map**: Leaflet (client-only, `ssr:false` dynamic import)  
**Port**: 5000 (0.0.0.0) — configured for Replit

### Component Structure
```
app/
  page.tsx                  — Dashboard shell; fetches live metrics on load; community-enriched parcels
  components/
    HeaderBar.tsx           — Top title bar with live status
    MetricCards.tsx         — 4 metric cards (live Census + City GIS aware)
    CityMap.tsx             — Leaflet map; 4 layers: vacancy, zoning, infrastructure, community
    LayerControls.tsx       — Layer toggle buttons (4 layers including Community Need)
    ParcelDetailPanel.tsx   — Parcel detail + auto-enrichment + city records + live zoning + permit history
    CopilotPanel.tsx        — AI Copilot with 3 preset questions + map highlighting
    SummaryPanel.tsx        — Mayor summary + live data freshness timestamp + Community Need status
  api/
    datasets/route.ts       — Aggregates all live sources + computes community need per parcel
    enrich/route.ts         — Parcel enrichment pipeline: Bright Data → OpenAI → deterministic
    copilot/route.ts        — Copilot query handler
    parcel-lookup/route.ts  — Live city parcel lookup: Parcels_Owner + Building_Permit_viewlayer
  lib/
    cache.ts                — In-memory TTL cache (Map-based, per-spec TTLs)
    types.ts                — Shared types (LiveMetrics, VacancyParcel, ParcelLookupResult, PermitRecord, etc.)
    scoring.ts              — Opportunity score + Community Need Score computation
    copilot.ts              — Copilot analysis logic
    mcpClient.ts            — Bright Data MCP abstraction
    datasets/
      census.ts             — US Census ACS 5-Year API (Montgomery County, AL — FIPS 01-101); 24hr cache
      osm.ts                — OpenStreetMap Overpass API (parks, schools, bus stops); 30min cache
      montgomeryGIS.ts      — Montgomery City GIS: infra, parks, parcel lookup, permit history, live zoning
      permits.ts            — Building Permit count from Montgomery City GIS; 15min cache
      normalize.ts          — Normalization helpers
  data/
    vacancy_sample.json     — 20 curated Montgomery, AL opportunity parcels (sample, shown immediately)
    infrastructure_sample.json — 12 infrastructure items (fallback if GIS unavailable)
    zoning_sample.json      — 8 zone areas (sample)
```

## Live Data Sources

| Source | Status | TTL Cache | Notes |
|--------|--------|-----------|-------|
| **US Census ACS 5-Year 2022** | **🟢 LIVE** | 24 hours | Real vacancy (14.9%), poverty (19.6%), income ($56,707) for Montgomery County, AL |
| **Montgomery City GIS — Infrastructure Improvement Projects** | **🟢 LIVE** | 1 hour | 23 projects with valid centroids. Road resurfacing, streetscapes, ROW acquisition. |
| **Montgomery City GIS — Parks & Trail** | **🟢 LIVE** | 1 hour | 96 real Montgomery parks as points in WGS84. Shown as 🌳 on map. |
| **Montgomery City GIS — Building Permits** | **🟢 LIVE** | 15 min | 24,016 total permits. Also used for live Zoning field per parcel. |
| **Montgomery City GIS — Parcels_Owner** | **🟢 LIVE (lookup)** | 20 min | Address-based lookup for parcel detail panel. Cross-referenced with Building_Permit_viewlayer. |
| **Community Need Score** | **🟢 LIVE (computed)** | N/A | Computed from Census poverty rate + permit inactivity + priority. Proxy for 311 data. |
| OpenStreetMap Overpass API | Rate-limited | 30 min | 429 from Replit IP. Graceful fallback. |
| Vacancy/Zoning/Opportunity parcels | Sample JSON | — | 20 curated parcels with scores. Enriched with community need on load. |

## Montgomery City GIS FeatureServer URLs

Organization ID: `xNUwUjOJqYE54USz`  
Base: `https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/`

- Infrastructure: `INFRASTRUCTURE_IMPROVEMENT_PROJECTS/FeatureServer/0`
- Parks: `Park_and_Trail/FeatureServer/0`
- Permits: `Building_Permit_viewlayer/FeatureServer/0` (fields: ParcelNo, **Zoning**, IssuedDate, PermitStatus, PermitCode, ProjectType, EstimatedCost)
- Parcels: `Parcels_Owner/FeatureServer/0` (fields: ParcelNo, PropertyAddr1, OwnerName, Neighborhood, TotalValue, LandUseCode, Calc_Acre)

Note: Zoning GIS service requires auth token (499). Live zoning derived from Building_Permit_viewlayer `Zoning` field instead.

## Map Layers (4 total)

| Layer | Source | Visual |
|-------|--------|--------|
| **Vacancy / Redevelopment** | Curated sample parcels | Red/orange/yellow circles by priority |
| **Zoning Compatibility** | Sample zoning JSON | Color squares by compatibility |
| **Infrastructure / Permits** | Live GIS infra (23) + Live parks (96) | Blue diamonds + green 🌳 dots |
| **Community Need** (NEW) | Computed: Census poverty + permit inactivity | Red/orange/yellow circles by need score |

## Parcel Click Workflow

```
User clicks parcel
  → Panel renders immediately (from sample/live data)
  → TWO parallel background calls:
      ① /api/enrich → Bright Data MCP → OpenAI → local insights
      ② /api/parcel-lookup → Parcels_Owner (owner, value, land use)
                          → Building_Permit_viewlayer (live Zoning + permit history)
  → Results render independently as they arrive
  → City Records shows: Parcel#, Owner, Value, Land Use, Live Zoning 🟢, Acreage
  → Permit History table: Date, Type, Status, Est. Cost
  → Community Need score bar with Census + Permits attribution
```

## Community Need Score (311 Proxy)

Since Montgomery, AL has no public 311 API, the Community Need Score is a live proxy:
- **Inputs**: permit_inactive_years (40 pts) + Census poverty rate (30 pts) + infrastructure context keywords (15 pts) + priority (15 pts)
- **Source labeling**: Clearly labeled "Source: Census ACS + Montgomery Building Permits"
- **Map layer**: "Community Need" toggle shows parcels colored by need score
- **Parcel panel**: Orange score bar with label (High/Moderate/Low)

## Performance

| Layer | Method | Typical first-call | Subsequent (cached) |
|-------|--------|--------------------|---------------------|
| Census ACS | HTTP fetch + in-memory cache | ~1.2s | <5ms (24hr TTL) |
| GIS Infra/Parks | HTTP fetch + in-memory cache | ~2s | <5ms (1hr TTL) |
| Permits count | HTTP fetch + in-memory cache | ~0.8s | <5ms (15min TTL) |
| `/api/datasets` | Promise.allSettled of above | ~2-3s | ~58ms |

## Enrichment + Zoning Sources

Enrichment chain:
1. **Bright Data MCP** (`BRIGHTDATA_API_KEY`) → Google search → web context
2. **OpenAI** (`OPENAI_API_KEY`) → Summarize into bullets
3. **Local deterministic** → Rich parcel-specific insights with real Montgomery citations

Live zoning:
- Queried from `Building_Permit_viewlayer` by `ParcelNo` (after Parcels_Owner lookup)
- Cached 20 minutes per parcel

## Environment Variables

| Variable | Required | Purpose |
|----------|----------|---------|
| `BRIGHTDATA_API_KEY` | Optional | Enables live web enrichment via Bright Data |
| `OPENAI_API_KEY` | Optional | Enables AI summarization |
| `BRIGHTDATA_UNLOCKER_ZONE` | Optional | Defaults to `web_unlocker1` |

## Workflow

**Start application**: `npm run dev` (port 5000, 0.0.0.0)

## Known Limitations

- Zoning GIS service at Montgomery GIS org requires auth (Token Required) — using Building_Permit_viewlayer `Zoning` field as live proxy
- 311 Service Requests: No public API at Montgomery GIS or Socrata — Community Need Score is the live proxy
- Vacant_Properties GIS service: Layer doesn't exist publicly — using curated 20-parcel sample
- OSM Overpass: Rate limited from Replit IP (429) — graceful fallback
- Parcel layer (vacancyData): Curated sample only (no public full-city parcel REST API with coordinates)
