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

/**
 * Calendar dates and relative times are fixed strings, not Intl.
 * Node ships Macedonian locale data and Chromium does not, so
 * `Intl.DateTimeFormat("mk")` and `Intl.RelativeTimeFormat("mk")` rendered
 * `13 сеп.` / `пред 29 дена` on the server and `Sep 13` / `29 days ago` in
 * the browser (React #418 on /mk/vo-zivo). The phrases below match the
 * strings full-ICU Node already produced, including plural forms.
 *
 * The calendar day is UTC. The server and the browser then share one
 * month and day even when their local zones differ.
 */

const SHORT_MONTHS: Record<Locale, readonly string[]> = {
  en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  de: ["Jan.", "Feb.", "März", "Apr.", "Mai", "Juni", "Juli", "Aug.", "Sept.", "Okt.", "Nov.", "Dez."],
  el: ["Ιαν", "Φεβ", "Μαρ", "Απρ", "Μαΐ", "Ιουν", "Ιουλ", "Αυγ", "Σεπ", "Οκτ", "Νοε", "Δεκ"],
  ro: ["ian.", "feb.", "mar.", "apr.", "mai", "iun.", "iul.", "aug.", "sept.", "oct.", "nov.", "dec."],
  sr: ["јан", "феб", "мар", "апр", "мај", "јун", "јул", "авг", "сеп", "окт", "нов", "дец"],
  mk: ["јан.", "фев.", "мар.", "апр.", "мај", "јун.", "јул.", "авг.", "сеп.", "окт.", "ное.", "дек."],
  ru: ["янв.", "февр.", "мар.", "апр.", "мая", "июн.", "июл.", "авг.", "сент.", "окт.", "нояб.", "дек."],
  // sk/cs `month: "short"` is the month number ("13. 9."), not a name.
  sk: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
  cs: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"],
};

/** Long month as it appears in a full date (genitive where the locale uses it). */
const LONG_MONTHS: Record<Locale, readonly string[]> = {
  en: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  sk: ["januára", "februára", "marca", "apríla", "mája", "júna", "júla", "augusta", "septembra", "októbra", "novembra", "decembra"],
  cs: ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"],
  ro: ["ianuarie", "februarie", "martie", "aprilie", "mai", "iunie", "iulie", "august", "septembrie", "octombrie", "noiembrie", "decembrie"],
  de: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
  sr: ["јануар", "фебруар", "март", "април", "мај", "јун", "јул", "август", "септембар", "октобар", "новембар", "децембар"],
  ru: ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"],
  mk: ["јануари", "февруари", "март", "април", "мај", "јуни", "јули", "август", "септември", "октомври", "ноември", "декември"],
  el: ["Ιανουαρίου", "Φεβρουαρίου", "Μαρτίου", "Απριλίου", "Μαΐου", "Ιουνίου", "Ιουλίου", "Αυγούστου", "Σεπτεμβρίου", "Οκτωβρίου", "Νοεμβρίου", "Δεκεμβρίου"],
};

type ShortOrder = "month-day" | "day-month" | "day-dot-month" | "day-dot-num";
type LongOrder =
  | "month-day-year"
  | "day-month-year"
  | "day-dot-month-year"
  | "day-dot-month-year-dot"
  | "day-month-year-g";

const SHORT_ORDER: Record<Locale, ShortOrder> = {
  en: "month-day",
  sk: "day-dot-num",
  cs: "day-dot-num",
  de: "day-dot-month",
  sr: "day-dot-month",
  el: "day-month",
  ro: "day-month",
  mk: "day-month",
  ru: "day-month",
};

const LONG_ORDER: Record<Locale, LongOrder> = {
  en: "month-day-year",
  sk: "day-dot-month-year",
  cs: "day-dot-month-year",
  de: "day-dot-month-year",
  sr: "day-dot-month-year-dot",
  el: "day-month-year",
  ro: "day-month-year",
  mk: "day-month-year-g",
  ru: "day-month-year-g",
};

interface UtcDateParts {
  year: number;
  monthIndex: number;
  day: number;
}

function utcDateParts(input: Date | string | number): UtcDateParts | null {
  const date = input instanceof Date ? input : new Date(input);
  const time = date.getTime();
  if (Number.isNaN(time)) return null;
  return {
    year: date.getUTCFullYear(),
    monthIndex: date.getUTCMonth(),
    day: date.getUTCDate(),
  };
}

function formatShortFromParts(parts: UtcDateParts, locale: Locale): string {
  const month = SHORT_MONTHS[locale][parts.monthIndex];
  const day = parts.day;
  switch (SHORT_ORDER[locale]) {
    case "month-day":
      return `${month} ${day}`;
    case "day-month":
      return `${day} ${month}`;
    case "day-dot-month":
      return `${day}. ${month}`;
    case "day-dot-num":
      return `${day}. ${month}.`;
  }
}

function formatLongFromParts(parts: UtcDateParts, locale: Locale): string {
  const month = LONG_MONTHS[locale][parts.monthIndex];
  const { day, year } = parts;
  switch (LONG_ORDER[locale]) {
    case "month-day-year":
      return `${month} ${day}, ${year}`;
    case "day-month-year":
      return `${day} ${month} ${year}`;
    case "day-dot-month-year":
      return `${day}. ${month} ${year}`;
    case "day-dot-month-year-dot":
      return `${day}. ${month} ${year}.`;
    case "day-month-year-g":
      return `${day} ${month} ${year} г.`;
  }
}

/** "Sep 13" / "13 сеп." — the feed date once a post is 30 days old or more. */
export function formatShortDate(date: Date | string | number, locale: Locale): string {
  const parts = utcDateParts(date);
  if (!parts) return "";
  return formatShortFromParts(parts, locale);
}

export function formatDate(date: Date | string, locale: Locale): string {
  const parts = utcDateParts(date);
  if (!parts) return "";
  return formatLongFromParts(parts, locale);
}

export type RelativeUnit = "minute" | "hour" | "day";

type PluralSlot = "one" | "few" | "many" | "other";

interface UnitPhrases {
  /** Elapsed count of 0 ("today", "this minute"). */
  zero: string;
  /** Whole word used only for count 1 ("yesterday"). */
  oneWord?: string;
  /** Whole word used only for count 2 ("vorgestern"). */
  twoWord?: string;
  /** Templates may include `{n}`. */
  one: string;
  few?: string;
  many?: string;
  other: string;
}

const RELATIVE: Record<Locale, Record<RelativeUnit, UnitPhrases>> = {
  en: {
    minute: { zero: "this minute", one: "{n} minute ago", other: "{n} minutes ago" },
    hour: { zero: "this hour", one: "{n} hour ago", other: "{n} hours ago" },
    day: { zero: "today", oneWord: "yesterday", one: "{n} day ago", other: "{n} days ago" },
  },
  de: {
    minute: { zero: "in dieser Minute", one: "vor {n} Minute", other: "vor {n} Minuten" },
    hour: { zero: "in dieser Stunde", one: "vor {n} Stunde", other: "vor {n} Stunden" },
    day: {
      zero: "heute",
      oneWord: "gestern",
      twoWord: "vorgestern",
      one: "vor {n} Tag",
      other: "vor {n} Tagen",
    },
  },
  el: {
    minute: { zero: "τρέχον λεπτό", one: "πριν από {n} λεπτό", other: "πριν από {n} λεπτά" },
    hour: { zero: "τρέχουσα ώρα", one: "πριν από {n} ώρα", other: "πριν από {n} ώρες" },
    day: {
      zero: "σήμερα",
      oneWord: "χθες",
      twoWord: "προχθές",
      one: "πριν από {n} ημέρα",
      other: "πριν από {n} ημέρες",
    },
  },
  sk: {
    minute: { zero: "v tejto minúte", one: "pred {n} minútou", other: "pred {n} minútami" },
    hour: { zero: "v tejto hodine", one: "pred {n} hodinou", other: "pred {n} hodinami" },
    day: {
      zero: "dnes",
      oneWord: "včera",
      twoWord: "predvčerom",
      one: "pred {n} dňami",
      other: "pred {n} dňami",
    },
  },
  cs: {
    minute: { zero: "tuto minutu", one: "před {n} minutou", other: "před {n} minutami" },
    hour: { zero: "tuto hodinu", one: "před {n} hodinou", other: "před {n} hodinami" },
    day: {
      zero: "dnes",
      oneWord: "včera",
      twoWord: "předevčírem",
      one: "před {n} dny",
      other: "před {n} dny",
    },
  },
  ro: {
    minute: {
      zero: "minutul acesta",
      one: "acum {n} minut",
      few: "acum {n} minute",
      many: "acum {n} de minute",
      other: "acum {n} minute",
    },
    hour: {
      zero: "ora aceasta",
      one: "acum {n} oră",
      few: "acum {n} ore",
      many: "acum {n} de ore",
      other: "acum {n} ore",
    },
    day: {
      zero: "azi",
      oneWord: "ieri",
      twoWord: "alaltăieri",
      one: "acum {n} zi",
      few: "acum {n} zile",
      many: "acum {n} de zile",
      other: "acum {n} zile",
    },
  },
  sr: {
    minute: {
      zero: "овог минута",
      one: "пре {n} минута",
      few: "пре {n} минута",
      many: "пре {n} минута",
      other: "пре {n} минута",
    },
    hour: {
      zero: "овог сата",
      one: "пре {n} сата",
      few: "пре {n} сата",
      many: "пре {n} сати",
      other: "пре {n} сати",
    },
    day: {
      zero: "данас",
      oneWord: "јуче",
      twoWord: "прекјуче",
      one: "пре {n} дана",
      few: "пре {n} дана",
      many: "пре {n} дана",
      other: "пре {n} дана",
    },
  },
  ru: {
    minute: {
      zero: "в эту минуту",
      one: "{n} минуту назад",
      few: "{n} минуты назад",
      many: "{n} минут назад",
      other: "{n} минут назад",
    },
    hour: {
      zero: "в этот час",
      one: "{n} час назад",
      few: "{n} часа назад",
      many: "{n} часов назад",
      other: "{n} часов назад",
    },
    day: {
      zero: "сегодня",
      oneWord: "вчера",
      twoWord: "позавчера",
      one: "{n} день назад",
      few: "{n} дня назад",
      many: "{n} дней назад",
      other: "{n} дней назад",
    },
  },
  mk: {
    minute: { zero: "оваа минута", one: "пред {n} минута", other: "пред {n} минути" },
    hour: { zero: "часов", one: "пред {n} час", other: "пред {n} часа" },
    day: {
      zero: "денес",
      oneWord: "вчера",
      twoWord: "завчера",
      one: "пред {n} ден",
      other: "пред {n} дена",
    },
  },
};

function pluralSlot(locale: Locale, n: number): PluralSlot {
  if (locale === "ru" || locale === "sr") {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "one";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
    return "many";
  }
  if (locale === "mk") {
    return n % 10 === 1 && n % 100 !== 11 ? "one" : "other";
  }
  if (locale === "ro") {
    if (n === 1) return "one";
    const mod100 = n % 100;
    if (mod100 === 0 || mod100 >= 20) return "many";
    return "few";
  }
  return n === 1 ? "one" : "other";
}

function renderPhrase(forms: UnitPhrases, n: number, slot: PluralSlot): string {
  if (n === 0) return forms.zero;
  if (n === 1 && forms.oneWord) return forms.oneWord;
  if (n === 2 && forms.twoWord) return forms.twoWord;
  const template = forms[slot] ?? forms.other;
  return template.replaceAll("{n}", String(n));
}

/** Past relative time. `elapsed` is a non-negative count of `unit`. */
export function formatRelativeTime(elapsed: number, unit: RelativeUnit, locale: Locale): string {
  const n = Number.isFinite(elapsed) ? Math.max(0, Math.round(elapsed)) : 0;
  return renderPhrase(RELATIVE[locale][unit], n, pluralSlot(locale, n));
}

const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;

/**
 * Feed timestamp. `now` is the server clock passed into the page, so the
 * server render and hydration describe the same instant.
 */
export function formatRelativeDate(iso: string, locale: Locale, now: number): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = now - then;
  const minutes = Math.round(diffMs / MINUTE_MS);
  const hours = Math.round(diffMs / HOUR_MS);
  const days = Math.round(diffMs / DAY_MS);
  if (minutes < 60) return formatRelativeTime(minutes, "minute", locale);
  if (hours < 24) return formatRelativeTime(hours, "hour", locale);
  if (days < 30) return formatRelativeTime(days, "day", locale);
  return formatShortDate(then, locale);
}

export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(BCP47[locale]).format(value);
}
