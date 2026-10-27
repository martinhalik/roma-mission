import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { DONATION_CURRENCY, normalizeDonorEmail } from "@/lib/donations";
import { createStripeClient } from "@/lib/stripe-server";
import { toStripeCheckoutLocale } from "@/lib/stripe-locale";

const stripe = createStripeClient();

// Preset amounts live in lib/donations.ts and are rendered by DonationModal.
// This route does not look up Stripe Prices: every amount, preset or custom,
// is an inline EUR price_data line item. Legacy USD Prices
// (lookup_key monthly_donation_<amount>) stay in the Stripe account and are
// never selected for an EUR session.
const DONATION_DESCRIPTION =
  "Supporting Orthodox mission to Roma communities in Eastern Europe";

type LineItem = Stripe.Checkout.SessionCreateParams.LineItem;

function buildMonthlyLineItem(unitAmount: number): LineItem {
  return {
    price_data: {
      currency: DONATION_CURRENCY,
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

function buildOneTimeLineItem(unitAmount: number): LineItem {
  return {
    price_data: {
      currency: DONATION_CURRENCY,
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
  const { amount, isMonthly, email, locale } = await req.json();

  if (!amount || amount < 1) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const donorEmail = normalizeDonorEmail(email);
  if (!donorEmail) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  const unitAmount = Math.round(amount * 100);

  const lineItem = isMonthly
    ? buildMonthlyLineItem(unitAmount)
    : buildOneTimeLineItem(unitAmount);

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: isMonthly ? "subscription" : "payment",
    line_items: [lineItem],
    return_url: `${baseUrl}/thank-you`,
    customer_email: donorEmail,
    locale: toStripeCheckoutLocale(locale),
  });

  return NextResponse.json({ clientSecret: session.client_secret });
}
