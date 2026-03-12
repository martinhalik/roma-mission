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
    coordinates: [19.889933, 48.597107],
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
    coordinates: [21.842554, 48.591614],
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
    coordinates: [21.845007, 48.613964],
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
    coordinates: [19.958240, 48.603342],
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
    coordinates: [19.943089, 48.647620],
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
    coordinates: [21.777042, 48.495533],
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
    id: "hnusta",
    name: "Hnúšťa",
    village: "Hnúšťa",
    type: "ended-plant",
    coordinates: [19.953789, 48.579620],
    subtitle: "Not continued — 2017",
    description:
      "An early outreach effort in the Hnúšťa area that could not be sustained without consistent missionary presence on the ground.",
    status: "CONCLUDED",
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
    coordinates: [21.382612, 49.413845],
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
    coordinates: [20.933315, 48.851837],
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "cejkov",
    name: "Cejkov",
    village: "Cejkov",
    type: "supported-parish",
    coordinates: [21.763248, 48.468624],
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "kurov",
    name: "Kurov",
    village: "Kurov",
    type: "supported-parish",
    coordinates: [21.134490, 49.342220],
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "lukov",
    name: "Lukov",
    village: "Lukov",
    type: "supported-parish",
    coordinates: [21.081251, 49.291912],
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "petrova",
    name: "Petrová",
    village: "Petrová",
    type: "supported-parish",
    coordinates: [21.119190, 49.387623],
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "strazske",
    name: "Strážske",
    village: "Strážske",
    type: "supported-parish",
    coordinates: [21.836252, 48.874687],
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "zbudska-bela",
    name: "Zbudská Belá",
    village: "Zbudská Belá",
    type: "supported-parish",
    coordinates: [21.942140, 49.151570],
    status: "SUPPORTED",
    isActive: true,
  },
  {
    id: "bezovce",
    name: "Bežovce",
    village: "Bežovce",
    type: "supported-parish",
    coordinates: [22.152979, 48.630238],
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
