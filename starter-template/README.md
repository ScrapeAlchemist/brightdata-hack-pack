# Bright Data Hackathon Starter Template

A minimal Next.js app that scrapes any URL using Bright Data's Web Unlocker API. Fork this and start building.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure your API key
cp .env.example .env
# Edit .env and add your Bright Data API key

# 3. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter a URL, and hit Scrape.

## How It Works

- **Frontend** (`app/page.tsx`): Simple form that takes a URL and displays the scraped HTML
- **API Route** (`app/api/scrape/route.ts`): Calls Bright Data's Web Unlocker to fetch the page

## Extending This Template

Some ideas to build on top of this:

- Parse the HTML with Cheerio to extract specific data
- Add the SERP API to search for URLs first
- Use an LLM to summarize or analyze the scraped content
- Store results in a database
- Add a Scraping Browser endpoint for JS-heavy sites

## Environment Variables

| Variable | Description |
|----------|-------------|
| `BRIGHTDATA_API_KEY` | Your API key from [brightdata.com/cp/setting/users](https://brightdata.com/cp/setting/users) |
| `BRIGHTDATA_UNLOCKER_ZONE` | Your Web Unlocker zone name (default: `web_unlocker1`) |
