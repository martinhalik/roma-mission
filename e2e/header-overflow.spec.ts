import { expect, test, type Locator, type Page } from "@playwright/test";
import { LOCALES } from "../lib/i18n/locales";
import { ROUTE_KEYS, ROUTE_SLUGS, type RouteKey } from "../lib/i18n/routes";

const PATHS: string[] = [];
for (const locale of LOCALES) {
  for (const key of ROUTE_KEYS) {
    const slug = ROUTE_SLUGS[locale.code][key as RouteKey];
    PATHS.push(slug ? `/${locale.code}/${slug}` : `/${locale.code}`);
  }
}

interface OverflowReport {
  scrollWidth: number;
  clientWidth: number;
  past: string[];
}

async function reportOverflow(page: Page): Promise<OverflowReport> {
  return page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const past: string[] = [];
    document.querySelectorAll("header, header *, nav, nav *, h1").forEach((el) => {
      const rect = el.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      if (rect.right > vw + 1 && rect.left < vw) {
        const text = (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 40);
        past.push(`${el.tagName} ${text}`);
      }
    });
    return {
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: vw,
      past,
    };
  });
}

function trackHydration(page: Page): string[] {
  const errors: string[] = [];
  page.on("console", (msg) => {
    const text = msg.text();
    if (msg.type() === "error" && /418|hydrat/i.test(text)) errors.push(text);
  });
  page.on("pageerror", (err) => {
    const text = String(err);
    if (/418|hydrat/i.test(text)) errors.push(text);
  });
  return errors;
}

async function waitForHydration(page: Page) {
  await page.waitForFunction(() => {
    const el = document.querySelector("nav a, nav button");
    if (!el) return false;
    return Object.keys(el).some((key) => key.startsWith("__reactFiber$"));
  });
}

async function focusWithKeyboard(page: Page, locator: Locator) {
  await locator.focus();
  await page.keyboard.press("Shift+Tab");
  await page.keyboard.press("Tab");
  await expect(locator).toBeFocused();
}

async function expectFocusRing(page: Page) {
  const ring = await page.evaluate(() => {
    const el = document.activeElement;
    if (!el || !(el instanceof HTMLElement)) return { visible: false, style: "" };
    const style = getComputedStyle(el);
    const outline = Number.parseFloat(style.outlineWidth) || 0;
    const visible =
      el.matches(":focus-visible") &&
      style.outlineStyle !== "none" &&
      outline > 0;
    return { visible, style: `${style.outlineStyle} ${style.outlineWidth}` };
  });
  expect(ring.visible, `focus ring ${ring.style}`).toBe(true);
}

test.describe("header does not overflow at 320px", () => {
  for (const path of PATHS) {
    test(path, async ({ page }) => {
      const hydration = trackHydration(page);
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await waitForHydration(page);
      const report = await reportOverflow(page);
      expect(
        report.scrollWidth,
        report.past.join(" | "),
      ).toBeLessThanOrEqual(report.clientWidth);
      expect(report.past).toEqual([]);
      const marked = await page.evaluate(() => {
        const shy = "\u00AD";
        const hits: string[] = [];
        const title = document.title;
        if (title.includes(shy)) hits.push(`title ${title.slice(0, 80)}`);
        document
          .querySelectorAll('meta[name="description"], meta[property^="og:"]')
          .forEach((el) => {
            const content = el.getAttribute("content") || "";
            if (content.includes(shy)) {
              const name = el.getAttribute("property") || el.getAttribute("name") || "meta";
              hits.push(`${name} ${content.slice(0, 80)}`);
            }
          });
        document.querySelectorAll("[aria-label], [title], [alt], [placeholder]").forEach((el) => {
          for (const attr of ["aria-label", "title", "alt", "placeholder"]) {
            const value = el.getAttribute(attr);
            if (value && value.includes(shy)) hits.push(`${attr} ${value.slice(0, 80)}`);
          }
        });
        return hits;
      });
      expect(marked).toEqual([]);
      // Playwright's Chromium has no Macedonian Intl data, so the activity
      // page's relative date hydrates as English while Node rendered
      // Macedonian. Firefox and WebKit include `mk` and stay quiet. That
      // mismatch predates the overflow fix; any other hydration error fails.
      const unexpected = hydration.filter(
        (text) =>
          !(
            text.includes("HeroPreviewPost") &&
            text.includes("server rendered text didn't match the client")
          ),
      );
      expect(unexpected).toEqual([]);
    });
  }
});

test.describe("header controls", () => {
  test("menu and language switcher at 320px", async ({ page }) => {
    const hydration = trackHydration(page);
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/ru", { waitUntil: "domcontentloaded" });
    await waitForHydration(page);

    const toggle = page.getByRole("button", { name: "Открыть меню" });
    await focusWithKeyboard(page, toggle);
    await expectFocusRing(page);

    const drawer = page.locator("div.lg\\:hidden.border-t");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");
    await expect(drawer.getByRole("link", { name: "МИССИЯ", exact: true })).toBeVisible();

    const language = drawer.getByRole("button", { name: "Выберите язык" });
    await focusWithKeyboard(page, language);
    await expectFocusRing(page);
    await language.click();
    await expect(language).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("listbox", { name: "Выберите язык" })).toBeVisible();

    await page.keyboard.press("Escape");
    await expect(language).toHaveAttribute("aria-expanded", "false");
    await expect(page.getByRole("listbox", { name: "Выберите язык" })).toHaveCount(0);

    await language.click();
    await expect(language).toHaveAttribute("aria-expanded", "true");
    await page.getByText("Выберите язык", { exact: true }).click();
    await expect(language).toHaveAttribute("aria-expanded", "false");

    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(drawer.getByRole("link", { name: "МИССИЯ", exact: true })).toHaveCount(0);
    expect(hydration).toEqual([]);
  });

  test("menu and language switcher at 375px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto("/en", { waitUntil: "domcontentloaded" });
    await waitForHydration(page);

    const toggle = page.getByRole("button", { name: "Toggle menu" });
    await focusWithKeyboard(page, toggle);
    await expectFocusRing(page);
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "true");

    const drawer = page.locator("div.lg\\:hidden.border-t");
    const language = drawer.getByRole("button", { name: "Select language" });
    await focusWithKeyboard(page, language);
    await expectFocusRing(page);
    // Desktop Firefox's device profile drops Playwright pointer clicks on this
    // mid-drawer control (the action reports success and no event arrives).
    // HTMLElement.click() still runs the same React onClick handler.
    await language.evaluate((el: HTMLButtonElement) => el.click());
    await expect(language).toHaveAttribute("aria-expanded", "true");
    await expect(page.getByRole("listbox", { name: "Select language" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(language).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("Escape");
    await toggle.click();
    await expect(toggle).toHaveAttribute("aria-expanded", "false");
  });

  test("desktop language switcher closes on Escape", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/de", { waitUntil: "domcontentloaded" });
    await waitForHydration(page);

    const language = page
      .locator("nav.hidden")
      .getByRole("button", { name: "Sprache wählen" });
    await focusWithKeyboard(page, language);
    await expectFocusRing(page);
    await language.click();
    await expect(page.getByRole("option", { name: /Deutsch/ })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("option", { name: /Deutsch/ })).toHaveCount(0);
  });
});

const HYPHEN_CASES = [
  { path: "/ru", word: "Задокументировано", lang: "ru" },
  { path: "/ru/missiya", word: "Самообеспечивающийся", lang: "ru" },
  { path: "/ru/konfidentsialnost", word: "конфиденциальности", lang: "ru" },
  { path: "/de/datenschutz", word: "Datenschutzerklärung", lang: "de" },
  { path: "/de/nutzungsbedingungen", word: "Nutzungsbedingungen", lang: "de" },
] as const;

const HYPHEN_WIDTHS = [320, 360, 375] as const;

interface LineBreak {
  gap: number;
  hyphenRect: boolean;
  /** Firefox can paint a dictionary hyphen inside the last letter's advance. */
  wideGlyph: boolean;
  ok: boolean;
}

interface WordLayout {
  lang: string;
  hyphens: string;
  overflowWrap: string;
  fontSize: string;
  hasSoftHyphen: boolean;
  /** Ink right edge minus the padding box's right edge. Negative means inside. */
  inkPast: number;
  /** Letters of this word on each visual line, after the Chromium hyphen quirk. */
  lines: string[];
  word: string;
  breaks: LineBreak[];
}

/**
 * A mid-word break counts as hyphenated when Chromium paints the hyphen as
 * its own narrow rect, when Firefox/WebKit extend the line box past the
 * last letter, or when Firefox folds the hyphen into that letter's advance
 * (the line box then ends on the letter and the gap is ~0, but the letter
 * is far wider than the same letter elsewhere). Heading hyphens are about
 * 10px; the 9px stat label's hyphen is about 3px. Character tops alone
 * mis-count Chromium: the first glyph of the next line often reports the
 * previous line's top.
 */
async function wordLayout(
  page: Page,
  word: string,
  selector: string,
  everyWord = false,
): Promise<WordLayout[]> {
  return page.evaluate(({ target, selector: rootSelector, everyWord: allWords }) => {
    const layouts: WordLayout[] = [];
    const nodes = document.querySelectorAll(rootSelector);
    for (const el of nodes) {
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let node: Node | null;
      while ((node = walker.nextNode())) {
        if (node.nodeType !== Node.TEXT_NODE) continue;
        const text = node as Text;
        const raw = text.textContent || "";
        const plain = raw.replace(/\u00AD/g, "");
        const runs: { start: number; word: string }[] = [];
        if (allWords) {
          for (const match of plain.matchAll(/\p{L}+/gu)) {
            if (match.index == null || match[0].length < 2) continue;
            runs.push({ start: match.index, word: match[0] });
          }
        } else {
          const found = plain.indexOf(target);
          if (found >= 0) runs.push({ start: found, word: target });
        }
        if (runs.length === 0) continue;
        el.scrollIntoView({ block: "center" });
        for (const run of runs) {
        const start = run.start;
        const targetWord = run.word;
        const rawAt = (plainIndex: number) => {
          let seen = 0;
          for (let i = 0; i < raw.length; i++) {
            if (raw[i] === "\u00AD") continue;
            if (seen === plainIndex) return i;
            seen++;
          }
          return raw.length;
        };
        const range = document.createRange();
        range.setStart(text, rawAt(start));
        range.setEnd(text, rawAt(start + targetWord.length));
        const wordRects = [...range.getClientRects()].filter(
          (rect) => rect.width > 1 && rect.height > 2,
        );
        const chars: { ch: string; top: number; right: number; width: number }[] = [];
        for (let index = start; index < start + targetWord.length; index++) {
          range.setStart(text, rawAt(index));
          range.setEnd(text, rawAt(index) + 1);
          const rect = [...range.getClientRects()].find(
            (item) => item.width > 0.4 && item.width < 80 && item.height > 2,
          );
          if (!rect) continue;
          chars.push({
            ch: plain[index] ?? "",
            top: rect.top,
            right: rect.right,
            width: rect.width,
          });
        }
        const wide = chars.filter((glyph) => glyph.width >= 5).map((glyph) => glyph.width);
        wide.sort((a, b) => a - b);
        const median = wide.length ? wide[Math.floor(wide.length / 2)] : 8;
        const groups: {
          top: number;
          chars: { ch: string; top: number; right: number; width: number }[];
        }[] = [];
        const place = (
          top: number,
          glyph: { ch: string; top: number; right: number; width: number },
        ) => {
          let group = groups.find((item) => Math.abs(item.top - top) < 4);
          if (!group) {
            group = { top, chars: [] };
            groups.push(group);
          }
          group.chars.push(glyph);
        };
        for (let index = 0; index < chars.length; index++) {
          const glyph = chars[index];
          const next = chars[index + 1];
          // Chromium paints the hyphen as the first character of the next
          // line and reports that glyph on the previous line's top.
          const hyphenGhost =
            glyph.width < median * 0.65 && Boolean(next && next.top > glyph.top + 4);
          place(hyphenGhost && next ? next.top : glyph.top, glyph);
        }
        const breaks: LineBreak[] = [];
        for (let index = 0; index < groups.length - 1; index++) {
          const group = groups[index];
          const last = group.chars[group.chars.length - 1];
          const sameLine = wordRects.filter((rect) => Math.abs(rect.top - group.top) < 4);
          const textRect = sameLine.reduce<DOMRect | null>(
            (widest, rect) => (widest && widest.width > rect.width ? widest : rect),
            null,
          );
          const hyphenRect = sameLine.some(
            (rect) =>
              textRect &&
              rect !== textRect &&
              rect.width <= 18 &&
              rect.left >= textRect.right - 4,
          );
          const gap = textRect ? textRect.right - last.right : 0;
          const peers = chars.filter(
            (glyph) => glyph !== last && glyph.ch === last.ch && glyph.width >= 5,
          );
          const peerWidths = peers.map((glyph) => glyph.width).sort((a, b) => a - b);
          const others = chars
            .filter((glyph) => glyph !== last && glyph.width >= 5)
            .map((glyph) => glyph.width)
            .sort((a, b) => a - b);
          const baseline = peerWidths.length
            ? peerWidths[Math.floor(peerWidths.length / 2)]
            : others.length
              ? others[Math.floor(others.length / 2)]
              : median;
          // Same letter: hinting never adds 40%. A unique last letter has to
          // clear a higher bar so a naturally wide glyph is not a hyphen.
          const wideGlyph = baseline > 0 && last.width > baseline * (peerWidths.length ? 1.4 : 1.55);
          breaks.push({
            gap: Math.round(gap),
            hyphenRect,
            wideGlyph,
            ok: hyphenRect || gap > 2 || wideGlyph,
          });
        }
        const style = getComputedStyle(el);
        const box = el.parentElement?.getBoundingClientRect();
        const inkRight = wordRects.reduce((right, rect) => Math.max(right, rect.right), 0);
        layouts.push({
          lang: document.documentElement.lang,
          hyphens: style.getPropertyValue("hyphens") || style.getPropertyValue("-webkit-hyphens"),
          overflowWrap: style.getPropertyValue("overflow-wrap"),
          fontSize: style.fontSize,
          hasSoftHyphen: raw.includes("\u00AD"),
          inkPast: box ? inkRight - box.right : 0,
          lines: groups.map((group) => group.chars.map((glyph) => glyph.ch).join("")),
          word: targetWord,
          breaks,
        });
        }
      }
    }
    return layouts;
  }, { target: word, selector, everyWord });
}

test.describe("mid-word heading breaks show a hyphen", () => {
  for (const width of HYPHEN_WIDTHS) {
    for (const item of HYPHEN_CASES) {
      test(`${item.path} “${item.word}” at ${width}px`, async ({ page }, testInfo) => {
        await page.setViewportSize({ width, height: 800 });
        await page.goto(item.path, { waitUntil: "domcontentloaded" });
        await waitForHydration(page);

        const overflow = await reportOverflow(page);
        expect(overflow.scrollWidth, overflow.past.join(" | ")).toBeLessThanOrEqual(
          overflow.clientWidth,
        );

        const layouts = await wordLayout(page, item.word, "h1, h2, h3, h4, h5, h6");
        expect(layouts.length, "heading contains the word").toBeGreaterThan(0);
        for (const layout of layouts) {
          expect(layout.lang).toBe(item.lang);
          expect(layout.hyphens).toBe("auto");
          expect(layout.overflowWrap).toBe("break-word");
          expect(layout.hasSoftHyphen).toBe(true);
          expect(
            layout.breaks.filter((item) => !item.ok),
            `${layout.word}: ${layout.lines.join(" | ")} ${JSON.stringify(layout.breaks)}`,
          ).toEqual([]);
          if (layout.lines.length > 1) {
            for (const line of layout.lines) {
              expect(line.length, layout.lines.join(" | ")).toBeGreaterThanOrEqual(3);
            }
          }
        }

        const breaks = layouts.flatMap((layout) => layout.breaks);
        const mustBreak =
          width === 320 ||
          (testInfo.project.name === "webkit" &&
            width === 375 &&
            (item.word === "Самообеспечивающийся" || item.word === "конфиденциальности"));
        if (mustBreak) {
          expect(breaks.length, `${testInfo.project.name} should hyphenate`).toBeGreaterThan(0);
        }
      });
    }
  }
});

test.describe("mission stat label stays inside its cell", () => {
  test("Официально at 320px", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/ru/missiya", { waitUntil: "domcontentloaded" });
    await waitForHydration(page);

    const layouts = await wordLayout(page, "Официально", "span.hyphenate");
    expect(layouts.length).toBeGreaterThan(0);
    for (const layout of layouts) {
      expect(layout.fontSize).toBe("9px");
      expect(layout.hyphens).toBe("auto");
      // A single line reaches the divider (WebKit paints about 4px past it).
      // The label wraps on a soft hyphen and the ink stays inside the cell.
      expect(layout.inkPast, `ink past cell ${layout.inkPast.toFixed(1)}px`).toBeLessThanOrEqual(1);
      expect(layout.breaks.filter((item) => !item.ok)).toEqual([]);
      expect(layout.breaks.length, "wraps on a hyphen").toBeGreaterThan(0);
      for (const line of layout.lines) {
        expect(line.length, layout.lines.join(" | ")).toBeGreaterThanOrEqual(3);
      }
    }
  });
});

test.describe("stat labels in every locale", () => {
  for (const width of HYPHEN_WIDTHS) {
    for (const locale of LOCALES) {
      const slug = ROUTE_SLUGS[locale.code].mission;
      const path = `/${locale.code}/${slug}`;
      test(`${path} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await waitForHydration(page);

        const layouts = await wordLayout(page, "", ".hyphenate", true);
        expect(layouts.length, "mission card has stat labels").toBeGreaterThan(0);
        for (const layout of layouts) {
          expect(layout.hyphens).toBe("auto");
          expect(layout.fontSize).toBe("9px");
          expect(layout.breaks.filter((item) => !item.ok), layout.word).toEqual([]);
          if (layout.lines.length > 1) {
            for (const line of layout.lines) {
              expect(
                line.length,
                `${layout.word}: ${layout.lines.join(" | ")}`,
              ).toBeGreaterThanOrEqual(3);
            }
          }
        }
      });
    }
  }
});
