"use client";

import { useState, useMemo, useEffect } from "react";
import dynamic from "next/dynamic";
import HeaderBar from "@/app/components/HeaderBar";
import MetricCards from "@/app/components/MetricCards";
import LayerControls from "@/app/components/LayerControls";
import ParcelDetailPanel from "@/app/components/ParcelDetailPanel";
import CopilotPanel from "@/app/components/CopilotPanel";
import SummaryPanel from "@/app/components/SummaryPanel";
import type { VacancyParcel, InfrastructureItem, ZoneArea, ParkItem, LayerName, LiveMetrics } from "@/app/lib/types";

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

const sampleParcels = vacancyRaw as VacancyParcel[];
const sampleInfra = infraRaw as InfrastructureItem[];
const zones = zonesRaw as ZoneArea[];

export default function Dashboard() {
  const [activeLayers, setActiveLayers] = useState<Set<LayerName>>(
    new Set(["vacancy", "zoning", "infrastructure"])
  );
  const [selectedParcel, setSelectedParcel] = useState<VacancyParcel | null>(null);
  const [highlightedParcelIds, setHighlightedParcelIds] = useState<string[]>([]);
  const [liveMetrics, setLiveMetrics] = useState<LiveMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(true);

  const fallbackMetrics: LiveMetrics = useMemo(() => ({
    vacantLots: sampleParcels.length,
    highPriority: sampleParcels.filter((p) => p.priority === "high").length,
    parkGaps: sampleParcels.filter((p) =>
      p.recommended_use.toLowerCase().includes("park") ||
      p.recommended_use.toLowerCase().includes("garden") ||
      p.recommended_use.toLowerCase().includes("green")
    ).length,
    activePermits: sampleInfra.filter((i) => i.status === "active").length,
    dataStatus: {
      parcels: "fallback",
      census: "fallback",
      osm: "fallback",
      infrastructure: "fallback",
      parks: "fallback",
      permits: "fallback",
    },
    fetchedAt: new Date().toISOString(),
  }), []);

  useEffect(() => {
    fetch("/api/datasets")
      .then((r) => r.json())
      .then((data: LiveMetrics) => {
        setLiveMetrics(data);
        setLoadingMetrics(false);
      })
      .catch(() => {
        setLiveMetrics(null);
        setLoadingMetrics(false);
      });
  }, []);

  const displayMetrics = liveMetrics ?? fallbackMetrics;

  const displayInfra: InfrastructureItem[] =
    liveMetrics?.liveInfrastructure && liveMetrics.liveInfrastructure.length > 0
      ? liveMetrics.liveInfrastructure
      : sampleInfra;

  const displayParks: ParkItem[] = liveMetrics?.liveParks ?? [];

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
      <MetricCards metrics={displayMetrics} />

      <div className="main-content">
        <div className="map-column">
          <LayerControls activeLayers={activeLayers} onToggle={toggleLayer} />
          <CityMap
            parcels={sampleParcels}
            infrastructure={displayInfra}
            zones={zones}
            parks={displayParks}
            activeLayers={activeLayers}
            selectedParcelId={selectedParcel?.id}
            highlightedParcelIds={highlightedParcelIds}
            onParcelClick={setSelectedParcel}
          />
        </div>

        <div className="right-column">
          <ParcelDetailPanel parcel={selectedParcel} />
          <CopilotPanel
            parcels={sampleParcels}
            selectedParcel={selectedParcel}
            onHighlight={setHighlightedParcelIds}
          />
        </div>
      </div>

      <SummaryPanel parcels={sampleParcels} liveMetrics={liveMetrics ?? fallbackMetrics} />
    </div>
  );
}
