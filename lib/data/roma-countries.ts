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
  /** When set, the card and the map tooltip both show this percent instead of pop ÷ total. */
  shareOverride?: number;
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
  /** When set, the map tooltip shows this percent instead of pop ÷ total. */
  shareOverride?: number;
}

export type RomaCountry = MissionCountry | MapCountry;

export function isMissionCountry(c: RomaCountry): c is MissionCountry {
  return "presence" in c;
}

/** Council of Europe estimates table, updated 2 July 2012. */
export const COE_ROMA_ESTIMATES_URL = "https://rm.coe.int/1680088ea9";

/**
 * Compact population for the map tooltip.
 * One decimal when it is exact (19.0M, 550K). A second decimal only when
 * one decimal would change the figure (1.85M, 37.5K, 1.05K).
 */
export function formatRomaPopulation(n: number): string {
  if (n >= 1_000_000) {
    const millions = n / 1_000_000;
    const one = millions.toFixed(1);
    if (Math.abs(Number(one) * 1_000_000 - n) < 1) return `${one}M`;
    return `${millions.toFixed(2)}M`;
  }
  const thousands = n / 1000;
  const whole = Math.round(thousands);
  if (Math.abs(whole * 1000 - n) < 1) return `${whole}K`;
  const one = thousands.toFixed(1);
  if (Math.abs(Number(one) * 1000 - n) < 1) return `${one}K`;
  return `${thousands.toFixed(2)}K`;
}

/** Two decimals, matching the European Commission sentences (8.32, 10.33). */
export function formatShareOverride(percent: number): string {
  return percent.toFixed(2);
}

type ShareSource = { pop: number; totalPop: number; shareOverride?: number };

/** Map tooltip percentage. An override replaces pop ÷ total. */
export function formatCountryPercent(country: ShareSource): string {
  if (country.shareOverride != null) return `${formatShareOverride(country.shareOverride)}%`;
  const pct = (country.pop / country.totalPop) * 100;
  return pct >= 1 ? `${pct.toFixed(1)}%` : `${pct.toFixed(2)}%`;
}

/** Mission-card share. Uses the same override as the tooltip. */
export function formatCardShare(country: { sharePercent: string; shareOverride?: number }): string {
  if (country.shareOverride != null) return `${formatShareOverride(country.shareOverride)}%`;
  return country.sharePercent;
}

function explicitShare(percent: number): Pick<MissionCountry, "shareOverride" | "sharePercent"> {
  return {
    shareOverride: percent,
    sharePercent: formatCardShare({ sharePercent: "", shareOverride: percent }),
  };
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
    pop: 1850000,
    totalPop: 19000000,
    officialPop: "~570,000",
    unofficialPop: "1,800,000–2,500,000",
    ...explicitShare(8.32),
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
    pop: 107100,
    totalPop: 2400000,
    officialPop: "9,356",
    unofficialPop: "14,200–200,000",
    sharePercent: "~0.6–8%",
    presence: "orthodox",
    presenceLabel: "Orthodox Active",
    scripture: "partial",
    scriptureNote: "Romanian Bible widely used; no Romani Scripture translations",
    liturgy: "needed",
    liturgyNote: "Moldovan Orthodox liturgy used; no Roma-specific materials",
    knownWorkers: "Moldovan Orthodox Church, some Protestant mission groups",
    sourceUrl: COE_ROMA_ESTIMATES_URL,
  },
  {
    iso: "RS",
    country: "Serbia",
    flag: "🇷🇸",
    pop: 600000,
    totalPop: 6800000,
    officialPop: "~132,000",
    unofficialPop: "400,000–800,000",
    sharePercent: "~6–12%",
    presence: "orthodox",
    presenceLabel: "Orthodox Active",
    scripture: "partial",
    scriptureNote: "Serbian Bible available; very limited Romani Scripture",
    liturgy: "needed",
    liturgyNote: "No dedicated Roma-language liturgy",
    knownWorkers: "Serbian Orthodox Church (limited reach), Pentecostal missions",
    sourceUrl: COE_ROMA_ESTIMATES_URL,
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
    pop: 750000,
    totalPop: 6500000,
    officialPop: "~267,000",
    unofficialPop: "700,000–900,000",
    ...explicitShare(10.33),
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
    pop: 197000,
    totalPop: 1840000,
    officialPop: "~46,000",
    unofficialPop: "134,000–260,000",
    sharePercent: "~7–14%",
    presence: "opportunity",
    presenceLabel: "Opportunity",
    scripture: "partial",
    scriptureNote: "Macedonian Bible available; small Romani NT project ongoing",
    liturgy: "progress",
    liturgyNote: "Active Romani liturgical translation projects underway",
    knownWorkers: "Roma NGOs in Shutka district, some Protestant missions",
    sourceUrl: COE_ROMA_ESTIMATES_URL,
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
    sourceUrl: COE_ROMA_ESTIMATES_URL,
  },
  {
    iso: "ME",
    country: "Montenegro",
    flag: "🇲🇪",
    pop: 20000,
    totalPop: 620000,
    officialPop: "~5,600",
    unofficialPop: "15,000–25,000",
    sharePercent: "~2–4%",
    presence: "opportunity",
    presenceLabel: "Opportunity",
    scripture: "partial",
    scriptureNote: "Serbian Bible widely used; no Romani Scripture translations",
    liturgy: "needed",
    liturgyNote: "No Roma-language liturgical materials exist",
    knownWorkers: "2 Roma evangelical churches in Podgorica, OM Montenegro",
    sourceUrl: COE_ROMA_ESTIMATES_URL,
  },

  // ── Geographic context countries (map only) ────────────────────────────────
  { iso: "ES", country: "Spain",          flag: "🇪🇸", pop:  750000, totalPop:  47400000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "TR", country: "Turkey",         flag: "🇹🇷", pop: 2750000, totalPop:  85000000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "FR", country: "France",         flag: "🇫🇷", pop:  400000, totalPop:  68000000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "UA", country: "Ukraine",        flag: "🇺🇦", pop:  260000, totalPop:  43000000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "GB", country: "United Kingdom", flag: "🇬🇧", pop:  225000, totalPop:  67000000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "DE", country: "Germany",        flag: "🇩🇪", pop:  105000, totalPop:  84000000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "IT", country: "Italy",          flag: "🇮🇹", pop:  150000, totalPop:  59000000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "SE", country: "Sweden",         flag: "🇸🇪", pop:   50000, totalPop:  10500000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "BA", country: "Bosnia & Herz.", flag: "🇧🇦", pop:   58000, totalPop:   3300000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "XK", country: "Kosovo",         flag: "🇽🇰", pop:   37500, totalPop:   1800000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "AT", country: "Austria",        flag: "🇦🇹", pop:   35000, totalPop:   9100000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "PT", country: "Portugal",       flag: "🇵🇹", pop:   52000, totalPop:  10300000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "NL", country: "Netherlands",    flag: "🇳🇱", pop:   40000, totalPop:  17900000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "BE", country: "Belgium",        flag: "🇧🇪", pop:   30000, totalPop:  11600000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "CH", country: "Switzerland",    flag: "🇨🇭", pop:   30000, totalPop:   8700000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "BY", country: "Belarus",        flag: "🇧🇾", pop:   47500, totalPop:   9400000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "HR", country: "Croatia",        flag: "🇭🇷", pop:   35000, totalPop:   3900000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "PL", country: "Poland",         flag: "🇵🇱", pop:   32500, totalPop:  38000000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "LV", country: "Latvia",         flag: "🇱🇻", pop:   12500, totalPop:   1850000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "LT", country: "Lithuania",      flag: "🇱🇹", pop:    3000, totalPop:   2800000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "EE", country: "Estonia",        flag: "🇪🇪", pop:    1050, totalPop:   1300000, sourceUrl: COE_ROMA_ESTIMATES_URL },
  { iso: "SI", country: "Slovenia",       flag: "🇸🇮", pop:    8500, totalPop:   2100000, sourceUrl: COE_ROMA_ESTIMATES_URL },
];
