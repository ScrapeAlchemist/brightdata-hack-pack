# Building AI Agents with Bright Data

The most impactful hackathon projects in 2025-2026 combine **AI agents + real-time web data**. Here's how to build them with Bright Data.

---

## Why Agents + Web Data?

LLMs are powerful but **stuck in the past** — their training data has a cutoff date. By giving agents access to live web data through Bright Data, you can:

- Ground responses in **current, real-time information**
- Prevent hallucination with **source citations**
- Build apps that react to **what's happening right now**
- Create multi-step workflows that **autonomously gather and analyze data**

---

## Architecture Patterns

### 1. Research Agent (Easiest to Build)

The agent searches, scrapes, and synthesizes — with citations.

```
User Query
  ↓
search_engine("query")         ← Find relevant sources
  ↓
scrape_as_markdown(urls)       ← Get full content
  ↓
LLM Synthesis                  ← Summarize with citations
  ↓
Grounded Answer + Sources
```

**Example use cases:**
- Market research tool
- News aggregator with analysis
- Technical documentation assistant
- Fact-checking bot

**Start here:** [The Missing Link in AI](https://github.com/ScrapeAlchemist/The_Missing_Link_in_AI)

---

### 2. Data Enrichment Pipeline

Collect structured data from multiple sources, then analyze.

```
Input (URLs, keywords, company names)
  ↓
Web Scraper API / MCP tools    ← Extract structured data
  ↓
Normalize & merge              ← Clean and combine
  ↓
LLM Analysis                   ← Generate insights
  ↓
Report / Dashboard
```

**Example use cases:**
- Price comparison across retailers
- Lead enrichment (scrape LinkedIn profiles)
- Product review aggregation
- Job market analysis

**Start here:** [BrightData Cookbook](https://github.com/ScrapeAlchemist/BrightData_Cookbook)

---

### 3. Real-Time Monitoring Agent

Continuously track changes across the web.

```
Scheduled Trigger (every N minutes)
  ↓
search_engine / scrape targets ← Collect latest data
  ↓
Compare with previous snapshot  ← Detect changes
  ↓
LLM Classification             ← Is this significant?
  ↓
Alert / Update Dashboard
```

**Example use cases:**
- Brand mention tracker
- Price drop alerts
- Competitor activity monitor
- Regulatory change tracker

**Start here:** [Internet Mood Radar](https://github.com/ScrapeAlchemist/Internet-Mood-Radar)

---

### 4. Multi-Source Intelligence

Query multiple data sources and synthesize a comprehensive view.

```
Research Question
  ↓
┌─ SERP API (Google results)
├─ Web Scraper (Amazon, LinkedIn)
├─ Scraping Browser (JS-heavy sites)
└─ AI Engines (ChatGPT, Perplexity)
  ↓
Cross-reference & validate
  ↓
LLM generates executive summary
```

**Example use cases:**
- Competitive intelligence dashboard
- Due diligence research
- Trend analysis across platforms
- Investment research

**Start here:** [Competitive Visibility Audit](https://github.com/ScrapeAlchemist/Competitive-Visibility-Audit)

---

## Cost-Smart Execution Strategy

Not all web requests are equal. Use the cheapest tool that works:

```
Level 1: Web Unlocker       (~$3/1K requests)  ← Start here
  ↓ If blocked or need JS rendering
Level 2: Scraping Browser    (~$8/1K pages)     ← Upgrade if needed
  ↓ If need structured data
Level 3: Web Scraper API     (varies)           ← Pre-built parsers
  ↓ If need search results
Level 4: SERP API            (~$3/1K searches)  ← Search engines
```

**Deep dive:** [Web Execution Layer Workshop](https://github.com/ScrapeAlchemist/web-execution-layer)

---

## Starter Code: Research Agent

Here's a minimal research agent you can build on:

```python
import asyncio
from llama_index.tools.brightdata import BrightDataToolSpec
from llama_index.llms.openai import OpenAI
from llama_index.core.agent.workflow import FunctionAgent

async def research(question: str) -> str:
    """Research any question using live web data."""
    tools = BrightDataToolSpec(
        api_key="YOUR_API_KEY",
        zone="mcp_unlocker",
    ).to_tool_list()

    agent = FunctionAgent(
        tools=tools,
        llm=OpenAI(model="gpt-4o-mini"),
        system_prompt="""You are a research agent. For every question:
        1. Search the web for relevant sources
        2. Scrape the most promising pages
        3. Synthesize findings with source citations
        Always cite your sources with URLs.""",
    )

    response = await agent.run(question)
    return str(response)

# Run it
result = asyncio.run(research("What are the latest breakthroughs in quantum computing?"))
print(result)
```

---

## Hackathon Tips

1. **Start with MCP** — it's the fastest path to a working agent
2. **Use the free tier** — 5,000 requests is plenty for a demo
3. **Show live data** — judges love seeing real-time information
4. **Add citations** — proves your agent isn't hallucinating
5. **Combine 2-3 products** — shows technical depth (e.g., SERP API + Web Unlocker + LLM)
6. **Think "what can't LLMs do alone?"** — the answer is "access current web data"
