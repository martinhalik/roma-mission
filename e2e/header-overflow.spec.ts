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
  scroll = true,
): Promise<WordLayout[]> {
  return page.evaluate(({ target, selector: rootSelector, everyWord: allWords, scroll: shouldScroll }) => {
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
        if (shouldScroll) el.scrollIntoView({ block: "center" });
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
          const rects = [...range.getClientRects()].filter(
            (item) => item.width > 0.4 && item.width < 80 && item.height > 2,
          );
          // Chromium paints the hyphen as an extra rect of the first letter
          // on the next line and gives that rect the previous line's top.
          const rect = rects.reduce<DOMRect | undefined>((chosen, item) => {
            if (!chosen || item.top > chosen.top + 4) return item;
            return chosen;
          }, undefined);
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
        const styled = text.parentElement ?? el;
        const style = getComputedStyle(styled);
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
  }, { target: word, selector, everyWord, scroll });
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
          expect(layout.hyphens).toBe("manual");
          expect(layout.overflowWrap).toBe("break-word");
          expect(layout.hasSoftHyphen).toBe(true);
          if (width === 320 && item.word === "Datenschutzerklärung") {
            expect(layout.lines).toEqual(["Datenschutz", "erklärung"]);
          }
          if (width === 320 && item.word === "Nutzungsbedingungen") {
            expect(layout.lines).toEqual(["Nutzungs", "bedingungen"]);
          }
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
      expect(layout.hyphens).toBe("manual");
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
          expect(layout.hyphens).toBe("manual");
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

const NARROW_WIDTHS = [320, 360] as const;
const WIDE_WIDTHS = [390, 414, 768, 1024, 1280] as const;

/** A wrapped heading must not open a line on punctuation such as a stranded period. */
async function punctuationLineStarts(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    const hits: string[] = [];
    const seen = new Set<Text>();
    const roots = document.querySelectorAll("h1, h2, h3, h4, h5, h6, .hyphenate");
    for (const el of roots) {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      const glyphs: { ch: string; top: number }[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) {
        const text = node as Text;
        if (seen.has(text)) continue;
        seen.add(text);
        const raw = text.textContent || "";
        const range = document.createRange();
        for (let index = 0; index < raw.length; index++) {
          const ch = raw[index];
          if (ch === "\u00AD" || ch === "\n") continue;
          range.setStart(text, index);
          range.setEnd(text, index + 1);
          const rects = [...range.getClientRects()].filter(
            (item) => item.width > 0.4 && item.height > 2,
          );
          const rect = rects.reduce<DOMRect | undefined>((chosen, item) => {
            if (!chosen || item.top > chosen.top + 4) return item;
            return chosen;
          }, undefined);
          if (!rect) continue;
          glyphs.push({ ch, top: rect.top });
        }
      }
      const lines: { top: number; chars: string[] }[] = [];
      for (const glyph of glyphs) {
        let line = lines.find((item) => Math.abs(item.top - glyph.top) < 4);
        if (!line) {
          line = { top: glyph.top, chars: [] };
          lines.push(line);
        }
        line.chars.push(glyph.ch);
      }
      for (const line of lines) {
        const text = line.chars.join("").trim();
        if (text.length === 0) continue;
        // A wrapped parenthetical may open on "(", which is the text.
        // A stranded period or comma from overflow-wrap is the failure.
        if (/^[.,;:!?…]/u.test(text)) {
          const label = (el.textContent || "").replace(/\u00AD/g, "").replace(/\s+/g, " ").trim().slice(0, 60);
          hits.push(`${label} → “${text.slice(0, 24)}”`);
        }
      }
    }
    return hits;
  });
}

function pathsFor(localeCode: string): string[] {
  return PATHS.filter(
    (path) => path === `/${localeCode}` || path.startsWith(`/${localeCode}/`),
  );
}

test.describe("narrow headings do not orphan a letter or punctuation", () => {
  for (const width of NARROW_WIDTHS) {
    for (const locale of LOCALES) {
      test(`${locale.code} at ${width}px`, async ({ page }) => {
        test.setTimeout(180_000);
        await page.setViewportSize({ width, height: 800 });
        for (const path of pathsFor(locale.code)) {
          await page.goto(path, { waitUntil: "domcontentloaded" });
          await waitForHydration(page);
          const layouts = await wordLayout(
            page,
            "",
            "h1, h2, h3, h4, h5, h6, .hyphenate",
            true,
            false,
          );
          for (const layout of layouts) {
            if (layout.lines.length < 2) continue;
            expect(
              layout.breaks.filter((item) => !item.ok),
              `${path} ${layout.word}: ${layout.lines.join(" | ")} ${JSON.stringify(layout.breaks)}`,
            ).toEqual([]);
            for (const line of layout.lines) {
              expect(
                line.length,
                `${path} ${layout.word}: ${layout.lines.join(" | ")}`,
              ).toBeGreaterThanOrEqual(3);
            }
          }
          const punct = await punctuationLineStarts(page);
          expect(punct, path).toEqual([]);
        }
      });
    }
  }
});

test.describe("wide headings do not hyphenate", () => {
  for (const width of WIDE_WIDTHS) {
    for (const locale of LOCALES) {
      test(`${locale.code} at ${width}px`, async ({ page }) => {
        test.setTimeout(180_000);
        await page.setViewportSize({ width, height: 900 });
        for (const path of pathsFor(locale.code)) {
          await page.goto(path, { waitUntil: "domcontentloaded" });
          await waitForHydration(page);
          const layouts = await wordLayout(
            page,
            "",
            "h1, h2, h3, h4, h5, h6, .hyphenate",
            true,
            false,
          );
          for (const layout of layouts) {
            if (layout.lines.length === 0) continue;
            expect(layout.hyphens, `${path} ${layout.word}`).toBe("none");
            expect(layout.overflowWrap, `${path} ${layout.word}`).toBe("normal");
            expect(
              layout.lines,
              `${path} ${layout.word} broke at ${width}px`,
            ).toHaveLength(1);
          }
        }
      });
    }
  }
});

const COPY_CASES = [
  { path: "/ru", needle: "Задокументировано" },
  { path: "/ru/konfidentsialnost", needle: "конфиденциальности" },
  { path: "/ru/media", needle: "Задокументировано" },
  { path: "/ru/uchastvovat", needle: "Присоединяйтесь" },
  { path: "/de/datenschutz", needle: "Datenschutzerklärung" },
  { path: "/sk/media", needle: "Zdokumentované" },
] as const;

test.describe("copying a hyphenated heading drops the soft hyphen", () => {
  for (const item of COPY_CASES) {
    test(item.path, async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 800 });
      await page.goto(item.path, { waitUntil: "domcontentloaded" });
      await waitForHydration(page);
      const copied = await page.evaluate(async (needle) => {
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node: Node | null;
        let target: Text | null = null;
        while ((node = walker.nextNode())) {
          const plain = (node.textContent || "").replace(/\u00AD/g, "");
          if (!plain.includes(needle)) continue;
          const host = node.parentElement;
          if (!host || host.closest("script, style, nav, footer")) continue;
          const box = host.getBoundingClientRect();
          if (box.width < 1 || box.height < 1) continue;
          if (!host.closest(".hyphenate-shy")) continue;
          target = node as Text;
          break;
        }
        const host = target?.parentElement;
        if (!host) return "missing";
        const box = host.getBoundingClientRect();
        if (box.width < 1 || box.height < 1 || host.closest("script, style, nav, footer")) {
          return "hidden";
        }
        host.scrollIntoView({ block: "center" });
        const range = document.createRange();
        range.selectNodeContents(host);
        const selection = document.getSelection();
        selection?.removeAllRanges();
        selection?.addRange(range);
        // Window bubble runs after the document listener, so this reads the
        // text that listener wrote even if it was registered later.
        function readCopy(): string {
          let copied = "no-event";
          const onCopy = (event: ClipboardEvent) => {
            copied = `${event.defaultPrevented ? "prevented" : "open"}:${event.clipboardData?.getData("text/plain") ?? ""}`;
          };
          window.addEventListener("copy", onCopy);
          document.execCommand("copy");
          window.removeEventListener("copy", onCopy);
          return copied;
        }
        let copied = readCopy();
        for (let attempt = 0; attempt < 8 && !copied.includes(needle); attempt++) {
          await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
          copied = readCopy();
        }
        return copied;
      }, item.needle);
      const copiedText = copied.includes(":") ? copied.slice(copied.indexOf(":") + 1) : copied;
      expect(copiedText, `${item.path} (${copied})`).not.toContain("\u00AD");
      expect(copiedText.replace(/\s+/g, " "), `${item.path} (${copied})`).toContain(item.needle);
    });
  }
});

const CARD_BADGE_WIDTHS = [320, 360, 390, 768, 1024, 1280] as const;

test.describe("country card badges keep a gap and stay in the header", () => {
  for (const width of CARD_BADGE_WIDTHS) {
    for (const locale of LOCALES) {
      const path = `/${locale.code}/${ROUTE_SLUGS[locale.code].mission}`;
      test(`${path} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path, { waitUntil: "domcontentloaded" });
        await waitForHydration(page);
        await page.evaluate(() => document.fonts.ready);
        await page.waitForFunction(
          () => document.querySelectorAll("[data-badge-settled='true']").length >= 11,
        );
        const cards = await page.evaluate(() => {
          return [...document.querySelectorAll("h3")].flatMap((heading) => {
            const row = heading.parentElement;
            const header = row?.parentElement;
            if (!header || !row?.querySelector("span")) return [];
            const badge = [...header.children].find(
              (el) => el !== row && el.tagName === "SPAN",
            );
            if (!(badge instanceof HTMLElement)) return [];
            const headerBox = header.getBoundingClientRect();
            const nameBox = heading.getBoundingClientRect();
            const badgeBox = badge.getBoundingClientRect();
            if (headerBox.width < 1 || badgeBox.width < 1 || nameBox.width < 1) return [];
            const horizontal = Math.max(
              nameBox.left - badgeBox.right,
              badgeBox.left - nameBox.right,
            );
            const vertical = Math.max(
              nameBox.top - badgeBox.bottom,
              badgeBox.top - nameBox.bottom,
            );
            const gap =
              horizontal < 0 && vertical < 0
                ? Math.max(horizontal, vertical)
                : horizontal > 0 && vertical > 0
                  ? Math.hypot(horizontal, vertical)
                  : Math.max(horizontal, vertical);
            return [
              {
                name: (heading.textContent || "").replace(/\s+/g, " ").trim(),
                gap,
                badgeRight: badgeBox.right,
                headerRight: headerBox.right,
              },
            ];
          });
        });
        expect(cards.length, path).toBeGreaterThanOrEqual(11);
        for (const card of cards) {
          expect(card.gap, `${path} ${card.name}`).toBeGreaterThanOrEqual(8);
          expect(
            card.badgeRight,
            `${path} ${card.name} badge past the header`,
          ).toBeLessThanOrEqual(card.headerRight + 1);
        }
      });
    }
  }
});
