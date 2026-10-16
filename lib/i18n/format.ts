import { DONATION_CURRENCY_ISO } from "../donations";
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

const EURO_SYMBOL = "€";
/** Normal space, identical on the server and in every browser. */
const EURO_GAP = " ";

/**
 * Symbol position is fixed per locale. Intl currency formatting is not used:
 * Node and Chromium disagree for some locales (mk renders "25 €" in Node and
 * "€25" in Chromium), which breaks hydration.
 * English is "€25". Every other locale is "25 €".
 */
const EURO_PREFIX_LOCALES = new Set<Locale>(["en"]);

export interface CurrencyAffix {
  symbol: string;
  position: "prefix" | "suffix";
}

function formatDonationNumber(amount: number): string {
  const negative = amount < 0;
  const absolute = Math.abs(amount);
  const digits = Number.isInteger(absolute) ? absolute.toString() : absolute.toFixed(2);
  return negative ? `-${digits}` : digits;
}

export function currencyAffix(
  locale: Locale,
  _currency: string = DONATION_CURRENCY_ISO
): CurrencyAffix {
  return {
    symbol: EURO_SYMBOL,
    position: EURO_PREFIX_LOCALES.has(locale) ? "prefix" : "suffix",
  };
}

export function formatCurrency(
  amount: number,
  locale: Locale,
  _currency: string = DONATION_CURRENCY_ISO
): string {
  const numeric = formatDonationNumber(amount);
  const affix = currencyAffix(locale);
  if (affix.position === "prefix") return `${affix.symbol}${numeric}`;
  return `${numeric}${EURO_GAP}${affix.symbol}`;
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
