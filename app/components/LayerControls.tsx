"use client";

import type { LayerName } from "@/app/lib/types";

interface Props {
  activeLayers: Set<LayerName>;
  onToggle: (layer: LayerName) => void;
}

const LAYERS: { id: LayerName; label: string; color: string; icon: string; desc: string }[] = [
  { id: "vacancy", label: "Vacancy / Redevelopment", color: "#dc2626", icon: "🏚️", desc: "Vacant and underused parcels" },
  { id: "zoning", label: "Zoning Compatibility", color: "#7c3aed", icon: "📋", desc: "Land-use zone context" },
  { id: "infrastructure", label: "Infrastructure / Permits", color: "#2563eb", icon: "🔧", desc: "Active projects and upgrades" },
];

export default function LayerControls({ activeLayers, onToggle }: Props) {
  return (
    <div className="layer-controls">
      <div className="layer-controls-title">Map Layers</div>
      <div className="layer-buttons">
        {LAYERS.map((layer) => {
          const active = activeLayers.has(layer.id);
          return (
            <button
              key={layer.id}
              onClick={() => onToggle(layer.id)}
              className={`layer-btn ${active ? "layer-btn-active" : "layer-btn-inactive"}`}
              style={active ? { borderColor: layer.color, background: layer.color + "18", color: layer.color } : {}}
              title={layer.desc}
            >
              <span className="layer-dot" style={{ background: active ? layer.color : "#d1d5db" }} />
              <span className="layer-icon">{layer.icon}</span>
              <span>{layer.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
