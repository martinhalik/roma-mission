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
