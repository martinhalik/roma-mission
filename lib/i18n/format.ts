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

export function formatCurrency(
  amount: number,
  locale: Locale,
  currency: string = DONATION_CURRENCY_ISO
): string {
  return new Intl.NumberFormat(BCP47[locale], {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: Number.isInteger(amount) ? 0 : 2,
  }).format(amount);
}

export interface CurrencyAffix {
  symbol: string;
  position: "prefix" | "suffix";
}

/** Where the currency symbol sits for a locale, derived from Intl (never hard-coded). */
export function currencyAffix(
  locale: Locale,
  currency: string = DONATION_CURRENCY_ISO
): CurrencyAffix {
  const parts = new Intl.NumberFormat(BCP47[locale], {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
    maximumFractionDigits: 0,
  }).formatToParts(0);
  const symbol = parts.find((part) => part.type === "currency")?.value ?? currency;
  const currencyIndex = parts.findIndex((part) => part.type === "currency");
  const numberIndex = parts.findIndex((part) => part.type === "integer");
  const position =
    currencyIndex >= 0 && numberIndex >= 0 && currencyIndex < numberIndex
      ? "prefix"
      : "suffix";
  return { symbol, position };
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
