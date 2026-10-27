/**
 * Donation receipt email: required field, Checkout email + locale.
 *
 * Runs at 390 and 1440 in Chromium, Firefox, and WebKit.
 * Not part of `npm test` (that suite is Vitest; CI does not install browsers).
 *
 *   BASE_URL=http://127.0.0.1:3000 node scripts/check-donation-receipt.mjs
 */
import { chromium, firefox, webkit } from "playwright-core";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const widths = [390, 1440];
const donorEmail = "donor@example.com";

const pages = [
  {
    locale: "en",
    stripeLocale: "en",
    path: "/en/get-involved",
    open: "GIVE NOW",
    title: "Give to Roma Mission",
    emailLabel: "Email for receipt",
    invalid: "Enter a valid email address.",
    give: "GIVE €100/MO",
  },
  {
    locale: "de",
    stripeLocale: "de",
    path: "/de/mitmachen",
    open: "JETZT SPENDEN",
    title: "An Roma Mission spenden",
    emailLabel: "E-Mail für die Quittung",
    invalid: "Geben Sie eine gültige E-Mail-Adresse ein.",
    give: "SPENDEN 100 €/MO",
  },
  {
    locale: "sr",
    stripeLocale: "auto",
    path: "/sr/prikljuci-se",
    open: "ДАЈТЕ САДА",
    title: "Дарујте Роминској мисији",
    emailLabel: "Е-пошта за потврду",
    invalid: "Унесите исправну адресу е-поште.",
    give: "ДАРУЈТЕ 100 €/МЕС",
  },
];

const engines = [
  {
    name: "chromium",
    launch: () =>
      chromium.launch({
        executablePath: process.env.CHROMIUM_PATH ?? "/usr/local/bin/google-chrome",
        args: ["--no-sandbox", "--disable-dev-shm-usage"],
      }),
  },
  { name: "firefox", launch: () => firefox.launch({ headless: true }) },
  { name: "webkit", launch: () => webkit.launch({ headless: true }) },
];

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function checkPage(page, entry, width) {
  const posts = [];
  await page.unroute("**/api/stripe/checkout").catch(() => {});
  await page.route("**/api/stripe/checkout", async (route) => {
    posts.push(route.request().postDataJSON());
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ clientSecret: "cs_test_e2e" }),
    });
  });

  try {
    await page.setViewportSize({ width, height: 1200 });
    await page.goto(base + entry.path, { waitUntil: "networkidle", timeout: 60000 });
    const open = page.getByRole("button", { name: entry.open, exact: true }).first();
    const title = page.getByRole("heading", { name: entry.title, exact: true });
    await open.click();
    try {
      await title.waitFor({ timeout: 4000 });
    } catch {
      await open.click();
      await title.waitFor();
    }

    const email = page.getByLabel(entry.emailLabel);
    await email.waitFor();
    assert((await email.getAttribute("type")) === "email", `${entry.locale} type`);
    assert((await email.getAttribute("required")) !== null, `${entry.locale} required`);
    assert((await email.getAttribute("autocomplete")) === "email", `${entry.locale} autocomplete`);

    await page.getByRole("button", { name: entry.give, exact: true }).click();
    await page.getByRole("alert").filter({ hasText: entry.invalid }).waitFor();
    assert(posts.length === 0, `${entry.locale}@${width} posted before a valid email`);
    assert((await email.getAttribute("aria-invalid")) === "true", `${entry.locale} aria-invalid`);

    await email.fill("not-an-email");
    await page.getByRole("button", { name: entry.give, exact: true }).click();
    await page.getByRole("alert").filter({ hasText: entry.invalid }).waitFor();
    assert(posts.length === 0, `${entry.locale}@${width} posted an invalid email`);

    await email.fill(donorEmail);
    await page.getByRole("button", { name: entry.give, exact: true }).click();
    const deadline = Date.now() + 8000;
    while (posts.length < 1 && Date.now() < deadline) {
      await page.waitForTimeout(50);
    }
    assert(posts.length === 1, `${entry.locale}@${width} expected 1 checkout call, got ${posts.length}`);
    assert(posts[0].email === donorEmail, `${entry.locale} email ${JSON.stringify(posts[0])}`);
    assert(posts[0].locale === entry.locale, `${entry.locale} site locale ${JSON.stringify(posts[0])}`);
    assert(
      posts[0].amount === 100 && posts[0].isMonthly === true,
      `${entry.locale} amount changed ${JSON.stringify(posts[0])}`
    );

    await page.keyboard.press("Escape");
    await title.waitFor({ state: "detached" });
  } finally {
    await page.unroute("**/api/stripe/checkout").catch(() => {});
  }
}

const results = [];
let failed = 0;

for (const engine of engines) {
  const browser = await engine.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  for (const width of widths) {
    for (const entry of pages) {
      const label = `${engine.name} ${width} ${entry.locale}`;
      try {
        await checkPage(page, entry, width);
        results.push({ label, ok: true, stripeLocale: entry.stripeLocale });
        console.log(
          "ok",
          label,
          "posted",
          entry.locale,
          "stripe checkout locale",
          entry.stripeLocale
        );
      } catch (error) {
        failed += 1;
        results.push({ label, ok: false, error: String(error) });
        console.log("FAIL", label);
        console.log(" ", error);
      }
    }
  }
  await browser.close();
}

const passed = results.filter((result) => result.ok).length;
console.log(JSON.stringify({ passed, failed, total: results.length }, null, 2));
if (failed > 0) process.exit(1);
