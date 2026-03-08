"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { VacancyParcel, InfrastructureItem, ZoneArea, ParkItem, LayerName } from "@/app/lib/types";
import { getPriorityColor, getCommunityNeedColor } from "@/app/lib/scoring";

interface Props {
  parcels: VacancyParcel[];
  infrastructure: InfrastructureItem[];
  zones: ZoneArea[];
  parks?: ParkItem[];
  activeLayers: Set<LayerName>;
  selectedParcelId?: string;
  highlightedParcelIds: string[];
  onParcelClick: (parcel: VacancyParcel) => void;
}

const MONTGOMERY_CENTER: [number, number] = [32.3778, -86.3003];

const INFRA_STATUS_COLOR: Record<string, string> = {
  active: "#2563eb",
  planned: "#7c3aed",
  completed: "#16a34a",
};

const ZONE_COMPAT_COLOR: Record<string, string> = {
  high: "#16a34a",
  medium: "#f59e0b",
  low: "#9ca3af",
};

function statusLabel(s: string): string {
  if (s === "active") return "ACTIVE";
  if (s === "completed") return "COMPLETE";
  return "PLANNED";
}

export default function CityMap({
  parcels,
  infrastructure,
  zones,
  parks = [],
  activeLayers,
  selectedParcelId,
  highlightedParcelIds,
  onParcelClick,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: MONTGOMERY_CENTER,
      zoom: 13,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];

    if (activeLayers.has("community")) {
      parcels.forEach((parcel) => {
        const needScore = parcel.community_need_score ?? 0;
        const color = getCommunityNeedColor(needScore);
        const needLabel = parcel.community_need_label ?? (needScore >= 65 ? "High" : needScore >= 40 ? "Moderate" : "Low");
        const isSelected = parcel.id === selectedParcelId;
        const isHighlighted = highlightedParcelIds.includes(parcel.id);
        const radius = isHighlighted ? 14 : isSelected ? 12 : 8;

        const marker = L.circleMarker([parcel.lat, parcel.lng], {
          radius,
          fillColor: color,
          color: isHighlighted ? "#fbbf24" : "#ffffff",
          weight: 2,
          opacity: 1,
          fillOpacity: 0.85,
        });

        marker.bindPopup(
          L.popup({ maxWidth: 260 }).setContent(`
            <div style="font-family:system-ui,sans-serif;padding:4px 0">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#0f172a">${parcel.name}</div>
              <div style="font-size:11px;color:#64748b;margin-bottom:6px">${parcel.address}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
                <span style="background:${color}20;color:${color};padding:2px 7px;border-radius:99px;font-size:11px;font-weight:600">⚠️ Need: ${needScore}/100 — ${needLabel}</span>
              </div>
              <div style="font-size:11px;color:#475569;margin-top:4px;line-height:1.5">${parcel.permit_inactive_years} yrs permit inactivity · ${parcel.neighborhood}</div>
              <div style="font-size:10px;color:#94a3b8;margin-top:4px">Source: Census ACS + Montgomery Building Permits</div>
              <div style="font-size:10px;color:#94a3b8;margin-top:2px">Click to open detail panel →</div>
            </div>
          `)
        );

        marker.on("click", () => {
          onParcelClick(parcel);
          marker.openPopup();
        });

        marker.addTo(map);
        markersRef.current.push(marker);
      });
    }

    if (activeLayers.has("vacancy")) {
      parcels.forEach((parcel) => {
        const isHighlighted = highlightedParcelIds.includes(parcel.id);
        const isSelected = parcel.id === selectedParcelId;
        const color = getPriorityColor(parcel.priority);
        const radius = isHighlighted ? 14 : isSelected ? 12 : 8;

        const marker = L.circleMarker([parcel.lat, parcel.lng], {
          radius,
          fillColor: color,
          color: isHighlighted ? "#fbbf24" : isSelected ? "#1e293b" : "#ffffff",
          weight: isHighlighted ? 3 : 2,
          opacity: 1,
          fillOpacity: isHighlighted ? 1 : 0.85,
        });

        marker.bindPopup(
          L.popup({ maxWidth: 260 }).setContent(`
            <div style="font-family:system-ui,sans-serif;padding:4px 0">
              <div style="font-weight:700;font-size:13px;margin-bottom:4px;color:#0f172a">${parcel.name}</div>
              <div style="font-size:11px;color:#64748b;margin-bottom:6px">${parcel.address}</div>
              <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:6px">
                <span style="background:${color}20;color:${color};padding:2px 7px;border-radius:99px;font-size:11px;font-weight:600;text-transform:uppercase">${parcel.priority}</span>
                <span style="background:#f1f5f9;color:#475569;padding:2px 7px;border-radius:99px;font-size:11px">${parcel.zoning}</span>
              </div>
              <div style="font-size:12px;color:#0f172a"><b>Score:</b> ${parcel.opportunity_score}/100</div>
              <div style="font-size:12px;color:#0f172a"><b>→</b> ${parcel.recommended_use}</div>
              ${parcel.community_need_score !== undefined ? `<div style="font-size:11px;color:#ea580c;margin-top:3px">⚠️ Community Need: ${parcel.community_need_score}/100</div>` : ""}
              <div style="font-size:10px;color:#94a3b8;margin-top:4px">Click to open detail panel →</div>
            </div>
          `)
        );

        marker.on("click", () => {
          onParcelClick(parcel);
          marker.openPopup();
        });

        marker.addTo(map);
        markersRef.current.push(marker);
      });
    }

    if (activeLayers.has("infrastructure")) {
      infrastructure.forEach((item) => {
        const color = INFRA_STATUS_COLOR[item.status] || "#2563eb";
        const liveTag = item.is_live ? " · 🟢 live" : "";

        const icon = L.divIcon({
          html: `<div style="background:${color};width:13px;height:13px;border-radius:3px;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.25);transform:rotate(45deg)"></div>`,
          className: "",
          iconSize: [17, 17],
          iconAnchor: [8, 8],
        });

        const marker = L.marker([item.lat, item.lng], { icon });
        marker.bindPopup(`
          <div style="font-family:system-ui,sans-serif;padding:4px 0">
            <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:4px">${item.name}</div>
            <span style="background:${color}20;color:${color};padding:2px 7px;border-radius:99px;font-size:11px;font-weight:600;text-transform:uppercase">${statusLabel(item.status)}</span>
            <div style="font-size:11px;color:#475569;margin-top:6px;line-height:1.5">${item.description}</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:4px">${item.source ?? ""}${liveTag}</div>
          </div>
        `);
        marker.addTo(map);
        markersRef.current.push(marker);
      });

      parks.forEach((park) => {
        const icon = L.divIcon({
          html: `<div style="background:#15803d;color:white;width:16px;height:16px;border-radius:50%;border:2px solid white;box-shadow:0 2px 4px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center;font-size:9px">🌳</div>`,
          className: "",
          iconSize: [18, 18],
          iconAnchor: [9, 9],
        });

        const marker = L.marker([park.lat, park.lng], { icon });
        marker.bindPopup(`
          <div style="font-family:system-ui,sans-serif;padding:4px 0">
            <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:4px">${park.name}</div>
            <div style="font-size:11px;color:#64748b;margin-bottom:5px">${park.address}</div>
            <span style="background:#dcfce720;color:#15803d;padding:2px 7px;border-radius:99px;font-size:11px;font-weight:600">${park.facilityType}</span>
            <div style="font-size:11px;color:#475569;margin-top:6px">Hours: ${park.operDays}</div>
            <div style="font-size:10px;color:#94a3b8;margin-top:4px">🟢 Montgomery City GIS live</div>
          </div>
        `);
        marker.addTo(map);
        markersRef.current.push(marker);
      });
    }

    if (activeLayers.has("zoning")) {
      zones.forEach((zone) => {
        const color = ZONE_COMPAT_COLOR[zone.compatibility] || "#9ca3af";

        const icon = L.divIcon({
          html: `<div style="background:${color}22;border:2px solid ${color};width:20px;height:20px;border-radius:3px;box-shadow:0 1px 3px rgba(0,0,0,0.15);display:flex;align-items:center;justify-content:center;font-size:7px;font-weight:800;color:${color}">${zone.zone_code.replace(/[^A-Z0-9-]/g, "").slice(0, 3)}</div>`,
          className: "",
          iconSize: [22, 22],
          iconAnchor: [11, 11],
        });

        const marker = L.marker([zone.lat, zone.lng], { icon });
        marker.bindPopup(`
          <div style="font-family:system-ui,sans-serif;padding:4px 0">
            <div style="font-weight:700;font-size:13px;color:#0f172a;margin-bottom:4px">${zone.name}</div>
            <div style="font-size:12px;color:#475569"><b>Zone:</b> ${zone.zone_code} — ${zone.zone_type}</div>
            <div style="font-size:12px;color:#475569;margin-top:3px"><b>Dev compatibility:</b> <span style="color:${color};font-weight:600">${zone.compatibility}</span></div>
            <div style="font-size:11px;color:#64748b;margin-top:5px;line-height:1.4">${zone.notes}</div>
          </div>
        `);
        marker.addTo(map);
        markersRef.current.push(marker);
      });
    }
  }, [parcels, infrastructure, zones, parks, activeLayers, selectedParcelId, highlightedParcelIds, onParcelClick]);

  return (
    <div className="city-map-wrapper">
      <div ref={containerRef} className="city-map" />
      <div className="map-legend">
        {activeLayers.has("community") && (
          <>
            <div className="legend-item"><span className="legend-dot" style={{ background: "#dc2626" }} />High need</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: "#f97316" }} />Moderate need</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: "#eab308" }} />Low need</div>
          </>
        )}
        {activeLayers.has("vacancy") && (
          <>
            <div className="legend-item"><span className="legend-dot" style={{ background: "#dc2626" }} />High priority</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: "#ea580c" }} />Medium</div>
            <div className="legend-item"><span className="legend-dot" style={{ background: "#ca8a04" }} />Low priority</div>
          </>
        )}
        {activeLayers.has("infrastructure") && (
          <>
            <div className="legend-item"><span className="legend-sq" style={{ background: "#2563eb", transform: "rotate(45deg)", display: "inline-block" }} />Infrastructure</div>
            {parks.length > 0 && (
              <div className="legend-item"><span style={{ fontSize: "11px" }}>🌳</span> Parks ({parks.length} live)</div>
            )}
          </>
        )}
        {activeLayers.has("zoning") && (
          <div className="legend-item"><span className="legend-sq" style={{ background: "#16a34a" }} />Zoning</div>
        )}
        {highlightedParcelIds.length > 0 && (
          <div className="legend-item" style={{ color: "#ca8a04", fontWeight: 600 }}>✦ {highlightedParcelIds.length} highlighted</div>
        )}
      </div>
    </div>
  );
}
