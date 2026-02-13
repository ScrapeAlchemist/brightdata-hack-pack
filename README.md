<p align="center">
  <img src="https://brightdata.com/wp-content/uploads/2024/02/Bright-Data-Logo.svg" alt="Bright Data" width="300">
</p>

<h1 align="center">Bright Data Hackathon Kit</h1>

<p align="center">
  <strong>Scrape any website. Get any data. Build something amazing.</strong><br>
  Your one-stop resource for building with Bright Data at hackathons.
</p>

<p align="center">
  <a href="#get-started-in-60-seconds">Quick Start</a> •
  <a href="#products">Products</a> •
  <a href="#code-examples">Examples</a> •
  <a href="#starter-template">Starter Template</a> •
  <a href="#project-ideas">Ideas</a> •
  <a href="#need-help">Help</a>
</p>

---

## Hi, I'm Rafael

I'm a Developer Advocate at [Bright Data](https://brightdata.com). Find me at the Bright Data booth — I'm here to help you build!

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Rafael_Levi-blue?logo=linkedin)](https://www.linkedin.com/in/rafael-levi/)
[![GitHub](https://img.shields.io/badge/GitHub-ScrapeAlchemist-black?logo=github)](https://github.com/ScrapeAlchemist)

---

## What is Bright Data?

Bright Data gives you tools to **collect data from any website** without getting blocked. Our APIs handle CAPTCHAs, anti-bot systems, browser fingerprinting, and IP rotation — so you can focus on building your hack, not fighting websites.

**For this hackathon, you get full access to all Bright Data products.**

---

## Get Started in 60 Seconds

### 1. Get your API key

Go to [brightdata.com/cp/setting/users](https://brightdata.com/cp/setting/users) and copy your API key.

### 2. Set your environment variable

```bash
export BRIGHTDATA_API_KEY="your_api_key_here"
```

### 3. Scrape something

**Python:**
```python
import requests

response = requests.post(
    "https://api.brightdata.com/request",
    headers={
        "Authorization": f"Bearer {YOUR_API_KEY}",
        "Content-Type": "application/json",
    },
    json={
        "zone": "web_unlocker1",
        "url": "https://www.example.com",
        "format": "raw",
    },
)
print(response.text)  # HTML of the page
```

**JavaScript:**
```javascript
const response = await fetch("https://api.brightdata.com/request", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${YOUR_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    zone: "web_unlocker1",
    url: "https://www.example.com",
    format: "raw",
  }),
});
console.log(await response.text()); // HTML of the page
```

**cURL:**
```bash
curl -X POST "https://api.brightdata.com/request" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"zone": "web_unlocker1", "url": "https://www.example.com", "format": "raw"}'
```

That's it. You just scraped a website.

---

## Products

| Product | What It Does | Best For |
|---------|-------------|----------|
| **[Web Scraper API](docs/PRODUCTS.md#web-scraper-api)** | Returns structured JSON from popular sites | Amazon, LinkedIn, Instagram data |
| **[SERP API](docs/PRODUCTS.md#serp-api)** | Search engine results without blocks | Google search, market research |
| **[Scraping Browser](docs/PRODUCTS.md#scraping-browser)** | Remote browser you control via Puppeteer/Playwright | JS-heavy sites, interactions, screenshots |
| **[Web Unlocker](docs/PRODUCTS.md#web-unlocker)** | Fetches any page's HTML without blocks | Any website, raw HTML |

**Not sure which to use?** Check the [decision tree →](docs/PRODUCTS.md)

---

## Code Examples

Ready-to-run scripts in Python and JavaScript. Copy, paste, run.

### Python

| Example | What It Does |
|---------|-------------|
| [`01_web_scraper_api.py`](examples/python/01_web_scraper_api.py) | Get structured JSON from supported sites |
| [`02_serp_api.py`](examples/python/02_serp_api.py) | Search Google and get parsed results |
| [`03_scraping_browser.py`](examples/python/03_scraping_browser.py) | Control a remote browser with Playwright |
| [`04_web_unlocker.py`](examples/python/04_web_unlocker.py) | Fetch any page's HTML |

```bash
cd examples/python
pip install -r requirements.txt
python 01_web_scraper_api.py
```

### JavaScript

| Example | What It Does |
|---------|-------------|
| [`01_web_scraper_api.js`](examples/javascript/01_web_scraper_api.js) | Get structured JSON from supported sites |
| [`02_serp_api.js`](examples/javascript/02_serp_api.js) | Search Google and get parsed results |
| [`03_scraping_browser.js`](examples/javascript/03_scraping_browser.js) | Control a remote browser with Puppeteer |
| [`04_web_unlocker.js`](examples/javascript/04_web_unlocker.js) | Fetch any page's HTML |

```bash
cd examples/javascript
npm install
node 01_web_scraper_api.js
```

### Python SDK (Even Simpler)

```bash
pip install brightdata
```

```python
from brightdata import BrightDataClient

async with BrightDataClient() as client:
    result = await client.scrape_url("https://example.com")
    search = await client.search.google(query="python scraping")
```

---

## Starter Template

A fork-ready **Next.js app** with Bright Data already wired up:

```bash
cd starter-template
npm install
cp .env.example .env     # Add your API key
npm run dev               # Open http://localhost:3000
```

Enter a URL → get scraped HTML. Build on top of it.

**[See the starter template →](starter-template/)**

---

## Project Ideas

Need inspiration? We've got 20+ ideas organized by hackathon track:

- **Healthcare** — Drug price tracker, clinical trial monitor
- **Sustainability** — Greenwashing detector, eco-product finder
- **AI/ML** — Training data pipeline, RAG knowledge base builder
- **Fintech** — Price comparison engine, alternative trading data
- **Education** — Scholarship aggregator, course comparison tool

**[See all project ideas →](docs/PROJECT_IDEAS.md)**

---

## Quick Reference

- **[Product Decision Tree](docs/PRODUCTS.md)** — Which product should I use?
- **[API Cheat Sheet](docs/CHEATSHEET.md)** — Endpoints, auth, response formats at a glance
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** — Common issues and fixes

---

## Official Resources

- [Bright Data Documentation](https://docs.brightdata.com)
- [API Reference](https://docs.brightdata.com/api-reference)
- [Control Panel](https://brightdata.com/cp)
- [Python SDK](https://github.com/brightdata/sdk-python)
- [Product Page](https://brightdata.com/products)

---

## Need Help?

- **Find me at the Bright Data booth** — I'm here to help you win
- **Open an issue** on this repo
- [![LinkedIn](https://img.shields.io/badge/LinkedIn-Rafael_Levi-blue?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rafael-levi/)

Good luck! Build something amazing.
