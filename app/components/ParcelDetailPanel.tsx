"use client";

import { useState } from "react";
import type { VacancyParcel } from "@/app/lib/types";
import { getScoreColor, getScoreLabel } from "@/app/lib/scoring";

interface Props {
  parcel: VacancyParcel | null;
}

export default function ParcelDetailPanel({ parcel }: Props) {
  const [enriching, setEnriching] = useState(false);
  const [enrichNote, setEnrichNote] = useState<string | null>(null);

  async function handleEnrich() {
    if (!parcel) return;
    setEnriching(true);
    setEnrichNote(null);

    try {
      const res = await fetch("/api/enrich", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool: "search_engine",
          params: { query: `${parcel.address} Montgomery Alabama redevelopment`, parcelId: parcel.id },
        }),
      });
      const data = await res.json();
      if (data.source === "brightdata" && data.data) {
        setEnrichNote(`Live data retrieved via Bright Data: ${data.data.slice(0, 200)}...`);
      } else {
        setEnrichNote("Bright Data MCP enrichment ready — add BRIGHTDATA_API_KEY to Secrets to enable live web context for this parcel.");
      }
    } catch {
      setEnrichNote("Enrichment unavailable. Add BRIGHTDATA_API_KEY to enable.");
    } finally {
      setEnriching(false);
    }
  }

  if (!parcel) {
    return (
      <div className="panel parcel-panel parcel-empty">
        <div className="parcel-empty-icon">📍</div>
        <div className="parcel-empty-title">Parcel Detail</div>
        <div className="parcel-empty-desc">Click any marker on the map to view parcel details and redevelopment analysis.</div>
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
        <span className="badge" style={{ background: pColor + "20", color: pColor }}>
          {parcel.priority.toUpperCase()} PRIORITY
        </span>
      </div>

      <div className="parcel-name">{parcel.name}</div>
      <div className="parcel-address">{parcel.address}</div>
      <div className="parcel-neighborhood">Neighborhood: {parcel.neighborhood}</div>

      <div className="score-bar-wrap">
        <div className="score-bar-header">
          <span>Opportunity Score</span>
          <span style={{ color: scoreColor, fontWeight: 700 }}>{parcel.opportunity_score}/100 — {scoreLabel}</span>
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
          <div className="field-value" style={{ color: "#16a34a", fontWeight: 600 }}>{parcel.recommended_use}</div>
        </div>
        <div className="parcel-field" style={{ gridColumn: "1 / -1" }}>
          <div className="field-label">Infrastructure Context</div>
          <div className="field-value" style={{ fontSize: "12px", color: "#475569" }}>{parcel.infrastructure_context}</div>
        </div>
      </div>

      <button
        onClick={handleEnrich}
        disabled={enriching}
        className="enrich-btn"
      >
        {enriching ? "⏳ Enriching..." : "⚡ Enrich with Bright Data MCP"}
      </button>

      {enrichNote && (
        <div className="enrich-note">
          <div className="enrich-note-label">🔍 MCP Enrichment</div>
          <div className="enrich-note-text">{enrichNote}</div>
        </div>
      )}

      <div className="parcel-id">Parcel ID: {parcel.id} · Updated: {new Date().toLocaleDateString()}</div>
    </div>
  );
}
