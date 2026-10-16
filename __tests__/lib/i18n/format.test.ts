import { afterEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "../../../lib/i18n/locales";
import { currencyAffix, formatCurrency } from "../../../lib/i18n/format";

const EXACT: Record<Locale, string> = {
  en: "€25",
  sk: "25 €",
  cs: "25 €",
  ro: "25 €",
  de: "25 €",
  sr: "25 €",
  ru: "25 €",
  mk: "25 €",
  el: "25 €",
};

describe("formatCurrency", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(Object.entries(EXACT) as [Locale, string][])(
    "formats 25 EUR for %s as %s",
    (locale, expected) => {
      expect(formatCurrency(25, locale)).toBe(expected);
      expect(formatCurrency(25, locale)).not.toMatch(/[\u00A0$]|USD/);
    }
  );

  it("uses a normal space before a trailing euro sign", () => {
    expect(formatCurrency(25, "mk")).toBe("25 €");
    expect(formatCurrency(25, "de").codePointAt(2)).toBe(0x20);
    expect(currencyAffix("en")).toEqual({ symbol: "€", position: "prefix" });
    expect(currencyAffix("mk")).toEqual({ symbol: "€", position: "suffix" });
  });

  it("does not depend on Intl currency display", () => {
    vi.spyOn(Intl, "NumberFormat").mockImplementation(() => {
      throw new Error("currency formatting must not consult Intl");
    });

    expect(formatCurrency(25, "mk")).toBe("25 €");
    expect(formatCurrency(25, "en")).toBe("€25");
    expect(formatCurrency(1000, "de")).toBe("1000 €");
    expect(formatCurrency(25.5, "sk")).toBe("25.50 €");
    expect(currencyAffix("mk").position).toBe("suffix");
  });

  it("defaults to EUR when no currency is passed", () => {
    for (const locale of Object.keys(EXACT) as Locale[]) {
      expect(formatCurrency(25, locale)).toBe(formatCurrency(25, locale, "EUR"));
      expect(formatCurrency(25, locale)).toBe(EXACT[locale]);
    }
  });
});
