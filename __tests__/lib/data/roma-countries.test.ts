import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  COE_ROMA_ESTIMATES_URL,
  formatRomaPopulation,
  isMissionCountry,
  ROMA_COUNTRIES,
  type MissionCountry,
} from "@/lib/data/roma-countries";

const DEAD_WORLD_BANK_BRIEF =
  "https://www.worldbank.org/en/country/moldova/brief/roma-in-moldova";

const EC_SLOVAKIA =
  "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/slovakia_en";

/**
 * Nearest integer percent of totalPop. Matches the card style "~9–11%".
 * Moldova is the exception: its CoE range is 14,200–200,000 (~1–8% of 2.4M),
 * and the card uses the CoE average, 107,100 / 2.4M ≈ 4%.
 */
function shareFromRange(min: number, max: number, total: number): string {
  const lo = Math.round((min / total) * 100);
  const hi = Math.round((max / total) * 100);
  return lo === hi ? `~${lo}%` : `~${lo}–${hi}%`;
}

function rangeEnds(unofficialPop: string): [number, number] {
  const [min, max] = unofficialPop.split("–").map((part) => Number(part.replace(/,/g, "")));
  return [min, max];
}

const MISSION: Record<string, Pick<MissionCountry, "pop" | "totalPop" | "officialPop" | "unofficialPop" | "sharePercent"> & { sourceUrl: string }> = {
  SK: {
    pop: 550000,
    totalPop: 5500000,
    officialPop: "~156,000",
    unofficialPop: "500,000–600,000",
    sharePercent: "~9–11%",
    sourceUrl: EC_SLOVAKIA,
  },
  CZ: {
    pop: 200000,
    totalPop: 10900000,
    officialPop: "~13,000",
    unofficialPop: "150,000–250,000",
    sharePercent: "~1–2%",
    sourceUrl: COE_ROMA_ESTIMATES_URL,
  },
  RO: {
    pop: 1850000,
    totalPop: 19000000,
    officialPop: "~570,000",
    unofficialPop: "1,200,000–2,500,000",
    sharePercent: "~6–13%",
    sourceUrl: COE_ROMA_ESTIMATES_URL,
  },
  MD: {
    pop: 107100,
    totalPop: 2400000,
    officialPop: "9,356",
    unofficialPop: "14,200–200,000",
    sharePercent: "~4%",
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
  GR: {
    pop: 210000,
    totalPop: 10400000,
    officialPop: "N/A (no ethnic census)",
    unofficialPop: "120,000–300,000",
    sharePercent: "~1–3%",
    sourceUrl: COE_ROMA_ESTIMATES_URL,
  },
  HU: {
    pop: 850000,
    totalPop: 9700000,
    officialPop: "~210,000",
    unofficialPop: "700,000–1,000,000",
    sharePercent: "~7–10%",
    sourceUrl: COE_ROMA_ESTIMATES_URL,
  },
  BG: {
    pop: 750000,
    totalPop: 6500000,
    officialPop: "~267,000",
    unofficialPop: "700,000–800,000",
    sharePercent: "~11–12%",
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

describe("Roma country figures", () => {
  it("does not cite the removed World Bank Moldova brief", () => {
    const source = readFileSync(
      path.resolve(process.cwd(), "lib/data/roma-countries.ts"),
      "utf8",
    );
    expect(source).not.toContain(DEAD_WORLD_BANK_BRIEF);
    expect(ROMA_COUNTRIES.some((country) => country.sourceUrl === DEAD_WORLD_BANK_BRIEF)).toBe(
      false,
    );
    expect(source).not.toContain("worldpopulationreview.com");
    expect(source).not.toContain("minorityrights.org");
  });

  it("pins mission-card figures to the Council of Europe estimates", () => {
    for (const [iso, expected] of Object.entries(MISSION)) {
      const country = ROMA_COUNTRIES.find((entry) => entry.iso === iso);
      expect(country && isMissionCountry(country), iso).toBe(true);
      if (!country || !isMissionCountry(country)) continue;
      expect(country, iso).toMatchObject(expected);
    }
  });

  it("recomputes each share from the estimate and the card total", () => {
    for (const country of ROMA_COUNTRIES.filter(isMissionCountry)) {
      if (country.iso === "MD") {
        expect(country.sharePercent).toBe(
          `~${Math.round((country.pop / country.totalPop) * 100)}%`,
        );
        continue;
      }
      const [min, max] = rangeEnds(country.unofficialPop);
      expect(country.sharePercent, country.iso).toBe(
        shareFromRange(min, max, country.totalPop),
      );
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
      Object.keys(MISSION).length + Object.keys(MAP_AVERAGES).length,
    );
  });

  it("gives every country an https source", () => {
    for (const country of ROMA_COUNTRIES) {
      expect(country.sourceUrl, country.iso).toMatch(/^https:\/\//);
    }
  });

  it("keeps the same English figures in every locale dictionary", () => {
    const retired = [
      "240,000–300,000",
      "1,800,000–2,500,000",
      "200,000–300,000",
      "700,000–900,000",
      "80,000–200,000",
      "20,000–40,000",
      "500,000–800,000",
      "~22,000",
      "~6,300",
    ];
    const dir = path.resolve(process.cwd(), "lib/i18n/dictionaries");
    const files = readdirSync(dir).filter((name) => name.endsWith(".ts"));
    expect(files).toHaveLength(9);
    for (const file of files) {
      const text = readFileSync(path.join(dir, file), "utf8");
      for (const phrase of retired) {
        expect(text, `${file} ${phrase}`).not.toContain(phrase);
      }
    }
  });

  it("formats CoE averages without rounding them to a different figure", () => {
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
