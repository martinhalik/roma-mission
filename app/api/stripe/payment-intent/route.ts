import { NextRequest, NextResponse } from "next/server";
import { resolveCharge, toMinorUnits } from "@/lib/donations";
import {
  countryOverrideAllowed,
  GEO_COUNTRY_COOKIE,
  resolveVisitorCountry,
} from "@/lib/geo";
import { createStripeClient } from "@/lib/stripe-server";

const stripe = createStripeClient();

function visitorCountry(req: NextRequest): string | null {
  return resolveVisitorCountry({
    headerCountry: req.headers.get("x-vercel-ip-country"),
    queryCountry: req.nextUrl.searchParams.get("country"),
    cookieCountry: req.cookies.get(GEO_COUNTRY_COOKIE)?.value ?? null,
    allowOverride: countryOverrideAllowed(),
  });
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

  const paymentIntent = await stripe.paymentIntents.create({
    amount: toMinorUnits(resolved.amount, resolved.currency),
    currency: resolved.currency,
    description: "One-Time Donation — Roma Mission",
    automatic_payment_methods: { enabled: true },
  });

  return NextResponse.json({ clientSecret: paymentIntent.client_secret });
}
