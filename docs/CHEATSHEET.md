# Bright Data API Cheat Sheet

One-page quick reference. Bookmark this.

---

## Authentication

```
API Key:    Authorization: Bearer YOUR_API_KEY
Proxy:      brd-customer-ID-zone-NAME:PASSWORD@brd.superproxy.io:PORT
Browser:    wss://USER:PASS@brd.superproxy.io:9222
```

Get your API key: [brightdata.com/cp/setting/users](https://brightdata.com/cp/setting/users)

---

## What's a Zone?

A **zone** is a configured instance of a Bright Data product — think of it as a named access point with its own settings and credentials. Every API call requires a zone name to tell Bright Data which product to route through.

| Product | Zone Example | Where It's Used |
|---------|-------------|-----------------|
| Web Unlocker | `web_unlocker1` | `"zone"` field in API request body |
| SERP API | `serp_api1` | `"zone"` field in API request body |
| Web Scraper API | *(uses `dataset_id` instead)* | `dataset_id` query parameter |
| Scraping Browser | `scraping_browser1` | Embedded in WebSocket username |

**Find your zones:** [brightdata.com/cp/zones](https://brightdata.com/cp/zones)

Each zone shows its **name**, **type**, and **credentials**. For Scraping Browser, you'll also need the **username** and **password** from the zone's Overview tab.

---

## Endpoints at a Glance

| Product | Endpoint | Method |
|---------|----------|--------|
| Web Scraper API | `https://api.brightdata.com/datasets/v3/scrape` | POST |
| SERP API | `https://api.brightdata.com/request` | POST |
| Web Unlocker | `https://api.brightdata.com/request` | POST |
| Web Unlocker (proxy) | `brd.superproxy.io:33335` | GET via proxy |
| Scraping Browser | `wss://...@brd.superproxy.io:9222` | WebSocket |

---

## Web Scraper API

```bash
curl -X POST "https://api.brightdata.com/datasets/v3/scrape?dataset_id=DATASET_ID&format=json" \
  -H "Authorization: Bearer API_KEY" \
  -H "Content-Type: application/json" \
  -d '[{"url": "https://www.amazon.com/dp/B0CRMZHDG8"}]'
```

**Response:** `200` = JSON data, `202` = queued (use `snapshot_id` to poll)

---

## SERP API

```bash
curl -X POST "https://api.brightdata.com/request" \
  -H "Authorization: Bearer API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"zone": "ZONE_NAME", "url": "https://www.google.com/search?q=query", "format": "json"}'
```

**Formats:** `"raw"` = HTML, `"json"` = parsed results

---

## Web Unlocker

```bash
curl -X POST "https://api.brightdata.com/request" \
  -H "Authorization: Bearer API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"zone": "ZONE_NAME", "url": "https://target.com", "format": "raw"}'
```

**Or via proxy** (requires [SSL certificate](https://brightdata.com/static/brightdata_proxy_ca.zip) for HTTPS targets):
```bash
curl -x "http://brd-customer-ID-zone-NAME:PASS@brd.superproxy.io:33335" \
  --cacert /path/to/ca.crt "https://target.com"
```

---

## Scraping Browser

**Puppeteer (Node.js):**
```javascript
const browser = await puppeteer.connect({
  browserWSEndpoint: `wss://${USER}:${PASS}@brd.superproxy.io:9222`
});
```

**Playwright (Python):**
```python
browser = await pw.chromium.connect_over_cdp(
    f"wss://{USER}:{PASS}@brd.superproxy.io:9222"
)
```

---

## Status Codes

| Code | Meaning |
|------|---------|
| 200 | Success — data in response body |
| 202 | Queued — poll with snapshot_id |
| 401 | Bad API key |
| 403 | Zone not authorized for this action |
| 407 | Bad proxy/browser credentials |
| 429 | Rate limited — slow down |
| 500 | Server error — retry |

---

## Python SDK Shortcut

```bash
pip install brightdata
```

```python
from brightdata import BrightDataClient

async with BrightDataClient() as client:
    result = await client.scrape_url("https://example.com")
    search = await client.search.google(query="python")
```

---

## Environment Variables

```bash
# API access (Web Scraper, SERP, Web Unlocker)
export BRIGHTDATA_API_KEY="your_api_key"

# Zone names (from control panel)
export BRIGHTDATA_SERP_ZONE="serp_api1"
export BRIGHTDATA_UNLOCKER_ZONE="web_unlocker1"
export BRIGHTDATA_DATASET_ID="gd_xxxxx"

# Scraping Browser credentials
export BRIGHTDATA_BROWSER_USER="brd-customer-XXXXX-zone-XXXXX"
export BRIGHTDATA_BROWSER_PASS="zone_password"
```
