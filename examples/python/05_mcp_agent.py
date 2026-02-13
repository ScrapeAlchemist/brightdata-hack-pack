"""
Bright Data MCP Agent — Give your AI agent real-time web access.

MCP (Model Context Protocol) lets AI agents call Bright Data tools directly —
search the web, scrape pages, extract structured data — all without you writing
API calls. The agent decides which tool to use based on the task.

This example uses LlamaIndex to build an agent with Bright Data web tools.

Setup:
  1. Get your API key from https://brightdata.com/cp/setting/users
  2. Install dependencies:
       pip install llama-index-tools-brightdata llama-index-llms-openai
  3. Set environment variables:
       export BRIGHTDATA_API_KEY="your_api_key"
       export OPENAI_API_KEY="your_openai_key"

Usage:
  python 05_mcp_agent.py
"""

import asyncio
import os
from llama_index.tools.brightdata import BrightDataToolSpec
from llama_index.llms.openai import OpenAI
from llama_index.core.agent.workflow import FunctionAgent

BRIGHTDATA_API_KEY = os.environ["BRIGHTDATA_API_KEY"]


async def main():
    # Initialize Bright Data tools for the agent
    brightdata_tools = BrightDataToolSpec(
        api_key=BRIGHTDATA_API_KEY,
        zone="mcp_unlocker",
        verbose=True,
    ).to_tool_list()

    # Create an agent with web access
    agent = FunctionAgent(
        tools=brightdata_tools,
        llm=OpenAI(model="gpt-4o-mini"),
        verbose=True,
    )

    # The agent autonomously decides which Bright Data tool to use:
    #   - Web search → search_engine
    #   - Scrape a page → scrape_as_markdown
    #   - Amazon product → web_data_amazon_product
    #   - LinkedIn profile → web_data_linkedin_person_profile

    response = await agent.run(
        "Search for the top 3 trending AI frameworks in 2025 and summarize what each does"
    )
    print(response)


if __name__ == "__main__":
    asyncio.run(main())
