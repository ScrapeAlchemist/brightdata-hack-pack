/**
 * Bright Data Web Unlocker — Access any website without blocks.
 *
 * Automatically handles CAPTCHAs, browser fingerprinting, retries, and IP rotation.
 * Returns the raw HTML of the target page.
 *
 * Setup:
 *   1. Get your API key from https://brightdata.com/cp/setting/users
 *   2. Find your Web Unlocker zone name from the control panel
 *   3. Set environment variables:
 *        export BRIGHTDATA_API_KEY="your_api_key"
 *        export BRIGHTDATA_UNLOCKER_ZONE="your_web_unlocker_zone_name"
 *
 * Usage:
 *   node 04_web_unlocker.js
 */

const API_KEY = process.env.BRIGHTDATA_API_KEY;
const UNLOCKER_ZONE = process.env.BRIGHTDATA_UNLOCKER_ZONE || "web_unlocker1";

async function unlockUrl(url) {
  const response = await fetch("https://api.brightdata.com/request", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      zone: UNLOCKER_ZONE,
      url,
      format: "raw",
    }),
  });

  if (!response.ok) {
    throw new Error(`Web Unlocker error: ${response.status} ${await response.text()}`);
  }

  return response.text();
}

// --- Run ---
const html = await unlockUrl("https://www.example.com");
console.log(`Received ${html.length} chars of HTML`);
console.log(html.slice(0, 500));
