/**
 * Bright Data Scraping Browser — Remote browser with built-in unblocking.
 *
 * Connects via Puppeteer to a real cloud browser that handles CAPTCHAs,
 * fingerprinting, and proxy rotation automatically.
 *
 * Setup:
 *   1. Create a Browser API zone in your Bright Data control panel
 *   2. Copy the username and password from the zone's Overview tab
 *   3. Install: npm install puppeteer-core
 *   4. Set environment variables:
 *        export BRIGHTDATA_BROWSER_USER="brd-customer-XXXXX-zone-XXXXX"
 *        export BRIGHTDATA_BROWSER_PASS="your_zone_password"
 *
 * Usage:
 *   node 03_scraping_browser.js
 */

import puppeteer from "puppeteer-core";

const BROWSER_USER = process.env.BRIGHTDATA_BROWSER_USER;
const BROWSER_PASS = process.env.BRIGHTDATA_BROWSER_PASS;
const BROWSER_WS = `wss://${BROWSER_USER}:${BROWSER_PASS}@brd.superproxy.io:9222`;

async function scrapeWithBrowser(url) {
  const browser = await puppeteer.connect({
    browserWSEndpoint: BROWSER_WS,
  });

  try {
    const page = await browser.newPage();
    page.setDefaultNavigationTimeout(2 * 60 * 1000);
    await page.goto(url);

    const title = await page.title();
    const html = await page.content();

    // Example: extract all links
    const links = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a[href]"))
        .slice(0, 20)
        .map((a) => ({ text: a.textContent.trim(), href: a.href }))
    );

    return { title, links, htmlLength: html.length };
  } finally {
    await browser.close();
  }
}

// --- Run ---
const result = await scrapeWithBrowser("https://news.ycombinator.com");
console.log(`Title: ${result.title}`);
console.log(`HTML length: ${result.htmlLength}`);
console.log(`Found ${result.links.length} links:`);
result.links.slice(0, 10).forEach((link) => {
  console.log(`  - ${link.text.slice(0, 60)} -> ${link.href}`);
});
