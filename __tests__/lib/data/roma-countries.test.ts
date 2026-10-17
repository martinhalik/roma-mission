import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { isMissionCountry, ROMA_COUNTRIES } from "@/lib/data/roma-countries";

const DEAD_WORLD_BANK_BRIEF =
  "https://www.worldbank.org/en/country/moldova/brief/roma-in-moldova";

describe("Roma country sources", () => {
  it("does not cite the removed World Bank Moldova brief", () => {
    const source = readFileSync(
      new URL("../../../lib/data/roma-countries.ts", import.meta.url),
      "utf8",
    );
    expect(source).not.toContain(DEAD_WORLD_BANK_BRIEF);
    expect(ROMA_COUNTRIES.some((country) => country.sourceUrl === DEAD_WORLD_BANK_BRIEF)).toBe(
      false,
    );
  });

  it("keeps the Moldova figures and drops only the dead source link", () => {
    const moldova = ROMA_COUNTRIES.find((country) => country.iso === "MD");
    expect(moldova && isMissionCountry(moldova)).toBe(true);
    if (!moldova || !isMissionCountry(moldova)) return;
    expect(moldova).toMatchObject({
      officialPop: "~22,000",
      unofficialPop: "240,000–300,000",
      sharePercent: "~2–3%",
    });
    expect(moldova.sourceUrl).toBeUndefined();
  });

  it("keeps an https source on every other mission-field country", () => {
    for (const country of ROMA_COUNTRIES.filter(isMissionCountry)) {
      if (country.iso === "MD") continue;
      expect(country.sourceUrl, country.iso).toMatch(/^https:\/\//);
    }
  });
});
