/**
 * Capture the exact params the donation API routes send to Stripe.
 *
 * Speaks to a local mock of the Stripe API (never api.stripe.com, never a
 * live key). Start the Next server first with:
 *
 *   STRIPE_SECRET_KEY=sk_test_mock_eur \
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
  const payload = isPaymentIntent
    ? {
        id: "pi_mock_eur",
        object: "payment_intent",
        client_secret: "pi_mock_eur_secret",
        currency: "eur",
        amount: Number(body.amount ?? 0),
        status: "requires_payment_method",
      }
    : {
        id: "cs_mock_eur",
        object: "checkout.session",
        client_secret: "cs_mock_eur_secret",
        currency: "eur",
        mode: body.mode ?? "payment",
        status: "open",
      };

  res.writeHead(200, {
    "Content-Type": "application/json",
    "Request-Id": "req_mock_eur",
  });
  res.end(JSON.stringify(payload));
});

await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));
console.log(`mock stripe listening on ${PORT}`);

const cases = [
  {
    name: "checkout-one-time",
    path: "/api/stripe/checkout",
    body: { amount: 30, isMonthly: false },
  },
  {
    name: "checkout-monthly-preset-10",
    path: "/api/stripe/checkout",
    body: { amount: 10, isMonthly: true },
  },
  {
    name: "checkout-monthly-preset-25",
    path: "/api/stripe/checkout",
    body: { amount: 25, isMonthly: true },
  },
  {
    name: "checkout-monthly-preset-50",
    path: "/api/stripe/checkout",
    body: { amount: 50, isMonthly: true },
  },
  {
    name: "checkout-monthly-preset-100",
    path: "/api/stripe/checkout",
    body: { amount: 100, isMonthly: true },
  },
  {
    name: "checkout-monthly-custom",
    path: "/api/stripe/checkout",
    body: { amount: 30, isMonthly: true },
  },
  {
    name: "checkout-monthly-fallback",
    path: "/api/stripe/checkout",
    body: { amount: 25, isMonthly: true },
    note: "Same inline price_data path as a preset. No Stripe Price is looked up, so a missing dashboard Price still charges EUR.",
  },
  {
    name: "payment-intent",
    path: "/api/stripe/payment-intent",
    body: { amount: 30 },
  },
];

await mkdir(OUT, { recursive: true });

for (const item of cases) {
  const before = captured.length;
  const response = await fetch(`${APP}${item.path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(item.body),
  });
  const json = await response.json();
  const outgoing = captured.slice(before);
  if (!response.ok || outgoing.length === 0) {
    console.error(item.name, response.status, json, outgoing);
    server.close();
    process.exit(1);
  }
  const record = {
    request: item.body,
    note: item.note ?? null,
    appStatus: response.status,
    appResponse: json,
    stripeRequests: outgoing,
  };
  const file = path.join(OUT, `${item.name}.json`);
  await writeFile(file, `${JSON.stringify(record, null, 2)}\n`);
  const currency =
    outgoing[0]?.body?.currency ??
    outgoing[0]?.body?.line_items?.[0]?.price_data?.currency;
  console.log(item.name, "currency=", currency);
}

const summary = {
  mock: true,
  liveStripe: false,
  realTestModeSession: "not created — needs STRIPE_SECRET_KEY=sk_test_... before merge",
  currency: "eur",
  files: cases.map((item) => `${item.name}.json`),
};
await writeFile(path.join(OUT, "summary.json"), `${JSON.stringify(summary, null, 2)}\n`);
server.close();
console.log("wrote", OUT);
