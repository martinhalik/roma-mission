"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useRef, useEffect, useState } from "react";
import { ROMA_COUNTRIES } from "@/lib/data/roma-countries";

// ─── Types ────────────────────────────────────────────────────────────────────

type MarkerType =
  | "mission-center"
  | "parish"
  | "collaborating"
  | "planting"
  | "failed";

interface MissionPoint {
  id: string;
  type: MarkerType;
  name: string;
  subtitle: string;
  description: string;
  coordinates: [number, number];
}

// ─── Mission Locations ────────────────────────────────────────────────────────

const MISSION_POINTS: MissionPoint[] = [
  {
    id: "klenovec",
    type: "mission-center",
    name: "Klenovec",
    subtitle: "St. Nicholas Mission Center",
    description:
      "Our primary mission base in central Slovakia — the operational hub for training, community formation, and regional coordination.",
    coordinates: [19.9097, 48.5433],
  },
  {
    id: "markovce",
    type: "parish",
    name: "Markovce",
    subtitle: "Roma Parish",
    description:
      "An active Orthodox Roma parish with regular Liturgy, youth programs, and growing local lay leadership.",
    coordinates: [21.735, 48.878],
  },
  {
    id: "varadka",
    type: "collaborating",
    name: "Varadka",
    subtitle: "Collaborating Parish · Bardejov",
    description:
      "A partner parish in the Bardejov district supporting the mission network through shared resources and pastoral cooperation.",
    coordinates: [21.283, 49.283],
  },
  {
    id: "kacanov",
    type: "planting",
    name: "Kačanov",
    subtitle: "Planting Parish",
    description:
      "A new church being established near Markovce. Services have begun. A permanent home and ongoing support are needed.",
    coordinates: [21.783, 48.833],
  },
  {
    id: "rimavska-pila",
    type: "planting",
    name: "Rimavská Pila",
    subtitle: "Planting Parish",
    description:
      "A new parish taking root near Klenovec. Early-stage community formation is underway — needs sustained presence and funding.",
    coordinates: [19.783, 48.467],
  },
  {
    id: "zemjastrabie",
    type: "planting",
    name: "Zemplínske Jastrabie",
    subtitle: "Planting Parish",
    description:
      "A settlement prayed over for years. We finally have a door open. Early outreach underway.",
    coordinates: [21.95, 48.63],
  },
  {
    id: "mutnik",
    type: "failed",
    name: "Mútnik",
    subtitle: "Concluded — 2026",
    description:
      "Nine years of faithful presence. A community formed, believers were baptized, and local leaders emerged. This chapter concluded in 2026.",
    coordinates: [19.95, 48.59],
  },
  {
    id: "hacava",
    type: "failed",
    name: "Hačava",
    subtitle: "Not continued — 2017",
    description:
      "A genuine open door with early fruit, but we could not sustain consistent missionary presence. Without someone going week after week, the community could not hold together.",
    coordinates: [20.25, 48.42],
  },
];

function getPct(d: { pop: number; totalPop: number }): number {
  return (d.pop / d.totalPop) * 100;
}

// ─── Style Config ─────────────────────────────────────────────────────────────

const MARKER_COLORS: Record<MarkerType, string> = {
  "mission-center": "#D4AF37",
  parish: "#D4AF37",
  collaborating: "#8B7CC8",
  planting: "#4CAF50",
  failed: "#E53935",
};

const MARKER_SIZES: Record<MarkerType, number> = {
  "mission-center": 18,
  parish: 13,
  collaborating: 12,
  planting: 12,
  failed: 12,
};

const MARKER_LABELS: Record<MarkerType, string> = {
  "mission-center": "Mission Center",
  parish: "Active Parish",
  collaborating: "Collaborating Parish",
  planting: "Planting Parish",
  failed: "Discontinued",
};

const LEGEND_ITEMS: MarkerType[] = [
  "mission-center",
  "parish",
  "planting",
  "collaborating",
  "failed",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPct(pct: number): string {
  return pct >= 1 ? `${pct.toFixed(1)}%` : `${pct.toFixed(2)}%`;
}

function formatPop(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${Math.round(n / 1000)}K`;
}

// Piecewise-linear color scale.
// 0→1%: near-grey (almost invisible vs unlisted countries), steep jump at 7–9%.
// Each stop: [percentage, [r, g, b]]
const COLOR_STOPS: [number, [number, number, number]][] = [
  [0,  [ 50, 35, 35]],  // faint warm grey — just visible against dark map
  [1,  [ 65, 30, 30]],  // slightly warm — distinguishable from unlisted countries
  [3,  [ 72, 16, 16]],  // now clearly dark red
  [5,  [115, 18, 18]],
  [7,  [162, 22, 22]],
  [9,  [229, 57, 53]],  // steep jump — high-density countries pop
  [13, [245, 95, 88]],
];

function getCountryColor(pct: number): string {
  if (pct <= COLOR_STOPS[0][0]) {
    const [r, g, b] = COLOR_STOPS[0][1];
    return `rgb(${r},${g},${b})`;
  }
  const last = COLOR_STOPS[COLOR_STOPS.length - 1];
  if (pct >= last[0]) {
    const [r, g, b] = last[1];
    return `rgb(${r},${g},${b})`;
  }
  for (let i = 0; i < COLOR_STOPS.length - 1; i++) {
    const [p0, c0] = COLOR_STOPS[i];
    const [p1, c1] = COLOR_STOPS[i + 1];
    if (pct <= p1) {
      const t = (pct - p0) / (p1 - p0);
      const r = Math.round(c0[0] + (c1[0] - c0[0]) * t);
      const g = Math.round(c0[1] + (c1[1] - c0[1]) * t);
      const b = Math.round(c0[2] + (c1[2] - c0[2]) * t);
      return `rgb(${r},${g},${b})`;
    }
  }
  const [r, g, b] = last[1];
  return `rgb(${r},${g},${b})`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MissionMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MissionPoint | null>(null);
  const [hoveredISO, setHoveredISO] = useState<string | null>(null);
  const [noToken, setNoToken] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!token) {
      setNoToken(true);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let mapInstance: any = null;
    let isCleaned = false;
    let resizeObserver: ResizeObserver | null = null;

    import("mapbox-gl").then((mod) => {
      if (isCleaned || !containerRef.current) return;

      const mapboxgl = mod.default;
      mapboxgl.accessToken = token;

      mapInstance = new mapboxgl.Map({
        container: containerRef.current,
        style: "mapbox://styles/mapbox/dark-v11",
        center: [21.5, 49.2],
        zoom: 5.6,
        maxZoom: 12,
        minZoom: 3,
        attributionControl: false,
        cooperativeGestures: true,
      });

      resizeObserver = new ResizeObserver(() => {
        mapInstance?.resize();
      });
      resizeObserver.observe(containerRef.current);

      mapInstance.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      mapInstance.on("load", () => {
        if (isCleaned) return;
        mapInstance.resize();

        // ── Country choropleth ───────────────────────────────────────────────
        mapInstance.addSource("countries", {
          type: "vector",
          url: "mapbox://mapbox.country-boundaries-v1",
        });

        const isoCodes = ROMA_COUNTRIES.map((c) => c.iso);

        // Build match expression for fill color
        const colorEntries: (string | string[])[] = [];
        for (const c of ROMA_COUNTRIES) {
          colorEntries.push(c.iso, getCountryColor(getPct(c)));
        }
        const colorExpr = [
          "match",
          ["get", "iso_3166_1"],
          ...colorEntries,
          "rgba(0,0,0,0)",
        ];

        // Filter only by ISO code — worldview is intentionally omitted so that
        // disputed-border countries (RS/Kosovo, UA/Crimea) are not excluded.
        // These countries may only have worldview-specific features (e.g. "RU")
        // in the tileset, meaning a worldview="all"/"US" constraint would hide them.
        // Rendering duplicate features for the same country has no visual effect.
        const layerFilter = ["in", ["get", "iso_3166_1"], ["literal", isoCodes]];

        mapInstance.addLayer({
          id: "roma-fill",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: layerFilter,
          paint: {
            "fill-color": colorExpr,
            "fill-opacity": 0.65,
          },
        });

        mapInstance.addLayer({
          id: "roma-stroke",
          type: "line",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: layerFilter,
          paint: {
            "line-color": "#D4AF3728",
            "line-width": 0.75,
          },
        });

        mapInstance.addLayer({
          id: "roma-hover",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: ["==", ["get", "iso_3166_1"], ""],
          paint: {
            "fill-color": "#D4AF37",
            "fill-opacity": 0.18,
          },
        });

        // ── Country hover events ─────────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapInstance.on("mousemove", "roma-fill", (e: any) => {
          const iso = e.features?.[0]?.properties?.iso_3166_1 as
            | string
            | undefined;
          if (iso) {
            mapInstance.setFilter("roma-hover", ["==", ["get", "iso_3166_1"], iso]);
            setHoveredISO(iso);
            mapInstance.getCanvas().style.cursor = "pointer";
          }
        });

        mapInstance.on("mouseleave", "roma-fill", () => {
          mapInstance.setFilter("roma-hover", ["==", ["get", "iso_3166_1"], ""]);
          setHoveredISO(null);
          mapInstance.getCanvas().style.cursor = "";
        });

        // ── Mission markers ──────────────────────────────────────────────────
        MISSION_POINTS.forEach((pt) => {
          const el = document.createElement("div");
          const color = MARKER_COLORS[pt.type];
          const size = MARKER_SIZES[pt.type];
          const isMain = pt.type === "mission-center";

          Object.assign(el.style, {
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: "50%",
            backgroundColor: color,
            border: "2px solid rgba(10,10,10,0.9)",
            boxShadow: `0 0 0 ${isMain ? "2.5px" : "1.5px"} ${color}55, 0 0 ${isMain ? "14px" : "7px"} ${color}44`,
            cursor: "pointer",
            transition: "transform 0.12s ease, box-shadow 0.12s ease",
            position: "relative",
            zIndex: isMain ? "10" : "5",
          });

          el.addEventListener("mouseenter", () => {
            el.style.transform = "scale(1.55)";
            el.style.boxShadow = `0 0 0 2.5px ${color}aa, 0 0 18px ${color}66`;
          });
          el.addEventListener("mouseleave", () => {
            el.style.transform = "";
            el.style.boxShadow = `0 0 0 ${isMain ? "2.5px" : "1.5px"} ${color}55, 0 0 ${isMain ? "14px" : "7px"} ${color}44`;
          });
          el.addEventListener("click", (e) => {
            e.stopPropagation();
            setSelectedPoint(pt);
          });

          new mapboxgl.Marker({ element: el })
            .setLngLat(pt.coordinates)
            .addTo(mapInstance);
        });

        setReady(true);
      });
    });

    return () => {
      isCleaned = true;
      resizeObserver?.disconnect();
      mapInstance?.remove();
    };
  }, []);

  const hovered = hoveredISO ? ROMA_COUNTRIES.find((c) => c.iso === hoveredISO) ?? null : null;

  return (
    <div className="relative w-full h-[420px] md:h-[540px] bg-[#0D0D0D] overflow-hidden">
      {/* Map container */}
      <div ref={containerRef} className="w-full h-[420px] md:h-[540px]" />

      {/* Loading state */}
      {!ready && !noToken && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[11px] font-semibold tracking-[2px] text-[#444]">
            LOADING MAP…
          </span>
        </div>
      )}

      {/* Token missing fallback */}
      {noToken && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <span className="text-[11px] font-semibold tracking-[2px] text-[#444]">
            MAP UNAVAILABLE
          </span>
          <span className="text-[10px] text-[#333]">
            Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local
          </span>
        </div>
      )}

      {/* Country hover tooltip */}
      {hovered && (
        <div className="absolute top-4 left-4 bg-[#0D0D0DEE] border border-[#2A2A2A] px-4 py-3 pointer-events-none z-20">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#666]">
            {hovered.country}
          </p>
          <p className="text-[38px] font-bold text-[var(--gold)] leading-none mt-1">
            {formatPct(getPct(hovered))}
          </p>
          <p className="text-[9px] text-[#555] mt-1">Roma · {formatPop(hovered.pop)} of {formatPop(hovered.totalPop)}</p>
        </div>
      )}

      {/* Selected point popup */}
      {selectedPoint && (
        <div className="absolute top-4 right-4 w-[248px] bg-[#0D0D0DF2] border border-[#2A2A2A] z-20">
          <div className="flex items-start justify-between px-5 pt-5 pb-2">
            <div className="flex-1 min-w-0 pr-2">
              <span
                className="text-[9px] font-bold tracking-[1.5px] uppercase"
                style={{ color: MARKER_COLORS[selectedPoint.type] }}
              >
                {MARKER_LABELS[selectedPoint.type]}
              </span>
              <h4 className="text-[17px] font-bold text-white mt-1 leading-tight">
                {selectedPoint.name}
              </h4>
              <p className="text-[11px] text-[#555] mt-0.5">
                {selectedPoint.subtitle}
              </p>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              aria-label="Close"
              className="text-[#555] hover:text-white text-xl leading-none flex-shrink-0 mt-0.5 transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-[12px] text-[var(--text-secondary)] leading-[1.65] px-5 pb-4">
            {selectedPoint.description}
          </p>
          <div className="px-5 pb-5">
            <a
              href="/get-involved"
              className={`block text-center text-[10px] font-bold tracking-[1px] py-3 transition-colors ${
                selectedPoint.type === "failed"
                  ? "border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#111]"
                  : "bg-[#D4AF37] text-[#111] hover:opacity-[88%]"
              }`}
            >
              {selectedPoint.type === "failed"
                ? "PREVENT THIS → GIVE NOW"
                : "SUPPORT THIS PARISH →"}
            </a>
          </div>
        </div>
      )}

      {/* Legend */}
      {ready && (
        <div className="absolute bottom-4 left-4 bg-[#0D0D0DEE] border border-[#2A2A2A] px-4 py-3 z-20">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[#555] mb-2.5">
            Legend
          </p>
          <div className="flex flex-col gap-2">
            {LEGEND_ITEMS.map((type) => (
              <div key={type} className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: MARKER_COLORS[type] }}
                />
                <span className="text-[10px] text-[#A0A0A0]">
                  {MARKER_LABELS[type]}
                </span>
              </div>
            ))}
            <div className="mt-1.5 pt-2 border-t border-[#2A2A2A] flex items-center gap-2">
              <div
                className="w-12 h-2 rounded-sm flex-shrink-0"
                style={{
                  background: "linear-gradient(to right, rgb(30,30,30), rgb(72,16,16), rgb(229,57,53))",
                }}
              />
              <span className="text-[10px] text-[#555]">Roma density</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
