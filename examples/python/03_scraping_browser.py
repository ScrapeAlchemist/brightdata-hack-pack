"""
Bright Data Scraping Browser — Remote browser with built-in unblocking.

Connects via Playwright (or Selenium) to a real cloud browser that handles
CAPTCHAs, fingerprinting, and proxy rotation automatically.

Setup:
  1. Create a Browser API zone in your Bright Data control panel
  2. Copy the username and password from the zone's Overview tab
  3. Install Playwright:
       pip install playwright
       playwright install chromium
  4. Set environment variables:
       export BRIGHTDATA_BROWSER_USER="brd-customer-XXXXX-zone-XXXXX"
       export BRIGHTDATA_BROWSER_PASS="your_zone_password"

Usage:
  python 03_scraping_browser.py
"""

import os
import asyncio
from playwright.async_api import async_playwright

BROWSER_USER = os.environ["BRIGHTDATA_BROWSER_USER"]
BROWSER_PASS = os.environ["BRIGHTDATA_BROWSER_PASS"]
BROWSER_WS = f"wss://{BROWSER_USER}:{BROWSER_PASS}@brd.superproxy.io:9222"


async def scrape_with_browser(url: str) -> dict:
    """Open a URL in a remote browser and extract content."""
    async with async_playwright() as pw:
        browser = await pw.chromium.connect_over_cdp(BROWSER_WS)
        try:
            page = await browser.new_page()
            await page.goto(url, timeout=120_000)

            title = await page.title()
            content = await page.content()

            # Example: extract all links
            links = await page.eval_on_selector_all(
                "a[href]",
                "els => els.map(e => ({text: e.textContent.trim(), href: e.href})).slice(0, 20)"
            )

            return {"title": title, "links": links, "html_length": len(content)}
        finally:
            await browser.close()


if __name__ == "__main__":
    result = asyncio.run(scrape_with_browser("https://news.ycombinator.com"))
    print(f"Title: {result['title']}")
    print(f"HTML length: {result['html_length']}")
    print(f"Found {len(result['links'])} links:")
    for link in result["links"][:10]:
        print(f"  - {link['text'][:60]} -> {link['href']}")
