/**
 * Layout checks for the Liturgy pages.
 *
 *   BASE_URL=http://127.0.0.1:3000 node scripts/check-liturgy-layout.mjs
 *
 * Chromium runs with mobile emulation, because a sideways overflow there
 * widens the layout viewport until scrollWidth and clientWidth match again.
 * visualViewport.width stays at the device width, so that is the comparison.
 * Firefox and WebKit use the same widths. Not part of `npm test`.
 *
 * Also, once per text page: the marker's keyboard focus draws a real outline
 * on the <summary>, no marker has whitespace before it, and the accessibility
 * tree still has each marker's name and expanded state. Chromium reads that
 * tree over CDP. Firefox and WebKit are launched headed so AT-SPI can.
 */
import { spawnSync } from "node:child_process";
import { chromium, firefox, webkit } from "playwright-core";

const base = process.env.BASE_URL ?? "http://127.0.0.1:3000";
const widths = [320, 360, 375, 390, 768, 1280];

const onlyLocales = process.env.LITURGY_LOCALES?.split(",").filter(Boolean);
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
].filter((entry) => !onlyLocales || onlyLocales.includes(entry.locale));

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

  function anchorRect(note) {
    const keep = note.closest(".liturgy-keep");
    const first = keep?.querySelector(".liturgy-note") ?? note;
    return glyphBefore(first);
  }

  function markerOnWord(note) {
    const summary = note.querySelector("summary");
    const word = anchorRect(note);
    const range = document.createRange();
    range.selectNodeContents(summary);
    const marker = [...range.getClientRects()].find((r) => r.width > 0.3 && r.height > 0.3);
    const dropped = !word || !marker || marker.top >= word.bottom - 1;
    return {
      dropped,
      n: summary.textContent.trim(),
      word: (note.closest(".liturgy-keep")?.firstChild?.textContent || "").replace(/\s+/g, " ").trim().slice(-24),
    };
  }

  function punctSplit(note) {
    let node = note.nextSibling;
    while (node && node.nodeType === Node.TEXT_NODE && !(node.nodeValue || "").length) node = node.nextSibling;
    if (!node || node.nodeType !== Node.TEXT_NODE) return "none";
    const value = node.nodeValue || "";
    if (!/^[,.;:!?]/.test(value)) return "none";
    if (/^\s/.test(value)) return "whitespace";
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, 1);
    const punct = [...range.getClientRects()].find((r) => r.width > 0.3 && r.height > 0.3);
    const summary = note.querySelector("summary");
    const markerRange = document.createRange();
    markerRange.selectNodeContents(summary);
    const marker = [...markerRange.getClientRects()].find((r) => r.width > 0.3 && r.height > 0.3);
    if (!punct || !marker || punct.top >= marker.bottom - 1) return "wrapped";
    return null;
  }

  function lineStartPunct() {
    const fails = [];
    const range = document.createRange();
    for (const line of document.querySelectorAll(".liturgy-rom, .liturgy-sk")) {
      const glyphs = [];
      const walker = document.createTreeWalker(line, NodeFilter.SHOW_TEXT);
      let current;
      while ((current = walker.nextNode())) {
        if (current.parentElement?.closest(".liturgy-note-body, summary")) continue;
        const value = current.textContent || "";
        for (let c = 0; c < value.length; c += 1) {
          const ch = value[c];
          if (!ch.trim()) continue;
          range.setStart(current, c);
          range.setEnd(current, c + 1);
          const rect = [...range.getClientRects()].find((r) => r.width > 0.3 && r.height > 0.3);
          if (!rect) continue;
          glyphs.push({ ch, x: rect.left, y: Math.round(rect.top) });
        }
      }
      const rows = new Map();
      for (const glyph of glyphs) {
        const row = rows.get(glyph.y) ?? [];
        row.push(glyph);
        rows.set(glyph.y, row);
      }
      for (const row of rows.values()) {
        row.sort((a, b) => a.x - b.x);
        if (/^[,.;:!?]$/.test(row[0].ch)) fails.push(row[0].ch + row.slice(1, 4).map((glyph) => glyph.ch).join(""));
      }
    }
    return fails;
  }

  const notes = [...document.querySelectorAll(".liturgy-note")];
  const markerFails = [];
  let markerPass = 0;
  const punctFails = [];
  let punctPass = 0;
  let maxSw = sw;
  for (const note of notes) {
    for (const open of [false, true]) {
      note.open = open;
      const targets = open
        ? [...(note.closest(".liturgy-keep")?.querySelectorAll(".liturgy-note") ?? [note])]
        : [note];
      for (const target of targets) {
        const result = markerOnWord(target);
        if (result.dropped) markerFails.push({ n: result.n, open, word: result.word, whileOpen: note.querySelector("summary").textContent.trim() });
        else markerPass += 1;
      }
      const split = punctSplit(note);
      if (split === "whitespace" || split === "wrapped") {
        punctFails.push({ n: note.querySelector("summary").textContent.trim(), open, split });
      } else if (split === null) punctPass += 1;
      maxSw = Math.max(maxSw, document.documentElement.scrollWidth, document.body.scrollWidth);
    }
    note.open = false;
  }
  const lineFails = lineStartPunct();
  const gapFails = [];
  let gapPass = 0;
  for (const note of notes) {
    let node = note.previousSibling;
    let spaced = false;
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const value = node.nodeValue ?? "";
        if (!value.length) {
          node = node.previousSibling;
          continue;
        }
        spaced = /\s$/.test(value);
        break;
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains("liturgy-note")) break;
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        let last = null;
        let current;
        while ((current = walker.nextNode())) last = current;
        if (!last || !(last.nodeValue || "").length) {
          node = node.previousSibling;
          continue;
        }
        spaced = /\s$/.test(last.nodeValue);
        break;
      }
      node = node.previousSibling;
    }
    if (spaced) gapFails.push(note.querySelector("summary").textContent.trim());
    else gapPass += 1;
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
    punctPass,
    punctFails,
    lineFails,
    gapPass,
    gapFails,
    chips,
  };
}

// Whitespace means a text node that ends in a space, not the marker's own
// padding. A neighbouring footnote is an element, so its body is not "before".
function markerFocusAndGap() {
  function whitespaceBefore(note) {
    let node = note.previousSibling;
    while (node) {
      if (node.nodeType === Node.TEXT_NODE) {
        const value = node.nodeValue ?? "";
        if (!value.length) {
          node = node.previousSibling;
          continue;
        }
        return /\s$/.test(value);
      }
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (node.classList.contains("liturgy-note")) return false;
        const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
        let last = null;
        let current;
        while ((current = walker.nextNode())) last = current;
        if (!last || !(last.nodeValue || "").length) {
          node = node.previousSibling;
          continue;
        }
        return /\s$/.test(last.nodeValue);
      }
      node = node.previousSibling;
    }
    return false;
  }

  const notes = [...document.querySelectorAll(".liturgy-note")];
  const gapFails = [];
  let gapPass = 0;
  const focusFails = [];
  let focusPass = 0;
  for (const note of notes) {
    const summary = note.querySelector("summary");
    if (whitespaceBefore(note)) gapFails.push(summary.textContent.trim());
    else gapPass += 1;
    for (const open of [false, true]) {
      note.open = open;
      summary.focus({ focusVisible: true });
      const style = getComputedStyle(summary);
      const width = parseFloat(style.outlineWidth);
      const visible =
        summary.matches(":focus-visible") && width > 0 && style.outlineStyle !== "none";
      const onSummary = document.activeElement === summary;
      if (!onSummary || !visible) {
        focusFails.push({
          n: summary.textContent.trim(),
          open,
          onSummary,
          active: document.activeElement?.tagName ?? null,
          width: style.outlineWidth,
          outlineStyle: style.outlineStyle,
        });
      } else {
        focusPass += 1;
      }
    }
    note.open = false;
  }
  const labels = notes.map((note) => note.querySelector("summary").getAttribute("aria-label"));
  return { gapPass, gapFails, focusPass, focusFails, labels };
}

function sameMultiset(a, b) {
  const count = (values) => {
    const map = new Map();
    for (const value of values) map.set(value, (map.get(value) ?? 0) + 1);
    return map;
  };
  const left = count(a);
  const right = count(b);
  if (left.size !== right.size) return false;
  for (const [key, value] of left) if (right.get(key) !== value) return false;
  return true;
}

// Chrome names a <summary> DisclosureTriangle. That is its disclosure button:
// the accessible name is the aria-label and expanded follows <details open>.
// Firefox exposes a push button. WebKitGTK's summary role is ATK_ROLE_UNKNOWN
// (the same on main) while the name and expanded state still track the note.
function axRoleOk(engine, node) {
  if (engine === "chromium") return node.role === "DisclosureTriangle" || node.role === "button";
  if (engine === "firefox") return node.role === "push button";
  return (node.role === "unknown" && node.tag === "summary") || node.role === "push button";
}

async function chromiumAx(cdp) {
  const { nodes } = await cdp.send("Accessibility.getFullAXTree");
  return nodes
    .filter((node) => !node.ignored && String(node.name?.value || "").startsWith("Translator's note "))
    .map((node) => ({
      name: node.name.value,
      role: node.role?.value ?? "",
      expanded: node.properties?.find((prop) => prop.name === "expanded")?.value?.value === true,
      focusable: node.properties?.find((prop) => prop.name === "focusable")?.value?.value === true,
      tag: "summary",
    }));
}

function platformAx(appName) {
  const script = `
import json, sys, pyatspi
app_name = sys.argv[1]
desk = pyatspi.Registry.getDesktop(0)
app = None
names = []
for i in range(desk.childCount):
    item = desk.getChildAtIndex(i)
    names.append(item.name)
    if item.name == app_name:
        app = item
if app is None:
    print(json.dumps({"error": "missing " + app_name, "apps": names}))
    raise SystemExit(0)
found = []
def walk(node, depth=0):
    if depth > 40:
        return
    try:
        name = node.name or ""
        count = node.childCount
    except Exception:
        return
    if name.startswith("Translator's note "):
        states = [pyatspi.stateToString(s) for s in node.getState().getStates()]
        attrs = []
        try:
            attrs = list(node.getAttributes())
        except Exception:
            pass
        tag = ""
        for attr in attrs:
            if attr.startswith("tag:"):
                tag = attr.split(":", 1)[1]
        found.append({
            "name": name,
            "role": node.getRoleName(),
            "expanded": "expanded" in states,
            "focusable": "focusable" in states,
            "tag": tag,
        })
    for i in range(count):
        try:
            walk(node.getChildAtIndex(i), depth + 1)
        except Exception:
            pass
walk(app)
print(json.dumps(found))
`;
  const result = spawnSync("python3", ["-c", script, appName], { encoding: "utf8" });
  if (result.status !== 0) {
    return { error: (result.stderr || result.stdout || "atspi failed").slice(0, 400) };
  }
  try {
    return JSON.parse(result.stdout);
  } catch {
    return { error: (result.stdout || "unreadable atspi").slice(0, 400) };
  }
}

function compareAx(engine, labels, nodes, open) {
  if (!Array.isArray(nodes)) return { pass: 0, fails: [{ open, error: nodes.error || "no tree" }] };
  const fails = [];
  if (!sameMultiset(nodes.map((node) => node.name), labels)) {
    fails.push({
      open,
      error: "names",
      expected: labels.length,
      got: nodes.length,
      sample: nodes.slice(0, 3),
    });
  }
  const byName = new Map();
  for (const node of nodes) {
    const list = byName.get(node.name) ?? [];
    list.push(node);
    byName.set(node.name, list);
  }
  let pass = 0;
  for (const label of labels) {
    const list = byName.get(label);
    const node = list?.shift();
    if (!node || !axRoleOk(engine, node) || node.expanded !== open || !node.focusable) {
      fails.push({
        open,
        label,
        role: node?.role ?? null,
        tag: node?.tag ?? null,
        expanded: node?.expanded ?? null,
        focusable: node?.focusable ?? null,
      });
    } else {
      pass += 1;
    }
  }
  return { pass, fails };
}

async function readAx(engine, page, cdp) {
  if (engine === "chromium") return chromiumAx(cdp);
  const app = engine === "firefox" ? "Firefox" : "MiniBrowser";
  let last = [];
  for (let attempt = 0; attempt < 8; attempt += 1) {
    last = platformAx(app);
    if (Array.isArray(last) && last.length) return last;
    await page.waitForTimeout(250);
  }
  return last;
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

async function checkAx(engine, page, cdp, entry, counts, samples) {
  const closed = await page.evaluate(() => {
    const notes = [...document.querySelectorAll(".liturgy-note")];
    for (const note of notes) note.open = false;
    return notes.map((note) => note.querySelector("summary").getAttribute("aria-label"));
  });
  let nodes = await readAx(engine.name, page, cdp);
  let result = compareAx(engine.name, closed, nodes, false);
  if (result.fails.length && engine.name !== "chromium") {
    for (let attempt = 0; attempt < 6 && result.fails.length; attempt += 1) {
      await page.waitForTimeout(300);
      nodes = await readAx(engine.name, page, cdp);
      result = compareAx(engine.name, closed, nodes, false);
    }
  }
  counts.ax.pass += result.pass;
  counts.ax.fail += result.fails.length;
  if (result.fails.length) {
    failed = true;
    if (samples.length < 16) samples.push({ locale: entry.locale, ax: result.fails.slice(0, 2) });
  }

  const opened = await page.evaluate(() => {
    const notes = [...document.querySelectorAll(".liturgy-note")];
    for (const note of notes) note.open = true;
    return notes.map((note) => note.querySelector("summary").getAttribute("aria-label"));
  });
  nodes = await readAx(engine.name, page, cdp);
  result = compareAx(engine.name, opened, nodes, true);
  if (result.fails.length && engine.name !== "chromium") {
    for (let attempt = 0; attempt < 6 && result.fails.length; attempt += 1) {
      await page.waitForTimeout(300);
      nodes = await readAx(engine.name, page, cdp);
      result = compareAx(engine.name, opened, nodes, true);
    }
  }
  counts.ax.pass += result.pass;
  counts.ax.fail += result.fails.length;
  if (result.fails.length) {
    failed = true;
    if (samples.length < 16) samples.push({ locale: entry.locale, axOpen: result.fails.slice(0, 2) });
  }
  await page.evaluate(() => {
    for (const note of document.querySelectorAll(".liturgy-note")) note.open = false;
  });
}

for (const engine of engines) {
  const counts = {
    scroll: tally(),
    marker: tally(),
    chip: tally(),
    focus: tally(),
    gap: tally(),
    punct: tally(),
    line: tally(),
    ax: tally(),
  };
  const samples = [];
  const browser = await engine.launch.launch({ headless: true });
  const context = await browser.newContext(engine.context);
  const page = await context.newPage();
  const cdp = engine.name === "chromium" ? await context.newCDPSession(page) : null;
  if (cdp) await cdp.send("Accessibility.enable");

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
          counts.punct.pass += data.punctPass;
          counts.punct.fail += data.punctFails.length;
          counts.line.pass += data.lineFails.length ? 0 : 1;
          counts.line.fail += data.lineFails.length ? 1 : 0;
          counts.gap.pass += data.gapPass;
          counts.gap.fail += data.gapFails.length;
          if (data.markerFails.length || data.punctFails.length || data.lineFails.length || data.gapFails.length) {
            failed = true;
            if (samples.length < 12) {
              samples.push({
                locale: entry.locale,
                width,
                marker: data.markerFails.slice(0, 3),
                punct: data.punctFails.slice(0, 3),
                line: data.lineFails.slice(0, 3),
                gap: data.gapFails.slice(0, 4),
              });
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
          if (width === 375) {
            const focus = await page.evaluate(markerFocusAndGap);
            counts.focus.pass += focus.focusPass;
            counts.focus.fail += focus.focusFails.length;
            if (focus.focusFails.length) {
              failed = true;
              samples.push({
                locale: entry.locale,
                focus: focus.focusFails.slice(0, 2),
              });
            }
            if (cdp) await checkAx(engine, page, cdp, entry, counts, samples);
          }
        }
      }
    }
  }

  await browser.close();

  if (engine.name !== "chromium") {
    const headed = await engine.launch.launch({
      headless: false,
      env: { ...process.env, GTK_MODULES: "gail:atk-bridge", GNOME_ACCESSIBILITY: "1" },
      ...(engine.name === "firefox" ? { firefoxUserPrefs: { "accessibility.force_disabled": 0 } } : {}),
    });
    const headedContext = await headed.newContext({ viewport: { width: 375, height: 812 } });
    const headedPage = await headedContext.newPage();
    for (const entry of pages) {
      await goto(headedPage, entry.text);
      await checkAx(engine, headedPage, null, entry, counts, samples);
    }
    await headed.close();
  }

  report[engine.name] = { counts, samples };
  console.log(engine.name, JSON.stringify(counts));
  if (samples.length) console.log(" samples", JSON.stringify(samples));
}

console.log("contrast", JSON.stringify(report.contrast, null, 2));
if (failed) process.exit(1);
