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
    oneTime: "ONE-TIME",
    title: "Give to Roma Mission",
  },
  {
    locale: "de",
    path: "/de/mitmachen",
    open: "JETZT SPENDEN",
    oneTime: "EINMALIG",
    title: "An Roma Mission spenden",
  },
  {
    locale: "sk",
    path: "/sk/zapojte-sa",
    open: "DAROVAŤ TERAZ",
    oneTime: "JEDNORAZOVO",
    title: "Darujte na Roma Mission",
  },
  {
    locale: "mk",
    path: "/mk/vklucise",
    open: "ДАРУВАЈТЕ СЕГА",
    oneTime: "ЕДНОКРАТНО",
    title: "Донирајте на Roma Mission",
  },
];

const widths = [375, 1280];

const browser = await chromium.launch({
  executablePath: "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

await mkdir(path.join(outRoot, phase), { recursive: true });

const page = await browser.newPage();

for (const entry of pages) {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(base + entry.path, { waitUntil: "networkidle" });
    const open = page.getByRole("button", { name: entry.open, exact: true });
    await open.first().click();
    const title = page.getByRole("heading", { name: entry.title, exact: true });
    await title.waitFor();
    const file = path.join(outRoot, phase, `${entry.locale}-${width}.png`);
    await page.screenshot({ path: file, fullPage: false });
    console.log("wrote", file);

    await page.getByRole("button", { name: entry.oneTime, exact: true }).click();
    const oneTimeFile = path.join(outRoot, phase, `${entry.locale}-${width}-onetime.png`);
    await page.screenshot({ path: oneTimeFile, fullPage: false });
    console.log("wrote", oneTimeFile);

    await page.keyboard.press("Escape");
    await title.waitFor({ state: "detached" });
  }
}

await browser.close();
