import Stripe from "stripe";

/**
 * Stripe client for the donation API routes.
 *
 * STRIPE_API_HOST / STRIPE_API_PORT / STRIPE_API_PROTOCOL point the SDK at a
 * local mock during end-to-end capture. They are unset in production, so live
 * and test requests still go to api.stripe.com.
 */
export function createStripeClient(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY ?? "";
  const host = process.env.STRIPE_API_HOST;
  if (!host) return new Stripe(key);

  const protocol = process.env.STRIPE_API_PROTOCOL === "https" ? "https" : "http";
  return new Stripe(key, {
    host,
    protocol,
    port: process.env.STRIPE_API_PORT ?? "80",
  });
}
