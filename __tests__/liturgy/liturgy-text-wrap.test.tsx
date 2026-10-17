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
    const keep = [...line!.querySelectorAll(".liturgy-keep")].find((el) =>
      el.textContent?.startsWith("Pokeresštašno")
    );
    expect(keep).toBeTruthy();
    expect(keep!.textContent?.startsWith("Pokeresštašno11,")).toBe(true);
    expect(keep!.innerHTML).not.toContain("<wbr");
    const details = keep!.querySelector("details");
    expect(details?.className.split(/\s+/)).not.toContain("inline");
    expect(details?.querySelector("summary")?.getAttribute("aria-label")).toBe(
      "Translator's note 11"
    );
    const cluster = keep!.parentElement;
    expect(cluster?.querySelector(".liturgy-note-body")?.textContent).toContain("11.");
    const navatin = [...line!.querySelectorAll(".liturgy-keep")].find((el) =>
      el.textContent?.startsWith("navatin")
    );
    expect(navatin?.textContent).toBe("navatin10");
    const following: string[] = [];
    let sibling = navatin?.parentElement?.nextSibling ?? null;
    while (sibling && !(sibling instanceof HTMLElement && sibling.classList.contains("liturgy-cluster"))) {
      following.push(sibling.textContent ?? "");
      sibling = sibling.nextSibling;
    }
    expect(following.join("").startsWith(" andemanušinen")).toBe(true);
    expect(navatin?.parentElement?.nextSibling?.nodeType).toBe(Node.TEXT_NODE);
    expect(navatin?.parentElement?.nextSibling?.textContent).toBe(" ");

    const agor = [...container.querySelectorAll(".liturgy-keep")].find((el) =>
      el.textContent?.startsWith("agor.")
    );
    expect(agor?.parentElement?.previousSibling?.nodeType).toBe(Node.TEXT_NODE);
    expect(agor?.parentElement?.previousSibling?.textContent).toBe(" ");
    expect(agor?.parentElement?.nextSibling?.nodeType).toBe(Node.TEXT_NODE);
    expect(agor?.parentElement?.nextSibling?.textContent).toBe("\n");
    expect(agor?.parentElement?.className).toContain("liturgy-cluster");
    const comma = keep!.querySelector(".liturgy-punct");
    expect(comma?.textContent).toBe(",");
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
    const keep = css.slice(css.indexOf(".liturgy-keep {"), css.indexOf(".liturgy-keep {") + 80);
    expect(keep).toContain("white-space: nowrap");
    expect(summary).toContain("padding: 0.85em 0.4em 0.85em 0");
    expect(summary).not.toContain("display: contents");
    const focus = css.slice(
      css.indexOf(".liturgy-note > summary:focus-visible"),
      css.indexOf(".liturgy-note > summary:focus-visible") + 420
    );
    expect(focus).toContain("outline: 2px solid var(--gold)");
    expect(focus).toContain("outline-offset: 1px");
    expect(css).toContain(".liturgy-note + .liturgy-note > summary");
    expect(css).toContain(".liturgy-keep > .liturgy-note:last-of-type > summary");
    const punct = css.slice(css.indexOf(".liturgy-punct {"), css.indexOf(".liturgy-punct {") + 120);
    expect(punct).toContain("display: inline-block");
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
