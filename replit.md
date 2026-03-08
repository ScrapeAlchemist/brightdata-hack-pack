# RevitaVibe Montgomery

AI Civic Land Intelligence Platform for Montgomery, Alabama.

## Overview

A Next.js 15 civic planning dashboard showing vacant parcels, infrastructure projects, parks, transit stops, code violations, and zoning data for Montgomery, AL, with live US Census (city-level) + Montgomery City GIS integration, Community Need scoring, and AI-powered parcel enrichment.

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
    MetricCards.tsx         — 4 metric cards: Vacant Lots, High Priority, Park-Ready, Open Code Violations
    CityMap.tsx             — Leaflet map; 4 layers: vacancy, zoning, infrastructure, community
    LayerControls.tsx       — Layer toggle buttons (4 layers including Community Need)
    ParcelDetailPanel.tsx   — Parcel detail + auto-enrichment + city records + violations + permits
    CopilotPanel.tsx        — AI Copilot with 3 preset questions + map highlighting
    SummaryPanel.tsx        — Mayor summary + live data freshness + 9 data source badges
  api/
    datasets/route.ts       — Aggregates 7 live sources in parallel + computes community need per parcel
    enrich/route.ts         — Parcel enrichment pipeline: Bright Data → OpenAI → deterministic
    copilot/route.ts        — Copilot query handler
    parcel-lookup/route.ts  — Live city parcel lookup: Parcels_Owner + Building_Permit_viewlayer + Code_Violations_view
  lib/
    cache.ts                — In-memory TTL cache (Map-based, per-spec TTLs)
    types.ts                — Shared types (LiveMetrics, VacancyParcel, ParcelLookupResult, PermitRecord, TransitStop, CodeViolation, CopilotResponse, etc.)
    scoring.ts              — Opportunity score + Community Need Score computation
    copilot.ts              — Copilot analysis logic
    mcpClient.ts            — Bright Data MCP abstraction
    datasets/
      census.ts             — US Census ACS 5-Year API (City of Montgomery place FIPS 01-51000); 24hr cache
      osm.ts                — OpenStreetMap Overpass API (parks, schools, bus stops); 30min cache; bbox covers full city
      montgomeryGIS.ts      — Montgomery City GIS: infra, parks, transit stops, code violations, parcel lookup
      permits.ts            — Building Permit count from Montgomery City GIS; 15min cache
      normalize.ts          — Normalization helpers
  data/
    vacancy_sample.json     — 20 curated Montgomery, AL opportunity parcels (sample, shown immediately)
    infrastructure_sample.json — 12 infrastructure items (fallback if GIS unavailable)
    zoning_sample.json      — 8 zone areas (sample)
```

## Live Data Sources (7 sources, fetched in parallel)

| Source | Status | TTL Cache | Notes |
|--------|--------|-----------|-------|
| **US Census ACS 5-Year 2022** | **🟢 LIVE** | 24 hours | City of Montgomery place FIPS `01-51000`. Vacancy 15.2%, poverty 21.2%, income $54,166 |
| **Montgomery City GIS — Infrastructure Improvement Projects** | **🟢 LIVE** | 1 hour | 23 projects with valid centroids. Road resurfacing, streetscapes, ROW acquisition. |
| **Montgomery City GIS — Parks & Trail** | **🟢 LIVE** | 1 hour | 96 real Montgomery parks. Shown as 🌳 on map infrastructure layer. |
| **Montgomery City GIS — Building Permits** | **🟢 LIVE** | 15 min | 24,016 total permits. Also used for live Zoning field per parcel. |
| **Montgomery City GIS — TheM_Stops (Transit)** | **🟢 LIVE** | 1 hour | 200 bus stops sampled from 1,613 total. Shown as blue dots on infrastructure layer. |
| **Montgomery City GIS — Code_Violations_view** | **🟢 LIVE** | 15 min | 14,487 open violations out of 61,056 total. Per-parcel lookup by ParcelNo. |
| **Montgomery City GIS — Parcels_Owner** | **🟢 LIVE (lookup)** | 20 min | Address-based lookup for parcel detail panel. Cross-referenced with permits + violations. |
| Community Need Score | Computed | N/A | Computed from Census poverty rate (21.2%) + permit inactivity + priority. |
| OpenStreetMap Overpass API | Rate-limited | 30 min | 429 from Replit IP. Graceful fallback. |

## Montgomery City GIS FeatureServer URLs

Organization ID: `xNUwUjOJqYE54USz`  
Base: `https://services7.arcgis.com/xNUwUjOJqYE54USz/arcgis/rest/services/`

- Infrastructure: `INFRASTRUCTURE_IMPROVEMENT_PROJECTS/FeatureServer/0`
- Parks: `Park_and_Trail/FeatureServer/0`
- Permits: `Building_Permit_viewlayer/FeatureServer/0` (fields: ParcelNo, Zoning, IssuedDate, PermitStatus, PermitCode, ProjectType, EstimatedCost)
- Parcels: `Parcels_Owner/FeatureServer/0` (fields: ParcelNo, PropertyAddr1, OwnerName, Neighborhood, TotalValue, LandUseCode, Calc_Acre)
- Transit: `TheM_Stops/FeatureServer/0` (fields: stop_id, stop_name, stop_lat, stop_lon) — 1,613 stops total
- Code Violations: `Code_Violations_view/FeatureServer/0` (fields: OffenceNum, CaseDate, CaseType, CaseStatus, LienStatus, ParcelNo) — 61,056 records; ParcelNo matches Parcels_Owner format

## Map Layers (4 total)

| Layer | Source | Visual |
|-------|--------|--------|
| **Vacancy / Redevelopment** | Curated sample parcels | Red/orange/yellow circles by priority |
| **Zoning Compatibility** | Sample zoning JSON | Color squares by compatibility |
| **Infrastructure / Permits** | Live GIS infra (23) + Live parks (96) + Live transit (200) | Blue diamonds + 🌳 + blue dots |
| **Community Need** | Computed: Census poverty + permit inactivity | Red/orange/yellow circles by need score |

## Parcel Click Workflow

```
User clicks parcel
  → Panel renders immediately (from sample/live data)
  → TWO parallel background calls:
      ① /api/enrich → Bright Data MCP → OpenAI → local insights
      ② /api/parcel-lookup → Parcels_Owner (owner, value, land use)
                          → Building_Permit_viewlayer (live Zoning + permit history)
                          → Code_Violations_view (open violations + recent 5 cases)
  → Results render independently as they arrive
  → City Records shows: Parcel#, Owner, Value, Land Use, Live Zoning 🟢, Acreage
  → Permit History table: Date, Type, Status, Est. Cost
  → Code Violations section: open count + case table (CaseDate, CaseType, Status, Lien)
  → Community Need score bar labeled "Census + Permits + Code Violations"
```

## Community Need Score (311 Proxy)

Since Montgomery, AL has no public 311 API, the Community Need Score is a live proxy:
- **Inputs**: permit_inactive_years (40 pts) + Census poverty rate 21.2% (30 pts) + infrastructure context keywords (15 pts) + priority (15 pts)
- **Default poverty**: 0.212 (City of Montgomery Census ACS 2022)
- **Map layer**: "Community Need" toggle shows parcels colored by need score

## Census Geography

- **Place FIPS**: `51000` (City of Montgomery, AL)
- **State FIPS**: `01` (Alabama)
- **API query**: `for=place:51000&in=state:01`
- **Cache key**: `census_montgomery_city`
- **City bounds** (used for GIS bounding): lat 32.27–32.52, lng -86.47 to -86.10

## Performance

| Layer | Method | Typical first-call | Subsequent (cached) |
|-------|--------|--------------------|---------------------|
| Census ACS | HTTP fetch + in-memory cache | ~1.2s | <5ms (24hr TTL) |
| GIS Infra/Parks | HTTP fetch + in-memory cache | ~2s | <5ms (1hr TTL) |
| GIS Transit | HTTP fetch + in-memory cache | ~1s | <5ms (1hr TTL) |
| GIS Code Violations | HTTP fetch + in-memory cache | ~1.5s | <5ms (15min TTL) |
| Permits count | HTTP fetch + in-memory cache | ~0.8s | <5ms (15min TTL) |
| `/api/datasets` | Promise.allSettled of 7 sources | ~2-3s | ~12ms |

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
- 311 Service Requests: No public API — Community Need Score is the live proxy
- Vacant_Properties GIS service: Layer doesn't exist publicly — using curated 20-parcel sample
- OSM Overpass: Rate limited from Replit IP (429) — graceful fallback
- Transit stops: Only 200 of 1,613 total displayed (map performance)
- Code violations per parcel: Requires address → ParcelNo lookup via Parcels_Owner first
