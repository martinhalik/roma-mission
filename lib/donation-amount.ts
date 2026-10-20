import type { Locale } from "./i18n/locales";

/**
 * Stripe's charge cap is 99,999,999 minor units. Every donation currency
 * here has two decimal places, so the major-unit maximum is 999,999.99.
 */
export const MAX_DONATION_MINOR = 99_999_999;

export type ParsedDonationAmount =
  | { ok: true; minor: number }
  | { ok: false; reason: "empty" }
  | { ok: false; reason: "invalid" }
  | { ok: false; reason: "aboveMaximum"; minor: number | null };

/**
 * English groups with "," and writes decimals with ".".
 * Every other locale groups with "." and writes decimals with ",".
 * (Slovak, Czech, and Russian display groups as spaces; those spaces are
 * removed before this choice, and a typed "." is still a group mark.)
 */
function groupSeparator(locale: Locale): "," | "." {
  return locale === "en" ? "," : ".";
}

function decimalSeparator(locale: Locale): "," | "." {
  return locale === "en" ? "." : ",";
}

function invalid(): ParsedDonationAmount {
  return { ok: false, reason: "invalid" };
}

function fromMinor(minor: number): ParsedDonationAmount {
  if (!Number.isSafeInteger(minor) || minor < 0) return invalid();
  if (minor > MAX_DONATION_MINOR) return { ok: false, reason: "aboveMaximum", minor };
  return { ok: true, minor };
}

/** Whole digits plus a 1- or 2-digit fraction, using integer math only. */
function minorFromParts(wholeDigits: string, fractionDigits: string): ParsedDonationAmount {
  if (!/^\d+$/.test(wholeDigits) || !/^\d{0,2}$/.test(fractionDigits)) return invalid();
  const whole = wholeDigits.replace(/^0+/, "") || "0";
  if (whole.length > 15) return { ok: false, reason: "aboveMaximum", minor: null };
  const fraction = fractionDigits.padEnd(2, "0");
  const minor = Number(whole) * 100 + Number(fraction);
  return fromMinor(minor);
}

function groupsAreValid(parts: string[]): boolean {
  if (parts.length === 0 || parts.some((part) => part.length === 0)) return false;
  if (!/^\d{1,3}$/.test(parts[0])) return false;
  return parts.slice(1).every((part) => /^\d{3}$/.test(part));
}

/**
 * Reads a custom donation amount as minor units (cents).
 *
 * The same function feeds the button label and, on the server, the Stripe
 * payload. It never rounds: more than two non-zero decimal digits is invalid,
 * and anything above {@link MAX_DONATION_MINOR} is `aboveMaximum`.
 */
export function parseDonationAmount(raw: string, locale: Locale): ParsedDonationAmount {
  const trimmed = raw.trim();
  if (!trimmed) return { ok: false, reason: "empty" };

  const cleaned = trimmed
    .replace(/[\s\u00A0\u202F]/g, "")
    .replace(/дин\.|ден\.|kč|usd|eur|czk|ron|rsd|mkd|lei|дин|ден|\$|€/gi, "");

  if (!cleaned) return invalid();
  if (!/^[\d.,]+$/.test(cleaned)) return invalid();

  const commaCount = cleaned.split(",").length - 1;
  const dotCount = cleaned.split(".").length - 1;

  if (commaCount > 0 && dotCount > 0) return parseMixed(cleaned);
  if (commaCount + dotCount > 1) return parseGrouped(cleaned, commaCount > 0 ? "," : ".");
  if (commaCount + dotCount === 1) {
    return parseSingle(cleaned, commaCount === 1 ? "," : ".", locale);
  }
  return minorFromParts(cleaned, "");
}

/** Both separators: the last one is the decimal mark, the other groups by 3. */
function parseMixed(value: string): ParsedDonationAmount {
  const lastDot = value.lastIndexOf(".");
  const lastComma = value.lastIndexOf(",");
  const decimalIndex = Math.max(lastDot, lastComma);
  const groupSep = lastDot > lastComma ? "," : ".";
  const whole = value.slice(0, decimalIndex);
  const fraction = value.slice(decimalIndex + 1);
  if (!/^\d{1,2}$/.test(fraction)) return invalid();
  if (whole.includes(groupSep === "," ? "." : ",")) return invalid();
  const parts = whole.split(groupSep);
  if (!groupsAreValid(parts)) return invalid();
  return minorFromParts(parts.join(""), fraction);
}

/** One separator, repeated: it is a thousands separator. */
function parseGrouped(value: string, separator: "," | "."): ParsedDonationAmount {
  const parts = value.split(separator);
  if (!groupsAreValid(parts)) return invalid();
  return minorFromParts(parts.join(""), "");
}

/**
 * One separator, once.
 * 1–2 digits after it: always the decimal mark.
 * Exactly 3: the locale's group mark builds an integer; its decimal mark is
 * a fractional value, and a non-zero third digit is invalid (no rounding).
 * More than 3, or a bare leading mark: only ",5" / ".50" style (0.x) is kept.
 */
function parseSingle(value: string, separator: "," | "." , locale: Locale): ParsedDonationAmount {
  const splitAt = value.indexOf(separator);
  const before = value.slice(0, splitAt);
  const after = value.slice(splitAt + 1);
  if (!/^\d*$/.test(before) || !/^\d+$/.test(after)) return invalid();

  if (before.length === 0) {
    if (after.length === 1 || after.length === 2) return minorFromParts("0", after);
    return invalid();
  }

  if (after.length === 1 || after.length === 2) return minorFromParts(before, after);

  if (after.length === 3) {
    if (separator === groupSeparator(locale)) {
      if (!/^\d{1,3}$/.test(before)) return invalid();
      return minorFromParts(before + after, "");
    }
    if (separator === decimalSeparator(locale)) {
      if (after[2] !== "0") return invalid();
      return minorFromParts(before, after.slice(0, 2));
    }
  }

  return invalid();
}

function numberHasExtraFraction(amount: number): boolean {
  const text = String(amount);
  if (/e/i.test(text)) {
    const fraction = amount.toFixed(8).split(".")[1] ?? "";
    return /[1-9]/.test(fraction.slice(2));
  }
  const fraction = text.split(".")[1];
  return Boolean(fraction && fraction.length > 2);
}

/** Numeric JSON amounts: exact cents only, never rounded. */
export function minorUnitsFromNumber(
  amount: number,
): { ok: true; minor: number } | { ok: false; reason: "invalid" | "aboveMaximum" } {
  if (typeof amount !== "number" || !Number.isFinite(amount) || amount <= 0) {
    return { ok: false, reason: "invalid" };
  }
  if (numberHasExtraFraction(amount)) return { ok: false, reason: "invalid" };
  const scaled = amount * 100;
  const minor = Math.round(scaled);
  if (!Number.isSafeInteger(minor) || Math.abs(scaled - minor) > 1e-6) {
    return { ok: false, reason: "invalid" };
  }
  if (minor > MAX_DONATION_MINOR) return { ok: false, reason: "aboveMaximum" };
  return { ok: true, minor };
}

/**
 * Server entry for a request amount. Strings are parsed with
 * {@link parseDonationAmount} so the charge uses the same rules as the label.
 * A missing locale only accepts an unambiguous `25` or `25.50`.
 */
export function minorUnitsOfAmount(
  amount: unknown,
  locale: Locale | null,
): { ok: true; minor: number } | { ok: false; reason: "invalid" | "aboveMaximum" } {
  if (typeof amount === "number") return minorUnitsFromNumber(amount);
  if (typeof amount !== "string") return { ok: false, reason: "invalid" };

  if (!locale) {
    if (!/^\d+(\.\d{1,2})?$/.test(amount)) return { ok: false, reason: "invalid" };
    const parsed = parseDonationAmount(amount, "en");
    if (!parsed.ok) {
      return { ok: false, reason: parsed.reason === "aboveMaximum" ? "aboveMaximum" : "invalid" };
    }
    if (parsed.minor <= 0) return { ok: false, reason: "invalid" };
    return { ok: true, minor: parsed.minor };
  }

  const parsed = parseDonationAmount(amount, locale);
  if (!parsed.ok) {
    return { ok: false, reason: parsed.reason === "aboveMaximum" ? "aboveMaximum" : "invalid" };
  }
  if (parsed.minor <= 0) return { ok: false, reason: "invalid" };
  return { ok: true, minor: parsed.minor };
}
