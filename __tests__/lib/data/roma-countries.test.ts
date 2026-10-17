import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  COE_ROMA_ESTIMATES_URL,
  formatCardShare,
  formatCountryPercent,
  formatRomaPopulation,
  isMissionCountry,
  ROMA_COUNTRIES,
  type MissionCountry,
} from "@/lib/data/roma-countries";

const DEAD_WORLD_BANK_BRIEF =
  "https://www.worldbank.org/en/country/moldova/brief/roma-in-moldova";

const EN_DASH = "\u2013";
const POPULATION_RANGE = new RegExp(
  `^\\d{1,3}(,\\d{3})*${EN_DASH}\\d{1,3}(,\\d{3})*$`,
);
const SHARE_RANGE = new RegExp(`^~\\d+(?:\\.\\d{1,2})?(?:${EN_DASH}\\d+(?:\\.\\d{1,2})?)?%$`);

/** Nearest integer, or one decimal when the end is below 1%. */
function formatShareEnd(percent: number): string {
  if (percent < 1) return (Math.round(percent * 10) / 10).toFixed(1);
  return String(Math.round(percent));
}

function shareFromRange(min: number, max: number, total: number): string {
  const lo = formatShareEnd((min / total) * 100);
  const hi = formatShareEnd((max / total) * 100);
  return lo === hi ? `~${lo}%` : `~${lo}${EN_DASH}${hi}%`;
}

function rangeEnds(unofficialPop: string): [number, number] {
  const [min, max] = unofficialPop.split(EN_DASH).map((part) => Number(part.replace(/,/g, "")));
  return [min, max];
}

type MissionPin = Pick<
  MissionCountry,
  "pop" | "totalPop" | "officialPop" | "unofficialPop" | "sharePercent"
> & { sourceUrl: string; shareOverride?: number };

/** European Commission cards. These stay exactly as published on main. */
const EC_MISSION: Record<string, MissionPin> = {
  SK: {
    pop: 550000,
    totalPop: 5500000,
    officialPop: "~156,000",
    unofficialPop: "500,000–600,000",
    sharePercent: "~9–11%",
    sourceUrl:
      "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/slovakia_en",
  },
  CZ: {
    pop: 250000,
    totalPop: 10900000,
    officialPop: "~13,000",
    unofficialPop: "200,000–300,000",
    sharePercent: "~2–3%",
    sourceUrl:
      "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/czech-republic_en",
  },
  RO: {
    pop: 1850000,
    totalPop: 19000000,
    officialPop: "~570,000",
    unofficialPop: "1,800,000–2,500,000",
    sharePercent: "~8.32%",
    shareOverride: 8.32,
    sourceUrl:
      "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/romania_en",
  },
  GR: {
    pop: 210000,
    totalPop: 10400000,
    officialPop: "N/A (no ethnic census)",
    unofficialPop: "120,000–300,000",
    sharePercent: "~1–3%",
    sourceUrl:
      "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/greece_en",
  },
  HU: {
    pop: 850000,
    totalPop: 9700000,
    officialPop: "~210,000",
    unofficialPop: "700,000–1,000,000",
    sharePercent: "~7–10%",
    sourceUrl:
      "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/hungary_en",
  },
  BG: {
    pop: 750000,
    totalPop: 6500000,
    officialPop: "~267,000",
    unofficialPop: "700,000–900,000",
    sharePercent: "~10.33%",
    shareOverride: 10.33,
    sourceUrl:
      "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/bulgaria_en",
  },
};

/** Council of Europe cards: the dead World Bank and Minority Rights Group links. */
const COE_MISSION: Record<string, MissionPin> = {
  MD: {
    pop: 107100,
    totalPop: 2400000,
    officialPop: "9,356",
    unofficialPop: "14,200–200,000",
    sharePercent: "~0.6–8%",
    sourceUrl: COE_ROMA_ESTIMATES_URL,
  },
  RS: {
    pop: 600000,
    totalPop: 6800000,
    officialPop: "~132,000",
    unofficialPop: "400,000–800,000",
    sharePercent: "~6–12%",
    sourceUrl: COE_ROMA_ESTIMATES_URL,
  },
  MK: {
    pop: 197000,
    totalPop: 1840000,
    officialPop: "~46,000",
    unofficialPop: "134,000–260,000",
    sharePercent: "~7–14%",
    sourceUrl: COE_ROMA_ESTIMATES_URL,
  },
  AL: {
    pop: 115000,
    totalPop: 2800000,
    officialPop: "~8,300",
    unofficialPop: "80,000–150,000",
    sharePercent: "~3–5%",
    sourceUrl: COE_ROMA_ESTIMATES_URL,
  },
  ME: {
    pop: 20000,
    totalPop: 620000,
    officialPop: "~5,600",
    unofficialPop: "15,000–25,000",
    sharePercent: "~2–4%",
    sourceUrl: COE_ROMA_ESTIMATES_URL,
  },
};

/** CoE average estimate, 2 July 2012, for map-only countries. */
const MAP_AVERAGES: Record<string, number> = {
  ES: 750000,
  TR: 2750000,
  FR: 400000,
  UA: 260000,
  GB: 225000,
  DE: 105000,
  IT: 150000,
  SE: 50000,
  BA: 58000,
  XK: 37500,
  AT: 35000,
  PT: 52000,
  NL: 40000,
  BE: 30000,
  CH: 30000,
  BY: 47500,
  HR: 35000,
  PL: 32500,
  LV: 12500,
  LT: 3000,
  EE: 1050,
  SI: 8500,
};

function assertEnDashRanges(label: string, text: string) {
  const hyphenPopulationRange = /\d{1,3}(?:,\d{3})+\s*-\s*\d/;
  const spacedPopulationRange = new RegExp(
    `\\d{1,3}(?:,\\d{3})+\\s+${EN_DASH}\\s*\\d|\\d{1,3}(?:,\\d{3})+\\s*${EN_DASH}\\s+\\d`,
  );
  expect(text, `${label} hyphen population range`).not.toMatch(hyphenPopulationRange);
  expect(text, `${label} spaced population range`).not.toMatch(spacedPopulationRange);
}

describe("Roma country figures", () => {
  it("does not cite the removed World Bank, Minority Rights Group, or World Population Review links", () => {
    const source = readFileSync(
      path.resolve(process.cwd(), "lib/data/roma-countries.ts"),
      "utf8",
    );
    expect(source).not.toContain(DEAD_WORLD_BANK_BRIEF);
    expect(source).not.toContain("worldpopulationreview.com");
    expect(source).not.toContain("minorityrights.org");
    expect(ROMA_COUNTRIES.some((country) => country.sourceUrl === DEAD_WORLD_BANK_BRIEF)).toBe(
      false,
    );
  });

  it("keeps Slovakia, Czechia, Greece, and Hungary on their main figures, and pins Romania and Bulgaria to the European Commission page", () => {
    for (const [iso, expected] of Object.entries(EC_MISSION)) {
      const country = ROMA_COUNTRIES.find((entry) => entry.iso === iso);
      expect(country && isMissionCountry(country), iso).toBe(true);
      if (!country || !isMissionCountry(country)) continue;
      expect(country, iso).toMatchObject(expected);
      expect(country.sourceUrl, iso).toContain("commission.europa.eu");
    }
  });

  it("pins the replaced-link cards to the Council of Europe estimates", () => {
    for (const [iso, expected] of Object.entries(COE_MISSION)) {
      const country = ROMA_COUNTRIES.find((entry) => entry.iso === iso);
      expect(country && isMissionCountry(country), iso).toBe(true);
      if (!country || !isMissionCountry(country)) continue;
      expect(country, iso).toMatchObject(expected);
      expect(country.sourceUrl, iso).toBe(COE_ROMA_ESTIMATES_URL);
    }
  });

  it("recomputes shares on the changed cards, with one decimal below 1%", () => {
    for (const iso of Object.keys(COE_MISSION)) {
      const country = ROMA_COUNTRIES.find((entry) => entry.iso === iso);
      if (!country || !isMissionCountry(country)) continue;
      const [min, max] = rangeEnds(country.unofficialPop);
      expect(country.sharePercent, country.iso).toBe(
        shareFromRange(min, max, country.totalPop),
      );
    }
    const moldova = ROMA_COUNTRIES.find((entry) => entry.iso === "MD");
    expect(moldova && isMissionCountry(moldova) && moldova.sharePercent).toBe("~0.6–8%");
  });

  it("uses the share override for Romania and Bulgaria on the card and the tooltip", () => {
    const romania = ROMA_COUNTRIES.find((entry) => entry.iso === "RO");
    const bulgaria = ROMA_COUNTRIES.find((entry) => entry.iso === "BG");
    expect(romania && isMissionCountry(romania)).toBe(true);
    expect(bulgaria && isMissionCountry(bulgaria)).toBe(true);
    if (!romania || !isMissionCountry(romania) || !bulgaria || !isMissionCountry(bulgaria)) return;

    expect(romania.shareOverride).toBe(8.32);
    expect(bulgaria.shareOverride).toBe(10.33);
    expect(formatCardShare(romania)).toBe("~8.32%");
    expect(formatCardShare(bulgaria)).toBe("~10.33%");
    expect(formatCountryPercent(romania)).toBe("8.32%");
    expect(formatCountryPercent(bulgaria)).toBe("10.33%");
    expect(
      `${formatCountryPercent(romania)} Roma · ${formatRomaPopulation(romania.pop)} of ${formatRomaPopulation(romania.totalPop)}`,
    ).toBe("8.32% Roma · 1.85M of 19.0M");
    expect(
      `${formatCountryPercent(bulgaria)} Roma · ${formatRomaPopulation(bulgaria.pop)} of ${formatRomaPopulation(bulgaria.totalPop)}`,
    ).toBe("10.33% Roma · 750K of 6.5M");

    const withOverride = ROMA_COUNTRIES.filter((country) => country.shareOverride != null).map(
      (country) => country.iso,
    );
    expect(withOverride.sort()).toEqual(["BG", "RO"]);
  });

  it("keeps the calculated tooltip percent when a country has no share override", () => {
    const germany = ROMA_COUNTRIES.find((entry) => entry.iso === "DE");
    const moldova = ROMA_COUNTRIES.find((entry) => entry.iso === "MD");
    expect(germany?.shareOverride).toBeUndefined();
    expect(moldova?.shareOverride).toBeUndefined();
    expect(germany && formatCountryPercent(germany)).toBe("0.13%");
    expect(moldova && isMissionCountry(moldova) && formatCountryPercent(moldova)).toBe("4.5%");
    expect(moldova && isMissionCountry(moldova) && formatCardShare(moldova)).toBe("~0.6–8%");
    expect(
      germany &&
        `${formatCountryPercent(germany)} Roma · ${formatRomaPopulation(germany.pop)} of ${formatRomaPopulation(germany.totalPop)}`,
    ).toBe("0.13% Roma · 105K of 84.0M");
  });

  it("writes every population range with an en dash and no spaces", () => {
    const source = readFileSync(
      path.resolve(process.cwd(), "lib/data/roma-countries.ts"),
      "utf8",
    );
    assertEnDashRanges("roma-countries.ts", source);
    for (const country of ROMA_COUNTRIES.filter(isMissionCountry)) {
      expect(country.unofficialPop, country.iso).toMatch(POPULATION_RANGE);
      expect(country.unofficialPop, country.iso).not.toContain("-");
      expect(country.unofficialPop, country.iso).not.toContain(" ");
      expect(country.sharePercent, country.iso).toMatch(SHARE_RANGE);
      expect(country.sharePercent, country.iso).not.toContain("-");
      expect(country.sharePercent, country.iso).not.toContain(" ");
    }

    const dir = path.resolve(process.cwd(), "lib/i18n/dictionaries");
    const files = readdirSync(dir).filter((name) => name.endsWith(".ts"));
    expect(files).toHaveLength(9);
    for (const file of files) {
      const text = readFileSync(path.join(dir, file), "utf8");
      assertEnDashRanges(file, text);
      expect(text, file).not.toContain(DEAD_WORLD_BANK_BRIEF);
      expect(text, file).not.toContain("minorityrights.org");
    }
  });

  it("pins map-only countries to the Council of Europe average", () => {
    for (const [iso, pop] of Object.entries(MAP_AVERAGES)) {
      const country = ROMA_COUNTRIES.find((entry) => entry.iso === iso);
      expect(country, iso).toBeTruthy();
      expect(country?.pop, iso).toBe(pop);
      expect(country?.sourceUrl, iso).toBe(COE_ROMA_ESTIMATES_URL);
      expect(isMissionCountry(country!), iso).toBe(false);
    }
    expect(ROMA_COUNTRIES).toHaveLength(
      Object.keys(EC_MISSION).length + Object.keys(COE_MISSION).length + Object.keys(MAP_AVERAGES).length,
    );
  });

  it("gives every country an https source", () => {
    for (const country of ROMA_COUNTRIES) {
      expect(country.sourceUrl, country.iso).toMatch(/^https:\/\//);
    }
  });

  it("formats populations without rounding them to a different figure", () => {
    expect(formatRomaPopulation(1850000)).toBe("1.85M");
    expect(formatRomaPopulation(2750000)).toBe("2.75M");
    expect(formatRomaPopulation(1840000)).toBe("1.84M");
    expect(formatRomaPopulation(19000000)).toBe("19.0M");
    expect(formatRomaPopulation(107100)).toBe("107.1K");
    expect(formatRomaPopulation(37500)).toBe("37.5K");
    expect(formatRomaPopulation(8500)).toBe("8.5K");
    expect(formatRomaPopulation(12500)).toBe("12.5K");
    expect(formatRomaPopulation(1050)).toBe("1.05K");
    expect(formatRomaPopulation(750000)).toBe("750K");
    expect(formatRomaPopulation(105000)).toBe("105K");
  });
});
