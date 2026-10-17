/**
 * Layout checks for the Liturgy pages.
 *
 *   BASE_URL=http://127.0.0.1:3000 node scripts/check-liturgy-layout.mjs
 *
 * Chromium runs with mobile emulation, because a sideways overflow there
 * widens the layout viewport until scrollWidth and clientWidth match again.
 * visualViewport.width stays at the device width, so that is the comparison.
 * Firefox and WebKit use the same widths. Not part of `npm test`.
 */
import { chromium, firefox, webkit } from "playwright-core";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const widths = [320, 360, 375, 390, 414, 768];

const pages = [
  { locale: "en", about: "/en/liturgy", text: "/en/liturgy/text" },
  { locale: "sk", about: "/sk/liturgia", text: "/sk/liturgia/text" },
  { locale: "cs", about: "/cs/liturgie", text: "/cs/liturgie/text" },
  { locale: "ro", about: "/ro/liturghie", text: "/ro/liturghie/text" },
  { locale: "de", about: "/de/liturgie", text: "/de/liturgie/text" },
  { locale: "sr", about: "/sr/liturgija", text: "/sr/liturgija/tekst" },
  { locale: "ru", about: "/ru/liturgiya", text: "/ru/liturgiya/tekst" },
  { locale: "mk", about: "/mk/liturgija", text: "/mk/liturgija/tekst" },
  { locale: "el", about: "/el/leitourgia", text: "/el/leitourgia/keimeno" },
];

function parseColor(color) {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1].split(",").map((part) => parseFloat(part.trim()));
  return [parts[0] / 255, parts[1] / 255, parts[2] / 255];
}

function contrast(a, b) {
  const channel = (value) =>
    value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  const lum = (rgb) =>
    0.2126 * channel(rgb[0]) + 0.7152 * channel(rgb[1]) + 0.0722 * channel(rgb[2]);
  const hi = Math.max(lum(a), lum(b));
  const lo = Math.min(lum(a), lum(b));
  return (hi + 0.05) / (lo + 0.05);
}

function tally() {
  return { pass: 0, fail: 0 };
}

async function goto(page, url) {
  await page.goto(base + url, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.locator("main").first().waitFor({ timeout: 20000 });
  await page.evaluate(() => document.fonts.ready);
}

function scrollAndNotes() {
  const vv = window.visualViewport?.width ?? document.documentElement.clientWidth;
  const sw = Math.max(document.documentElement.scrollWidth, document.body.scrollWidth);
  const overflow = sw > vv + 1;

  function glyphBefore(note) {
    const range = document.createRange();
    let node = note.previousSibling;
    while (node) {
      const texts = [];
      if (node.nodeType === Node.ELEMENT_NODE && node.classList.contains("liturgy-note")) {
        const summary = node.querySelector("summary");
        if (summary) {
          range.selectNodeContents(summary);
          const rect = [...range.getClientRects()].find((r) => r.width > 0.3 && r.height > 0.3);
          if (rect) return rect;
        }
      } else if (node.nodeType === Node.TEXT_NODE) {
        texts.push(node);
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        let current;
        while ((current = walker.nextNode())) texts.push(current);
      }
      for (let i = texts.length - 1; i >= 0; i -= 1) {
        const value = texts[i].textContent || "";
        for (let c = value.length - 1; c >= 0; c -= 1) {
          if (!value[c].trim()) continue;
          range.setStart(texts[i], c);
          range.setEnd(texts[i], c + 1);
          const rect = [...range.getClientRects()].find((r) => r.width > 0.3 && r.height > 0.3);
          if (rect) return rect;
        }
      }
      node = node.previousSibling;
    }
    return null;
  }

  const notes = [...document.querySelectorAll(".liturgy-note")];
  const markerFails = [];
  let markerPass = 0;
  let maxSw = sw;
  for (const note of notes) {
    const summary = note.querySelector("summary");
    for (const open of [false, true]) {
      note.open = open;
      const word = glyphBefore(note);
      const range = document.createRange();
      range.selectNodeContents(summary);
      const marker = [...range.getClientRects()].find((r) => r.width > 0.3 && r.height > 0.3);
      const dropped = !word || !marker || marker.top >= word.bottom - 1;
      if (dropped) {
        markerFails.push({
          n: summary.textContent.trim(),
          open,
          word: (note.previousSibling?.textContent || "").replace(/\s+/g, " ").trim().slice(-24),
        });
      } else {
        markerPass += 1;
      }
      maxSw = Math.max(maxSw, document.documentElement.scrollWidth, document.body.scrollWidth);
    }
    note.open = false;
  }

  const chips = [...document.querySelectorAll(".liturgy-view label")].map((label) => ({
    text: label.textContent.trim(),
    height: label.getBoundingClientRect().height,
  }));

  return {
    overflow: overflow || maxSw > vv + 1,
    sw: maxSw,
    vv,
    client: document.documentElement.clientWidth,
    markerPass,
    markerFails,
    chips,
  };
}

async function measureContrast(page) {
  return page.evaluate(() => {
    const opaque = (node) => {
      let current = node;
      while (current) {
        const color = getComputedStyle(current).backgroundColor;
        const match = color.match(/rgba?\(([^)]+)\)/);
        if (match) {
          const parts = match[1].split(",").map((part) => parseFloat(part));
          const alpha = parts.length === 4 ? parts[3] : 1;
          if (alpha > 0.9) return color;
        }
        current = current.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    };
    const labels = [...document.querySelectorAll(".liturgy-view label")];
    const selected = labels.find((label) => getComputedStyle(label).backgroundColor !== "rgba(0, 0, 0, 0)") ?? labels[0];
    const unselected = labels.find((label) => label !== selected);
    return {
      selected: {
        color: getComputedStyle(selected).color,
        bg: getComputedStyle(selected).backgroundColor,
        label: selected.textContent.trim(),
      },
      unselected: {
        color: getComputedStyle(unselected).color,
        bg: opaque(unselected),
        label: unselected.textContent.trim(),
      },
    };
  });
}

const engines = [
  {
    name: "chromium",
    launch: chromium,
    context: {
      viewport: { width: 375, height: 812 },
      isMobile: true,
      hasTouch: true,
      deviceScaleFactor: 2,
    },
  },
  { name: "firefox", launch: firefox, context: { viewport: { width: 375, height: 812 } } },
  { name: "webkit", launch: webkit, context: { viewport: { width: 375, height: 812 } } },
];

const report = {};
let failed = false;

for (const engine of engines) {
  const counts = { scroll: tally(), marker: tally(), chip: tally() };
  const samples = [];
  const browser = await engine.launch.launch({ headless: true });
  const context = await browser.newContext(engine.context);
  const page = await context.newPage();

  if (engine.name === "chromium") {
    report.contrast = {};
    for (const theme of ["light", "dark"]) {
      await page.addInitScript((value) => localStorage.setItem("theme", value), theme);
      await goto(page, "/en/liturgy/text");
      const colors = await measureContrast(page);
      report.contrast[theme] = {
        selected: {
          ...colors.selected,
          ratio: Number(contrast(parseColor(colors.selected.color), parseColor(colors.selected.bg)).toFixed(2)),
        },
        unselected: {
          ...colors.unselected,
          ratio: Number(contrast(parseColor(colors.unselected.color), parseColor(colors.unselected.bg)).toFixed(2)),
        },
      };
      await page.context().clearCookies();
      await page.evaluate(() => localStorage.clear());
    }
    await page.addInitScript(() => localStorage.setItem("theme", "dark"));
    await goto(page, "/en/liturgy/text");
  }

  for (const entry of pages) {
    for (const kind of ["about", "text"]) {
      await goto(page, entry[kind]);
      for (const width of widths) {
        await page.setViewportSize({ width, height: 812 });
        const data = await page.evaluate(scrollAndNotes);
        if (data.overflow) {
          counts.scroll.fail += 1;
          failed = true;
          if (samples.length < 8) {
            samples.push({ locale: entry.locale, kind, width, sw: data.sw, vv: data.vv, client: data.client });
          }
        } else {
          counts.scroll.pass += 1;
        }

        if (kind === "text") {
          counts.marker.pass += data.markerPass;
          counts.marker.fail += data.markerFails.length;
          if (data.markerFails.length) {
            failed = true;
            if (samples.length < 12) {
              samples.push({ locale: entry.locale, width, marker: data.markerFails.slice(0, 3) });
            }
          }
          for (const chip of data.chips) {
            if (chip.height >= 44) counts.chip.pass += 1;
            else {
              counts.chip.fail += 1;
              failed = true;
              samples.push({ locale: entry.locale, width, chip });
            }
          }
        }
      }
    }
  }

  await browser.close();
  report[engine.name] = { counts, samples };
  console.log(engine.name, JSON.stringify(counts));
  if (samples.length) console.log(" samples", JSON.stringify(samples));
}

console.log("contrast", JSON.stringify(report.contrast, null, 2));
if (failed) process.exit(1);
