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
 * Symbol position and digit separators are fixed per locale. Intl currency
 * formatting is not used: Node and Chromium disagree for some locales (mk
 * renders "25 €" in Node and "€25" in Chromium), which breaks hydration.
 * English is "€1,250.50". de/ro/sr/mk/el are "1.250,50 €". sk/cs/ru are "1 250,50 €".
 */
const EURO_PREFIX_LOCALES = new Set<Locale>(["en"]);

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

export function currencyAffix(locale: Locale): CurrencyAffix {
  return {
    symbol: EURO_SYMBOL,
    position: EURO_PREFIX_LOCALES.has(locale) ? "prefix" : "suffix",
  };
}

/** Formats a donation amount in EUR. Whole amounts omit decimals. */
export function formatCurrency(amount: number, locale: Locale): string {
  const numeric = formatDonationNumber(amount, locale);
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
