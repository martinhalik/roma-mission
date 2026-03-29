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
  sourceUrl?: string;
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
    pop: 550000,
    totalPop: 5500000,
    officialPop: "~156,000",
    unofficialPop: "500,000–600,000",
    sharePercent: "~9–11%",
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
    sharePercent: "~2–3%",
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
    pop: 2150000,
    totalPop: 19000000,
    officialPop: "~570,000",
    unofficialPop: "1,800,000–2,500,000",
    sharePercent: "~9–13%",
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
    pop: 270000,
    totalPop: 2400000,
    officialPop: "~22,000",
    unofficialPop: "240,000–300,000",
    sharePercent: "~2–3%",
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
    pop: 650000,
    totalPop: 6800000,
    officialPop: "~132,000",
    unofficialPop: "500,000–800,000",
    sharePercent: "~7–11%",
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
    pop: 210000,
    totalPop: 10400000,
    officialPop: "N/A (no ethnic census)",
    unofficialPop: "120,000–300,000",
    sharePercent: "~1–3%",
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
    pop: 850000,
    totalPop: 9700000,
    officialPop: "~210,000",
    unofficialPop: "700,000–1,000,000",
    sharePercent: "~7–10%",
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
    officialPop: "~267,000",
    unofficialPop: "700,000–900,000",
    sharePercent: "~11–14%",
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
    pop: 140000,
    totalPop: 2100000,
    officialPop: "~46,000",
    unofficialPop: "80,000–200,000",
    sharePercent: "~4–10%",
    presence: "opportunity",
    presenceLabel: "Opportunity",
    scripture: "partial",
    scriptureNote: "Macedonian Bible available; small Romani NT project ongoing",
    liturgy: "progress",
    liturgyNote: "Active Romani liturgical translation projects underway",
    knownWorkers: "Roma NGOs in Shutka district, some Protestant missions",
    sourceUrl: "https://minorityrights.org/country/macedonia/",
  },
  {
    iso: "AL",
    country: "Albania",
    flag: "🇦🇱",
    pop: 115000,
    totalPop: 2800000,
    officialPop: "~8,300",
    unofficialPop: "80,000–150,000",
    sharePercent: "~3–5%",
    presence: "opportunity",
    presenceLabel: "Opportunity",
    scripture: "partial",
    scriptureNote: "Albanian Bible available; no known Romani Scripture translations",
    liturgy: "needed",
    liturgyNote: "No Roma-language liturgical materials exist",
    knownWorkers: "AIAFA (Albanians In Action For Christ), evangelical missions post-1991",
    sourceUrl: "https://minorityrights.org/communities/roma/",
  },
  {
    iso: "ME",
    country: "Montenegro",
    flag: "🇲🇪",
    pop: 30000,
    totalPop: 620000,
    officialPop: "~6,300",
    unofficialPop: "20,000–40,000",
    sharePercent: "~3–6%",
    presence: "opportunity",
    presenceLabel: "Opportunity",
    scripture: "partial",
    scriptureNote: "Serbian Bible widely used; no Romani Scripture translations",
    liturgy: "needed",
    liturgyNote: "No Roma-language liturgical materials exist",
    knownWorkers: "2 Roma evangelical churches in Podgorica, OM Montenegro",
    sourceUrl: "https://minorityrights.org/country/montenegro/",
  },

  // ── Geographic context countries (map only) ────────────────────────────────
  { iso: "ES", country: "Spain",          flag: "🇪🇸", pop: 1125000, totalPop:  47400000 },
  { iso: "TR", country: "Turkey",         flag: "🇹🇷", pop: 1625000, totalPop:  85000000, sourceUrl: "https://worldpopulationreview.com/country-rankings/roma-population-by-country" },
  { iso: "FR", country: "France",         flag: "🇫🇷", pop:  500000, totalPop:  68000000 },
  { iso: "UA", country: "Ukraine",        flag: "🇺🇦", pop:  400000, totalPop:  43000000 },
  { iso: "GB", country: "United Kingdom", flag: "🇬🇧", pop:  225000, totalPop:  67000000, sourceUrl: "https://worldpopulationreview.com/country-rankings/roma-population-by-country" },
  { iso: "DE", country: "Germany",        flag: "🇩🇪", pop:  200000, totalPop:  84000000 },
  { iso: "IT", country: "Italy",          flag: "🇮🇹", pop:  170000, totalPop:  59000000 },
  { iso: "SE", country: "Sweden",         flag: "🇸🇪", pop:   75000, totalPop:  10500000, sourceUrl: "https://worldpopulationreview.com/country-rankings/roma-population-by-country" },
  { iso: "BA", country: "Bosnia & Herz.", flag: "🇧🇦", pop:   70000, totalPop:   3300000, sourceUrl: "https://minorityrights.org/communities/roma-3/" },
  { iso: "XK", country: "Kosovo",         flag: "🇽🇰", pop:   43000, totalPop:   1800000, sourceUrl: "https://minorityrights.org/communities/roma-ashkali-and-egyptians/" },
  { iso: "AT", country: "Austria",        flag: "🇦🇹", pop:   45000, totalPop:   9100000 },
  { iso: "PT", country: "Portugal",       flag: "🇵🇹", pop:   60000, totalPop:  10300000 },
  { iso: "NL", country: "Netherlands",    flag: "🇳🇱", pop:   36000, totalPop:  17900000, sourceUrl: "https://worldpopulationreview.com/country-rankings/roma-population-by-country" },
  { iso: "BE", country: "Belgium",        flag: "🇧🇪", pop:   30000, totalPop:  11600000, sourceUrl: "https://worldpopulationreview.com/country-rankings/roma-population-by-country" },
  { iso: "CH", country: "Switzerland",    flag: "🇨🇭", pop:   30000, totalPop:   8700000, sourceUrl: "https://worldpopulationreview.com/country-rankings/roma-population-by-country" },
  { iso: "BY", country: "Belarus",        flag: "🇧🇾", pop:   27000, totalPop:   9400000, sourceUrl: "https://worldpopulationreview.com/country-rankings/roma-population-by-country" },
  { iso: "HR", country: "Croatia",        flag: "🇭🇷", pop:   35000, totalPop:   3900000 },
  { iso: "PL", country: "Poland",         flag: "🇵🇱", pop:   30000, totalPop:  38000000 },
  { iso: "LV", country: "Latvia",         flag: "🇱🇻", pop:   10000, totalPop:   1850000, sourceUrl: "https://worldpopulationreview.com/country-rankings/roma-population-by-country" },
  { iso: "LT", country: "Lithuania",      flag: "🇱🇹", pop:    3000, totalPop:   2800000, sourceUrl: "https://worldpopulationreview.com/country-rankings/roma-population-by-country" },
  { iso: "EE", country: "Estonia",        flag: "🇪🇪", pop:    1250, totalPop:   1300000, sourceUrl: "https://worldpopulationreview.com/country-rankings/roma-population-by-country" },
  { iso: "SI", country: "Slovenia",       flag: "🇸🇮", pop:   12000, totalPop:   2100000 },
];
