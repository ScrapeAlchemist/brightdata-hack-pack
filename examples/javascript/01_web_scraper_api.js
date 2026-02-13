/**
 * Bright Data Web Scraper API — Scrape structured data from any supported website.
 *
 * Returns structured JSON (product info, reviews, profiles, etc.) from popular
 * websites like Amazon, LinkedIn, Instagram, and more.
 *
 * Setup:
 *   1. Get your API key from https://brightdata.com/cp/setting/users
 *   2. Find your dataset_id from your Web Scraper zone in the control panel
 *   3. Set environment variables:
 *        export BRIGHTDATA_API_KEY="your_api_key"
 *        export BRIGHTDATA_DATASET_ID="your_dataset_id"
 *
 * Usage:
 *   node 01_web_scraper_api.js
 */

const API_KEY = process.env.BRIGHTDATA_API_KEY;
const DATASET_ID = process.env.BRIGHTDATA_DATASET_ID || "gd_l1viktl72bvl7bjuj0";

async function scrape(urls, format = "json") {
  const response = await fetch(
    `https://api.brightdata.com/datasets/v3/scrape?dataset_id=${DATASET_ID}&format=${format}`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(urls.map((url) => ({ url }))),
    }
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${await response.text()}`);
  }

  const data = await response.json();

  // 202 = async request (takes longer than 1 min)
  if (response.status === 202) {
    console.log(`Request queued. Snapshot ID: ${data.snapshot_id}`);
    console.log(
      `Poll with: GET https://api.brightdata.com/datasets/v3/progress/${data.snapshot_id}`
    );
  }

  return data;
}

// --- Run ---
const result = await scrape(["https://www.amazon.com/dp/B0CRMZHDG8"]);
console.log(JSON.stringify(result, null, 2));
