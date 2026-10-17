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
  { locale: "en", path: "/en/stories", label: "Featured Testimony", founder: "The Founder's Story" },
  { locale: "sk", path: "/sk/pribehy", label: "Vybrané svedectvo", founder: "Príbeh zakladateľa" },
  { locale: "cs", path: "/cs/pribehy", label: "Vybrané svědectví", founder: "Příběh zakladatele" },
  { locale: "ro", path: "/ro/marturii", label: "Mărturie selectată", founder: "Povestea fondatorului" },
  { locale: "de", path: "/de/geschichten", label: "Ausgewähltes Zeugnis", founder: "Die Geschichte des Gründers" },
  { locale: "sr", path: "/sr/price", label: "Истакнуто сведочанство", founder: "Прича оснивача" },
  { locale: "ru", path: "/ru/istorii", label: "Избранное свидетельство", founder: "История основателя" },
  { locale: "mk", path: "/mk/prikazni", label: "Истакнато сведоштво", founder: "Приказната на основачот" },
  { locale: "el", path: "/el/martyries", label: "Επιλεγμένη μαρτυρία", founder: "Η ιστορία του ιδρυτή" },
];

const shotLocales768 = new Set(["de", "sk", "ru", "mk", "sr", "en"]);
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

  const clips = [];
  const overflowsHidden = (el) => {
    const cs = getComputedStyle(el);
    return cs.overflowX === "hidden" || cs.overflowX === "clip";
  };
  for (const el of document.querySelectorAll("body *")) {
    if (!overflowsHidden(el)) continue;
    if (el.scrollWidth <= el.clientWidth + 1) continue;
    const rect = el.getBoundingClientRect();
    if (rect.width < 2 || rect.height < 2 || rect.left < -500) continue;
    clips.push({
      kind: "scroll",
      tag: el.tagName.toLowerCase(),
      cls: (el.className?.toString?.() || "").slice(0, 160),
      text: (el.innerText || "").replace(/\s+/g, " ").trim().slice(0, 90),
      scrollWidth: el.scrollWidth,
      clientWidth: el.clientWidth,
      top: Math.round(rect.top + window.scrollY),
    });
  }

  const hiddenAncestor = (el) => {
    let cur = el.parentElement;
    while (cur && cur !== document.body) {
      if (overflowsHidden(cur)) return cur;
      cur = cur.parentElement;
    }
    return null;
  };
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const seenText = new Set();
  let node;
  while ((node = walker.nextNode())) {
    const text = node.textContent.replace(/\s+/g, " ").trim();
    if (text.length < 2) continue;
    const parent = node.parentElement;
    if (!parent) continue;
    const ancestor = hiddenAncestor(parent);
    if (!ancestor) continue;
    const ancestorRect = ancestor.getBoundingClientRect();
    if (ancestorRect.left < -500 || ancestorRect.width < 2) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    for (const rect of range.getClientRects()) {
      if (rect.width < 1 || rect.height < 1) continue;
      if (rect.right > ancestorRect.right + 1 || rect.left < ancestorRect.left - 1) {
        const key = text.slice(0, 40) + "|" + Math.round(rect.top);
        if (seenText.has(key)) break;
        seenText.add(key);
        clips.push({
          kind: "text",
          text: text.slice(0, 90),
          right: Math.round(rect.right),
          ancestorRight: Math.round(ancestorRect.right),
          ancestorCls: (ancestor.className?.toString?.() || "").slice(0, 140),
          top: Math.round(rect.top + window.scrollY),
        });
        break;
      }
    }
  }

  let quoteGap = null;
  const photo = [...document.querySelectorAll("button")].find((el) =>
    /w-\[440px\]/.test(el.className?.toString?.() || ""),
  );
  const mark = photo?.nextElementSibling?.querySelector("span");
  if (photo && mark) {
    const fontSize = parseFloat(getComputedStyle(mark).fontSize);
    const lineTop = mark.getBoundingClientRect().top;
    const photoBox = photo.getBoundingClientRect();
    const stacked = getComputedStyle(photo.parentElement).flexDirection === "column";
    // The quotation glyph paints about 0.22em above its line box, so the
    // flex gap alone is mostly hidden. This is the visible space under the photo.
    quoteGap = {
      stacked,
      visibleGap: Math.round(lineTop - photoBox.bottom - fontSize * 0.22),
    };
  }

  return {
    scrollWidth: sw,
    clientWidth: vw,
    overflow: sw > vw,
    offenderCount: offenders.length,
    topOffenders: offenders.slice(0, 3),
    clipCount: clips.length,
    clips: clips.slice(0, 8),
    quoteGap,
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
    const gapBad =
      data.quoteGap?.stacked &&
      (width === 375 || width === 768) &&
      (data.quoteGap.visibleGap < 32 || data.quoteGap.visibleGap > 52);
    const bad = data.overflow || data.offenderCount > 0 || data.clipCount > 0 || gapBad;
    if (bad) failed = true;
    console.log(
      `${bad ? "FAIL" : "ok"} ${entry.locale} ${width} sw=${data.scrollWidth} cw=${data.clientWidth} offenders=${data.offenderCount} clips=${data.clipCount} gap=${data.quoteGap?.visibleGap ?? "-"}`,
    );

    const wantShot =
      shots &&
      ((width === 768 && shotLocales768.has(entry.locale)) ||
        (entry.locale === "de" && shotWidthsDe.has(width)));
    if (!wantShot) continue;

    await shotSection(page, entry.label, path.join(shotDir, `stories-${entry.locale}-${width}-featured.png`), width);
    await shotSection(page, entry.founder, path.join(shotDir, `stories-${entry.locale}-${width}-founder.png`), width);
  }
}

async function shotSection(page, labelText, file, viewportWidth) {
  const label = page.getByText(labelText, { exact: true }).first();
  const section = label.locator("xpath=ancestor::section[1]");
  const pos = await section.evaluate((el) => {
    const rect = el.getBoundingClientRect();
    return {
      y: rect.top + window.scrollY,
      height: rect.height,
      scrollWidth: document.documentElement.scrollWidth,
    };
  });
  const session = await page.context().newCDPSession(page);
  const shot = await session.send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: {
      x: 0,
      y: pos.y,
      width: Math.max(viewportWidth, pos.scrollWidth),
      height: Math.min(pos.height, 900),
      scale: 1,
    },
  });
  await writeFile(file, Buffer.from(shot.data, "base64"));
  await session.detach();
  console.log("wrote", file);
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
        clipCount: data.clipCount,
        clips: data.clips,
      });
      const bad = data.overflow || data.offenderCount > 0;
      console.log(
        `${bad ? "FAIL" : "ok"} ${group.name} ${locale} 768 sw=${data.scrollWidth} offenders=${data.offenderCount} clips=${data.clipCount}`,
      );
    }
  }
}

if (process.env.OUT_DIR) {
  await mkdir(shotDir, { recursive: true });
  const jsonPath = path.join(shotDir, "scrollwidth.json");
  const clipPath = path.join(shotDir, "clips.json");
  const storiesPublic = storiesResults.map(({ clips, topOffenders, ...rest }) => ({
    ...rest,
    topOffenders,
    clips,
  }));
  await writeFile(jsonPath, JSON.stringify({ phase, stories: storiesPublic, others: otherResults }, null, 2));
  await writeFile(
    clipPath,
    JSON.stringify(
      {
        phase,
        stories: storiesResults
          .filter((row) => row.clipCount > 0)
          .map((row) => ({
            locale: row.locale,
            width: row.width,
            clipCount: row.clipCount,
            clips: row.clips,
          })),
        others: otherResults
          .filter((row) => row.clipCount > 0)
          .map((row) => ({
            page: row.page,
            locale: row.locale,
            clipCount: row.clipCount,
            clips: row.clips,
          })),
      },
      null,
      2,
    ),
  );
  console.log("wrote", jsonPath);
  console.log("wrote", clipPath);
}

await browser.close();
if (failed) process.exit(1);
