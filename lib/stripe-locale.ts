import type Stripe from "stripe";
import type { Locale } from "@/lib/i18n/locales";

/**
 * Checkout Session `locale` values this Stripe API version accepts.
 * Serbian (sr) and Macedonian (mk) are site locales Stripe Checkout does not
 * offer, so those sessions use `auto` and follow the donor's browser.
 */
const STRIPE_CHECKOUT_LOCALES: Partial<
  Record<Locale, Stripe.Checkout.SessionCreateParams.Locale>
> = {
  en: "en",
  sk: "sk",
  cs: "cs",
  ro: "ro",
  de: "de",
  ru: "ru",
  el: "el",
};

export function toStripeCheckoutLocale(
  locale: unknown,
): Stripe.Checkout.SessionCreateParams.Locale {
  if (typeof locale !== "string") return "auto";
  return STRIPE_CHECKOUT_LOCALES[locale as Locale] ?? "auto";
}
