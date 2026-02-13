"""
Bright Data SERP API — Get search engine results without being blocked.

Returns raw HTML or parsed search results from Google, Bing, and other engines.

Setup:
  1. Get your API key from https://brightdata.com/cp/setting/users
  2. Find your SERP zone name from the control panel
  3. Set environment variables:
       export BRIGHTDATA_API_KEY="your_api_key"
       export BRIGHTDATA_SERP_ZONE="your_serp_zone_name"

Usage:
  python 02_serp_api.py
"""

import os
import json
from urllib.parse import urlencode
import requests

API_KEY = os.environ["BRIGHTDATA_API_KEY"]
SERP_ZONE = os.environ.get("BRIGHTDATA_SERP_ZONE", "serp_api1")


def search_google(query: str, num_results: int = 10) -> str:
    """Search Google and get raw HTML results."""
    search_url = f"https://www.google.com/search?{urlencode({'q': query, 'num': num_results})}"

    response = requests.post(
        "https://api.brightdata.com/request",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "zone": SERP_ZONE,
            "url": search_url,
            "format": "raw",
        },
    )
    response.raise_for_status()
    return response.text


def search_google_parsed(query: str, num_results: int = 10) -> dict:
    """Search Google and get parsed JSON results (organic, ads, etc.)."""
    search_url = f"https://www.google.com/search?{urlencode({'q': query, 'num': num_results})}"

    response = requests.post(
        "https://api.brightdata.com/request",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "zone": SERP_ZONE,
            "url": search_url,
            "format": "json",
        },
    )
    response.raise_for_status()
    return response.json()


if __name__ == "__main__":
    results = search_google_parsed("best python web scraping libraries")
    print(json.dumps(results, indent=2)[:2000])
