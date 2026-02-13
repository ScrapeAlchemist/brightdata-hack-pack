# Bright Data MCP — Give Your AI Agent Web Access

MCP (Model Context Protocol) is the easiest way to connect AI agents to real-time web data. Instead of writing API calls, your agent gets tools it can call autonomously — search the web, scrape pages, extract structured data.

**Why use MCP at a hackathon?**
- Zero API code — the agent calls the tools itself
- 60+ built-in tools for popular sites (Amazon, LinkedIn, Instagram, etc.)
- Free tier: 5,000 requests/month (more than enough for a hackathon)
- Works with Claude, GPT, Gemini, and any MCP-compatible client

---

## Quick Setup

### Option 1: Cloud URL (Zero Setup)

Just add this URL to any MCP-compatible client:

```
https://mcp.brightdata.com/mcp?token=YOUR_API_TOKEN
```

No Node.js needed. Works immediately.

### Option 2: Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "Bright Data": {
      "command": "npx",
      "args": ["@brightdata/mcp"],
      "env": {
        "API_TOKEN": "YOUR_API_TOKEN",
        "WEB_UNLOCKER_ZONE": "mcp_unlocker",
        "BROWSER_AUTH": "optional"
      }
    }
  }
}
```

### Option 3: Claude Code (CLI)

```bash
claude mcp add brightdata \
  --env API_TOKEN=YOUR_API_TOKEN \
  --env PRO_MODE=true \
  -- npx -y @brightdata/mcp
```

### Option 4: Cursor / Windsurf / Other IDEs

Same JSON config as Claude Desktop — just paste it into your IDE's MCP settings.

---

## Available Tools

### Free Tier (5,000 requests/month)

| Tool | What It Does |
|------|-------------|
| `search_engine` | Web search with AI-optimized results |
| `scrape_as_markdown` | Convert any webpage to clean Markdown |
| `scrape_batch` | Scrape multiple URLs at once |
| `session_stats` | View your usage stats |

### Pro Mode (60+ Tools)

Enable with `PRO_MODE=true` in your config.

| Category | Tools |
|----------|-------|
| **E-commerce** | `web_data_amazon_product`, `web_data_amazon_product_reviews` |
| **LinkedIn** | `web_data_linkedin_person_profile`, `web_data_linkedin_company_profile` |
| **Instagram** | `web_data_instagram_profiles`, `web_data_instagram_posts`, `web_data_instagram_reels` |
| **Facebook** | `web_data_facebook_posts`, `web_data_facebook_marketplace_listings` |
| **X/Twitter** | `web_data_x_posts` |
| **YouTube** | `web_data_youtube_videos` |
| **Real Estate** | `web_data_zillow_properties_listing` |
| **Travel** | `web_data_booking_hotel_listings` |
| **Browser** | `scraping_browser_navigate`, `scraping_browser_click`, `scraping_browser_screenshot` |

---

## Code Examples

### Python — LlamaIndex Agent

```python
from llama_index.tools.brightdata import BrightDataToolSpec
from llama_index.llms.openai import OpenAI
from llama_index.core.agent.workflow import FunctionAgent

agent = FunctionAgent(
    tools=BrightDataToolSpec(api_key=API_KEY, zone="mcp_unlocker").to_tool_list(),
    llm=OpenAI(model="gpt-4o-mini"),
)

# Agent autonomously picks the right tool
response = await agent.run("Find the top 3 trending AI tools and summarize them")
```

### Python — LangChain Agent

```python
from langchain_brightdata import BrightDataWebScraperAPI

scraper = BrightDataWebScraperAPI()
data = scraper.invoke({
    "url": "https://linkedin.com/in/example",
    "dataset_type": "linkedin_person_profile"
})
```

### JavaScript — MCP Client

```javascript
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

const client = new Client({ name: "my-agent", version: "1.0.0" });
await client.connect(new StdioClientTransport({
    command: "npx",
    args: ["-y", "@brightdata/mcp"],
    env: { ...process.env, API_TOKEN: "YOUR_KEY" },
}));

// Search the web
const results = await client.callTool({
    name: "search_engine",
    arguments: { query: "latest AI news" },
});

// Scrape a page
const page = await client.callTool({
    name: "scrape_as_markdown",
    arguments: { url: "https://example.com" },
});
```

---

## Agentic Workflow Patterns

### Pattern 1: Research Agent

```
User question → search_engine (find sources) → scrape_as_markdown (get content)
→ LLM synthesizes answer with citations
```

### Pattern 2: Data Enrichment Pipeline

```
Input URLs → scrape structured data (Amazon, LinkedIn, etc.)
→ LLM analyzes and compares → Generate report
```

### Pattern 3: Real-Time Monitoring

```
Scheduled task → search_engine (find new info) → scrape pages
→ Compare with previous data → Alert on changes
```

### Pattern 4: Competitive Intelligence

```
Company name → search competitors → scrape their sites
→ Query AI engines (ChatGPT, Perplexity) for brand mentions
→ Generate competitive analysis
```

---

## Framework Integrations

| Framework | Package | Docs |
|-----------|---------|------|
| LlamaIndex | `llama-index-tools-brightdata` | [Guide](https://brightdata.com/blog/ai/build-ai-agents-with-llamaindex) |
| LangChain | `langchain-brightdata` | [Guide](https://brightdata.com/blog/ai/web-scraping-with-langchain-and-bright-data) |
| Agno | `agno[brightdata]` | [Guide](https://brightdata.com/blog/ai/web-scraping-with-agno-and-bright-data) |
| n8n | Built-in node | [Guide](https://docs.brightdata.com/ai/mcp-server/overview) |

---

## See It In Action

Check out these complete implementations:

- **[The Missing Link in AI](https://github.com/ScrapeAlchemist/The_Missing_Link_in_AI)** — Full MCP-powered research agent
- **[Internet Mood Radar](https://github.com/ScrapeAlchemist/Internet-Mood-Radar)** — Real-time sentiment tracking with agentic pipeline
- **[Competitive Visibility Audit](https://github.com/ScrapeAlchemist/Competitive-Visibility-Audit)** — Multi-step competitive intelligence workflow
