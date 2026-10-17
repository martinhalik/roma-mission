import { afterEach, describe, expect, it, vi } from "vitest";
import type { Locale } from "../../../lib/i18n/locales";
import { currencyAffix, formatCurrency, parseLocalizedAmount, sentenceAfterAmount } from "../../../lib/i18n/format";
import { DICTIONARIES } from "../../../lib/i18n";
import { CURRENCIES, defaultCurrency } from "../../../lib/donations";

const AMOUNTS = {
  en: { 25: "$25", 1250: "$1,250", 25.5: "$25.50" },
  de: { 25: "25 €", 1250: "1.250 €", 25.5: "25,50 €" },
  ro: { 25: "25 lei", 1250: "1.250 lei", 25.5: "25,50 lei" },
  sr: { 25: "25 дин.", 1250: "1.250 дин.", 25.5: "25,50 дин." },
  mk: { 25: "25 ден.", 1250: "1.250 ден.", 25.5: "25,50 ден." },
  el: { 25: "25 €", 1250: "1.250 €", 25.5: "25,50 €" },
  sk: { 25: "25 €", 1250: "1 250 €", 25.5: "25,50 €" },
  cs: { 25: "25 Kč", 1250: "1 250 Kč", 25.5: "25,50 Kč" },
  ru: { 25: "25 $", 1250: "1 250 $", 25.5: "25,50 $" },
} as const satisfies Record<Locale, { 25: string; 1250: string; 25.5: string }>;

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

  it("formats English euros with the same separators and a euro prefix", () => {
    expect(formatCurrency(25, "en", "eur")).toBe("€25");
    expect(formatCurrency(1250, "en", "eur")).toBe("€1,250");
    expect(formatCurrency(25.5, "en", "eur")).toBe("€25.50");
    expect(currencyAffix("en", "eur")).toEqual({ symbol: "€", position: "prefix" });
    expect(currencyAffix("en", "usd")).toEqual({ symbol: "$", position: "prefix" });
  });

  it("formats a Czech preset with a space and a koruna suffix", () => {
    expect(formatCurrency(250, "cs")).toBe("250 Kč");
    expect(formatCurrency(12500, "cs")).toBe("12 500 Kč");
  });

  it("puts the dollar sign after the amount in Russian", () => {
    expect(currencyAffix("ru")).toEqual({ symbol: "$", position: "suffix" });
    expect(formatCurrency(1250, "ru")).toBe("1 250 $");
  });

  it("does not depend on Intl currency display", () => {
    vi.spyOn(Intl, "NumberFormat").mockImplementation(() => {
      throw new Error("currency formatting must not consult Intl");
    });

    expect(formatCurrency(25, "mk")).toBe("25 ден.");
    expect(formatCurrency(1250, "en")).toBe("$1,250");
    expect(formatCurrency(1250, "en", "eur")).toBe("€1,250");
    expect(formatCurrency(1250, "de")).toBe("1.250 €");
    expect(formatCurrency(1250, "sk")).toBe("1 250 €");
    expect(formatCurrency(25.5, "sk")).toBe("25,50 €");
    expect(formatCurrency(25.5, "ro")).toBe("25,50 lei");
    expect(formatCurrency(25.5, "ru")).toBe("25,50 $");
    expect(currencyAffix("el").position).toBe("suffix");
  });
});

const MINIMUM_MESSAGE: Record<Locale, string> = {
  en: "Minimum amount is $0.50.",
  sk: "Minimálna suma je 0,50 €.",
  cs: "Minimální částka je 15 Kč.",
  ro: "Suma minimă este 2 lei.",
  de: "Der Mindestbetrag ist 0,50 €.",
  sr: "Минимални износ је 50 дин.",
  ru: "Минимальная сумма — 0,50 $.",
  mk: "Минималниот износ е 30 ден.",
  el: "Το ελάχιστο ποσό είναι 0,50 €.",
};

describe("minimum amount message", () => {
  it.each(Object.entries(MINIMUM_MESSAGE) as [Locale, string][])(
    "keeps a single sentence period for %s",
    (locale, expected) => {
      const currency = defaultCurrency(locale);
      const formatted = formatCurrency(CURRENCIES[currency].minimum, locale, currency);
      const message = sentenceAfterAmount(
        DICTIONARIES[locale].donation.amountTooLow,
        formatted,
      );
      expect(message).toBe(expected);
      expect(message).not.toMatch(/\.\./);
    },
  );

  it("does not double the period after Serbian and Macedonian abbreviations", () => {
    expect(sentenceAfterAmount("Минимални износ је {amount}.", "50 дин.")).toBe(
      "Минимални износ је 50 дин.",
    );
    expect(sentenceAfterAmount("Минималниот износ е {amount}.", "30 ден.")).toBe(
      "Минималниот износ е 30 ден.",
    );
  });
});

describe("parseLocalizedAmount", () => {
  it("accepts a comma or a dot in comma-decimal locales", () => {
    expect(parseLocalizedAmount("25,50", "sk")).toBe(25.5);
    expect(parseLocalizedAmount("25.50", "sk")).toBe(25.5);
    expect(parseLocalizedAmount("1.250,50", "de")).toBe(1250.5);
    expect(parseLocalizedAmount("1,250.50", "sr")).toBe(1250.5);
    expect(parseLocalizedAmount("1 250,50", "cs")).toBe(1250.5);
    expect(parseLocalizedAmount("0,25", "mk")).toBe(0.25);
  });

  it("keeps the comma as a thousands separator in English", () => {
    expect(parseLocalizedAmount("25.50", "en")).toBe(25.5);
    expect(parseLocalizedAmount("1,250.50", "en")).toBe(1250.5);
    expect(parseLocalizedAmount("25,50", "en")).toBe(2550);
  });

  it("rejects values that are not a single non-negative number", () => {
    expect(parseLocalizedAmount("", "en")).toBe(0);
    expect(parseLocalizedAmount("abc", "de")).toBe(0);
    expect(parseLocalizedAmount("-5", "en")).toBe(0);
    expect(parseLocalizedAmount("1,2,3", "sk")).toBe(0);
  });
});
