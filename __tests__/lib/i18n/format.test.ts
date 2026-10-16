import { describe, expect, it } from "vitest";
import { LOCALES, type Locale } from "../../../lib/i18n/locales";
import { currencyAffix, formatCurrency } from "../../../lib/i18n/format";

const LOCALES_WITH_SUFFIX: Locale[] = LOCALES.map((locale) => locale.code).filter(
  (code) => code !== "en"
);

describe("formatCurrency", () => {
  it("formats English as a euro prefix", () => {
    expect(formatCurrency(25, "en").replace(/\s/g, "")).toBe("€25");
    expect(formatCurrency(25, "en")).not.toContain("$");
    expect(currencyAffix("en")).toEqual({ symbol: "€", position: "prefix" });
  });

  it.each(["de", "sk"] as const)("formats %s as a euro suffix", (locale) => {
    expect(formatCurrency(25, locale).replace(/\s/g, "")).toBe("25€");
    expect(formatCurrency(25, locale)).not.toContain("$");
    expect(currencyAffix(locale)).toEqual({ symbol: "€", position: "suffix" });
  });

  it.each(LOCALES.map((locale) => locale.code))(
    "formats 25 as EUR for %s",
    (locale) => {
      const formatted = formatCurrency(locale === "en" ? 25 : 25, locale);
      const compact = formatted.replace(/\s/g, "");
      expect(compact).toContain("€");
      expect(compact).toContain("25");
      expect(formatted).not.toMatch(/\$|USD|dollar/i);
      expect(currencyAffix(locale).symbol).toBe("€");
      expect(currencyAffix(locale).position).toBe(locale === "en" ? "prefix" : "suffix");
    }
  );

  it("defaults to EUR when no currency is passed", () => {
    for (const locale of LOCALES.map((entry) => entry.code)) {
      expect(formatCurrency(25, locale)).toBe(formatCurrency(25, locale, "EUR"));
    }
  });

  it("puts the symbol after the number in every non-English locale", () => {
    for (const locale of LOCALES_WITH_SUFFIX) {
      expect(currencyAffix(locale).position).toBe("suffix");
      expect(formatCurrency(10, locale).replace(/\s/g, "").endsWith("€")).toBe(true);
    }
  });
});
