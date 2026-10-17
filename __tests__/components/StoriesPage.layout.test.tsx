import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import StoriesPage from "@/app/[locale]/_components/StoriesPage";
import LanguageProvider from "@/components/LanguageProvider";

beforeEach(() => {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
});

// The Stories page used to place fixed-width photos beside copy at the md
// breakpoint. Combined with md:px-[120px], that is wider than a 768px
// viewport: the featured quote was squeezed to its min-content and, in
// de/ru/mk/sr, pushed past the right edge. These rows stay stacked until lg,
// the same idea as the Mission page fix in #53.
describe("Stories page — fixed-width rows wait until lg", () => {
  it("stacks the featured testimony until lg, then sits the 440px photo beside the quote", () => {
    render(
      <LanguageProvider>
        <StoriesPage />
      </LanguageProvider>,
    );

    const photo = screen.getByRole("button", { name: "Watch Laco's story" });
    expect(photo.className).toContain("w-full");
    expect(photo.className).toContain("lg:w-[440px]");
    expect(photo.className).toContain("lg:shrink-0");
    expect(photo.className).not.toMatch(/\bmd:w-\[440px\]/);
    expect(photo.className).not.toMatch(/\bmd:shrink-0\b/);

    const row = photo.parentElement;
    expect(row).not.toBeNull();
    expect(row!.className).toContain("flex-col");
    expect(row!.className).toContain("lg:flex-row");
    expect(row!.className).toContain("lg:gap-20");
    expect(row!.className).not.toMatch(/\bmd:flex-row\b/);
    expect(row!.className).not.toMatch(/\bmd:gap-20\b/);

    const quote = row!.children[1] as HTMLElement;
    expect(quote.className).toContain("min-w-0");
    expect(quote.className).toContain("flex-1");
    // The 120px quote mark's line box is shorter than the glyph, so a 40px
    // row gap looks like ~14px. Extra padding restores ~40px while stacked.
    expect(quote.className).toContain("pt-6");
    expect(quote.className).toContain("lg:pt-0");
  });

  it("stacks the founder's story card until lg so the 360px photo does not clip the title", () => {
    const { container } = render(
      <LanguageProvider>
        <StoriesPage />
      </LanguageProvider>,
    );

    const photo = container.querySelector(".lg\\:w-\\[360px\\]");
    expect(photo).not.toBeNull();
    expect(photo!.className).toContain("w-full");
    expect(photo!.className).toContain("lg:shrink-0");
    expect(photo!.className).not.toMatch(/\bmd:w-\[360px\]/);
    expect(photo!.className).not.toMatch(/\bflex-shrink-0\b/);

    const card = photo!.parentElement as HTMLElement;
    expect(card.className).toContain("flex-col");
    expect(card.className).toContain("lg:flex-row");
    expect(card.className).toContain("overflow-hidden");
    expect(card.className).not.toMatch(/\bmd:flex-row\b/);

    const copy = card.children[1] as HTMLElement;
    expect(copy.className).toContain("min-w-0");
  });

  it("stacks the featured family story until lg so the 520px photo does not shove the quote off-screen", () => {
    const { container } = render(
      <LanguageProvider>
        <StoriesPage />
      </LanguageProvider>,
    );

    const photo = container.querySelector(".lg\\:w-\\[520px\\]");
    expect(photo).not.toBeNull();
    expect(photo!.className).toContain("w-full");
    expect(photo!.className).toContain("lg:shrink-0");
    expect(photo!.className).not.toMatch(/\bmd:w-\[520px\]/);

    const card = photo!.parentElement as HTMLElement;
    expect(card.className).toContain("flex-col");
    expect(card.className).toContain("lg:flex-row");
    expect(card.className).toContain("overflow-hidden");
    expect(card.className).not.toMatch(/\bmd:flex-row\b/);

    const copy = card.children[1] as HTMLElement;
    expect(copy.className).toContain("min-w-0");
  });
});

// Same fixed-width-plus-md-padding pattern, found while scanning the other
// pages. Stacking starts at lg, so 1024 and 1280 keep the previous row.
describe("other pages — fixed-width rows wait until lg", () => {
  const home = readFileSync(
    join(process.cwd(), "app/[locale]/_components/HomePage.tsx"),
    "utf8",
  );
  const involved = readFileSync(
    join(process.cwd(), "app/[locale]/_components/GetInvolvedPage.tsx"),
    "utf8",
  );

  it("stacks the home testimony until lg", () => {
    expect(home).toContain("lg:flex-row gap-8 lg:gap-16");
    expect(home).toContain("lg:w-[380px]");
    expect(home).not.toContain("md:w-[380px]");
    expect(home).not.toContain("md:flex-row gap-8 md:gap-16");
  });

  it("stacks the get-involved FAQ until lg", () => {
    expect(involved).toContain("lg:flex-row gap-10 lg:gap-20");
    expect(involved).toContain("lg:w-[400px]");
    expect(involved).not.toContain("md:w-[400px]");
    expect(involved).not.toContain("md:flex-row gap-10 md:gap-20");
  });
});
