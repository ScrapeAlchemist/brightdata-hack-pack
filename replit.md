# Bright Data Hackathon Starter

A Next.js web scraper powered by Bright Data's Web Unlocker API. Enter a URL and get back the full HTML content of any webpage.

## Architecture

- **Framework**: Next.js 15 (App Router) with TypeScript
- **Frontend**: React 19 client component (`app/page.tsx`)
- **Backend**: Next.js API route (`app/api/scrape/route.ts`) — API key stays server-side, never exposed to the browser
- **Port**: 5000 (Replit standard)

## Project Structure

```
app/
  api/scrape/route.ts   # Server-side API route — calls Bright Data
  globals.css           # Global styles
  layout.tsx            # Root layout
  page.tsx              # Client UI component
next.config.ts
package.json
tsconfig.json
```

## Environment Variables (Secrets)

Set these in the Replit Secrets panel:

| Variable | Description |
|---|---|
| `BRIGHTDATA_API_KEY` | Your Bright Data API key (required) |
| `BRIGHTDATA_UNLOCKER_ZONE` | Zone name, defaults to `web_unlocker1` |
| `BRIGHTDATA_SERP_ZONE` | SERP zone name, defaults to `serp_api1` |

## Running

The app starts automatically via the "Start application" workflow (`npm run dev`).

## Security Notes

- The Bright Data API key is only accessed server-side in the API route
- URL validation enforces HTTP/HTTPS only
- No secrets are exposed to the client
