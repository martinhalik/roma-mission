/**
 * Capture the exact params the donation API routes send to Stripe.
 *
 * Speaks to a local mock of the Stripe API (never api.stripe.com, never a
 * live key). Start the Next server first with:
 *
 *   STRIPE_SECRET_KEY=sk_test_mock \
 *   STRIPE_API_HOST=127.0.0.1 \
 *   STRIPE_API_PORT=12111 \
 *   STRIPE_API_PROTOCOL=http \
 *   npm run dev -- --port 3000
 *
 * A real test-mode Checkout Session still needs STRIPE_SECRET_KEY=sk_test_...
 * from the Stripe dashboard. This script does not create one.
 */
import http from "node:http";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const PORT = Number(process.env.STRIPE_API_PORT ?? 12111);
const APP = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const OUT = process.env.OUT_DIR ?? "/opt/cursor/artifacts/stripe";

function assignForm(target, key, value) {
  const parts = key.split(/\[|\]/).filter((part) => part.length > 0);
  let cursor = target;
  for (let i = 0; i < parts.length - 1; i += 1) {
    const part = parts[i];
    const next = parts[i + 1];
    if (cursor[part] == null) cursor[part] = /^\d+$/.test(next) ? [] : {};
    cursor = cursor[part];
  }
  cursor[parts[parts.length - 1]] = value;
}

function parseForm(raw) {
  const parsed = {};
  const params = new URLSearchParams(raw);
  for (const [key, value] of params) assignForm(parsed, key, value);
  return parsed;
}

const captured = [];

const server = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  const contentType = req.headers["content-type"] ?? "";
  const body = contentType.includes("application/x-www-form-urlencoded")
    ? parseForm(raw)
    : raw;

  captured.push({
    method: req.method,
    url: req.url,
    body,
  });

  const isPaymentIntent = (req.url ?? "").startsWith("/v1/payment_intents");
  const currency = body.currency ?? body.line_items?.[0]?.price_data?.currency ?? "eur";
  const payload = isPaymentIntent
    ? {
        id: "pi_mock",
        object: "payment_intent",
        client_secret: "pi_mock_secret",
        currency,
        amount: Number(body.amount ?? 0),
        status: "requires_payment_method",
      }
    : {
        id: "cs_mock",
        object: "checkout.session",
        client_secret: "cs_mock_secret",
        currency,
        mode: body.mode ?? "payment",
        status: "open",
      };

  res.writeHead(200, {
    "Content-Type": "application/json",
    "Request-Id": "req_mock",
  });
  res.end(JSON.stringify(payload));
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
console.log(`mock stripe listening on ${PORT}`);

const locales = [
  { locale: "en", currency: "usd", onetime: 30, monthly: 25, custom: 40 },
  { locale: "sk", currency: "eur", onetime: 30, monthly: 25, custom: 40 },
  { locale: "de", currency: "eur", onetime: 30, monthly: 25, custom: 40 },
  { locale: "el", currency: "eur", onetime: 30, monthly: 25, custom: 40 },
  { locale: "cs", currency: "czk", onetime: 750, monthly: 600, custom: 400 },
  { locale: "ro", currency: "ron", onetime: 150, monthly: 125, custom: 80 },
  { locale: "sr", currency: "rsd", onetime: 3500, monthly: 3000, custom: 2000 },
  { locale: "ru", currency: "usd", onetime: 30, monthly: 25, custom: 40 },
  { locale: "mk", currency: "mkd", onetime: 1800, monthly: 1500, custom: 900 },
];

const cases = [
  {
    name: "checkout-missing-locale-eur-fallback",
    path: "/api/stripe/checkout",
    body: { amount: 30, isMonthly: false, currency: "usd" },
    expectStatus: 200,
    note: "Unknown or missing locale falls back to EUR and ignores the client currency.",
  },
];

for (const item of locales) {
  cases.push(
    {
      name: `checkout-onetime-${item.locale}`,
      path: "/api/stripe/checkout",
      body: { amount: item.onetime, isMonthly: false, locale: item.locale, currency: item.currency },
      expectStatus: 200,
    },
    {
      name: `checkout-monthly-preset-${item.locale}`,
      path: "/api/stripe/checkout",
      body: { amount: item.monthly, isMonthly: true, locale: item.locale, currency: item.currency },
      expectStatus: 200,
    },
    {
      name: `checkout-monthly-custom-${item.locale}`,
      path: "/api/stripe/checkout",
      body: { amount: item.custom, isMonthly: true, locale: item.locale, currency: item.currency },
      expectStatus: 200,
    },
    {
      name: `checkout-monthly-fallback-${item.locale}`,
      path: "/api/stripe/checkout",
      body: { amount: item.monthly, isMonthly: true, locale: item.locale, currency: item.currency },
      expectStatus: 200,
      note: "Same inline price_data path as a preset. No Stripe Price is looked up.",
    },
    {
      name: `payment-intent-${item.locale}`,
      path: "/api/stripe/payment-intent",
      body: { amount: item.onetime, locale: item.locale, currency: item.currency },
      expectStatus: 200,
    },
  );
}

cases.push(
  {
    name: "checkout-en-non-us-eur",
    path: "/api/stripe/checkout",
    headers: { "x-vercel-ip-country": "DE" },
    body: { amount: 25, isMonthly: true, locale: "en", currency: "eur" },
    expectStatus: 200,
  },
  {
    name: "checkout-en-us-usd",
    path: "/api/stripe/checkout",
    headers: { "x-vercel-ip-country": "US" },
    body: { amount: 25, isMonthly: true, locale: "en", currency: "usd" },
    expectStatus: 200,
  },
  {
    name: "checkout-en-us-eur-rejected",
    path: "/api/stripe/checkout",
    headers: { "x-vercel-ip-country": "US" },
    body: { amount: 25, isMonthly: true, locale: "en", currency: "eur" },
    expectStatus: 400,
  },
  {
    name: "checkout-de-usd-rejected",
    path: "/api/stripe/checkout",
    body: { amount: 25, isMonthly: false, locale: "de", currency: "usd" },
    expectStatus: 400,
  },
  {
    name: "checkout-sk-usd-rejected",
    path: "/api/stripe/checkout",
    body: { amount: 25, isMonthly: false, locale: "sk", currency: "usd" },
    expectStatus: 400,
  },
  {
    name: "checkout-ru-eur-rejected",
    path: "/api/stripe/checkout",
    body: { amount: 25, isMonthly: false, locale: "ru", currency: "eur" },
    expectStatus: 400,
  },
  {
    name: "payment-intent-en-us-eur-rejected",
    path: "/api/stripe/payment-intent",
    headers: { "x-vercel-ip-country": "US" },
    body: { amount: 30, locale: "en", currency: "eur" },
    expectStatus: 400,
  },
  {
    name: "checkout-cs-below-minimum",
    path: "/api/stripe/checkout",
    body: { amount: 10, isMonthly: false, locale: "cs", currency: "czk" },
    expectStatus: 400,
  },
);

await mkdir(OUT, { recursive: true });

for (const item of cases) {
  const before = captured.length;
  const response = await fetch(`${APP}${item.path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(item.headers ?? {}) },
    body: JSON.stringify(item.body),
  });
  const json = await response.json();
  const outgoing = captured.slice(before);
  const rejected = item.expectStatus === 400;
  if (response.status !== item.expectStatus || (rejected ? outgoing.length !== 0 : outgoing.length === 0)) {
    console.error(item.name, response.status, json, outgoing);
    server.close();
    process.exit(1);
  }
  const record = {
    request: item.body,
    headers: item.headers ?? null,
    note: item.note ?? null,
    appStatus: response.status,
    appResponse: json,
    stripeRequests: outgoing,
  };
  const file = path.join(OUT, `${item.name}.json`);
  await writeFile(file, `${JSON.stringify(record, null, 2)}\n`);
  const currency =
    outgoing[0]?.body?.currency ??
    outgoing[0]?.body?.line_items?.[0]?.price_data?.currency ??
    "rejected";
  console.log(item.name, response.status, "currency=", currency);
}

const summary = {
  mock: true,
  liveStripe: false,
  realTestModeSession: "not created — needs STRIPE_SECRET_KEY=sk_test_... before merge",
  files: cases.map((item) => `${item.name}.json`),
};
await writeFile(path.join(OUT, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
server.close();
console.log("wrote", OUT);
