/**
 * Bright Data SERP API — Get search engine results without being blocked.
 *
 * Returns raw HTML or parsed search results from Google, Bing, and other engines.
 *
 * Setup:
 *   1. Get your API key from https://brightdata.com/cp/setting/users
 *   2. Find your SERP zone name from the control panel
 *   3. Set environment variables:
 *        export BRIGHTDATA_API_KEY="your_api_key"
 *        export BRIGHTDATA_SERP_ZONE="your_serp_zone_name"
 *
 * Usage:
 *   node 02_serp_api.js
 */

const API_KEY = process.env.BRIGHTDATA_API_KEY;
const SERP_ZONE = process.env.BRIGHTDATA_SERP_ZONE || "serp_api1";

async function searchGoogle(query, numResults = 10) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${numResults}`;

  const response = await fetch("https://api.brightdata.com/request", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      zone: SERP_ZONE,
      url: searchUrl,
      format: "raw",
    }),
  });

  if (!response.ok) {
    throw new Error(`SERP API error: ${response.status} ${await response.text()}`);
  }

  return response.text();
}

async function searchGoogleParsed(query, numResults = 10) {
  const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}&num=${numResults}`;

  const response = await fetch("https://api.brightdata.com/request", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      zone: SERP_ZONE,
      url: searchUrl,
      format: "json",
    }),
  });

  if (!response.ok) {
    throw new Error(`SERP API error: ${response.status} ${await response.text()}`);
  }

  return response.json();
}

// --- Run ---
const results = await searchGoogleParsed("best javascript web scraping libraries");
console.log(JSON.stringify(results, null, 2).slice(0, 2000));
