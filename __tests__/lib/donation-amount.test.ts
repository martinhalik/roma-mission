import { describe, expect, it } from "vitest";
import {
  MAX_DONATION_MINOR,
  minorUnitsFromNumber,
  minorUnitsOfAmount,
  parseDonationAmount,
  type ParsedDonationAmount,
} from "../../lib/donation-amount";
import type { Locale } from "../../lib/i18n/locales";

const LOCALES = ["en", "de", "sk", "cs", "ro", "sr", "mk", "el", "ru"] as const satisfies readonly Locale[];

const ok = (minor: number): ParsedDonationAmount => ({ ok: true, minor });
const invalid: ParsedDonationAmount = { ok: false, reason: "invalid" };
const empty: ParsedDonationAmount = { ok: false, reason: "empty" };
const above = (minor: number | null): ParsedDonationAmount => ({
  ok: false,
  reason: "aboveMaximum",
  minor,
});

const SHARED: Array<[string, ParsedDonationAmount]> = [
  ["25,5", ok(2550)],
  ["0,50", ok(50)],
  ["25.5", ok(2550)],
  ["25.50", ok(2550)],
  ["25,50", ok(2550)],
  ["1,250.00", ok(125000)],
  ["1.250,00", ok(125000)],
  ["1 250,50", ok(125050)],
  ["1\u00A0250", ok(125000)],
  ["1\u202F250,50", ok(125050)],
  [",5", ok(50)],
  [".5", ok(50)],
  [",50", ok(50)],
  [".50", ok(50)],
  ["$1,250.00", ok(125000)],
  ["1 250 €", ok(125000)],
  ["€1.250,00", ok(125000)],
  ["25 USD", ok(2500)],
  ["25,50 EUR", ok(2550)],
  ["1,250.5", ok(125050)],
  ["1,2,3", invalid],
  ["1,2,3.4", invalid],
  ["1e3", invalid],
  ["-5", invalid],
  ["-1,50", invalid],
  ["abc", invalid],
  ["12a", invalid],
  [".500", invalid],
  [",555", invalid],
  ["1.2500", invalid],
  ["25.", invalid],
  ["", empty],
  ["   ", empty],
  ["$", invalid],
  ["999999.99", ok(MAX_DONATION_MINOR)],
  ["999999,99", ok(MAX_DONATION_MINOR)],
  ["1000000", above(100000000)],
  ["99999999999", above(9999999999900)],
];

describe("parseDonationAmount", () => {
  it.each(LOCALES.flatMap((locale) => SHARED.map(([raw, expected]) => [locale, raw, expected] as const)))(
    "%s parses %j",
    (locale, raw, expected) => {
      const parsed = parseDonationAmount(raw, locale);
      expect(parsed).toEqual(expected);
      if (parsed.ok) {
        expect(minorUnitsOfAmount(raw, locale)).toEqual({ ok: true, minor: parsed.minor });
      }
    },
  );

  it.each(LOCALES)("treats a single group of three by the %s convention", (locale) => {
    if (locale === "en") {
      expect(parseDonationAmount("1,250", locale)).toEqual(ok(125000));
      expect(parseDonationAmount("1.250", locale)).toEqual(ok(125));
      expect(parseDonationAmount("25,555", locale)).toEqual(ok(2555500));
      expect(parseDonationAmount("25.555", locale)).toEqual(invalid);
      expect(parseDonationAmount("25.550", locale)).toEqual(ok(2555));
      expect(parseDonationAmount("999,999.99", locale)).toEqual(ok(MAX_DONATION_MINOR));
      expect(parseDonationAmount("1,250,000", locale)).toEqual(above(125000000));
      return;
    }

    expect(parseDonationAmount("1.250", locale)).toEqual(ok(125000));
    expect(parseDonationAmount("1,250", locale)).toEqual(ok(125));
    expect(parseDonationAmount("25,555", locale)).toEqual(invalid);
    expect(parseDonationAmount("25.555", locale)).toEqual(ok(2555500));
    expect(parseDonationAmount("25,550", locale)).toEqual(ok(2555));
    expect(parseDonationAmount("999.999,99", locale)).toEqual(ok(MAX_DONATION_MINOR));
    expect(parseDonationAmount("1.250.000", locale)).toEqual(above(125000000));
  });

  it("strips each locale's currency symbol or code", () => {
    expect(parseDonationAmount("1 250 Kč", "cs")).toEqual(ok(125000));
    expect(parseDonationAmount("1.250 lei", "ro")).toEqual(ok(125000));
    expect(parseDonationAmount("1.250 дин.", "sr")).toEqual(ok(125000));
    expect(parseDonationAmount("1.250 ден.", "mk")).toEqual(ok(125000));
    expect(parseDonationAmount("25 $", "ru")).toEqual(ok(2500));
  });

  it("does not round a third non-zero decimal into a charge", () => {
    expect(parseDonationAmount("25,555", "de")).toEqual(invalid);
    expect(parseDonationAmount("25.555", "en")).toEqual(invalid);
    expect(minorUnitsFromNumber(25.555)).toEqual({ ok: false, reason: "invalid" });
    expect(minorUnitsFromNumber(25.5)).toEqual({ ok: true, minor: 2550 });
    expect(minorUnitsFromNumber(999999.99)).toEqual({ ok: true, minor: MAX_DONATION_MINOR });
    expect(minorUnitsFromNumber(1000000)).toEqual({ ok: false, reason: "aboveMaximum" });
    expect(minorUnitsFromNumber(99999999999)).toEqual({ ok: false, reason: "aboveMaximum" });
  });
});
