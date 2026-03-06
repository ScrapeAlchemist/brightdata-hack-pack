"use client";

import { useState } from "react";

export default function Home() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleScrape(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult("");

    try {
      const res = await fetch("/api/scrape", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scrape failed");
        return;
      }

      setResult(data.html);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <h1>Bright Data Scraper</h1>
      <p>Enter a URL to scrape its HTML content using Bright Data Web Unlocker.</p>

      <form onSubmit={handleScrape}>
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          required
        />
        <button type="submit" disabled={loading}>
          {loading ? "Scraping..." : "Scrape"}
        </button>
      </form>

      {error && <div className="error">{error}</div>}

      {result && (
        <div>
          <h2>Result ({result.length.toLocaleString()} chars)</h2>
          <pre>{result.slice(0, 5000)}</pre>
        </div>
      )}
    </main>
  );
}
