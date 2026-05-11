// ─── Types ────────────────────────────────────────────────────────────────────

export type LocationType =
  | "mission-center"
  | "planted-church"
  | "active-plant"
  | "supported-parish"
  | "ended-plant";

// Translatable fields (subtitle, description, status) live in the i18n
// dictionary under `locations.map.<id>`. Consumers should look them up via
// `useTranslation()` rather than reading them off this object.
export interface MissionLocation {
  id: string;
  name: string;
  village: string;
  type: LocationType;
  coordinates: [number, number]; // [longitude, latitude]
  region?: string;
  yearStart?: number;
  yearEnd?: number | null;
  congregation?: number;
  isActive?: boolean;
}

// ─── Mission Locations ────────────────────────────────────────────────────────

export const MISSION_LOCATIONS: MissionLocation[] = [
  // ─── Mission Centers ─────────────────────────────────────────────────────
  {
    id: "klenovec",
    name: "Klenovec",
    village: "Klenovec",
    type: "mission-center",
    coordinates: [19.889933, 48.597107],
    region: "Banská Bystrica Region, SK",
    isActive: true,
  },
  {
    id: "markovce",
    name: "Markovce",
    village: "Markovce",
    type: "mission-center",
    coordinates: [21.842554, 48.591614],
    region: "Prešov Region, SK",
    isActive: true,
  },

  // ─── Planted Churches ────────────────────────────────────────────────────
  {
    id: "kacanov",
    name: "Kačanov",
    village: "Kačanov",
    type: "planted-church",
    coordinates: [21.845007, 48.613964],
    yearStart: 2025,
    yearEnd: null,
    congregation: 20,
    isActive: true,
  },
  {
    id: "mutnik",
    name: "Mútnik",
    village: "Mútnik (Hnúšťa)",
    type: "ended-plant",
    coordinates: [19.958240, 48.603342],
    yearStart: 2017,
    yearEnd: 2026,
    congregation: 20,
    isActive: false,
  },

  // ─── Active Church Plants ────────────────────────────────────────────────
  {
    id: "rimavska-pila",
    name: "Rimavská Pila",
    village: "Rimavská Pila",
    type: "active-plant",
    coordinates: [19.943089, 48.647620],
    yearStart: 2023,
    yearEnd: null,
    isActive: true,
  },
  {
    id: "zemjastrabie",
    name: "Zemplínske Jastrabie",
    village: "Zemplínske Jastrabie",
    type: "active-plant",
    coordinates: [21.777042, 48.495533],
    yearStart: 2025,
    yearEnd: null,
    isActive: true,
  },

  // ─── Ended Plants ───────────────────────────────────────────────────────
  {
    id: "hnusta",
    name: "Hnúšťa",
    village: "Hnúšťa",
    type: "ended-plant",
    coordinates: [19.953789, 48.579620],
    yearStart: 2017,
    yearEnd: 2017,
    isActive: false,
  },
  {
    id: "hacava",
    name: "Hačava",
    village: "Hačava",
    type: "ended-plant",
    coordinates: [19.960119, 48.613215],
    yearStart: 2017,
    yearEnd: 2017,
    isActive: false,
  },

  // ─── Supported Parishes ─────────────────────────────────────────────────
  {
    id: "varadka",
    name: "Varadka",
    village: "Varadka",
    type: "supported-parish",
    coordinates: [21.382612, 49.413845],
    isActive: true,
  },
  {
    id: "zavadka",
    name: "Závadka",
    village: "Závadka",
    type: "supported-parish",
    coordinates: [20.933315, 48.851837],
    isActive: true,
  },
  {
    id: "cejkov",
    name: "Cejkov",
    village: "Cejkov",
    type: "supported-parish",
    coordinates: [21.763248, 48.468624],
    isActive: true,
  },
  {
    id: "kurov",
    name: "Kurov",
    village: "Kurov",
    type: "supported-parish",
    coordinates: [21.134490, 49.342220],
    isActive: true,
  },
  {
    id: "lukov",
    name: "Lukov",
    village: "Lukov",
    type: "supported-parish",
    coordinates: [21.081251, 49.291912],
    isActive: true,
  },
  {
    id: "petrova",
    name: "Petrová",
    village: "Petrová",
    type: "supported-parish",
    coordinates: [21.119190, 49.387623],
    isActive: true,
  },
  {
    id: "strazske",
    name: "Strážske",
    village: "Strážske",
    type: "supported-parish",
    coordinates: [21.836252, 48.874687],
    isActive: true,
  },
  {
    id: "zbudska-bela",
    name: "Zbudská Belá",
    village: "Zbudská Belá",
    type: "supported-parish",
    coordinates: [21.942140, 49.151570],
    isActive: true,
  },
  {
    id: "bezovce",
    name: "Bežovce",
    village: "Bežovce",
    type: "supported-parish",
    coordinates: [22.152979, 48.630238],
    isActive: true,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getLocationsByType(type: LocationType): MissionLocation[] {
  return MISSION_LOCATIONS.filter((loc) => loc.type === type);
}

export function getLocationById(id: string): MissionLocation | undefined {
  return MISSION_LOCATIONS.find((loc) => loc.id === id);
}

export function getActiveLocations(): MissionLocation[] {
  return MISSION_LOCATIONS.filter((loc) => loc.isActive !== false);
}
