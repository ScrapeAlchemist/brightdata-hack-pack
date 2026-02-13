# Troubleshooting Guide

Hit a wall? Here are the most common issues and how to fix them.

---

## 1. Authentication Failed (401 / 403)

**Symptom:** `401 Unauthorized` or `403 Forbidden`

**Fixes:**
- Double-check your API key at [brightdata.com/cp/setting/users](https://brightdata.com/cp/setting/users)
- Make sure the header is `Authorization: Bearer YOUR_KEY` (not `Basic`)
- Verify your zone name matches exactly (case-sensitive)
- For Scraping Browser: use zone username + password, not the API key

```python
# Correct
headers = {"Authorization": f"Bearer {API_KEY}"}

# Wrong
headers = {"Authorization": API_KEY}  # Missing "Bearer"
```

---

## 2. Zone Not Found / Invalid Zone

**Symptom:** Error mentioning zone name or zone configuration

**Fixes:**
- Check your zone name in the [control panel](https://brightdata.com/cp/zones)
- Zone names are case-sensitive
- Make sure the zone is active (not paused or deleted)
- Different products use different zones — SERP API zone won't work with Web Unlocker

---

## 3. Timeout Errors

**Symptom:** Request hangs or times out

**Fixes:**
- Web Unlocker and SERP API requests can take 10-30 seconds — set a generous timeout
- Scraping Browser: set navigation timeout to at least 2 minutes
- Web Scraper API: if response is 202, your request is queued — poll for results

```python
# Python: set timeout
response = requests.post(url, headers=headers, json=body, timeout=60)

# Scraping Browser: set navigation timeout
await page.goto(url, timeout=120_000)  # 2 minutes
```

---

## 4. Empty or Unexpected Response

**Symptom:** Response is empty, HTML instead of JSON, or garbled data

**Fixes:**
- Check the `format` parameter: `"raw"` returns HTML, `"json"` returns parsed data
- Not all sites support parsed JSON — use `"raw"` and parse the HTML yourself
- Web Scraper API: make sure the `dataset_id` matches the site you're scraping
- Web Scraper API returns 202 for long requests — don't treat the snapshot_id response as your data

---

## 5. Scraping Browser Connection Failed

**Symptom:** WebSocket connection error or `407 Auth Failed`

**Fixes:**
- Check credentials: `wss://USER:PASS@brd.superproxy.io:9222`
- USER format: `brd-customer-XXXXX-zone-XXXXX`
- PASS: the zone password (not your account password, not your API key)
- Make sure your Browser API zone is active
- Install the right package: `puppeteer-core` (not `puppeteer`) or `playwright`

```javascript
// Correct: puppeteer-core (connects to remote browser)
const puppeteer = require("puppeteer-core");

// Wrong: puppeteer (tries to launch local browser)
const puppeteer = require("puppeteer");
```

---

## 6. Rate Limiting

**Symptom:** `429 Too Many Requests`

**Fixes:**
- Add a small delay between requests (even 100ms helps)
- Use batch/async mode for multiple URLs instead of parallel requests
- Check your plan's rate limits in the control panel

---

## Still Stuck?

- Check the [official docs](https://docs.brightdata.com)
- Find me at the Bright Data booth
- Open an issue on this repo
