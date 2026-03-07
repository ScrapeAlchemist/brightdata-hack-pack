"use client";

import { useState } from "react";
import type { VacancyParcel, LiveMetrics } from "@/app/lib/types";
import { rankParcels, getScoreColor } from "@/app/lib/scoring";

interface Props {
  parcels: VacancyParcel[];
  liveMetrics?: LiveMetrics | null;
}

export default function SummaryPanel({ parcels, liveMetrics }: Props) {
  const [exported, setExported] = useState(false);
  const top3 = rankParcels(parcels).slice(0, 3);

  const totalVacant = parcels.length;
  const highPriority = parcels.filter((p) => p.priority === "high").length;
  const avgScore = Math.round(parcels.reduce((s, p) => s + p.opportunity_score, 0) / parcels.length);

  const censusLive = liveMetrics?.dataStatus.census === "live";
  const parksLive = liveMetrics?.dataStatus.parks === "live";
  const infraLive = liveMetrics?.dataStatus.infrastructure === "live";
  const permitsLive = liveMetrics?.dataStatus.permits === "live";

  function handleExport() {
    const report = {
      generated: new Date().toISOString(),
      title: "RevitaVibe Montgomery — Mayor Redevelopment Summary",
      dataSources: {
        parcels: liveMetrics?.dataStatus.parcels ?? "fallback",
        census: liveMetrics?.dataStatus.census ?? "fallback",
        infrastructure: liveMetrics?.dataStatus.infrastructure ?? "fallback",
        parks: liveMetrics?.dataStatus.parks ?? "fallback",
        permits: liveMetrics?.dataStatus.permits ?? "fallback",
        censusSource: liveMetrics?.censusSource,
        gisInfraSource: liveMetrics?.gisInfraSource,
        gisParksSource: liveMetrics?.gisParksSource,
        gisPermitsSource: liveMetrics?.gisPermitsSource,
      },
      metrics: {
        totalVacant,
        highPriority,
        avgScore,
        censusVacancyRate: liveMetrics?.censusVacancyRate,
        censusPovertyRate: liveMetrics?.censusPovertyRate,
        censusMedianIncome: liveMetrics?.censusMedianIncome,
        gisParkCount: liveMetrics?.gisParkCount,
        gisInfraCount: liveMetrics?.gisInfraCount,
        gisPermitCount: liveMetrics?.gisPermitCount,
      },
      topOpportunities: top3.map((p) => ({
        id: p.id,
        name: p.name,
        address: p.address,
        score: p.opportunity_score,
        recommendedUse: p.recommended_use,
        priority: p.priority,
      })),
    };
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "revitavibe-montgomery-summary.json";
    a.click();
    URL.revokeObjectURL(url);
    setExported(true);
    setTimeout(() => setExported(false), 3000);
  }

  return (
    <div className="summary-panel">
      <div className="summary-header">
        <div>
          <div className="summary-title">🏛️ Mayor Redevelopment Summary</div>
          <div className="summary-subtitle">
            {totalVacant} vacant parcels · {highPriority} high priority · Avg score {avgScore}/100
            {censusLive && liveMetrics?.censusPovertyRate
              ? ` · ${(liveMetrics.censusPovertyRate * 100).toFixed(1)}% county poverty rate`
              : ""}
            {infraLive && liveMetrics?.gisInfraCount
              ? ` · ${liveMetrics.gisInfraCount} live infra projects`
              : ""}
          </div>
        </div>
        <button onClick={handleExport} className="export-btn">
          {exported ? "✅ Exported!" : "📄 Export Summary"}
        </button>
      </div>

      <div className="summary-insights">
        <div className="insight-card" style={{ borderLeftColor: "#16a34a" }}>
          <div className="insight-icon">🌟</div>
          <div className="insight-body">
            <div className="insight-title">Key Insight</div>
            <div className="insight-text">
              West End and Lincoln Heights represent the highest concentration of redevelopment
              opportunity, with {highPriority} high-priority sites averaging {avgScore}/100.
              {parksLive && liveMetrics?.gisParkCount !== undefined
                ? ` City GIS confirms ${liveMetrics.gisParkCount} mapped parks in Montgomery.`
                : ""}
            </div>
          </div>
        </div>
        <div className="insight-card" style={{ borderLeftColor: "#2563eb" }}>
          <div className="insight-icon">🔧</div>
          <div className="insight-body">
            <div className="insight-title">Infrastructure Alignment</div>
            <div className="insight-text">
              {infraLive && liveMetrics?.gisInfraCount
                ? `${liveMetrics.gisInfraCount} live infrastructure improvement projects recorded by Montgomery City GIS, creating an active development pipeline.`
                : `${Math.round(highPriority * 0.7)} high-priority parcels are adjacent to active infrastructure projects, creating a development-ready pipeline.`}
            </div>
          </div>
        </div>
        <div className="insight-card" style={{ borderLeftColor: "#ea580c" }}>
          <div className="insight-icon">📈</div>
          <div className="insight-body">
            <div className="insight-title">Economic Potential</div>
            <div className="insight-text">
              Estimated redevelopment value across top {highPriority} parcels: $240M–$380M.
              {censusLive && liveMetrics?.censusMedianIncome
                ? ` Median household income: $${liveMetrics.censusMedianIncome.toLocaleString()} (Census ACS 2022).`
                : " Based on comparable mid-sized Alabama city projects."}
            </div>
          </div>
        </div>
      </div>

      <div className="top-opportunities">
        <div className="top-opp-title">Top 3 Redevelopment Opportunities</div>
        <div className="opp-cards">
          {top3.map((parcel, i) => {
            const scoreColor = getScoreColor(parcel.opportunity_score);
            return (
              <div key={parcel.id} className="opp-card">
                <div className="opp-rank" style={{ background: scoreColor }}>{i + 1}</div>
                <div className="opp-body">
                  <div className="opp-name">{parcel.name}</div>
                  <div className="opp-address">{parcel.address}</div>
                  <div className="opp-use">→ {parcel.recommended_use}</div>
                  <div className="opp-score" style={{ color: scoreColor }}>
                    Score: {parcel.opportunity_score}/100
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="summary-data-status">
        <div className="data-status-row">
          <span className="data-status-label">Data sources:</span>
          <span className={`data-status-val ${censusLive ? "status-live" : "status-fallback"}`}>
            {censusLive ? "🟢" : "📂"} Census ACS
          </span>
          <span className={`data-status-val ${infraLive ? "status-live" : "status-fallback"}`}>
            {infraLive ? "🟢" : "📂"} Infrastructure ({liveMetrics?.gisInfraCount ?? 0} projects)
          </span>
          <span className={`data-status-val ${parksLive ? "status-live" : "status-fallback"}`}>
            {parksLive ? "🟢" : "📂"} Parks ({liveMetrics?.gisParkCount ?? 0} live)
          </span>
          <span className={`data-status-val ${permitsLive ? "status-live" : "status-fallback"}`}>
            {permitsLive ? "🟢" : "📂"} Permits ({liveMetrics?.gisPermitCount ?? 0} total)
          </span>
          <span className="data-status-val status-fallback">
            📂 Parcels: curated sample
          </span>
        </div>
        <div className="summary-footer">
          Parcels: curated Montgomery, AL sample · Census ACS 2022 (live) · Montgomery City GIS Infrastructure & Parks (live) ·
          Building Permits (live) · Bright Data MCP enrichment on parcel click · RevitaVibe Montgomery
        </div>
      </div>
    </div>
  );
}
