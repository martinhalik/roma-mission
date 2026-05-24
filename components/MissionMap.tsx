"use client";

import "mapbox-gl/dist/mapbox-gl.css";
import { useRef, useEffect, useState } from "react";
import LocaleLink from "@/components/LocaleLink";
import { ROMA_COUNTRIES } from "@/lib/data/roma-countries";
import { MISSION_LOCATIONS, type LocationType, type MissionLocation } from "@/lib/data/mission-locations";
import { useTranslation } from "@/components/LanguageProvider";

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
  village: string;
  coordinates: [number, number];
}

// ─── Location Type to Marker Type Mapping ─────────────────────────────────────

function getMarkerType(locationType: LocationType): MarkerType {
  const typeMap: Record<LocationType, MarkerType> = {
    "mission-center": "mission-center",
    "planted-church": "parish",
    "active-plant": "planting",
    "supported-parish": "collaborating",
    "ended-plant": "failed",
  };
  return typeMap[locationType];
}

// ─── Convert Mission Locations to Mission Points ────────────────────────────

function convertToMissionPoints(locations: MissionLocation[]): MissionPoint[] {
  return locations.map((loc) => ({
    id: loc.id,
    type: getMarkerType(loc.type),
    name: loc.name,
    village: loc.village,
    coordinates: loc.coordinates,
  }));
}

const MISSION_POINTS_INITIAL = convertToMissionPoints(MISSION_LOCATIONS);

// Per-location ids that have translatable subtitle/description in the
// `locations.map` dictionary namespace. Other ids (most supported parishes)
// fall back to the village name as subtitle and have no description.
const TRANSLATED_MAP_IDS = new Set([
  "klenovec",
  "markovce",
  "kacanov",
  "mutnik",
  "rimavska-pila",
  "zemjastrabie",
  "hnusta",
  "hacava",
  "varadka",
]);

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

const MARKER_LABEL_KEYS: Record<MarkerType, string> = {
  "mission-center": "map.markers.missionCenter",
  parish: "map.markers.parish",
  collaborating: "map.markers.collaborating",
  planting: "map.markers.planting",
  failed: "map.markers.failed",
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

// ─── Color scales ─────────────────────────────────────────────────────────────
// Dark map: muted warm tones, steep jump at high density.
// Light map: vivid reds/corals that pop against the cream Mapbox background.

const DARK_COLOR_STOPS: [number, [number, number, number]][] = [
  [0,  [ 50,  35,  35]],
  [1,  [ 65,  30,  30]],
  [3,  [ 72,  16,  16]],
  [5,  [115,  18,  18]],
  [7,  [162,  22,  22]],
  [9,  [229,  57,  53]],
  [13, [245,  95,  88]],
];

const LIGHT_COLOR_STOPS: [number, [number, number, number]][] = [
  [0,  [255, 215, 205]],  // very faint blush — barely visible on cream
  [1,  [255, 170, 145]],  // light salmon
  [3,  [245, 115,  85]],  // coral
  [5,  [228,  65,  45]],  // orange-red
  [7,  [200,  28,  18]],  // vivid red
  [9,  [170,   8,   8]],  // deep red
  [13, [135,   0,   0]],  // crimson
];

function getCountryColor(pct: number, isLight: boolean): string {
  const COLOR_STOPS = isLight ? LIGHT_COLOR_STOPS : DARK_COLOR_STOPS;
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

// ─── Layer / source helpers ───────────────────────────────────────────────────

// Filter to a single worldview so disputed-territory features (e.g. Kosovo)
// don't render twice and stack opacity over Serbia. The `worldview` property
// can be a comma-separated string (e.g. "US,CN,IN"), so use `in` for the
// per-worldview match rather than `==`.
const WORLDVIEW_FILTER = [
  "any",
  ["==", ["get", "worldview"], "all"],
  ["in", "US", ["get", "worldview"]],
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function addLayersToMap(mapInstance: any, isLight: boolean) {
  const isoCodes = ROMA_COUNTRIES.map((c) => c.iso);

  const colorEntries: (string | string[])[] = [];
  for (const c of ROMA_COUNTRIES) {
    colorEntries.push(c.iso, getCountryColor(getPct(c), isLight));
  }
  const colorExpr = [
    "match",
    ["get", "iso_3166_1"],
    ...colorEntries,
    "rgba(0,0,0,0)",
  ];
  const layerFilter = [
    "all",
    WORLDVIEW_FILTER,
    ["in", ["get", "iso_3166_1"], ["literal", isoCodes]],
  ];

  if (!mapInstance.getSource("countries")) {
    mapInstance.addSource("countries", {
      type: "vector",
      url: "mapbox://mapbox.country-boundaries-v1",
    });
  }

  mapInstance.addLayer({
    id: "roma-fill",
    type: "fill",
    source: "countries",
    "source-layer": "country_boundaries",
    filter: layerFilter,
    paint: { "fill-color": colorExpr, "fill-opacity": 0.65 },
  });

  mapInstance.addLayer({
    id: "roma-stroke",
    type: "line",
    source: "countries",
    "source-layer": "country_boundaries",
    filter: layerFilter,
    paint: {
      "line-color": "rgba(212, 175, 55, 0.16)",
      "line-width": 0.75,
    },
  });

  mapInstance.addLayer({
    id: "roma-hover",
    type: "fill",
    source: "countries",
    "source-layer": "country_boundaries",
    filter: ["all", WORLDVIEW_FILTER, ["==", ["get", "iso_3166_1"], ""]],
    paint: { "fill-color": isLight ? "#7A5A0E" : "#D4AF37", "fill-opacity": 0.18 },
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MissionMap() {
  const { t } = useTranslation();
  const containerRef = useRef<HTMLDivElement>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mapInstanceRef = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const markersRef = useRef<any[]>([]);
  const [ready, setReady] = useState(false);
  const [selectedPoint, setSelectedPoint] = useState<MissionPoint | null>(null);
  const [hoveredISO, setHoveredISO] = useState<string | null>(null);
  const [noToken, setNoToken] = useState(false);
  const [isLight, setIsLight] = useState(false);

  const missionPoints = MISSION_POINTS_INITIAL;

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

    const getTheme = () =>
      document.documentElement.classList.contains("light") ? "light" : "dark";

    let currentTheme = getTheme();
    setIsLight(currentTheme === "light");

    // Watch for theme class changes on <html> and swap map style
    const themeObserver = new MutationObserver(() => {
      const newTheme = getTheme();
      if (newTheme === currentTheme) return;
      currentTheme = newTheme;
      setIsLight(newTheme === "light");

      const mapInst = mapInstanceRef.current;
      if (!mapInst) return;

      const newStyle =
        newTheme === "light"
          ? "mapbox://styles/mapbox/light-v11"
          : "mapbox://styles/mapbox/dark-v11";
      mapInst.setStyle(newStyle);
      mapInst.once("style.load", () => addLayersToMap(mapInst, newTheme === "light"));
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    import("mapbox-gl").then((mod) => {
      if (isCleaned || !containerRef.current) return;

      const mapboxgl = mod.default;
      mapboxgl.accessToken = token;

      const initialStyle =
        currentTheme === "light"
          ? "mapbox://styles/mapbox/light-v11"
          : "mapbox://styles/mapbox/dark-v11";

      mapInstance = new mapboxgl.Map({
        container: containerRef.current,
        style: initialStyle,
        center: [10, 50],
        zoom: 3.5,
        maxZoom: 12,
        minZoom: 3,
        attributionControl: false,
        cooperativeGestures: true,
      });

      mapInstanceRef.current = mapInstance;

      resizeObserver = new ResizeObserver(() => {
        if (mapInstance && !isCleaned) mapInstance.resize();
      });
      resizeObserver.observe(containerRef.current!);

      mapInstance.addControl(
        new mapboxgl.AttributionControl({ compact: true }),
        "bottom-right"
      );

      mapInstance.once("load", () => {
        if (isCleaned || !mapInstance) return;
        mapInstance.resize();

        addLayersToMap(mapInstance, currentTheme === "light");

        // ── Country hover events ─────────────────────────────────────────────
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        mapInstance.on("mousemove", "roma-fill", (e: any) => {
          const iso = e.features?.[0]?.properties?.iso_3166_1 as string | undefined;
          if (iso) {
            mapInstance.setFilter("roma-hover", [
              "all",
              WORLDVIEW_FILTER,
              ["==", ["get", "iso_3166_1"], iso],
            ]);
            setHoveredISO(iso);
            mapInstance.getCanvas().style.cursor = "pointer";
          }
        });

        mapInstance.on("mouseleave", "roma-fill", () => {
          mapInstance.setFilter("roma-hover", [
            "all",
            WORLDVIEW_FILTER,
            ["==", ["get", "iso_3166_1"], ""],
          ]);
          setHoveredISO(null);
          mapInstance.getCanvas().style.cursor = "";
        });

        // ── Mission markers ──────────────────────────────────────────────────
        if (markersRef.current.length === 0) {
          missionPoints.forEach((pt) => {
            const color = MARKER_COLORS[pt.type];
            const size = MARKER_SIZES[pt.type];
            const isMain = pt.type === "mission-center";

            const el = document.createElement("div");
            Object.assign(el.style, {
              width: `${size}px`,
              height: `${size}px`,
              cursor: "pointer",
              zIndex: isMain ? "10" : "5",
            });

            const dot = document.createElement("div");
            const normalShadow = `0 0 0 ${isMain ? "2.5px" : "1.5px"} ${color}55, 0 0 ${isMain ? "14px" : "7px"} ${color}44`;
            Object.assign(dot.style, {
              width: "100%",
              height: "100%",
              borderRadius: "50%",
              backgroundColor: color,
              border: "2px solid rgba(10,10,10,0.9)",
              boxShadow: normalShadow,
              transition: "transform 0.12s ease, box-shadow 0.12s ease",
              transformOrigin: "center",
            });
            el.appendChild(dot);

            el.addEventListener("mouseenter", () => {
              dot.style.transform = "scale(1.55)";
              dot.style.boxShadow = `0 0 0 2.5px ${color}aa, 0 0 18px ${color}66`;
            });
            el.addEventListener("mouseleave", () => {
              dot.style.transform = "";
              dot.style.boxShadow = normalShadow;
            });
            el.addEventListener("click", (e) => {
              e.stopPropagation();
              setSelectedPoint(pt);
            });

            const marker = new mapboxgl.Marker({ element: el, anchor: "center" })
              .setLngLat(pt.coordinates)
              .addTo(mapInstance);

            markersRef.current.push(marker);
          });
        }

        setReady(true);
      });
    });

    return () => {
      isCleaned = true;
      themeObserver.disconnect();
      resizeObserver?.disconnect();
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      mapInstanceRef.current = null;
      mapInstance?.remove();
    };
  }, []);

  const hovered = hoveredISO
    ? ROMA_COUNTRIES.find((c) => c.iso === hoveredISO) ?? null
    : null;

  const densityGradient = isLight
    ? "linear-gradient(to right, rgb(255,215,205), rgb(245,115,85), rgb(135,0,0))"
    : "linear-gradient(to right, rgb(30,30,30), rgb(72,16,16), rgb(229,57,53))";

  return (
    <div className="relative w-full h-[420px] md:h-[540px] bg-[var(--bg-card)] overflow-hidden">
      {/* Map container */}
      <div ref={containerRef} className="w-full h-full" />

      {/* Loading state */}
      {!ready && !noToken && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[11px] font-semibold tracking-[2px] text-[var(--text-muted)]">
            {t("map.loading")}
          </span>
        </div>
      )}

      {/* Token missing fallback */}
      {noToken && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
          <span className="text-[11px] font-semibold tracking-[2px] text-[var(--text-muted)]">
            {t("map.unavailable")}
          </span>
          <span className="text-[10px] text-[var(--text-secondary)]">
            {t("map.unavailableHint")}
          </span>
        </div>
      )}

      {/* Country hover tooltip */}
      {hovered && (
        <div className="absolute top-4 left-4 bg-[var(--bg-primary)]/95 border border-[var(--border-default)] px-4 py-3 pointer-events-none z-20">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[var(--text-muted)]">
            {t(`countries.${hovered.iso}`)}
          </p>
          <p className="text-[38px] font-bold text-[var(--gold)] leading-none mt-1">
            {formatPct(getPct(hovered))}
          </p>
          <p className="text-[9px] text-[var(--text-muted)] mt-1">
            {t("map.hoverPopulation", {
              pop: formatPop(hovered.pop),
              total: formatPop(hovered.totalPop),
            })}
          </p>
        </div>
      )}

      {/* Selected point popup */}
      {selectedPoint && (
        <div className="absolute top-4 right-4 w-[248px] bg-[var(--bg-primary)]/95 border border-[var(--border-default)] z-20">
          <div className="flex items-start justify-between px-5 pt-5 pb-2">
            <div className="flex-1 min-w-0 pr-2">
              <span
                className="text-[9px] font-bold tracking-[1.5px] uppercase"
                style={{ color: MARKER_COLORS[selectedPoint.type] }}
              >
                {t(MARKER_LABEL_KEYS[selectedPoint.type])}
              </span>
              <h4 className="text-[17px] font-bold text-[var(--text-primary)] mt-1 leading-tight">
                {selectedPoint.name}
              </h4>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5">
                {TRANSLATED_MAP_IDS.has(selectedPoint.id)
                  ? t(`locations.map.${selectedPoint.id}.subtitle`)
                  : selectedPoint.village}
              </p>
            </div>
            <button
              onClick={() => setSelectedPoint(null)}
              aria-label={t("map.close")}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] text-xl leading-none flex-shrink-0 mt-0.5 transition-colors"
            >
              ×
            </button>
          </div>
          <p className="text-[12px] text-[var(--text-secondary)] leading-[1.65] px-5 pb-4">
            {TRANSLATED_MAP_IDS.has(selectedPoint.id)
              ? t(`locations.map.${selectedPoint.id}.description`)
              : ""}
          </p>
          <div className="px-5 pb-5">
            <LocaleLink
              routeKey="getInvolved"
              className={`block text-center text-[10px] font-bold tracking-[1px] py-3 transition-colors ${
                selectedPoint.type === "failed"
                  ? "border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--on-accent)]"
                  : "bg-[var(--gold)] text-[var(--on-accent)] hover:opacity-90"
              }`}
            >
              {selectedPoint.type === "failed"
                ? t("map.popup.preventThis")
                : t("map.popup.supportThisParish")}
            </LocaleLink>
          </div>
        </div>
      )}

      {/* Legend */}
      {ready && (
        <div className="absolute bottom-4 left-4 bg-[var(--bg-primary)]/95 border border-[var(--border-default)] px-4 py-3 z-20">
          <p className="text-[9px] font-bold tracking-[1.5px] uppercase text-[var(--text-muted)] mb-2.5">
            {t("map.legend")}
          </p>
          <div className="flex flex-col gap-2">
            {LEGEND_ITEMS.map((type) => (
              <div key={type} className="flex items-center gap-2.5">
                <div
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                  style={{ backgroundColor: MARKER_COLORS[type] }}
                />
                <span className="text-[10px] text-[var(--text-secondary)]">
                  {t(MARKER_LABEL_KEYS[type])}
                </span>
              </div>
            ))}
            <div className="mt-1.5 pt-2 border-t border-[var(--border-default)] flex items-center gap-2">
              <div
                className="w-12 h-2 rounded-sm flex-shrink-0"
                style={{ background: densityGradient }}
              />
              <span className="text-[10px] text-[var(--text-muted)]">{t("map.romaDensity")}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
