import { readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import LiturgyTextPage from "@/app/[locale]/_components/LiturgyTextPage";
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

// Chant stars are margins, and the newlines around them are trimmed, so
// "andemanušinen.*Pokeresštašno¹¹," is one unbreakable run on a phone.
// A `<wbr>` around each star breaks that run. It is hidden from 768px up so
// wide columns keep their current line breaks. break-words is the backstop.
describe("liturgy text wrapping", () => {
  it("breaks around chant stars and keeps footnote 11 on Pokeresštašno", () => {
    const { container } = render(
      <LanguageProvider>
        <LiturgyTextPage locale="en" />
      </LanguageProvider>
    );

    const rom = container.querySelector(".liturgy-rom");
    const sk = container.querySelector(".liturgy-sk");
    expect(rom!.className).toContain("break-words");
    expect(sk!.className).toContain("break-words");

    const line = [...container.querySelectorAll(".liturgy-rom")].find((el) =>
      el.textContent?.includes("Pokeresštašno")
    );
    expect(line).toBeTruthy();
    const html = line!.innerHTML;
    expect(html).toMatch(
      /liturgy-break[^>]*>\s*<wbr[^>]*>\s*<\/span>\s*<span[^>]*>\*<\/span>\s*<span class="liturgy-break"/
    );
    const marker = html.match(/Pokeresštašno<\/span><details[\s\S]*?<\/details>/);
    expect(marker).toBeTruthy();
    expect(marker![0]).not.toContain("<wbr");
  });

  it("does not let break-word split the footnote marker", () => {
    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
    const note = css.slice(css.indexOf(".liturgy-note {"), css.indexOf(".liturgy-note > summary"));
    const summary = css.slice(
      css.indexOf(".liturgy-note > summary {"),
      css.indexOf(".liturgy-note > summary::-webkit-details-marker")
    );
    expect(note).toContain("overflow-wrap: normal");
    expect(summary).toContain("overflow-wrap: normal");
    expect(summary).toContain("white-space: nowrap");
  });
});
