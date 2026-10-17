import { afterEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "../../../lib/i18n/locales";
import { currencyAffix, formatCurrency } from "../../../lib/i18n/format";

const AMOUNTS = {
  en: { 25: "€25", 1250: "€1,250", 25.5: "€25.50" },
  de: { 25: "25 €", 1250: "1.250 €", 25.5: "25,50 €" },
  ro: { 25: "25 €", 1250: "1.250 €", 25.5: "25,50 €" },
  sr: { 25: "25 €", 1250: "1.250 €", 25.5: "25,50 €" },
  mk: { 25: "25 €", 1250: "1.250 €", 25.5: "25,50 €" },
  el: { 25: "25 €", 1250: "1.250 €", 25.5: "25,50 €" },
  sk: { 25: "25 €", 1250: "1 250 €", 25.5: "25,50 €" },
  cs: { 25: "25 €", 1250: "1 250 €", 25.5: "25,50 €" },
  ru: { 25: "25 €", 1250: "1 250 €", 25.5: "25,50 €" },
} as const satisfies Record<Locale, { 25: string; 1250: string; 25.5: string }>;

const AFFIX: Record<Locale, "prefix" | "suffix"> = {
  en: "prefix",
  sk: "suffix",
  cs: "suffix",
  ro: "suffix",
  de: "suffix",
  sr: "suffix",
  ru: "suffix",
  mk: "suffix",
  el: "suffix",
};

describe("formatCurrency", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(Object.entries(AMOUNTS) as [Locale, (typeof AMOUNTS)[Locale]][])(
    "formats 25, 1250, and 25.5 for %s",
    (locale, expected) => {
      expect(formatCurrency(25, locale)).toBe(expected[25]);
      expect(formatCurrency(1250, locale)).toBe(expected[1250]);
      expect(formatCurrency(25.5, locale)).toBe(expected[25.5]);
      expect(formatCurrency(1250, locale)).not.toMatch(/\u00A0/);
    }
  );

  it.each(Object.entries(AFFIX) as [Locale, "prefix" | "suffix"][])(
    "places the euro sign for %s as a %s",
    (locale, position) => {
      expect(currencyAffix(locale)).toEqual({ symbol: "€", position });
    }
  );

  it("does not depend on Intl currency display", () => {
    vi.spyOn(Intl, "NumberFormat").mockImplementation(() => {
      throw new Error("currency formatting must not consult Intl");
    });

    expect(formatCurrency(25, "mk")).toBe("25 €");
    expect(formatCurrency(1250, "en")).toBe("€1,250");
    expect(formatCurrency(1250, "de")).toBe("1.250 €");
    expect(formatCurrency(1250, "sk")).toBe("1 250 €");
    expect(formatCurrency(25.5, "sk")).toBe("25,50 €");
    expect(formatCurrency(25.5, "ro")).toBe("25,50 €");
    expect(currencyAffix("el").position).toBe("suffix");
  });
});
