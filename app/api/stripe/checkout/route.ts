import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { normalizeDonorEmail, resolveCharge, type DonationCurrency } from "@/lib/donations";
import { toStripeCheckoutLocale } from "@/lib/stripe-locale";
import {
  countryOverrideAllowed,
  GEO_COUNTRY_COOKIE,
  resolveVisitorCountry,
} from "@/lib/geo";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";
import { buildPath } from "@/lib/i18n/routes";
import { createStripeClient } from "@/lib/stripe-server";

const stripe = createStripeClient();

// Preset amounts live in lib/donations.ts and are rendered by DonationModal.
// Every amount, preset or custom, is an inline price_data line item. Legacy
// USD Prices (lookup_key monthly_donation_<amount>) are not queried.
const DONATION_DESCRIPTION =
  "Supporting Orthodox mission to Roma communities in Eastern Europe";

type LineItem = Stripe.Checkout.SessionCreateParams.LineItem;

function visitorCountry(req: NextRequest): string | null {
  return resolveVisitorCountry({
    headerCountry: req.headers.get("x-vercel-ip-country"),
    queryCountry: req.nextUrl.searchParams.get("country"),
    cookieCountry: req.cookies.get(GEO_COUNTRY_COOKIE)?.value ?? null,
    allowOverride: countryOverrideAllowed(),
  });
}

function buildMonthlyLineItem(unitAmount: number, currency: DonationCurrency): LineItem {
  return {
    price_data: {
      currency,
      product_data: {
        name: "Monthly Donation — Roma Mission",
        description: DONATION_DESCRIPTION,
      },
      unit_amount: unitAmount,
      recurring: { interval: "month" },
    },
    quantity: 1,
  };
}

function buildOneTimeLineItem(unitAmount: number, currency: DonationCurrency): LineItem {
  return {
    price_data: {
      currency,
      product_data: {
        name: "One-Time Donation — Roma Mission",
        description: DONATION_DESCRIPTION,
      },
      unit_amount: unitAmount,
    },
    quantity: 1,
  };
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const resolved = resolveCharge({
    locale: body.locale,
    currency: body.currency,
    country: visitorCountry(req),
    amount: body.amount,
  });

  if (!resolved.ok) {
    return NextResponse.json({ error: resolved.error }, { status: resolved.status });
  }

  const donorEmail = normalizeDonorEmail(body.email);
  if (!donorEmail) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  const unitAmount = resolved.minor;
  const lineItem = body.isMonthly
    ? buildMonthlyLineItem(unitAmount, resolved.currency)
    : buildOneTimeLineItem(unitAmount, resolved.currency);
  const thankYou = buildPath(resolved.locale ?? DEFAULT_LOCALE, "thankYou");

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: body.isMonthly ? "subscription" : "payment",
    line_items: [lineItem],
    return_url: `${baseUrl}${thankYou}`,
    customer_email: donorEmail,
    locale: toStripeCheckoutLocale(resolved.locale),
  });

  return NextResponse.json({ clientSecret: session.client_secret });
}
