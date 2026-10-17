import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import path from "node:path";

const phase = process.argv[2];
if (phase !== "before" && phase !== "after") {
  console.error("usage: capture-donation-modal.mjs <before|after>");
  process.exit(1);
}

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const outRoot = process.env.OUT_DIR ?? "/opt/cursor/artifacts";

const pages = [
  {
    locale: "en",
    path: "/en/get-involved",
    open: "GIVE NOW",
    monthly: "MONTHLY",
    oneTime: "ONE-TIME",
    title: "Give to Roma Mission",
    custom: "Custom amount",
  },
  {
    locale: "sk",
    path: "/sk/zapojte-sa",
    open: "DAROVAŤ TERAZ",
    monthly: "MESAČNE",
    oneTime: "JEDNORAZOVO",
    title: "Darujte na Roma Mission",
    custom: "Vlastná suma",
  },
  {
    locale: "cs",
    path: "/cs/zapojte-se",
    open: "DAROVAT NYNÍ",
    monthly: "MĚSÍČNĚ",
    oneTime: "JEDNORÁZOVĚ",
    title: "Darujte na Roma Mission",
    custom: "Vlastní částka",
  },
  {
    locale: "ro",
    path: "/ro/implica-te",
    open: "DĂRUIEȘTE ACUM",
    monthly: "LUNAR",
    oneTime: "O SINGURĂ DATĂ",
    title: "Donează către Roma Mission",
    custom: "Sumă personalizată",
  },
  {
    locale: "de",
    path: "/de/mitmachen",
    open: "JETZT SPENDEN",
    monthly: "MONATLICH",
    oneTime: "EINMALIG",
    title: "An Roma Mission spenden",
    custom: "Eigener Betrag",
  },
  {
    locale: "sr",
    path: "/sr/prikljuci-se",
    open: "ДАЈТЕ САДА",
    monthly: "МЕСЕЧНО",
    oneTime: "ЈЕДНОКРАТНО",
    title: "Дарујте Роминској мисији",
    custom: "Прилагођен износ",
  },
  {
    locale: "ru",
    path: "/ru/uchastvovat",
    open: "ПОЖЕРТВОВАТЬ СЕЙЧАС",
    monthly: "ЕЖЕМЕСЯЧНО",
    oneTime: "РАЗОВО",
    title: "Пожертвовать на Roma Mission",
    custom: "Своя сумма",
  },
  {
    locale: "mk",
    path: "/mk/vklucise",
    open: "ДАРУВАЈТЕ СЕГА",
    monthly: "МЕСЕЧНО",
    oneTime: "ЕДНОКРАТНО",
    title: "Донирајте на Roma Mission",
    custom: "Сопствен износ",
  },
  {
    locale: "el",
    path: "/el/symmetechete",
    open: "ΔΩΡΕΑ ΤΩΡΑ",
    monthly: "ΜΗΝΙΑΙΑ",
    oneTime: "ΕΦΑΠΑΞ",
    title: "Δωρεά στη Roma Mission",
    custom: "Προσαρμοσμένο ποσό",
  },
];

const widths = [375, 1280];

const browser = await chromium.launch({
  executablePath: "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

await mkdir(path.join(outRoot, phase), { recursive: true });

const page = await browser.newPage();

async function shootModal(entry, width, suffix, url) {
  await page.setViewportSize({ width, height: 900 });
  await page.goto(base + url, { waitUntil: "networkidle" });
  const open = page.getByRole("button", { name: entry.open, exact: true });
  await open.first().click();
  const title = page.getByRole("heading", { name: entry.title, exact: true });
  await title.waitFor();

  const monthlyFile = path.join(
    outRoot,
    phase,
    `${suffix}-${width}-monthly.png`,
  );
  await page.screenshot({ path: monthlyFile, fullPage: false });
  console.log("wrote", monthlyFile);

  await page.getByRole("button", { name: entry.oneTime, exact: true }).click();
  const oneTimeFile = path.join(
    outRoot,
    phase,
    `${suffix}-${width}-onetime.png`,
  );
  await page.screenshot({ path: oneTimeFile, fullPage: false });
  console.log("wrote", oneTimeFile);

  await page.getByRole("button", { name: entry.monthly, exact: true }).click();
  const input = page.getByPlaceholder(entry.custom);
  await input.click();
  await input.fill("1250");
  const customFile = path.join(
    outRoot,
    phase,
    `${suffix}-${width}-custom.png`,
  );
  await page.screenshot({ path: customFile, fullPage: false });
  console.log("wrote", customFile);

  await page.keyboard.press("Escape");
  await title.waitFor({ state: "detached" });
}

for (const entry of pages) {
  for (const width of widths) {
    await shootModal(entry, width, entry.locale, entry.path);
  }
}

if (phase === "after") {
  const en = pages[0];
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + en.path, { waitUntil: "networkidle" });
    await page.getByRole("button", { name: en.open, exact: true }).first().click();
    const title = page.getByRole("heading", { name: en.title, exact: true });
    await title.waitFor();
    await page.getByRole("radio", { name: "EUR" }).click();
    const monthlyFile = path.join(outRoot, phase, `en-eur-${width}-monthly.png`);
    await page.screenshot({ path: monthlyFile, fullPage: false });
    console.log("wrote", monthlyFile);

    await page.getByRole("button", { name: en.oneTime, exact: true }).click();
    const oneTimeFile = path.join(outRoot, phase, `en-eur-${width}-onetime.png`);
    await page.screenshot({ path: oneTimeFile, fullPage: false });
    console.log("wrote", oneTimeFile);

    await page.getByRole("button", { name: en.monthly, exact: true }).click();
    const input = page.getByPlaceholder(en.custom);
    await input.click();
    await input.fill("1250");
    const customFile = path.join(outRoot, phase, `en-eur-${width}-custom.png`);
    await page.screenshot({ path: customFile, fullPage: false });
    console.log("wrote", customFile);

    await page.keyboard.press("Escape");
    await title.waitFor({ state: "detached" });

    await shootModal(en, width, "en-us", `${en.path}?country=US`);
  }
}

await browser.close();
