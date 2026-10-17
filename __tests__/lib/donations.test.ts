import { describe, expect, it } from "vitest";
import { LOCALES } from "../../lib/i18n/locales";
import {
  CURRENCIES,
  allowedCurrencies,
  defaultCurrency,
  marketingAmounts,
  monthlyPresets,
  onetimePresets,
  resolveCharge,
  toMinorUnits,
} from "../../lib/donations";

describe("donation currency config", () => {
  it("gives every locale a single default currency", () => {
    expect(defaultCurrency("en")).toBe("usd");
    expect(defaultCurrency("sk")).toBe("eur");
    expect(defaultCurrency("de")).toBe("eur");
    expect(defaultCurrency("el")).toBe("eur");
    expect(defaultCurrency("cs")).toBe("czk");
    expect(defaultCurrency("ro")).toBe("ron");
    expect(defaultCurrency("sr")).toBe("rsd");
    expect(defaultCurrency("mk")).toBe("mkd");
    expect(defaultCurrency("ru")).toBe("usd");
    expect(LOCALES).toHaveLength(9);
  });

  it("allows EUR for English only outside the US, and USD only for Russian", () => {
    expect(allowedCurrencies("en", null)).toEqual(["usd", "eur"]);
    expect(allowedCurrencies("en", "DE")).toEqual(["usd", "eur"]);
    expect(allowedCurrencies("en", "US")).toEqual(["usd"]);
    expect(allowedCurrencies("ru", null)).toEqual(["usd"]);
    expect(allowedCurrencies("ru", "US")).toEqual(["usd"]);
    expect(allowedCurrencies("de", null)).toEqual(["eur"]);
    expect(allowedCurrencies("sk", "US")).toEqual(["eur"]);
  });

  it("uses the same preset ladder for Russian and English dollars", () => {
    expect(monthlyPresets("usd")).toEqual([10, 25, 50, 100]);
    expect(onetimePresets("usd")).toEqual([30, 100, 250, 500]);
    expect(monthlyPresets("eur")).toEqual([10, 25, 50, 100]);
    expect(monthlyPresets("czk")).toEqual([250, 600, 1250, 2500]);
    expect(onetimePresets("czk")).toEqual([750, 2500, 6000, 12500]);
    expect(monthlyPresets("ron")).toEqual([50, 125, 250, 500]);
    expect(onetimePresets("ron")).toEqual([150, 500, 1250, 2500]);
    expect(monthlyPresets("rsd")).toEqual([1200, 3000, 6000, 12000]);
    expect(onetimePresets("rsd")).toEqual([3500, 12000, 30000, 60000]);
    expect(monthlyPresets("mkd")).toEqual([600, 1500, 3000, 6000]);
    expect(onetimePresets("mkd")).toEqual([1800, 6000, 15000, 30000]);
    expect(marketingAmounts("czk")).toEqual([600, 1250, 2500]);
    expect(marketingAmounts("usd")).toEqual([25, 50, 100]);
  });

  it("converts every currency to minor units with a factor of 100", () => {
    for (const currency of Object.keys(CURRENCIES) as (keyof typeof CURRENCIES)[]) {
      expect(CURRENCIES[currency].minorUnitFactor).toBe(100);
      expect(toMinorUnits(25.5, currency)).toBe(2550);
      expect(toMinorUnits(CURRENCIES[currency].minimum, currency)).toBe(
        Math.round(CURRENCIES[currency].minimum * 100),
      );
    }
  });

  it("rejects a currency outside the locale allowlist and falls back when locale is missing", () => {
    expect(resolveCharge({ locale: "de", currency: "usd", country: null, amount: 25 }).ok).toBe(false);
    expect(resolveCharge({ locale: "sk", currency: "usd", country: null, amount: 25 }).ok).toBe(false);
    expect(resolveCharge({ locale: "ru", currency: "eur", country: null, amount: 25 }).ok).toBe(false);
    expect(resolveCharge({ locale: "en", currency: "eur", country: "US", amount: 25 }).ok).toBe(false);
    expect(resolveCharge({ locale: "en", currency: "eur", country: null, amount: 25 })).toMatchObject({
      ok: true,
      currency: "eur",
    });
    expect(resolveCharge({ locale: "ru", currency: "usd", country: null, amount: 25 })).toMatchObject({
      ok: true,
      currency: "usd",
    });
    expect(resolveCharge({ locale: undefined, currency: "usd", country: "US", amount: 25 })).toMatchObject({
      ok: true,
      currency: "eur",
      locale: null,
    });
    expect(resolveCharge({ locale: "xx", currency: "czk", country: null, amount: 25 })).toMatchObject({
      ok: true,
      currency: "eur",
    });
  });

  it("enforces the Stripe minimum for the resolved currency", () => {
    expect(resolveCharge({ locale: "cs", currency: "czk", country: null, amount: 10 })).toMatchObject({
      ok: false,
      error: "Amount below minimum",
    });
    expect(resolveCharge({ locale: "cs", currency: "czk", country: null, amount: 15 })).toMatchObject({
      ok: true,
      currency: "czk",
    });
    expect(resolveCharge({ locale: "ro", currency: "ron", country: null, amount: 1 })).toMatchObject({
      ok: false,
      error: "Amount below minimum",
    });
    expect(resolveCharge({ locale: "en", currency: "usd", country: "US", amount: 0.49 })).toMatchObject({
      ok: false,
      error: "Amount below minimum",
    });
    expect(resolveCharge({ locale: "en", currency: "usd", country: "US", amount: 0.5 })).toMatchObject({
      ok: true,
    });
    expect(resolveCharge({ locale: "en", currency: "usd", country: null, amount: 0 })).toMatchObject({
      ok: false,
      error: "Invalid amount",
    });
  });
});
