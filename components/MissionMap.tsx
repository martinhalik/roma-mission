"use client";

import { useRef, useEffect, useState } from "react";

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
    id: "failed",
    type: "failed",
    name: "Hodejov",
    subtitle: "Discontinued — 2021",
    description:
      "A parish planting that could not be sustained without consistent funding and clergy presence. The community dispersed. This is what we are working to prevent everywhere else.",
    coordinates: [20.133, 48.517],
  },
];

// ─── Roma Population by Country ───────────────────────────────────────────────

const ROMA_DATA: Record<string, { name: string; pop: number }> = {
  RO: { name: "Romania", pop: 1850000 },
  ES: { name: "Spain", pop: 1125000 },
  HU: { name: "Hungary", pop: 675000 },
  BG: { name: "Bulgaria", pop: 650000 },
  FR: { name: "France", pop: 500000 },
  SK: { name: "Slovakia", pop: 475000 },
  UA: { name: "Ukraine", pop: 400000 },
  RS: { name: "Serbia", pop: 380000 },
  CZ: { name: "Czechia", pop: 300000 },
  GR: { name: "Greece", pop: 280000 },
  MK: { name: "North Macedonia", pop: 260000 },
  DE: { name: "Germany", pop: 200000 },
  IT: { name: "Italy", pop: 170000 },
  AL: { name: "Albania", pop: 100000 },
  BA: { name: "Bosnia & Herz.", pop: 70000 },
  PT: { name: "Portugal", pop: 60000 },
  ME: { name: "Montenegro", pop: 20000 },
  HR: { name: "Croatia", pop: 35000 },
  SI: { name: "Slovenia", pop: 12000 },
};

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

function formatPop(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  return `${Math.round(n / 1000)}K`;
}

function getCountryColor(pop: number): string {
  if (pop >= 1_500_000) return "#6B1212";
  if (pop >= 900_000) return "#8B1818";
  if (pop >= 600_000) return "#A82222";
  if (pop >= 400_000) return "#B84040";
  if (pop >= 200_000) return "#C86040";
  return "#9B7060";
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

        const isoCodes = Object.keys(ROMA_DATA);

        // Build match expression for fill color
        const colorEntries: (string | string[])[] = [];
        for (const [iso, d] of Object.entries(ROMA_DATA)) {
          colorEntries.push(iso, getCountryColor(d.pop));
        }
        const colorExpr = [
          "match",
          ["get", "iso_3166_1"],
          ...colorEntries,
          "rgba(0,0,0,0)",
        ];

        const worldviewFilter = [
          "any",
          ["==", ["get", "worldview"], "all"],
          ["==", ["get", "worldview"], "US"],
        ];

        mapInstance.addLayer({
          id: "roma-fill",
          type: "fill",
          source: "countries",
          "source-layer": "country_boundaries",
          filter: ["all", ["in", "iso_3166_1", ...isoCodes], worldviewFilter],
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
          filter: ["all", ["in", "iso_3166_1", ...isoCodes], worldviewFilter],
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
          filter: ["==", "iso_3166_1", ""],
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
            mapInstance.setFilter("roma-hover", ["==", "iso_3166_1", iso]);
            setHoveredISO(iso);
            mapInstance.getCanvas().style.cursor = "pointer";
          }
        });

        mapInstance.on("mouseleave", "roma-fill", () => {
          mapInstance.setFilter("roma-hover", ["==", "iso_3166_1", ""]);
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

  const hovered = hoveredISO ? ROMA_DATA[hoveredISO] : null;

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
            {hovered.name}
          </p>
          <p className="text-[22px] font-bold text-[#D4AF37] leading-tight mt-0.5">
            {formatPop(hovered.pop)}
          </p>
          <p className="text-[9px] text-[#555]">Roma population</p>
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
              className="text-[#555] hover:text-white text-xl leading-none flex-shrink-0 mt-0.5 transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-[12px] text-[#A0A0A0] leading-[1.65] px-5 pb-4">
            {selectedPoint.description}
          </p>
          <div className="px-5 pb-5">
            <a
              href="/get-involved"
              className={`block text-center text-[10px] font-bold tracking-[1px] py-3 transition-colors ${
                selectedPoint.type === "failed"
                  ? "border border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#111]"
                  : "bg-[#D4AF37] text-[#111] hover:opacity-88"
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
                  background: "linear-gradient(to right, #9B7060, #6B1212)",
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
