import {
  CURRENCIES,
  defaultCurrency,
  type DonationCurrency,
} from "@/lib/donations";
import type { Locale } from "./locales";

const BCP47: Record<Locale, string> = {
  en: "en-US",
  sk: "sk-SK",
  cs: "cs-CZ",
  ro: "ro-RO",
  de: "de-DE",
  sr: "sr-Cyrl-RS",
  ru: "ru-RU",
  mk: "mk-MK",
  el: "el-GR",
};

/** Normal space, identical on the server and in every browser. */
const SYMBOL_GAP = " ";

/**
 * Symbol position and digit separators are fixed. Intl currency formatting is
 * not used: Node and Chromium disagree for some locales (mk renders "25 €"
 * in Node and "€25" in Chromium), which breaks hydration.
 *
 * English, USD or EUR, uses a prefix and comma grouping: `$1,250.50`, `€1,250.50`.
 * de/ro/sr/mk/el use a suffix and dot grouping: `1.250,50 €`, `1.250 дин.`.
 * sk/cs/ru use a suffix and a normal space: `1 250,50 €`, `1 250 Kč`, `1 250 $`.
 */
const PREFIX_LOCALES = new Set<Locale>(["en"]);

interface DigitSeparators {
  group: string;
  decimal: string;
}

const DIGIT_SEPARATORS: Record<Locale, DigitSeparators> = {
  en: { group: ",", decimal: "." },
  de: { group: ".", decimal: "," },
  ro: { group: ".", decimal: "," },
  sr: { group: ".", decimal: "," },
  mk: { group: ".", decimal: "," },
  el: { group: ".", decimal: "," },
  sk: { group: " ", decimal: "," },
  cs: { group: " ", decimal: "," },
  ru: { group: " ", decimal: "," },
};

export interface CurrencyAffix {
  symbol: string;
  position: "prefix" | "suffix";
}

function formatDonationNumber(amount: number, locale: Locale): string {
  const negative = amount < 0;
  const absolute = Math.abs(amount);
  const fixed = Number.isInteger(absolute)
    ? Math.trunc(absolute).toString()
    : absolute.toFixed(2);
  const [whole, fraction] = fixed.split(".");
  const { group, decimal } = DIGIT_SEPARATORS[locale];
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, group);
  const numeric = fraction ? `${grouped}${decimal}${fraction}` : grouped;
  return negative ? `-${numeric}` : numeric;
}

export function currencyAffix(
  locale: Locale,
  currency: DonationCurrency = defaultCurrency(locale),
): CurrencyAffix {
  return {
    symbol: CURRENCIES[currency].symbol,
    position: PREFIX_LOCALES.has(locale) ? "prefix" : "suffix",
  };
}

/**
 * Formats a donation amount in the locale's currency (or an explicit one,
 * for the English euro option). Whole amounts omit decimals.
 */
export function formatCurrency(
  amount: number,
  locale: Locale,
  currency: DonationCurrency = defaultCurrency(locale),
): string {
  const numeric = formatDonationNumber(amount, locale);
  const affix = currencyAffix(locale, currency);
  if (affix.position === "prefix") return `${affix.symbol}${numeric}`;
  return `${numeric}${SYMBOL_GAP}${affix.symbol}`;
}

export function formatDate(date: Date | string, locale: Locale): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(BCP47[locale], {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(BCP47[locale]).format(value);
}

/**
 * Fills `{amount}` and drops a sentence period that would double an
 * abbreviation already ending in "." (`50 дин.`, `30 ден.`).
 */
export function sentenceAfterAmount(template: string, amount: string): string {
  const text = template.replaceAll("{amount}", amount);
  if (amount.endsWith(".") && text.endsWith("..")) return text.slice(0, -1);
  return text;
}

/**
 * Formats minor units with the same separators as {@link formatCurrency}.
 * Custom donation labels use this so the button cannot round independently
 * of the integer that Stripe is charged.
 */
export function formatCurrencyFromMinor(
  minor: number,
  locale: Locale,
  currency: DonationCurrency = defaultCurrency(locale),
): string {
  const negative = minor < 0;
  const absolute = Math.abs(minor);
  const whole = Math.trunc(absolute / 100);
  const fraction = absolute % 100;
  const { group, decimal } = DIGIT_SEPARATORS[locale];
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, group);
  const numeric =
    fraction === 0 ? grouped : `${grouped}${decimal}${String(fraction).padStart(2, "0")}`;
  const signed = negative ? `-${numeric}` : numeric;
  const affix = currencyAffix(locale, currency);
  if (affix.position === "prefix") return `${affix.symbol}${signed}`;
  return `${signed}${SYMBOL_GAP}${affix.symbol}`;
}
