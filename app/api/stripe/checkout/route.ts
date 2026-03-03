import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { amount, isMonthly } = await req.json();

  if (!amount || amount < 1) {
    return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_URL ?? "http://localhost:3000";

  const priceData: Stripe.Checkout.SessionCreateParams.LineItem.PriceData = {
    currency: "usd",
    product_data: {
      name: isMonthly ? "Monthly Donation — Roma Mission" : "One-Time Donation — Roma Mission",
      description: "Supporting Orthodox mission to Roma communities in Eastern Europe",
    },
    unit_amount: Math.round(amount * 100),
    ...(isMonthly ? { recurring: { interval: "month" } } : {}),
  };

  const session = await stripe.checkout.sessions.create({
    ui_mode: "embedded",
    mode: isMonthly ? "subscription" : "payment",
    line_items: [{ price_data: priceData, quantity: 1 }],
    return_url: `${baseUrl}/get-involved?success=true`,
  });

  return NextResponse.json({ clientSecret: session.client_secret });
}
