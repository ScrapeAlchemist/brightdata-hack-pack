"""
Bright Data Web Scraper API — Scrape structured data from any supported website.

The Web Scraper API returns structured JSON data (product info, reviews, profiles, etc.)
from popular websites like Amazon, LinkedIn, Instagram, and more.

Setup:
  1. Get your API key from https://brightdata.com/cp/setting/users
  2. Find your dataset_id from your Web Scraper zone in the control panel
  3. Set environment variables:
       export BRIGHTDATA_API_KEY="your_api_key"
       export BRIGHTDATA_DATASET_ID="your_dataset_id"

Usage:
  python 01_web_scraper_api.py
"""

import os
import requests

API_KEY = os.environ["BRIGHTDATA_API_KEY"]
DATASET_ID = os.environ.get("BRIGHTDATA_DATASET_ID", "gd_l1viktl72bvl7bjuj0")  # Example: Amazon products

def scrape(urls: list[str], format: str = "json") -> dict:
    """Scrape structured data from one or more URLs."""
    response = requests.post(
        "https://api.brightdata.com/datasets/v3/scrape",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        params={"dataset_id": DATASET_ID, "format": format},
        json=[{"url": url} for url in urls],
    )
    response.raise_for_status()

    if response.status_code == 200:
        return response.json()

    # 202 = async (takes longer than 1 min). Poll using snapshot_id.
    if response.status_code == 202:
        data = response.json()
        print(f"Request queued. Snapshot ID: {data['snapshot_id']}")
        print(f"Poll with: GET https://api.brightdata.com/datasets/v3/progress/{data['snapshot_id']}")
        return data

    return response.json()


if __name__ == "__main__":
    # Example: Scrape an Amazon product page
    result = scrape(["https://www.amazon.com/dp/B0CRMZHDG8"])
    print(result)
