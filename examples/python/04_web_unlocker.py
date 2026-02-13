"""
Bright Data Web Unlocker — Access any website without blocks.

Automatically handles CAPTCHAs, browser fingerprinting, retries, and IP rotation.
Returns the raw HTML of the target page. Works with both the API and proxy interface.

Setup:
  1. Get your API key from https://brightdata.com/cp/setting/users
  2. Find your Web Unlocker zone name from the control panel
  3. Set environment variables:
       export BRIGHTDATA_API_KEY="your_api_key"
       export BRIGHTDATA_UNLOCKER_ZONE="your_web_unlocker_zone_name"

Usage:
  python 04_web_unlocker.py
"""

import os
import requests

API_KEY = os.environ["BRIGHTDATA_API_KEY"]
UNLOCKER_ZONE = os.environ.get("BRIGHTDATA_UNLOCKER_ZONE", "web_unlocker1")


def unlock_url(url: str) -> str:
    """Fetch a URL through Web Unlocker and return raw HTML."""
    response = requests.post(
        "https://api.brightdata.com/request",
        headers={
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        },
        json={
            "zone": UNLOCKER_ZONE,
            "url": url,
            "format": "raw",
        },
        timeout=60,
    )
    response.raise_for_status()
    return response.text


def unlock_url_via_proxy(url: str, customer_id: str, zone: str, password: str) -> str:
    """Alternative: access via proxy endpoint (useful for existing HTTP clients)."""
    proxy = f"http://brd-customer-{customer_id}-zone-{zone}:{password}@brd.superproxy.io:33335"
    response = requests.get(
        url,
        proxies={"http": proxy, "https": proxy},
        timeout=60,
    )
    response.raise_for_status()
    return response.text


if __name__ == "__main__":
    html = unlock_url("https://www.example.com")
    print(f"Received {len(html)} chars of HTML")
    print(html[:500])
