"use client";

import { useState, useEffect } from "react";
import type { VacancyParcel, EnrichmentResult, ParcelLookupResult } from "@/app/lib/types";
import { getScoreColor, getScoreLabel } from "@/app/lib/scoring";

interface Props {
  parcel: VacancyParcel | null;
}

export default function ParcelDetailPanel({ parcel }: Props) {
  const [enriching, setEnriching] = useState(false);
  const [enrichResult, setEnrichResult] = useState<EnrichmentResult | null>(null);
  const [enrichError, setEnrichError] = useState<string | null>(null);

  const [lookingUp, setLookingUp] = useState(false);
  const [cityRecord, setCityRecord] = useState<ParcelLookupResult | null>(null);

  useEffect(() => {
    if (!parcel) {
      setEnrichResult(null);
      setEnrichError(null);
      setCityRecord(null);
      return;
    }

    setEnrichResult(null);
    setEnrichError(null);
    setCityRecord(null);
    setEnriching(true);
    setLookingUp(true);

    const controller = new AbortController();

    fetch("/api/enrich", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        parcel: {
          id: parcel.id,
          name: parcel.name,
          address: parcel.address,
          neighborhood: parcel.neighborhood,
          zoning: parcel.zoning,
          priority: parcel.priority,
          opportunity_score: parcel.opportunity_score,
          recommended_use: parcel.recommended_use,
          infrastructure_context: parcel.infrastructure_context,
        },
      }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data: EnrichmentResult) => {
        setEnrichResult(data);
        setEnriching(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") {
          setEnrichError("Enrichment unavailable right now.");
          setEnriching(false);
        }
      });

    fetch("/api/parcel-lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ address: parcel.address }),
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.found) setCityRecord(data.parcel);
        setLookingUp(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") setLookingUp(false);
      });

    return () => controller.abort();
  }, [parcel?.id]);

  async function handleRefresh() {
    if (!parcel) return;
    setEnriching(true);
    setEnrichResult(null);
    setEnrichError(null);
    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parcel: {
            id: parcel.id,
            name: parcel.name,
            address: parcel.address,
            neighborhood: parcel.neighborhood,
            zoning: parcel.zoning,
            priority: parcel.priority,
            opportunity_score: parcel.opportunity_score,
            recommended_use: parcel.recommended_use,
            infrastructure_context: parcel.infrastructure_context,
          },
        }),
      });
      setEnrichResult(await res.json());
    } catch {
      setEnrichError("Enrichment unavailable. Try again.");
    } finally {
      setEnriching(false);
    }
  }

  if (!parcel) {
    return (
      <div className="panel parcel-panel parcel-empty">
        <div className="parcel-empty-icon">📍</div>
        <div className="parcel-empty-title">Parcel Detail</div>
        <div className="parcel-empty-desc">
          Click any marker on the map to view parcel details and get automatic AI-powered enrichment with real city data.
        </div>
      </div>
    );
  }

  const scoreColor = getScoreColor(parcel.opportunity_score);
  const scoreLabel = getScoreLabel(parcel.opportunity_score);
  const priorityColors: Record<string, string> = { high: "#dc2626", medium: "#ea580c", low: "#ca8a04" };
  const pColor = priorityColors[parcel.priority];

  return (
    <div className="panel parcel-panel">
      <div className="panel-header">
        <div className="panel-title">📍 Parcel Detail</div>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <span className="data-badge" style={{ background: "#64748b20", color: "#64748b" }}>
            📂 sample
          </span>
          <span className="badge" style={{ background: pColor + "20", color: pColor }}>
            {parcel.priority.toUpperCase()}
          </span>
        </div>
      </div>

      <div className="parcel-name">{parcel.name}</div>
      <div className="parcel-address">{parcel.address}</div>
      <div className="parcel-neighborhood">
        {parcel.neighborhood} · {parcel.dataset_name ?? "Montgomery, AL Planning Dataset"}
      </div>

      {parcel.citation_url && (
        <div className="parcel-citation">
          <a href={parcel.citation_url} target="_blank" rel="noopener noreferrer">
            📎 View source dataset
          </a>
        </div>
      )}

      {(lookingUp || cityRecord) && (
        <div className="city-record-block">
          <div className="city-record-header">
            <span>🏛️ City Records Lookup</span>
            {lookingUp ? (
              <span className="city-record-loading">searching…</span>
            ) : cityRecord ? (
              <span className="data-badge" style={{ background: "#16a34a20", color: "#16a34a" }}>🟢 live</span>
            ) : null}
          </div>
          {cityRecord && (
            <div className="city-record-grid">
              <div className="city-field">
                <div className="field-label">Parcel No</div>
                <div className="field-value mono">{cityRecord.parcelNo}</div>
              </div>
              <div className="city-field">
                <div className="field-label">Owner</div>
                <div className="field-value">{cityRecord.owner || "—"}</div>
              </div>
              <div className="city-field">
                <div className="field-label">Assessed Value</div>
                <div className="field-value" style={{ color: "#0d9488", fontWeight: 600 }}>
                  {cityRecord.totalValue > 0
                    ? `$${cityRecord.totalValue.toLocaleString()}`
                    : "—"}
                </div>
              </div>
              <div className="city-field">
                <div className="field-label">Land Use</div>
                <div className="field-value">{cityRecord.landUseCode || "—"}</div>
              </div>
              {cityRecord.acreage > 0 && (
                <div className="city-field">
                  <div className="field-label">Acreage</div>
                  <div className="field-value">{cityRecord.acreage.toFixed(2)} ac</div>
                </div>
              )}
              {cityRecord.neighborhood && (
                <div className="city-field">
                  <div className="field-label">Neighborhood</div>
                  <div className="field-value">{cityRecord.neighborhood}</div>
                </div>
              )}
              <div className="city-record-citation" style={{ gridColumn: "1 / -1" }}>
                <a href={cityRecord.citationUrl} target="_blank" rel="noopener noreferrer">
                  📎 Montgomery City Assessor — Parcels_Owner
                </a>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="score-bar-wrap">
        <div className="score-bar-header">
          <span>Opportunity Score</span>
          <span style={{ color: scoreColor, fontWeight: 700 }}>
            {parcel.opportunity_score}/100 — {scoreLabel}
          </span>
        </div>
        <div className="score-bar-bg">
          <div className="score-bar-fill" style={{ width: `${parcel.opportunity_score}%`, background: scoreColor }} />
        </div>
      </div>

      <div className="parcel-grid">
        <div className="parcel-field">
          <div className="field-label">Zoning</div>
          <div className="field-value">{parcel.zoning}</div>
        </div>
        <div className="parcel-field">
          <div className="field-label">Permit Inactivity</div>
          <div className="field-value">{parcel.permit_inactive_years} years</div>
        </div>
        <div className="parcel-field" style={{ gridColumn: "1 / -1" }}>
          <div className="field-label">Recommended Use</div>
          <div className="field-value" style={{ color: "#16a34a", fontWeight: 600 }}>
            {parcel.recommended_use}
          </div>
        </div>
        <div className="parcel-field" style={{ gridColumn: "1 / -1" }}>
          <div className="field-label">Infrastructure Context</div>
          <div className="field-value" style={{ fontSize: "11px", color: "#475569" }}>
            {parcel.infrastructure_context}
          </div>
        </div>
        {parcel.community_need_context && (
          <div className="parcel-field" style={{ gridColumn: "1 / -1" }}>
            <div className="field-label">Community Context</div>
            <div className="field-value" style={{ fontSize: "11px", color: "#475569" }}>
              {parcel.community_need_context}
            </div>
          </div>
        )}
      </div>

      <div className="enrich-section">
        <div className="enrich-section-header">
          <div className="enrich-section-title">
            ⚡ External Context
            <span className="enrich-powered">via Bright Data MCP</span>
          </div>
          {!enriching && (
            <button onClick={handleRefresh} className="refresh-btn" title="Refresh enrichment">
              ↻
            </button>
          )}
        </div>

        {enriching && (
          <div className="enrich-loading">
            <div className="enrich-spinner" />
            <span>Searching live sources for {parcel.name}…</span>
          </div>
        )}

        {!enriching && enrichError && (
          <div className="enrich-error">
            <div>No live enrichment available right now.</div>
            <button onClick={handleRefresh} className="retry-btn">Retry</button>
          </div>
        )}

        {!enriching && enrichResult && (
          <div className="enrich-result">
            <div className="enrich-source-badge">
              {enrichResult.source === "brightdata_openai" && <span className="live-badge">🟢 Bright Data + AI</span>}
              {enrichResult.source === "brightdata" && <span className="live-badge">🟢 Bright Data</span>}
              {enrichResult.source === "openai" && <span className="live-badge">🟡 AI Analysis</span>}
              {enrichResult.source === "local" && <span className="local-badge">📂 Local Analysis</span>}
              <span className="enrich-ts">
                {new Date(enrichResult.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <ul className="enrich-bullets">
              {enrichResult.bullets.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>

            {enrichResult.citations.length > 0 && (
              <div className="citations-block">
                <div className="citations-title">Sources</div>
                {enrichResult.citations.map((c, i) => (
                  <div key={i} className="citation-item">
                    <span className="citation-num">{i + 1}.</span>
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="citation-link">
                      {c.title}
                    </a>
                    <span className="citation-domain">— {c.domain}</span>
                  </div>
                ))}
              </div>
            )}

            {enrichResult.citations.length === 0 && (
              <div className="no-citations">No external citations available for this query.</div>
            )}
          </div>
        )}
      </div>

      <div className="parcel-id">
        Parcel ID: {parcel.id} · {parcel.source ?? "Montgomery, AL Planning Dataset"} ·{" "}
        {new Date().toLocaleDateString()}
      </div>
    </div>
  );
}
