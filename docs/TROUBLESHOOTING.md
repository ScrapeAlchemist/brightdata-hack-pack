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

## 6. SSL Certificate Errors (Proxy Mode Only)

**Symptom:** `SSLError`, `CERTIFICATE_VERIFY_FAILED`, or `unable to get local issuer certificate` when using the **proxy endpoint** (`brd.superproxy.io:33335`)

> **Note:** This only applies if you're using the proxy interface. The REST API (`api.brightdata.com/request`) does NOT require any SSL certificate setup.

**Why it happens:** When routing HTTPS traffic through Bright Data's proxy, the proxy terminates and re-encrypts the SSL connection. Your client needs to trust Bright Data's CA certificate.

**Option 1: Load the certificate in your code (Recommended)**

Download the certificate: [brightdata.com/static/brightdata_proxy_ca.zip](https://brightdata.com/static/brightdata_proxy_ca.zip)

Unzip it and use the new certificate file (`ca.crt`).

```python
# Python — pass the cert path to requests
import requests

proxy = "http://brd-customer-ID-zone-NAME:PASS@brd.superproxy.io:33335"
response = requests.get(
    "https://example.com",
    proxies={"http": proxy, "https": proxy},
    verify="/path/to/ca.crt",  # Point to the downloaded certificate
)
```

```bash
# cURL — use --cacert flag
curl --proxy brd.superproxy.io:33335 \
  --proxy-user brd-customer-ID-zone-NAME:PASS \
  --cacert /path/to/ca.crt \
  "https://example.com"
```

**Option 2: Install the certificate system-wide**

| Platform | Steps |
|----------|-------|
| **Windows** | Double-click `ca.crt` → Install Certificate → Trusted Root Authorities → Reboot |
| **macOS** | Double-click `ca.crt` → Keychain Access → Set to "Always Trust" |
| **Linux** | Copy to `/usr/local/share/ca-certificates/` → Run `sudo update-ca-certificates` |

**Option 3: Skip SSL verification (Hackathon shortcut only)**

Not recommended for production, but fine during a hackathon:

```python
# Python — disable verification
response = requests.get(url, proxies=proxies, verify=False)

# Suppress the warning
import urllib3
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
```

```bash
# cURL
curl -k --proxy brd.superproxy.io:33335 ...
```

**Best approach for hackathons:** Use the REST API (`api.brightdata.com/request`) instead of the proxy — it doesn't need any SSL certificate setup.

---

## 7. Rate Limiting

**Symptom:** `429 Too Many Requests`

**Fixes:**
- Add a small delay between requests (even 100ms helps)
- Use batch/async mode for multiple URLs instead of parallel requests
- Check your plan's rate limits in the control panel

---

## Still Stuck?

- Check the [official docs](https://docs.brightdata.com)
- **Reach out on LinkedIn** — [![LinkedIn](https://img.shields.io/badge/LinkedIn-Rafael_Levi-blue?logo=linkedin&logoColor=white)](https://www.linkedin.com/in/rafael-levi/)
- Open an issue on this repo
