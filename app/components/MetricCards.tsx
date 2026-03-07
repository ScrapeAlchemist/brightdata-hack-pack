"use client";

import type { LiveMetrics } from "@/app/lib/types";

interface Props {
  metrics: LiveMetrics;
}

export default function MetricCards({ metrics }: Props) {
  const censusLive = metrics.dataStatus.census === "live";
  const osmLive = metrics.dataStatus.osm === "live";

  const cards = [
    {
      label: "Vacant Lots",
      value: metrics.vacantLots,
      sub: censusLive && metrics.censusVacancyRate
        ? `${(metrics.censusVacancyRate * 100).toFixed(1)}% county vacancy rate`
        : "Parcels with no active permits",
      icon: "🏚️",
      color: "#dc2626",
      bg: "#fef2f2",
      sourceLive: metrics.dataStatus.parcels === "live",
      sourceLabel: metrics.dataStatus.parcels === "live" ? "live" : "sample",
    },
    {
      label: "High Priority",
      value: metrics.highPriority,
      sub: censusLive && metrics.censusPovertyRate
        ? `${(metrics.censusPovertyRate * 100).toFixed(1)}% county poverty rate`
        : "Opportunity score ≥ 75",
      icon: "🎯",
      color: "#ea580c",
      bg: "#fff7ed",
      sourceLive: censusLive,
      sourceLabel: censusLive ? "Census live" : "sample",
    },
    {
      label: "Park-Ready Sites",
      value: osmLive && metrics.osmParkCount !== undefined
        ? metrics.parkGaps
        : metrics.parkGaps,
      sub: osmLive && metrics.osmParkCount !== undefined
        ? `${metrics.osmParkCount} parks mapped via OSM`
        : "Sites suitable for parks or greenways",
      icon: "🌳",
      color: "#16a34a",
      bg: "#f0fdf4",
      sourceLive: osmLive,
      sourceLabel: osmLive ? "OSM live" : "sample",
    },
    {
      label: "Active Projects",
      value: metrics.activePermits,
      sub: censusLive && metrics.censusMedianIncome
        ? `Median income $${metrics.censusMedianIncome.toLocaleString()}`
        : "Infrastructure projects underway",
      icon: "🔧",
      color: "#2563eb",
      bg: "#eff6ff",
      sourceLive: false,
      sourceLabel: "sample",
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
