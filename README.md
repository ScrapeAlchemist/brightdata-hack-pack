<p align="center">
  <img src="https://github.com/user-attachments/assets/c21b3f7b-7ff1-40c3-b3d8-66706913d62f" alt="Bright Data" width="300">
</p>

<h1 align="center">Bright Data Hackathon Kit</h1>

<p align="center">
  <strong>Scrape any website. Get any data. Build something amazing.</strong><br>
  Your one-stop resource for building with Bright Data at hackathons.
</p>

<p align="center">
  <a href="#get-started-in-60-seconds">Quick Start</a> •
  <a href="#mcp--ai-agents">MCP & Agents</a> •
  <a href="#products">Products</a> •
  <a href="#code-examples">Examples</a> •
  <a href="#built-with-bright-data">Showcase</a> •
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

### 2. Know your zones

A **zone** is a configured instance of a Bright Data product. Think of it as a named access point — each product (Web Unlocker, SERP API, Scraping Browser) gets its own zone with its own credentials and settings.

- Find your zones at [brightdata.com/cp/zones](https://brightdata.com/cp/zones)
- Each zone has a **name** (e.g., `web_unlocker1`, `serp_api1`) that you pass in API calls
- Scraping Browser zones also have a **username** and **password** (used for WebSocket auth)
- When you sign up, default zones are created for you — check your control panel

### 3. Set your environment variables

```bash
export BRIGHTDATA_API_KEY="your_api_key_here"

# Zone names — find yours at brightdata.com/cp/zones
export BRIGHTDATA_UNLOCKER_ZONE="web_unlocker1"     # Web Unlocker zone
export BRIGHTDATA_SERP_ZONE="serp_api1"              # SERP API zone
```

### 4. Scrape something

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

## MCP & AI Agents

**The fastest way to build an AI agent with web access.** MCP (Model Context Protocol) lets your agent search the web, scrape pages, and extract structured data — without you writing API calls.

### Zero-Setup Option

Add this URL to any MCP-compatible client (Claude Desktop, Cursor, Windsurf):

```
https://mcp.brightdata.com/mcp?token=YOUR_API_TOKEN
```

### Claude Desktop Setup

```json
{
  "mcpServers": {
    "Bright Data": {
      "command": "npx",
      "args": ["@brightdata/mcp"],
      "env": {
        "API_TOKEN": "YOUR_API_TOKEN"
      }
    }
  }
}
```

### Build an Agent in 10 Lines

```python
from llama_index.tools.brightdata import BrightDataToolSpec
from llama_index.llms.openai import OpenAI
from llama_index.core.agent.workflow import FunctionAgent

agent = FunctionAgent(
    tools=BrightDataToolSpec(api_key=API_KEY, zone="mcp_unlocker").to_tool_list(),
    llm=OpenAI(model="gpt-4o-mini"),
)
response = await agent.run("Find the top AI trends this week and summarize them")
```

The agent autonomously decides which tool to use:
- Web search → `search_engine`
- Scrape a page → `scrape_as_markdown`
- Amazon product → `web_data_amazon_product`
- LinkedIn profile → `web_data_linkedin_person_profile`
- 60+ more tools available

**Free tier: 5,000 requests/month** — more than enough for a hackathon.

**[Full MCP Guide →](docs/MCP_GUIDE.md)** | **[Agentic Workflow Patterns →](docs/AGENTIC_WORKFLOWS.md)**

---

## Products

| Product | What It Does | Best For |
|---------|-------------|----------|
| **[MCP Server](docs/MCP_GUIDE.md)** | Give AI agents real-time web access | Agentic workflows, LLM tools |
| **[Web Scraper API](docs/PRODUCTS.md#web-scraper-api)** | Returns structured JSON from popular sites | Amazon, LinkedIn, Instagram data |
| **[SERP API](docs/PRODUCTS.md#serp-api)** | Search engine results without blocks | Google search, market research |
| **[Scraping Browser](docs/PRODUCTS.md#scraping-browser)** | Remote browser via Puppeteer/Playwright | JS-heavy sites, interactions, screenshots |
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
| [`05_mcp_agent.py`](examples/python/05_mcp_agent.py) | Build an AI agent with web access (MCP) |

```bash
cd examples/python
pip install -r requirements.txt    # Installs all deps (including MCP agent)
export BRIGHTDATA_API_KEY="your_key"
export BRIGHTDATA_UNLOCKER_ZONE="web_unlocker1"
python 04_web_unlocker.py          # Try the simplest example first

# For the MCP agent (05), you also need:
export OPENAI_API_KEY="your_openai_key"
python 05_mcp_agent.py
```

### JavaScript

| Example | What It Does |
|---------|-------------|
| [`01_web_scraper_api.js`](examples/javascript/01_web_scraper_api.js) | Get structured JSON from supported sites |
| [`02_serp_api.js`](examples/javascript/02_serp_api.js) | Search Google and get parsed results |
| [`03_scraping_browser.js`](examples/javascript/03_scraping_browser.js) | Control a remote browser with Puppeteer |
| [`04_web_unlocker.js`](examples/javascript/04_web_unlocker.js) | Fetch any page's HTML |
| [`05_mcp_agent.js`](examples/javascript/05_mcp_agent.js) | Connect to Bright Data MCP server |

```bash
cd examples/javascript
npm install
export BRIGHTDATA_API_KEY="your_key"
export BRIGHTDATA_UNLOCKER_ZONE="web_unlocker1"
node 04_web_unlocker.js             # Try the simplest example first
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

## Built with Bright Data

Real projects from our team. Use these for inspiration, reference code, or fork them as your starting point.

| Project | What It Does | Stars | Stack |
|---------|-------------|-------|-------|
| **[PepoLeHub](https://github.com/MeirKaD/pepolehub)** | Natural language people search engine | 320+ | Next.js, LangGraph, Bright Data |
| **[MCP_ADK](https://github.com/MeirKaD/MCP_ADK)** | Web search agent with Google ADK | 46 | Python, Gemini, Bright Data MCP |
| **[FactFlux](https://github.com/MeirKaD/FactFlux)** | Multi-agent fact-checking system | 41 | Agno, Gemini, Bright Data |
| **[Unified Search](https://github.com/MeirKaD/unified-search)** | Smart query routing agent | 18 | LangGraph, Bright Data MCP |
| **[The Missing Link in AI](https://github.com/ScrapeAlchemist/The_Missing_Link_in_AI)** | MCP-powered research agent | - | Node.js, LangChain, Bright Data MCP |
| **[Internet Mood Radar](https://github.com/ScrapeAlchemist/Internet-Mood-Radar)** | Real-time global sentiment tracker | - | Next.js, OpenAI, Bright Data |
| **[Rent Hunter](https://github.com/MeirKaD/Rent-Hunter)** | Multi-agent apartment search | 10 | LangGraph, Streamlit, Bright Data |
| **[Geo Chat](https://github.com/MeirKaD/geo-chat)** | Location-based search with maps | - | Express.js, LangGraph, MapLibre |
| **[EnrichIt](https://github.com/MeirKaD/EnrichIt)** | AI spreadsheet data enrichment | 3 | React, FastAPI, LangGraph |
| **[AI Travel Planner](https://github.com/MeirKaD/ai-travel-planner)** | Travel assistant with real-time data | - | FastAPI, LangGraph, WebSocket |

**[See all projects with details →](docs/SHOWCASE.md)**

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

- **[MCP Guide](docs/MCP_GUIDE.md)** — Set up MCP and build AI agents with web access
- **[Agentic Workflows](docs/AGENTIC_WORKFLOWS.md)** — Architecture patterns for AI + web data
- **[Product Decision Tree](docs/PRODUCTS.md)** — Which product should I use?
- **[API Cheat Sheet](docs/CHEATSHEET.md)** — Endpoints, auth, response formats at a glance
- **[Troubleshooting](docs/TROUBLESHOOTING.md)** — Common issues and fixes
- **[Project Showcase](docs/SHOWCASE.md)** — Real projects built with Bright Data

---

## Official Resources

- [Bright Data Documentation](https://docs.brightdata.com)
- [Bright Data MCP Server](https://github.com/brightdata/brightdata-mcp)
- [API Reference](https://docs.brightdata.com/api-reference)
- [Control Panel](https://brightdata.com/cp)
- [Python SDK](https://github.com/brightdata/sdk-python)

---

## Need Help?

- **Find me at the Bright Data booth** — I'm here to help you win
- **Open an issue** on this repo
- [![LinkedIn](https://img.shields.io/badge/LinkedIn-Rafael_Levi-blue?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rafael-levi/)

Good luck! Build something amazing.
