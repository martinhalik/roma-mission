/**
 * Prod-build check: custom amounts on the donation modal.
 *
 * The dev server must already be a production `next start` whose Stripe
 * client points at 127.0.0.1:12111. This script boots that mock, types and
 * pastes the QA cases, and asserts the button label and the Stripe
 * unit_amount come from the same minor units.
 *
 *   STRIPE_SECRET_KEY=sk_test_mock STRIPE_API_HOST=127.0.0.1 \
 *   STRIPE_API_PORT=12111 STRIPE_API_PROTOCOL=http \
 *   npm run build && npm start
 *   node scripts/check-donation-amount-parsing.mjs
 */
import http from "node:http";
import { createRequire } from "node:module";

const require = createRequire("/workspace/package.json");
const { chromium } = require("playwright-core");

const APP = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const PORT = Number(process.env.STRIPE_API_PORT ?? 12111);

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
  for (const [key, value] of new URLSearchParams(raw)) assignForm(parsed, key, value);
  return parsed;
}

const captured = [];
const server = http.createServer(async (req, res) => {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  const raw = Buffer.concat(chunks).toString("utf8");
  const body = (req.headers["content-type"] ?? "").includes("application/x-www-form-urlencoded")
    ? parseForm(raw)
    : raw;
  captured.push({ url: req.url, body });
  const isPaymentIntent = (req.url ?? "").startsWith("/v1/payment_intents");
  const payload = isPaymentIntent
    ? { id: "pi_mock", object: "payment_intent", client_secret: "pi_mock_secret", status: "requires_payment_method" }
    : { id: "cs_mock", object: "checkout.session", client_secret: "cs_mock_secret", status: "open" };
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify(payload));
});
await new Promise((resolve) => server.listen(PORT, "127.0.0.1", resolve));

const pages = {
  en: {
    path: "/en/get-involved",
    open: "GIVE NOW",
    monthly: "MONTHLY",
    oneTime: "ONE-TIME",
    title: "Give to Roma Mission",
    custom: "Custom amount",
    once: (amount) => `GIVE ${amount}`,
    month: (amount) => `GIVE ${amount}/MO`,
    invalid: "Enter an amount like 25 or 25.50.",
    max: "Maximum amount is $999,999.99.",
    currency: "usd",
  },
  de: {
    path: "/de/mitmachen",
    open: "JETZT SPENDEN",
    monthly: "MONATLICH",
    oneTime: "EINMALIG",
    title: "An Roma Mission spenden",
    custom: "Eigener Betrag",
    once: (amount) => `SPENDEN ${amount}`,
    month: (amount) => `SPENDEN ${amount}/MO`,
    invalid: "Geben Sie einen Betrag wie 25 oder 25,50 ein.",
    max: "Der Höchstbetrag ist 999.999,99 €.",
    currency: "eur",
  },
  cs: {
    path: "/cs/zapojte-se",
    open: "DAROVAT NYNÍ",
    monthly: "MĚSÍČNĚ",
    oneTime: "JEDNORÁZOVĚ",
    title: "Darujte na Roma Mission",
    custom: "Vlastní částka",
    once: (amount) => `DAROVAT ${amount}`,
    month: (amount) => `DAROVAT ${amount}/MĚS`,
    invalid: "Zadejte částku jako 25 nebo 25,50.",
    max: "Maximální částka je 999 999,99 Kč.",
    currency: "czk",
  },
  mk: {
    path: "/mk/vklucise",
    open: "ДАРУВАЈТЕ СЕГА",
    monthly: "МЕСЕЧНО",
    oneTime: "ЕДНОКРАТНО",
    title: "Донирајте на Roma Mission",
    custom: "Сопствен износ",
    once: (amount) => `ДОНИРАЈТЕ ${amount}`,
    month: (amount) => `ДОНИРАЈТЕ ${amount}/МЕС`,
    invalid: "Внесете износ како 25 или 25,50.",
    max: "Максималниот износ е 999.999,99 ден.",
    currency: "mkd",
  },
};

function formatMinor(minor, locale, currency) {
  const whole = Math.trunc(minor / 100);
  const fraction = minor % 100;
  const group = locale === "en" ? "," : locale === "cs" ? " " : ".";
  const decimal = locale === "en" ? "." : ",";
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, group);
  const numeric = fraction === 0 ? grouped : `${grouped}${decimal}${String(fraction).padStart(2, "0")}`;
  const symbol = { usd: "$", eur: "€", czk: "Kč", mkd: "ден." }[currency];
  return locale === "en" ? `${symbol}${numeric}` : `${numeric} ${symbol}`;
}

const charge = (minor) => ({ minor, charge: true });
const blocked = (minor) => ({ minor, charge: false });
const invalid = { invalid: true };
const tooHigh = { max: true };

const cases = {
  en: [
    ["25,5", charge(2550)],
    ["0,50", charge(50)],
    ["1.250", charge(125)],
    ["1,250", charge(125000)],
    ["25.555", invalid, { paste: false }],
    ["25,555", charge(2555500)],
    ["$1,250.00", charge(125000), { paste: true }],
    ["abc", invalid, { paste: true }],
    ["-5", invalid, { paste: true }],
    ["1e3", invalid, { paste: true }],
    [".5", charge(50)],
    ["99999999999", tooHigh],
    ["25,5", charge(2550), { monthly: true }],
  ],
  de: [
    ["25,5", charge(2550)],
    ["0,50", charge(50)],
    ["1.250", charge(125000)],
    ["1,250", charge(125)],
    ["25,555", invalid],
    ["1 250 €", charge(125000), { paste: true }],
    ["abc", invalid, { paste: true }],
    ["-5", invalid, { paste: true }],
    ["1e3", invalid, { paste: true }],
    [".5", charge(50)],
    ["99999999999", tooHigh],
  ],
  cs: [
    ["25,5", charge(2550)],
    ["0,50", blocked(50)],
    ["1.250", charge(125000)],
    ["1,250", blocked(125)],
    ["25,555", invalid],
    ["1 250 Kč", charge(125000), { paste: true }],
    ["abc", invalid, { paste: true }],
    ["-5", invalid, { paste: true }],
    ["1e3", invalid, { paste: true }],
    [".5", blocked(50)],
    ["99999999999", tooHigh],
  ],
  mk: [
    ["25,5", blocked(2550)],
    ["0,50", blocked(50)],
    ["1.250", charge(125000)],
    ["1,250", blocked(125)],
    ["25,555", invalid],
    ["1 250 ден.", charge(125000), { paste: true }],
    ["abc", invalid, { paste: true }],
    ["-5", invalid, { paste: true }],
    ["1e3", invalid, { paste: true }],
    [".5", blocked(50)],
    ["99999999999", tooHigh],
  ],
};

const browser = await chromium.launch({
  executablePath: "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});
const page = await browser.newPage();
const posts = [];
page.on("request", (req) => {
  if (req.method() === "POST" && req.url().includes("/api/stripe/checkout")) posts.push(req.postData());
});

let passed = 0;
const failures = [];

async function buttonWithText(text) {
  const handle = page.locator("button").filter({ hasText: text }).last();
  await handle.waitFor({ timeout: 4000 });
  return handle;
}

for (const width of [375, 1280]) {
  await page.setViewportSize({ width, height: 900 });
  for (const [locale, list] of Object.entries(cases)) {
    const entry = pages[locale];
    for (const [value, expected, options = {}] of list) {
      const name = `${locale} ${width} ${options.monthly ? "monthly" : "once"} ${JSON.stringify(value)}`;
      try {
        captured.length = 0;
        posts.length = 0;
        await page.context().clearCookies();
        await page.goto(APP + entry.path, { waitUntil: "networkidle" });
        await page.getByRole("button", { name: entry.open, exact: true }).first().click();
        await page.getByRole("heading", { name: entry.title, exact: true }).waitFor();
        if (!options.monthly) {
          await page.getByRole("button", { name: entry.oneTime, exact: true }).click();
        }
        const input = page.getByPlaceholder(entry.custom);
        if (options.paste) {
          await input.fill(value);
        } else {
          await input.click();
          await input.fill("");
          await input.pressSequentially(value, { delay: 15 });
        }

        const expectedLabel = expected.invalid
          ? entry.once("—")
          : (options.monthly ? entry.month : entry.once)(
              formatMinor(expected.max ? 9999999999900 : expected.minor, locale, entry.currency),
            );

        const button = await buttonWithText(expectedLabel);
        const text = (await button.textContent())?.trim();
        if (text !== expectedLabel) throw new Error(`label ${text} !== ${expectedLabel}`);

        if (expected.charge) {
          if (await button.isDisabled()) throw new Error("expected an enabled CTA");
          await button.click();
          const started = Date.now();
          let hit = null;
          while (Date.now() - started < 5000) {
            hit = captured.find((item) => (item.url ?? "").startsWith("/v1/checkout/sessions"));
            if (hit) break;
            await page.waitForTimeout(50);
          }
          if (!hit) throw new Error("Stripe checkout was not called");
          const unit = Number(hit.body?.line_items?.[0]?.price_data?.unit_amount);
          if (unit !== expected.minor) throw new Error(`stripe ${unit} !== ${expected.minor}`);
          const formatted = formatMinor(unit, locale, entry.currency);
          if (!text.includes(formatted)) throw new Error(`label ${text} does not contain ${formatted}`);
          const posted = JSON.parse(posts.at(-1) ?? "{}");
          if (posted.amount !== value) throw new Error(`posted ${posted.amount} !== ${value}`);
        } else {
          if (!(await button.isDisabled())) throw new Error("expected a disabled CTA");
          if ((await button.getAttribute("aria-disabled")) !== "true") {
            throw new Error("missing aria-disabled");
          }
          const message = expected.invalid ? entry.invalid : expected.max ? entry.max : null;
          if (message) {
            const alert = page.locator("p[role='alert']");
            await alert.waitFor();
            const alertText = (await alert.textContent())?.trim();
            if (alertText !== message) throw new Error(`message ${alertText} !== ${message}`);
          }
          await page.waitForTimeout(200);
          if (captured.some((item) => (item.url ?? "").startsWith("/v1/checkout/sessions"))) {
            throw new Error("Stripe was called for a blocked amount");
          }
          if (posts.length !== 0) throw new Error("checkout was posted for a blocked amount");
        }
        passed += 1;
        console.log("ok", name);
      } catch (error) {
        failures.push(`${name}: ${error.message}`);
        console.error("FAIL", name, error.message);
      }
    }
  }
}

await browser.close();
await new Promise((resolve) => server.close(resolve));

console.log(`passed ${passed}, failed ${failures.length}`);
if (failures.length > 0) {
  for (const failure of failures) console.error(failure);
  process.exit(1);
}
