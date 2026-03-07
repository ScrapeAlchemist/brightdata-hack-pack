"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import HeaderBar from "@/app/components/HeaderBar";
import MetricCards from "@/app/components/MetricCards";
import LayerControls from "@/app/components/LayerControls";
import ParcelDetailPanel from "@/app/components/ParcelDetailPanel";
import CopilotPanel from "@/app/components/CopilotPanel";
import SummaryPanel from "@/app/components/SummaryPanel";
import type { VacancyParcel, InfrastructureItem, ZoneArea, LayerName } from "@/app/lib/types";

import vacancyRaw from "@/app/data/vacancy_sample.json";
import infraRaw from "@/app/data/infrastructure_sample.json";
import zonesRaw from "@/app/data/zoning_sample.json";

const CityMap = dynamic(() => import("@/app/components/CityMap"), {
  ssr: false,
  loading: () => (
    <div className="map-loading">
      <div className="map-loading-inner">
        <div className="map-spinner" />
        <div>Loading Montgomery map…</div>
      </div>
    </div>
  ),
});

const parcels = vacancyRaw as VacancyParcel[];
const infrastructure = infraRaw as InfrastructureItem[];
const zones = zonesRaw as ZoneArea[];

export default function Dashboard() {
  const [activeLayers, setActiveLayers] = useState<Set<LayerName>>(
    new Set(["vacancy", "zoning", "infrastructure"])
  );
  const [selectedParcel, setSelectedParcel] = useState<VacancyParcel | null>(null);
  const [highlightedParcelIds, setHighlightedParcelIds] = useState<string[]>([]);

  const metrics = useMemo(() => ({
    vacantLots: parcels.length,
    highPriority: parcels.filter((p) => p.priority === "high").length,
    parkGaps: parcels.filter((p) => p.recommended_use.toLowerCase().includes("park") || p.recommended_use.toLowerCase().includes("garden") || p.recommended_use.toLowerCase().includes("green")).length,
    activePermits: infrastructure.filter((i) => i.status === "active").length,
  }), []);

  function toggleLayer(layer: LayerName) {
    setActiveLayers((prev) => {
      const next = new Set(prev);
      if (next.has(layer)) next.delete(layer);
      else next.add(layer);
      return next;
    });
  }

  return (
    <div className="dashboard">
      <HeaderBar />
      <MetricCards metrics={metrics} />

      <div className="main-content">
        <div className="map-column">
          <LayerControls activeLayers={activeLayers} onToggle={toggleLayer} />
          <CityMap
            parcels={parcels}
            infrastructure={infrastructure}
            zones={zones}
            activeLayers={activeLayers}
            selectedParcelId={selectedParcel?.id}
            highlightedParcelIds={highlightedParcelIds}
            onParcelClick={setSelectedParcel}
          />
        </div>

        <div className="right-column">
          <ParcelDetailPanel parcel={selectedParcel} />
          <CopilotPanel
            parcels={parcels}
            selectedParcel={selectedParcel}
            onHighlight={setHighlightedParcelIds}
          />
        </div>
      </div>

      <SummaryPanel parcels={parcels} />
    </div>
  );
}
