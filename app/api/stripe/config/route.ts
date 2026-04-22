import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET() {
  try {
    const account = await stripe.accounts.retrieve();
    const caps = account.capabilities ?? {};
    return NextResponse.json(
      {
        card: caps.card_payments === "active",
        paypal: caps.paypal_payments === "active",
      },
      {
        headers: {
          "Cache-Control": "public, max-age=300, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch {
    return NextResponse.json({ card: true, paypal: false });
  }
}
