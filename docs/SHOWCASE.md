# Built with Bright Data — Project Showcase

Real projects built with Bright Data APIs. Use these for inspiration, reference code, or as a starting point for your own hack.

---

## Featured Projects

### [PepoLeHub](https://github.com/MeirKaD/pepolehub) — People Search Engine
**320+ stars** | Next.js, LangGraph, Bright Data, Gemini, PostgreSQL

Natural language people search — type "5 AI Engineers in Israel" and get results. Scrapes LinkedIn profiles via Bright Data, with Redis caching and a 3D glassmorphic UI.

> Great example of: **Full-stack app + LinkedIn scraping + LangGraph orchestration**

---

### [The Missing Link in AI](https://github.com/ScrapeAlchemist/The_Missing_Link_in_AI) — MCP Research Agent
Node.js, Bright Data MCP, LangChain ReAct

Autonomous research agent that searches the web, scrapes 10+ sources, and synthesizes findings with citations. The go-to example for MCP + agentic workflows.

> Great example of: **MCP integration + multi-source research + citation tracking**

---

### [Internet Mood Radar](https://github.com/ScrapeAlchemist/Internet-Mood-Radar) — Global Sentiment Tracker
Next.js, Bright Data, OpenAI, Leaflet Maps, Prisma

Real-time global mood tracking across 6 regions. Scrapes news and social media, runs sentiment analysis, visualizes emotional tension on an interactive map.

> Great example of: **Real-time data pipeline + NLP + data visualization**

---

### [FactFlux](https://github.com/MeirKaD/FactFlux) — AI Fact Checker
**41 stars** | Agno, Bright Data, Gemini

Multi-agent fact-checking system: Content Extractor → Claim Identifier → Cross-Reference Agent → Verdict Agent. Checks social media claims against web sources.

> Great example of: **Multi-agent orchestration + real-world social impact**

---

### [MCP_ADK](https://github.com/MeirKaD/MCP_ADK) — Web Search Agent
**46 stars** | Google ADK, Bright Data MCP, Gemini

Simple but powerful web search agent built with Google's Agent Development Kit. Clean example of MCP integration for interactive web queries.

> Great example of: **Quickest path to a working MCP agent**

---

### [Unified Search](https://github.com/MeirKaD/unified-search) — Smart Query Router
**18 stars** | LangGraph, Bright Data MCP, Gemini, Pydantic

Intelligently routes queries to the best search method: general search, product shopping, website scraping, or comparisons. The agent picks the right tool automatically.

> Great example of: **Intelligent routing + LangGraph state machine**

---

### [Rent Hunter](https://github.com/MeirKaD/Rent-Hunter) — Apartment Search Agent
**10 stars** | LangGraph, Bright Data MCP, Streamlit

Multi-agent apartment search for Tel Aviv. Discovers, analyzes, and ranks apartments by price fairness. 97.7% discovery success rate.

> Great example of: **Multi-agent architecture + practical real-world use case**

---

### [Geo Chat](https://github.com/MeirKaD/geo-chat) — Location-Based Search
Express.js, LangGraph, Bright Data MCP, MapLibre GL

Ask "Find Italian restaurants in Tel Aviv" and get map-based results. Two modes: fast (2-3 sec) and deep scraping (10-15 sec).

> Great example of: **Maps integration + fast/deep pipeline pattern**

---

### [EnrichIt](https://github.com/MeirKaD/EnrichIt) — Spreadsheet Data Enrichment
React, FastAPI, LangGraph, Bright Data MCP

Upload a spreadsheet, and AI enriches each row with live web data. Includes citation tracking and deep research mode.

> Great example of: **Data enrichment pipeline + full-stack React/FastAPI**

---

### [Competitive Visibility Audit](https://github.com/ScrapeAlchemist/Competitive-Visibility-Audit) — Competitive Intelligence
Jupyter Notebook, Bright Data, OpenAI

5-phase competitive analysis: SERP rankings → deep dive → AI perception (ChatGPT, Perplexity, Grok) → competitor profiles → executive summary. Runs in Google Colab.

> Great example of: **Multi-step analysis + zero-setup Colab notebook**

---

### [Web Execution Layer](https://github.com/ScrapeAlchemist/web-execution-layer) — Cost-Smart Scraping
Node.js, Bright Data

Workshop demonstrating the 4-level escalation strategy: HTTP ($3/1K) → Browser ($8/1K) → Web Scraper → SERP API. Start cheap, upgrade only when needed.

> Great example of: **Cost optimization + tool selection strategy**

---

### [Price Shield Agent](https://github.com/MeirKaD/price-shield-agent) — Price Insurance
LangGraph, Bright Data, Gemini, Streamlit

Three-stage pipeline: search retailers → extract prices → analyze market. Finds real-time prices across Amazon, Walmart, Best Buy.

> Great example of: **Multi-retailer data aggregation + market analysis**

---

### [AI Travel Planner](https://github.com/MeirKaD/ai-travel-planner) — Travel Assistant
FastAPI, LangGraph, Bright Data MCP, React, WebSocket

Full-stack travel planning with real-time flight/hotel data, WebSocket updates, and automated email reports.

> Great example of: **Full-stack with WebSocket + email integration**

---

### [EasyDocs](https://github.com/MeirKaD/EasyDocs) — API Doc Generator
LangGraph, Bright Data, Streamlit

Ask a question like "How do I create a Stripe payment intent?" and get a formatted guide with code examples. Uses Bright Data's browser to scrape official API docs.

> Great example of: **Browser automation + documentation generation**

---

### [BrightData Cookbook](https://github.com/ScrapeAlchemist/BrightData_Cookbook) — Production Recipes
Node.js, Bright Data Web Unlocker

Production-ready scraping recipes with concurrent request handling (10-200+ simultaneous), error handling, and rate limiting.

> Great example of: **Production-grade patterns + Amazon scraping**

---

## Common Patterns Across Projects

| Pattern | Used In |
|---------|---------|
| **MCP for agent web access** | The Missing Link, MCP_ADK, Unified Search, Rent Hunter |
| **LangGraph orchestration** | PepoLeHub, Unified Search, Rent Hunter, EnrichIt, Price Shield |
| **Multi-agent systems** | FactFlux, Rent Hunter, README SEO Booster |
| **Real-time data + visualization** | Internet Mood Radar, Geo Chat |
| **Full-stack (Next.js/React + API)** | PepoLeHub, EnrichIt, AI Travel Planner, Geo Chat |
| **Streamlit rapid prototyping** | Rent Hunter, Price Shield, EasyDocs, FactFlux |
