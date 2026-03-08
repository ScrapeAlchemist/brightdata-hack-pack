"use client";

import type { LiveMetrics } from "@/app/lib/types";

interface Props {
  metrics: LiveMetrics;
}

export default function MetricCards({ metrics }: Props) {
  const censusLive = metrics.dataStatus.census === "live";
  const parksLive = metrics.dataStatus.parks === "live";
  const violationsLive = metrics.dataStatus.codeViolations === "live";
  const transitLive = metrics.dataStatus.transit === "live";

  const cards = [
    {
      label: "Vacant Lots",
      value: metrics.vacantLots.toLocaleString(),
      sub: censusLive && metrics.censusVacancyRate
        ? `${(metrics.censusVacancyRate * 100).toFixed(1)}% city vacancy rate (Census ACS)`
        : "Parcels with no active permits",
      icon: "🏚️",
      color: "#dc2626",
      bg: "#fef2f2",
      sourceLive: censusLive,
      sourceLabel: censusLive ? "Census ACS live" : "sample",
    },
    {
      label: "High Priority Sites",
      value: metrics.highPriority,
      sub: censusLive && metrics.censusPovertyRate
        ? `${(metrics.censusPovertyRate * 100).toFixed(1)}% city poverty rate · $${metrics.censusMedianIncome?.toLocaleString()} median income`
        : "Opportunity score ≥ 75",
      icon: "🎯",
      color: "#ea580c",
      bg: "#fff7ed",
      sourceLive: censusLive,
      sourceLabel: censusLive ? "Census ACS live" : "sample",
    },
    {
      label: "Park-Ready Sites",
      value: metrics.parkGaps,
      sub: parksLive && metrics.gisParkCount !== undefined
        ? `${metrics.gisParkCount} parks mapped · ${transitLive && metrics.gisTransitCount ? `${metrics.gisTransitCount} transit stops` : "Montgomery City GIS"}`
        : "Sites suitable for parks or greenways",
      icon: "🌳",
      color: "#16a34a",
      bg: "#f0fdf4",
      sourceLive: parksLive,
      sourceLabel: parksLive ? "City GIS live" : "sample",
    },
    {
      label: "Open Code Violations",
      value: violationsLive && metrics.codeViolationsOpen !== undefined
        ? metrics.codeViolationsOpen.toLocaleString()
        : metrics.activePermits,
      sub: violationsLive && metrics.codeViolationsTotal !== undefined
        ? `${metrics.codeViolationsTotal.toLocaleString()} total violations · ${metrics.gisInfraCount ?? 0} infra projects`
        : "Infrastructure projects underway",
      icon: "⚠️",
      color: "#7c3aed",
      bg: "#f5f3ff",
      sourceLive: violationsLive,
      sourceLabel: violationsLive ? "City GIS live" : "sample",
    },
  ];

  return (
    <div className="metric-cards">
      {cards.map((card) => (
        <div key={card.label} className="metric-card" style={{ borderTopColor: card.color }}>
          <div className="metric-icon" style={{ background: card.bg, color: card.color }}>
            {card.icon}
          </div>
          <div className="metric-body">
            <div className="metric-value" style={{ color: card.color }}>{card.value}</div>
            <div className="metric-label">{card.label}</div>
            <div className="metric-desc">{card.sub}</div>
            <div
              className="metric-source"
              style={{ color: card.sourceLive ? "#16a34a" : "#9ca3af" }}
            >
              {card.sourceLive ? "🟢" : "📂"} {card.sourceLabel}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
