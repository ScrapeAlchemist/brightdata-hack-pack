# Which Bright Data Product Should I Use?

## Zones — The Key Concept

Before diving into products, understand **zones**. A zone is a configured instance of a Bright Data product. When you create a Web Unlocker zone, you get a zone name like `web_unlocker1` — that's what you pass in every API call to tell Bright Data which product to use.

**How to set up a zone:**
1. Go to [brightdata.com/cp/zones](https://brightdata.com/cp/zones)
2. Click **Add Zone** and pick the product type
3. Give it a name (or use the auto-generated one)
4. Copy the zone name into your environment variables or code

> **Hackathon shortcut:** Default zones are usually created when you sign up. Check your [control panel](https://brightdata.com/cp/zones) — you may already have `web_unlocker1` and `serp_api1` ready to go.

---

## Quick Decision Tree

```
What do you need?
│
├── Structured data from a popular site (Amazon, LinkedIn, Instagram...)
│   └── ✅ Web Scraper API
│
├── Search engine results (Google, Bing, etc.)
│   └── ✅ SERP API
│
├── Interact with a page (click, scroll, fill forms, screenshots)
│   └── ✅ Scraping Browser
│
├── Just get a page's HTML without being blocked
│   └── ✅ Web Unlocker
│
└── Not sure?
    └── Start with Web Unlocker — it works on any site
```

---

## Product Comparison

| Product | Best For | Returns | Difficulty |
|---------|----------|---------|------------|
| **Web Scraper API** | Getting clean JSON from supported sites | Structured JSON | Easy |
| **SERP API** | Search results from any engine | HTML or parsed JSON | Easy |
| **Scraping Browser** | JS-heavy sites, SPAs, interactions | Full browser access | Medium |
| **Web Unlocker** | Any URL, raw HTML needed | Raw HTML | Easy |

---

## Web Scraper API

**What it does:** Pre-built scrapers that return structured JSON data from popular websites.

**Supported sites:** Amazon, LinkedIn, Instagram, Facebook, TikTok, YouTube, Reddit, Zillow, and [many more](https://brightdata.com/products/web-scraper).

**Best for:**
- Getting product data, prices, reviews
- Scraping social media profiles and posts
- Any task where you need clean, structured data

**Endpoint:** `POST https://api.brightdata.com/datasets/v3/scrape`

**Example:**
```python
response = requests.post(
    "https://api.brightdata.com/datasets/v3/scrape",
    headers={"Authorization": f"Bearer {API_KEY}"},
    params={"dataset_id": DATASET_ID, "format": "json"},
    json=[{"url": "https://www.amazon.com/dp/B0CRMZHDG8"}],
)
print(response.json())  # Structured product data!
```

**Docs:** [Web Scraper API Documentation](https://docs.brightdata.com/datasets/scrapers/scrapers-library/overview)

---

## SERP API

**What it does:** Returns search engine results from Google, Bing, and other engines without being blocked.

**Best for:**
- Building search-powered apps
- Competitor analysis
- SEO tools
- Market research

**Endpoint:** `POST https://api.brightdata.com/request`

**Example:**
```python
response = requests.post(
    "https://api.brightdata.com/request",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "zone": SERP_ZONE,
        "url": "https://www.google.com/search?q=best+python+libraries",
        "format": "json",
    },
)
print(response.json())  # Parsed search results!
```

**Docs:** [SERP API Documentation](https://docs.brightdata.com/scraping-automation/serp-api/introduction)

---

## Scraping Browser

**What it does:** A remote Chromium browser that you control via Puppeteer or Playwright. Handles CAPTCHAs, fingerprinting, and proxy rotation automatically.

**Best for:**
- JavaScript-heavy sites (SPAs, React apps)
- Sites that require interaction (login, scroll, click)
- Taking screenshots
- Anything that needs a real browser

**Connection:** `wss://USER:PASS@brd.superproxy.io:9222`

**Example (Playwright):**
```python
from playwright.async_api import async_playwright

async with async_playwright() as pw:
    browser = await pw.chromium.connect_over_cdp(
        f"wss://{USER}:{PASS}@brd.superproxy.io:9222"
    )
    page = await browser.new_page()
    await page.goto("https://example.com")
    title = await page.title()
```

**Example (Puppeteer):**
```javascript
const browser = await puppeteer.connect({
    browserWSEndpoint: `wss://${USER}:${PASS}@brd.superproxy.io:9222`
});
const page = await browser.newPage();
await page.goto("https://example.com");
```

**Docs:** [Scraping Browser Documentation](https://docs.brightdata.com/scraping-automation/scraping-browser/introduction)

---

## Web Unlocker

**What it does:** Proxies your request through Bright Data's infrastructure, automatically handling blocks, CAPTCHAs, and fingerprinting. Returns the raw HTML.

**Best for:**
- Getting HTML from any website
- Sites that block regular requests
- When you need raw HTML to parse yourself
- The "just make it work" option

**Endpoint:** `POST https://api.brightdata.com/request`

**Alternative (proxy):** `http://brd-customer-ID-zone-NAME:PASS@brd.superproxy.io:33335`

**Example:**
```python
response = requests.post(
    "https://api.brightdata.com/request",
    headers={"Authorization": f"Bearer {API_KEY}"},
    json={
        "zone": UNLOCKER_ZONE,
        "url": "https://www.example.com",
        "format": "raw",
    },
)
print(response.text)  # Raw HTML!
```

**Docs:** [Web Unlocker Documentation](https://docs.brightdata.com/scraping-automation/web-unlocker/introduction)

---

## Python SDK (Shortcut)

Don't want to deal with raw API calls? Use the official Python SDK:

```bash
pip install brightdata
```

```python
from brightdata import BrightDataClient

async with BrightDataClient() as client:
    # Scrape any URL
    result = await client.scrape_url("https://example.com")

    # Search Google
    result = await client.search.google(query="python scraping")

    # Platform-specific scrapers
    result = await client.scrape.amazon.products(url="https://amazon.com/dp/...")
```

**Docs:** [Python SDK on GitHub](https://github.com/brightdata/sdk-python)
