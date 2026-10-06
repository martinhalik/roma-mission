import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// Fixed monthly prices on the "Monthly Donation — Roma Mission" product.
// Keep in sync with MONTHLY_AMOUNTS in components/DonationModal.tsx.
const MONTHLY_PRESET_AMOUNTS = [10, 25, 50, 100];
const MONTHLY_LOOKUP_KEY_PREFIX = "monthly_donation_";

const DONATION_DESCRIPTION =
  "Supporting Orthodox mission to Roma communities in Eastern Europe";

type LineItem = Stripe.Checkout.SessionCreateParams.LineItem;

async function getMonthlyPresetPrices(): Promise<Stripe.Price[]> {
  const { data } = await stripe.prices.list({
    lookup_keys: MONTHLY_PRESET_AMOUNTS.map(
      (amt) => `${MONTHLY_LOOKUP_KEY_PREFIX}${amt}`
    ),
    active: true,
  });
  return data;
}

function getProductId(price: Stripe.Price): string {
  return typeof price.product === "string" ? price.product : price.product.id;
}

async function buildMonthlyLineItem(unitAmount: number): Promise<LineItem> {
  const presetPrices = await getMonthlyPresetPrices();

  const presetPrice = presetPrices.find((p) => p.unit_amount === unitAmount);
  if (presetPrice) return { price: presetPrice.id, quantity: 1 };

  // Custom amount: one-off price, but on the same product as the presets.
  if (presetPrices.length > 0) {
    return {
      price_data: {
        currency: "usd",
        product: getProductId(presetPrices[0]),
        unit_amount: unitAmount,
        recurring: { interval: "month" },
      },
      quantity: 1,
    };
  }

  // Fallback when the preset prices aren't set up (e.g. a fresh test account).
  return {
    price_data: {
      currency: "usd",
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
      currency: "usd",
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
  const { amount, isMonthly } = await req.json();

  if (!amount || amount < 1) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";
  const unitAmount = Math.round(amount * 100);

  const lineItem = isMonthly
    ? await buildMonthlyLineItem(unitAmount)
    : buildOneTimeLineItem(unitAmount);

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: isMonthly ? "subscription" : "payment",
    line_items: [lineItem],
    return_url: `${baseUrl}/thank-you`,
  });

  return NextResponse.json({ clientSecret: session.client_secret });
}
