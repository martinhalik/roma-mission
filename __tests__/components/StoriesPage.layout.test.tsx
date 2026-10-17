import { describe, it, expect, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
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
