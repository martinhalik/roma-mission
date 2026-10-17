import { isLocale, type Locale } from "./i18n/locales";

/**
 * Donation currencies.
 *
 * Exchange rates used to pick preset ladders (not for charging — Stripe is
 * given the major-unit amount as-is):
 *
 * ECB euro foreign-exchange reference rates, 16 October 2026:
 *   USD 1.1253, CZK 24.323, RON 5.3310 per 1 EUR.
 *   RSD and MKD are not in the ECB list. Presets for those two assume
 *   117 RSD and 61.5 MKD per 1 EUR (historical pegs, for approval).
 *   RUB publication has been suspended since 1 March 2022. The Russian
 *   locale does not use RUB: Martin decided it charges USD only.
 *
 * USD (en default, and ru) keeps the existing round ladder rather than an
 * FX conversion of the euro steps. 10 EUR ≈ 11.25 USD on that date.
 *
 * Stripe presentment currencies (docs.stripe.com/currencies, checked
 * 16 October 2026): USD, EUR, CZK, RON, RSD, MKD are all presentment
 * currencies. None of them is zero-decimal, and none is in the special-case
 * list (ISK, HUF, TWD, UGX), so the minor unit is 100.
 * Documented minimums: USD 0.50, EUR 0.50, CZK 15.00, RON 2.00.
 * RSD and MKD are absent from that table. Their floors below are a
 * US$0.50 equivalent at the assumed rates (50 RSD, 30 MKD) and must be
 * confirmed against the settlement currency on the SK account.
 */

export type DonationCurrency = "usd" | "eur" | "czk" | "ron" | "rsd" | "mkd";

/** Wallet Payment Request country. The Stripe account is Slovak. */
export const PAYMENT_REQUEST_COUNTRY = "SK";

export const CURRENCY_CHOICE_KEY = "donation-currency";

interface CurrencySpec {
  iso: string;
  symbol: string;
  minorUnitFactor: number;
  minimum: number;
}

export const CURRENCIES: Record<DonationCurrency, CurrencySpec> = {
  usd: { iso: "USD", symbol: "$", minorUnitFactor: 100, minimum: 0.5 },
  eur: { iso: "EUR", symbol: "€", minorUnitFactor: 100, minimum: 0.5 },
  czk: { iso: "CZK", symbol: "Kč", minorUnitFactor: 100, minimum: 15 },
  ron: { iso: "RON", symbol: "lei", minorUnitFactor: 100, minimum: 2 },
  rsd: { iso: "RSD", symbol: "дин.", minorUnitFactor: 100, minimum: 50 },
  mkd: { iso: "MKD", symbol: "ден.", minorUnitFactor: 100, minimum: 30 },
};

/**
 * Currencies a locale may charge. `en` is narrowed to USD for US visitors
 * in `allowedCurrencies`. `ru` is USD only, with no euro option.
 */
const LOCALE_CURRENCIES: Record<Locale, readonly DonationCurrency[]> = {
  en: ["usd", "eur"],
  sk: ["eur"],
  cs: ["czk"],
  ro: ["ron"],
  de: ["eur"],
  sr: ["rsd"],
  ru: ["usd"],
  mk: ["mkd"],
  el: ["eur"],
};

const PRESETS: Record<
  DonationCurrency,
  { monthly: readonly number[]; onetime: readonly number[] }
> = {
  usd: { monthly: [10, 25, 50, 100], onetime: [30, 100, 250, 500] },
  eur: { monthly: [10, 25, 50, 100], onetime: [30, 100, 250, 500] },
  czk: { monthly: [250, 600, 1250, 2500], onetime: [750, 2500, 6000, 12500] },
  ron: { monthly: [50, 125, 250, 500], onetime: [150, 500, 1250, 2500] },
  rsd: { monthly: [1200, 3000, 6000, 12000], onetime: [3500, 12000, 30000, 60000] },
  mkd: { monthly: [600, 1500, 3000, 6000], onetime: [1800, 6000, 15000, 30000] },
};

export function isDonationCurrency(value: unknown): value is DonationCurrency {
  return typeof value === "string" && Object.prototype.hasOwnProperty.call(CURRENCIES, value);
}

export function defaultCurrency(locale: Locale): DonationCurrency {
  return LOCALE_CURRENCIES[locale][0];
}

/** Allowlist for a locale and a resolved country. Null country is non-US. */
export function allowedCurrencies(
  locale: Locale,
  country: string | null,
): readonly DonationCurrency[] {
  if (locale === "en" && country === "US") return ["usd"];
  return LOCALE_CURRENCIES[locale];
}

export function monthlyPresets(currency: DonationCurrency): readonly number[] {
  return PRESETS[currency].monthly;
}

export function onetimePresets(currency: DonationCurrency): readonly number[] {
  return PRESETS[currency].onetime;
}

/** Marketing bullets: the monthly ladder without its smallest step. */
export function marketingAmounts(currency: DonationCurrency): readonly number[] {
  return PRESETS[currency].monthly.slice(1);
}

export function toMinorUnits(amount: number, currency: DonationCurrency): number {
  return Math.round(amount * CURRENCIES[currency].minorUnitFactor);
}

export function equivalentPreset(
  amount: number,
  from: DonationCurrency,
  to: DonationCurrency,
  frequency: "monthly" | "onetime",
): number {
  const source = frequency === "monthly" ? monthlyPresets(from) : onetimePresets(from);
  const target = frequency === "monthly" ? monthlyPresets(to) : onetimePresets(to);
  const index = source.indexOf(amount);
  if (index < 0) return target[target.length - 1];
  return target[index];
}

export type ChargeSuccess = {
  ok: true;
  currency: DonationCurrency;
  /** Null when the request had no known locale and EUR was used instead. */
  locale: Locale | null;
  amount: number;
};

export type ChargeFailure = {
  ok: false;
  status: 400;
  error: string;
};

/**
 * Server-side charge decision. A missing or unknown locale falls back to EUR
 * and ignores the client currency. A known locale with a currency outside its
 * allowlist is rejected. Country must already be resolved from the request
 * header (or a non-production override), never from the JSON body.
 */
export function resolveCharge(input: {
  locale: unknown;
  currency: unknown;
  country: string | null;
  amount: unknown;
}): ChargeSuccess | ChargeFailure {
  const locale =
    typeof input.locale === "string" && isLocale(input.locale) ? input.locale : null;

  let currency: DonationCurrency;
  if (!locale) {
    currency = "eur";
  } else if (input.currency == null || input.currency === "") {
    currency = defaultCurrency(locale);
  } else if (
    !isDonationCurrency(input.currency) ||
    !allowedCurrencies(locale, input.country).includes(input.currency)
  ) {
    return { ok: false, status: 400, error: "Currency not allowed" };
  } else {
    currency = input.currency;
  }

  if (typeof input.amount !== "number" || !Number.isFinite(input.amount) || input.amount <= 0) {
    return { ok: false, status: 400, error: "Invalid amount" };
  }

  if (input.amount + Number.EPSILON < CURRENCIES[currency].minimum) {
    return { ok: false, status: 400, error: "Amount below minimum" };
  }

  return { ok: true, currency, locale, amount: input.amount };
}
