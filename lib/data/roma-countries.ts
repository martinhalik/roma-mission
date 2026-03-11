// ─── Types ────────────────────────────────────────────────────────────────────

export type Presence = "active" | "orthodox" | "opportunity" | "next-steps";
export type TranslationStatus = "available" | "partial" | "progress" | "needed";

// Countries with full mission-field detail (shown on /mission page)
export interface MissionCountry {
  iso: string;
  country: string;
  flag: string;
  pop: number;         // numeric unofficial estimate — single source of truth for the map
  totalPop: number;    // for % calculation
  officialPop: string;
  unofficialPop: string;
  sharePercent: string;
  presence: Presence;
  presenceLabel: string;
  scripture: TranslationStatus;
  scriptureNote: string;
  liturgy: TranslationStatus;
  liturgyNote: string;
  knownWorkers: string;
  sourceUrl: string;
}

// Countries shown on the map for geographic context only
export interface MapCountry {
  iso: string;
  country: string;
  flag: string;
  pop: number;
  totalPop: number;
}

export type RomaCountry = MissionCountry | MapCountry;

export function isMissionCountry(c: RomaCountry): c is MissionCountry {
  return "presence" in c;
}

// ─── Data ─────────────────────────────────────────────────────────────────────

export const ROMA_COUNTRIES: RomaCountry[] = [
  // ── Mission-field countries (full detail) ──────────────────────────────────
  {
    iso: "SK",
    country: "Slovakia",
    flag: "🇸🇰",
    pop: 500000,
    totalPop: 5500000,
    officialPop: "~105,000",
    unofficialPop: "~500,000",
    sharePercent: "~9%",
    presence: "active",
    presenceLabel: "We're Here",
    scripture: "partial",
    scriptureNote: "Romani NT exists; Slovak Bible widely used in parishes",
    liturgy: "partial",
    liturgyNote: "Liturgical materials actively being developed by our mission",
    knownWorkers: "KRM (our mission), Greek-Catholic Church missions",
    sourceUrl: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/slovakia_en",
  },
  {
    iso: "CZ",
    country: "Czechia",
    flag: "🇨🇿",
    pop: 250000,
    totalPop: 10900000,
    officialPop: "~13,000",
    unofficialPop: "200,000–300,000",
    sharePercent: "2–3%",
    presence: "next-steps",
    presenceLabel: "Next Steps",
    scripture: "partial",
    scriptureNote: "Czech Bible widely available; very limited Romani Scripture",
    liturgy: "needed",
    liturgyNote: "No Roma-language liturgical materials exist",
    knownWorkers: "Caritas Czech Republic, some evangelical outreach programs",
    sourceUrl: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/czech-republic_en",
  },
  {
    iso: "RO",
    country: "Romania",
    flag: "🇷🇴",
    pop: 1850000,
    totalPop: 19000000,
    officialPop: "~621,000",
    unofficialPop: "~1.85 million",
    sharePercent: "~8%",
    presence: "orthodox",
    presenceLabel: "Orthodox Active",
    scripture: "available",
    scriptureNote: "Romanian Bible widely available; partial Romani translations",
    liturgy: "partial",
    liturgyNote: "Romanian Orthodox liturgy used; limited Roma-specific materials",
    knownWorkers: "Romanian Orthodox Church, Romani CRISS, Romanian Bible Society",
    sourceUrl: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/romania_en",
  },
  {
    iso: "MD",
    country: "Moldova",
    flag: "🇲🇩",
    pop: 250000,
    totalPop: 2600000,
    officialPop: "~107,000",
    unofficialPop: "200,000–300,000",
    sharePercent: "4–8%",
    presence: "orthodox",
    presenceLabel: "Orthodox Active",
    scripture: "partial",
    scriptureNote: "Romanian Bible widely used; no Romani Scripture translations",
    liturgy: "needed",
    liturgyNote: "Moldovan Orthodox liturgy used; no Roma-specific materials",
    knownWorkers: "Moldovan Orthodox Church, some Protestant mission groups",
    sourceUrl: "https://www.worldbank.org/en/country/moldova/brief/roma-in-moldova",
  },
  {
    iso: "RS",
    country: "Serbia",
    flag: "🇷🇸",
    pop: 500000,
    totalPop: 6800000,
    officialPop: "~147,000",
    unofficialPop: "400,000–600,000",
    sharePercent: "2–8%",
    presence: "orthodox",
    presenceLabel: "Orthodox Active",
    scripture: "partial",
    scriptureNote: "Serbian Bible available; very limited Romani Scripture",
    liturgy: "needed",
    liturgyNote: "No dedicated Roma-language liturgy",
    knownWorkers: "Serbian Orthodox Church (limited reach), Pentecostal missions",
    sourceUrl: "https://minorityrights.org/communities/roma-14/",
  },
  {
    iso: "GR",
    country: "Greece",
    flag: "🇬🇷",
    pop: 300000,
    totalPop: 10400000,
    officialPop: "~111,000",
    unofficialPop: "250,000–350,000",
    sharePercent: "2–3%",
    presence: "orthodox",
    presenceLabel: "Orthodox Active",
    scripture: "partial",
    scriptureNote: "Greek Bible widely available; limited Romani Scripture translations",
    liturgy: "partial",
    liturgyNote: "Greek Orthodox liturgy used; Roma-specific materials very limited",
    knownWorkers: "Greek Orthodox Church, local parish outreach programs",
    sourceUrl: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/greece_en",
  },
  {
    iso: "HU",
    country: "Hungary",
    flag: "🇭🇺",
    pop: 700000,
    totalPop: 9700000,
    officialPop: "~315,000",
    unofficialPop: "~700,000",
    sharePercent: "~7%",
    presence: "opportunity",
    presenceLabel: "Opportunity",
    scripture: "partial",
    scriptureNote: "Hungarian Bible available; very limited Romani Scripture",
    liturgy: "needed",
    liturgyNote: "No Roma-language liturgical materials exist",
    knownWorkers: "Hungarian Baptist Aid, Reformed Church of Hungary programs",
    sourceUrl: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/hungary_en",
  },
  {
    iso: "BG",
    country: "Bulgaria",
    flag: "🇧🇬",
    pop: 800000,
    totalPop: 6500000,
    officialPop: "~325,000",
    unofficialPop: "700,000–900,000",
    sharePercent: "5–12%",
    presence: "opportunity",
    presenceLabel: "Opportunity",
    scripture: "partial",
    scriptureNote: "Bulgarian Bible available; very limited Romani Scripture",
    liturgy: "needed",
    liturgyNote: "No Roma-language liturgical materials exist",
    knownWorkers: "Amalipe Center (Roma NGO), various evangelical groups",
    sourceUrl: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/bulgaria_en",
  },
  {
    iso: "MK",
    country: "North Macedonia",
    flag: "🇲🇰",
    pop: 260000,
    totalPop: 2100000,
    officialPop: "~54,000",
    unofficialPop: "200,000+",
    sharePercent: "2–12%",
    presence: "opportunity",
    presenceLabel: "Opportunity",
    scripture: "partial",
    scriptureNote: "Macedonian Bible available; small Romani NT project ongoing",
    liturgy: "progress",
    liturgyNote: "Active Romani liturgical translation projects underway",
    knownWorkers: "Roma NGOs in Shutka district, some Protestant missions",
    sourceUrl: "https://minorityrights.org/country/macedonia/",
  },

  // ── Geographic context countries (map only) ────────────────────────────────
  { iso: "ES", country: "Spain",          flag: "🇪🇸", pop: 1125000, totalPop: 47400000 },
  { iso: "FR", country: "France",         flag: "🇫🇷", pop:  500000, totalPop: 68000000 },
  { iso: "UA", country: "Ukraine",        flag: "🇺🇦", pop:  400000, totalPop: 43000000 },
  { iso: "PL", country: "Poland",         flag: "🇵🇱", pop:   30000, totalPop: 38000000 },
  { iso: "AT", country: "Austria",        flag: "🇦🇹", pop:   45000, totalPop:  9100000 },
  { iso: "DE", country: "Germany",        flag: "🇩🇪", pop:  200000, totalPop: 84000000 },
  { iso: "IT", country: "Italy",          flag: "🇮🇹", pop:  170000, totalPop: 59000000 },
  { iso: "AL", country: "Albania",        flag: "🇦🇱", pop:  100000, totalPop:  2800000 },
  { iso: "BA", country: "Bosnia & Herz.", flag: "🇧🇦", pop:   70000, totalPop:  3300000 },
  { iso: "PT", country: "Portugal",       flag: "🇵🇹", pop:   60000, totalPop: 10300000 },
  { iso: "HR", country: "Croatia",        flag: "🇭🇷", pop:   35000, totalPop:  3900000 },
  { iso: "ME", country: "Montenegro",     flag: "🇲🇪", pop:   20000, totalPop:   620000 },
  { iso: "SI", country: "Slovenia",       flag: "🇸🇮", pop:   12000, totalPop:  2100000 },
];
