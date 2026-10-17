/**
 * Measure horizontal overflow on the Stories page.
 *
 * Usage:
 *   BASE_URL=http://127.0.0.1:3000 node scripts/check-stories-overflow.mjs
 *   CHECK_OTHERS=1 node scripts/check-stories-overflow.mjs
 *   SHOTS=1 OUT_DIR=/opt/cursor/artifacts PHASE=after node scripts/check-stories-overflow.mjs
 *
 * Exits 1 when any Stories viewport has scrollWidth > clientWidth or an
 * element whose border box passes the right edge. Needs Chrome and a
 * running dev server. Not part of `npm test` (that lock is the Vitest
 * class check in __tests__/components/StoriesPage.layout.test.tsx).
 */
import { chromium } from "playwright-core";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const widths = [375, 768, 1024, 1280];

const stories = [
  { locale: "en", path: "/en/stories", label: "Featured Testimony" },
  { locale: "sk", path: "/sk/pribehy", label: "Vybrané svedectvo" },
  { locale: "cs", path: "/cs/pribehy", label: "Vybrané svědectví" },
  { locale: "ro", path: "/ro/marturii", label: "Mărturie selectată" },
  { locale: "de", path: "/de/geschichten", label: "Ausgewähltes Zeugnis" },
  { locale: "sr", path: "/sr/price", label: "Истакнуто сведочанство" },
  { locale: "ru", path: "/ru/istorii", label: "Избранное свидетельство" },
  { locale: "mk", path: "/mk/prikazni", label: "Истакнато сведоштво" },
  { locale: "el", path: "/el/martyries", label: "Επιλεγμένη μαρτυρία" },
];

const shotLocales768 = new Set(["de", "ru", "mk", "sr", "en"]);
const shotWidthsDe = new Set([375, 1024, 1280]);

const otherPages = [
  { name: "home", paths: { en: "/en", de: "/de", sk: "/sk", ru: "/ru", el: "/el" } },
  {
    name: "mission",
    paths: {
      en: "/en/mission",
      de: "/de/mission",
      sk: "/sk/misia",
      ru: "/ru/missiya",
      el: "/el/apostoli",
    },
  },
  {
    name: "media",
    paths: {
      en: "/en/media",
      de: "/de/medien",
      sk: "/sk/media",
      ru: "/ru/media",
      el: "/el/mesa",
    },
  },
  {
    name: "get-involved",
    paths: {
      en: "/en/get-involved",
      de: "/de/mitmachen",
      sk: "/sk/zapojte-sa",
      ru: "/ru/uchastvovat",
      el: "/el/symmetechete",
    },
  },
];

async function gotoSettled(page, url) {
  const response = await page.goto(url, {
    waitUntil: "domcontentloaded",
    timeout: 60000,
  });
  await page.locator("main").first().waitFor({ timeout: 20000 });
  await Promise.race([
    page.waitForLoadState("networkidle"),
    page.waitForTimeout(2500),
  ]);
  return response;
}

function measureScript() {
  const vw = document.documentElement.clientWidth;
  const sw = document.documentElement.scrollWidth;
  const offenders = [];
  for (const el of document.querySelectorAll("body *")) {
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) continue;
    if (rect.left < -500) continue;
    const right = rect.right + window.scrollX;
    if (right > vw + 1) {
      offenders.push({
        tag: el.tagName.toLowerCase(),
        cls: (el.className?.toString?.() || "").slice(0, 180),
        text: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 80),
        right: Math.round(right),
        width: Math.round(rect.width),
      });
    }
  }
  offenders.sort((a, b) => b.right - a.right || b.width - a.width);
  return {
    scrollWidth: sw,
    clientWidth: vw,
    overflow: sw > vw,
    offenderCount: offenders.length,
    topOffenders: offenders.slice(0, 3),
  };
}

const browser = await chromium.launch({
  executablePath: process.env.CHROME_PATH ?? "/usr/local/bin/google-chrome",
  args: ["--no-sandbox", "--disable-dev-shm-usage"],
});

const page = await browser.newPage();
const storiesResults = [];
let failed = false;

const shots = process.env.SHOTS === "1";
const phase = process.env.PHASE ?? "after";
const outRoot = process.env.OUT_DIR ?? "/opt/cursor/artifacts";
const shotDir = path.join(outRoot, phase);
if (shots) await mkdir(shotDir, { recursive: true });

for (const entry of stories) {
  for (const width of widths) {
    await page.setViewportSize({ width, height: 900 });
    await gotoSettled(page, base + entry.path);
    await page.evaluate(() => document.fonts.ready);
    const data = await page.evaluate(measureScript);
    const row = { locale: entry.locale, path: entry.path, width, ...data };
    storiesResults.push(row);
    const bad = data.overflow || data.offenderCount > 0;
    if (bad) failed = true;
    console.log(
      `${bad ? "FAIL" : "ok"} ${entry.locale} ${width} sw=${data.scrollWidth} cw=${data.clientWidth} offenders=${data.offenderCount}`,
    );

    const wantShot =
      shots &&
      ((width === 768 && shotLocales768.has(entry.locale)) ||
        (entry.locale === "de" && shotWidthsDe.has(width)));
    if (!wantShot) continue;

    const label = page.getByText(entry.label, { exact: true }).first();
    const section = label.locator("xpath=ancestor::section[1]");
    const pos = await section.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return {
        y: rect.top + window.scrollY,
        height: rect.height,
        scrollWidth: document.documentElement.scrollWidth,
      };
    });
    const file = path.join(shotDir, `stories-${entry.locale}-${width}-featured.png`);
    const session = await page.context().newCDPSession(page);
    const shot = await session.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: {
        x: 0,
        y: pos.y,
        width: Math.max(width, pos.scrollWidth),
        height: Math.min(pos.height, 900),
        scale: 1,
      },
    });
    await writeFile(file, Buffer.from(shot.data, "base64"));
    await session.detach();
    console.log("wrote", file);
  }
}

const otherResults = [];
if (process.env.CHECK_OTHERS === "1") {
  for (const group of otherPages) {
    for (const [locale, urlPath] of Object.entries(group.paths)) {
      await page.setViewportSize({ width: 768, height: 900 });
      const response = await gotoSettled(page, base + urlPath);
      await page.evaluate(() => document.fonts.ready);
      const data = await page.evaluate(measureScript);
      otherResults.push({
        page: group.name,
        locale,
        path: urlPath,
        status: response?.status() ?? 0,
        width: 768,
        scrollWidth: data.scrollWidth,
        clientWidth: data.clientWidth,
        overflow: data.overflow,
        offenderCount: data.offenderCount,
        topOffenders: data.topOffenders,
      });
      const bad = data.overflow || data.offenderCount > 0;
      console.log(
        `${bad ? "FAIL" : "ok"} ${group.name} ${locale} 768 sw=${data.scrollWidth} offenders=${data.offenderCount}`,
      );
    }
  }
}

if (process.env.OUT_DIR) {
  await mkdir(shotDir, { recursive: true });
  const jsonPath = path.join(shotDir, "scrollwidth.json");
  await writeFile(
    jsonPath,
    JSON.stringify({ phase, stories: storiesResults, others: otherResults }, null, 2),
  );
  console.log("wrote", jsonPath);
}

await browser.close();
if (failed) process.exit(1);
