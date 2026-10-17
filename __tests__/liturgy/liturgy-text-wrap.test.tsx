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
// A `<wbr>` after each star breaks that run and leaves the star on the
// preceding phrase. It is hidden from 768px up so wide columns keep their
// current line breaks. break-words is the backstop.
describe("liturgy text wrapping", () => {
  it("breaks after chant stars and keeps footnote 11 on Pokeresštašno", () => {
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
      /<span[^>]*>\*<\/span>\s*<span class="liturgy-break"[^>]*>\s*<wbr/
    );
    expect(html).not.toMatch(
      /liturgy-break[^>]*>\s*<wbr[^>]*>\s*<\/span>\s*<span[^>]*>\*<\/span>/
    );
    const marker = html.match(/Pokeresštašno<\/span><details[\s\S]*?<\/details>/);
    expect(marker).toBeTruthy();
    expect(marker![0]).not.toContain("<wbr");
    // `inline` is a utility and would beat `.liturgy-note[open] { display: contents }`.
    const details = [...line!.querySelectorAll("details")].find(
      (el) => el.querySelector("summary")?.textContent === "11"
    );
    expect(details?.className.split(/\s+/)).not.toContain("inline");
    expect(details?.querySelector("summary")?.getAttribute("aria-label")).toBe(
      "Translator's note 11"
    );
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
    const open = css.slice(
      css.indexOf(".liturgy-note[open] {"),
      css.indexOf(".liturgy-note[open] {") + 180
    );
    expect(open).toContain("display: contents");
    const focus = css.slice(
      css.indexOf(".liturgy-note > summary:focus-visible"),
      css.indexOf(".liturgy-note > summary:focus-visible") + 240
    );
    expect(focus).toContain("outline: 2px solid var(--gold)");
    expect(focus).toContain("outline-offset: 2px");
  });

  it("gives the language chips a 44px target and a colour the selected state can override", () => {
    const { container } = render(
      <LanguageProvider>
        <LiturgyTextPage locale="en" />
      </LanguageProvider>
    );
    const labels = [...container.querySelectorAll(".liturgy-view label")];
    expect(labels.map((label) => label.textContent)).toEqual([
      "Both",
      "Romani",
      "Slovak",
    ]);
    for (const label of labels) {
      expect(label.className).toContain("min-h-11");
      expect(label.className).not.toContain("text-[var(--text-secondary)]");
      expect(label.className).not.toContain("hover:text-");
    }

    const css = readFileSync(join(process.cwd(), "app/globals.css"), "utf8");
    const rule = css.slice(
      css.indexOf(".liturgy-view label {"),
      css.indexOf(".liturgy-view:has(#liturgy-view-both:checked)")
    );
    expect(rule).toContain("color: var(--text-secondary)");
    expect(rule).toContain("color: var(--text-primary)");
  });
});
