# RevitaVibe Montgomery — AI Civic Land Intelligence Platform

A hackathon MVP civic planning dashboard built on Next.js 15. Transforms the Bright Data hackathon starter into a polished, demoable product for city planners and mayors.

## What It Does

Interactive single-page dashboard for Montgomery, AL that identifies vacant land redevelopment opportunities, visualizes infrastructure projects, and answers urban planning questions via an AI Copilot.

## Architecture

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Map**: Leaflet + custom Leaflet imperative hooks (`app/components/CityMap.tsx`) — dynamically imported with `ssr: false`
- **Data**: Local JSON sample datasets (20 parcels, 12 infra projects, 8 zones) — swappable with real GIS data
- **Scoring**: Weighted opportunity score (vacancy 40%, zoning 25%, infra 20%, permit inactivity 15%) in `app/lib/scoring.ts`
- **Copilot**: Deterministic keyword-matching logic in `app/lib/copilot.ts` — upgrades to OpenAI if `OPENAI_API_KEY` set
- **MCP**: Bright Data enrichment stub in `app/lib/mcpClient.ts` + `app/lib/enrichment.ts` — activates when `BRIGHTDATA_API_KEY` is set
- **Port**: 5000 (Replit standard)

## File Structure

```
app/
  page.tsx                        ← Main dashboard (state + layout)
  layout.tsx                      ← Root layout + metadata
  globals.css                     ← All dashboard styles
  components/
    HeaderBar.tsx                 ← Title bar with Bright Data badge
    MetricCards.tsx               ← 4 metric summary cards
    CityMap.tsx                   ← Leaflet map (client-only, ssr:false)
    LayerControls.tsx             ← Vacancy/Zoning/Infrastructure toggles
    ParcelDetailPanel.tsx         ← Click-to-open parcel detail + MCP enrich
    CopilotPanel.tsx              ← AI Copilot with preset questions
    SummaryPanel.tsx              ← Mayor Redevelopment Summary + export
  data/
    vacancy_sample.json           ← 20 Montgomery vacant parcels (MOCK)
    infrastructure_sample.json    ← 12 infrastructure projects (MOCK)
    zoning_sample.json            ← 8 zoning areas (MOCK)
  lib/
    types.ts                      ← Shared TypeScript interfaces
    scoring.ts                    ← Opportunity score algorithm
    copilot.ts                    ← Copilot logic + preset questions
    mcpClient.ts                  ← Bright Data MCP abstraction
    enrichment.ts                 ← Parcel enrichment layer
  api/
    copilot/route.ts              ← POST /api/copilot
    enrich/route.ts               ← POST /api/enrich (Bright Data MCP)
    scrape/route.ts               ← Original scrape endpoint (preserved)
```

## Environment Variables (Secrets)

| Variable | Effect |
|---|---|
| `BRIGHTDATA_API_KEY` | Enables live enrichment in parcel panel + Copilot |
| `BRIGHTDATA_UNLOCKER_ZONE` | Zone name, defaults to `web_unlocker1` |
| `OPENAI_API_KEY` | (Future) Enable real LLM Copilot responses |

## Mock vs Live

| Feature | Status |
|---|---|
| Map data (parcels, infra, zones) | MOCK — local JSON |
| Opportunity scoring | LIVE — computed from data |
| Copilot responses | MOCK — deterministic keyword logic |
| Map highlighting from Copilot | LIVE — works now |
| Parcel click interaction | LIVE — works now |
| Layer toggles | LIVE — works now |
| Bright Data enrichment | STUB — activates with API key |
| Export Summary button | LIVE — downloads JSON |

## Packages Added

- `leaflet` — map rendering
- `react-leaflet` — (installed, Leaflet used directly for SSR safety)
- `@types/leaflet` — TypeScript types
