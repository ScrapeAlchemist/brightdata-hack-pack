/**
 * Bright Data MCP Agent — Give your AI agent real-time web access.
 *
 * This example shows how to use the Bright Data MCP server with any
 * MCP-compatible client. The agent gets tools like search_engine,
 * scrape_as_markdown, and 60+ structured data extractors.
 *
 * Setup:
 *   1. Get your API key from https://brightdata.com/cp/setting/users
 *   2. Install: npm install @anthropic-ai/sdk @brightdata/mcp
 *   3. Set environment variable:
 *        export BRIGHTDATA_API_KEY="your_api_key"
 *
 * Usage:
 *   node 05_mcp_agent.js
 */

import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";

async function main() {
  // Connect to Bright Data MCP server
  const transport = new StdioClientTransport({
    command: "npx",
    args: ["-y", "@brightdata/mcp"],
    env: {
      ...process.env,
      API_TOKEN: process.env.BRIGHTDATA_API_KEY,
    },
  });

  const client = new Client({ name: "hackathon-agent", version: "1.0.0" });
  await client.connect(transport);

  // List available tools
  const { tools } = await client.listTools();
  console.log(
    "Available tools:",
    tools.map((t) => t.name)
  );

  // Use search_engine tool
  const searchResult = await client.callTool({
    name: "search_engine",
    arguments: {
      query: "best AI hackathon projects 2025",
    },
  });
  console.log("Search results:", searchResult.content);

  // Use scrape_as_markdown tool
  const scrapeResult = await client.callTool({
    name: "scrape_as_markdown",
    arguments: {
      url: "https://news.ycombinator.com",
    },
  });
  console.log("Scraped content:", scrapeResult.content[0]?.text?.slice(0, 500));

  await client.close();
}

main().catch(console.error);
