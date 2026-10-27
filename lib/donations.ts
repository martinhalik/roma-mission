/** Stripe currency code. Every locale is charged in euros. */
export const DONATION_CURRENCY = "eur";

/** ISO 4217 code passed to Intl.NumberFormat. */
export const DONATION_CURRENCY_ISO = "EUR";

/**
 * Two-letter country of the Stripe account for the Payment Request (wallet)
 * button. Roma Mission is a registered Slovak non-profit, and Slovakia is in
 * the eurozone, so the wallet sheet is created for an SK / EUR account.
 */
export const PAYMENT_REQUEST_COUNTRY = "SK";

/** Monthly preset buttons in components/DonationModal.tsx. */
export const MONTHLY_PRESET_AMOUNTS = [10, 25, 50, 100] as const;

/** One-time preset buttons in components/DonationModal.tsx. */
export const ONETIME_PRESET_AMOUNTS = [30, 100, 250, 500] as const;

const DONOR_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Trimmed donor email, or null when the value cannot receive a receipt. */
export function normalizeDonorEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim();
  if (email.length === 0 || email.length > 254) return null;
  if (!DONOR_EMAIL_PATTERN.test(email)) return null;
  return email;
}
