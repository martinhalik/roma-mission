import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: NextRequest) {
  const { amount, paymentMethodId, email, name } = await req.json();

  if (!amount || amount < 1 || !paymentMethodId) {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const customer = await stripe.customers.create({
    email: email ?? undefined,
    name: name ?? undefined,
    payment_method: paymentMethodId,
    invoice_settings: { default_payment_method: paymentMethodId },
  });

  const price = await stripe.prices.create({
    unit_amount: Math.round(amount * 100),
    currency: "usd",
    recurring: { interval: "month" },
    product_data: { name: "Monthly Donation — Roma Mission" },
  });

  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: price.id }],
    payment_behavior: "default_incomplete",
    expand: ["latest_invoice.payment_intent"],
  });

  const invoice = subscription.latest_invoice as Stripe.Invoice;
  const paymentIntent = invoice.payment_intent as Stripe.PaymentIntent;

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
