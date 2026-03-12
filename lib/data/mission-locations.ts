// ─── Types ────────────────────────────────────────────────────────────────────

export type LocationType =
  | "mission-center"
  | "planted-church"
  | "active-plant"
  | "supported-parish"
  | "ended-plant";

export interface MissionLocation {
  id: string;
  name: string;
  village: string;
  type: LocationType;
  coordinates: [number, number]; // [longitude, latitude]
  subtitle?: string;
  description?: string;
  region?: string;
  status?: string;
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
    coordinates: [19.9097, 48.5433],
    subtitle: "St. Nicholas Mission Center",
    description:
      "Our primary mission base in central Slovakia — the operational hub for training, community formation, and regional coordination.",
    region: "Banská Bystrica Region, SK",
    status: "MISSION CENTER",
    isActive: true,
  },
  {
    id: "markovce",
    name: "Markovce",
    village: "Markovce",
    type: "mission-center",
    coordinates: [21.735, 48.878],
    subtitle: "Roma Parish & Developing Mission Center",
    description:
      "An active Orthodox Roma parish with regular Liturgy, youth programs, and growing local lay leadership. Transitioning into a full mission center.",
    region: "Prešov Region, SK",
    status: "DEVELOPING CENTER",
    isActive: true,
  },

  // ─── Planted Churches ────────────────────────────────────────────────────
  {
    id: "kacanov",
    name: "Kačanov",
    village: "Kačanov",
    type: "planted-church",
    coordinates: [21.783, 48.833],
    subtitle: "Planting Parish",
    description:
      "A new church being established near Markovce. Services have begun. A permanent home and ongoing support are needed.",
    status: "FIRST CHAPEL",
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
    coordinates: [19.95, 48.59],
    subtitle: "Concluded — 2026",
    description:
      "Nine years of faithful presence. A community formed, believers were baptized, and local leaders emerged. This chapter concluded in 2026.",
    status: "CONCLUDED 2026",
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
    coordinates: [19.783, 48.467],
    subtitle: "Active Church Plant",
    description:
      "A new parish taking root near Klenovec. Services have begun. A permanent home and ongoing support are needed.",
    status: "PLANTING",
    yearStart: 2023,
    yearEnd: null,
    isActive: true,
  },
  {
    id: "zemjastrabie",
    name: "Zemplínske Jastrabie",
    village: "Zemplínske Jastrabie",
    type: "active-plant",
    coordinates: [21.95, 48.63],
    subtitle: "Active Church Plant",
    description:
      "A settlement prayed over for years. We finally have a door open. Early outreach underway.",
    status: "PLANTING",
    yearStart: 2025,
    yearEnd: null,
    isActive: true,
  },

  // ─── Ended Plants ───────────────────────────────────────────────────────
  {
    id: "hacava",
    name: "Hačava",
    village: "Hačava",
    type: "ended-plant",
    coordinates: [20.25, 48.42],
    subtitle: "Not continued — 2017",
    description:
      "A genuine open door with early fruit, but we could not sustain consistent missionary presence. Without someone going week after week, the community could not hold together.",
    status: "CONCLUDED",
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
    coordinates: [21.283, 49.283],
    subtitle: "Collaborating Parish",
    description:
      "A partner parish in the Bardejov district supporting the mission network through shared resources and pastoral cooperation.",
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "zavadka",
    name: "Závadka",
    village: "Závadka",
    type: "supported-parish",
    coordinates: [21.50, 48.50],
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "cejkov",
    name: "Cejkov",
    village: "Cejkov",
    type: "supported-parish",
    coordinates: [21.50, 48.75],
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "kurov",
    name: "Kurov",
    village: "Kurov",
    type: "supported-parish",
    coordinates: [20.50, 48.60],
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "lukov",
    name: "Lukov",
    village: "Lukov",
    type: "supported-parish",
    coordinates: [20.00, 48.75],
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "petrova",
    name: "Petrová",
    village: "Petrová",
    type: "supported-parish",
    coordinates: [20.50, 48.45],
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "strazske",
    name: "Strážske",
    village: "Strážske",
    type: "supported-parish",
    coordinates: [21.50, 48.95],
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "zbudska-bela",
    name: "Zbudská Belá",
    village: "Zbudská Belá",
    type: "supported-parish",
    coordinates: [21.30, 49.00],
    status: "SUPPORTED",
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
