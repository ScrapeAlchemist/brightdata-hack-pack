"use client";

import type { DashboardMetrics } from "@/app/lib/types";

interface Props {
  metrics: DashboardMetrics;
}

const CARD_CONFIGS = [
  {
    key: "vacantLots" as const,
    label: "Vacant Lots",
    icon: "🏚️",
    description: "Parcels with no active permits",
    color: "#dc2626",
    bg: "#fef2f2",
  },
  {
    key: "highPriority" as const,
    label: "High Priority Parcels",
    icon: "🎯",
    description: "Opportunity score ≥ 75",
    color: "#ea580c",
    bg: "#fff7ed",
  },
  {
    key: "parkGaps" as const,
    label: "Park-Ready Sites",
    icon: "🌳",
    description: "Suitable for parks or greenways",
    color: "#16a34a",
    bg: "#f0fdf4",
  },
  {
    key: "activePermits" as const,
    label: "Active Projects",
    icon: "🔧",
    description: "Infrastructure projects underway",
    color: "#2563eb",
    bg: "#eff6ff",
  },
];

export default function MetricCards({ metrics }: Props) {
  return (
    <div className="metric-cards">
      {CARD_CONFIGS.map((card) => (
        <div key={card.key} className="metric-card" style={{ borderTopColor: card.color }}>
          <div className="metric-icon" style={{ background: card.bg, color: card.color }}>
            {card.icon}
          </div>
          <div className="metric-body">
            <div className="metric-value" style={{ color: card.color }}>
              {metrics[card.key]}
            </div>
            <div className="metric-label">{card.label}</div>
            <div className="metric-desc">{card.description}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
