import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import Navbar from "@/components/Navbar";
import LanguageProvider from "@/components/LanguageProvider";

// Catches the case where someone reaches for a Tailwind `cursor-*` class
// (or inline style) on an interactive element and accidentally disables
// the pointer affordance. The base CSS rule in globals.css can't catch
// per-element overrides — this test does.
describe("Navbar — interactive elements never opt out of cursor: pointer", () => {
  it("has no cursor-default / cursor-not-allowed / cursor-auto on buttons or links", () => {
    const { container } = render(
      <LanguageProvider>
        <Navbar />
      </LanguageProvider>,
    );

    const interactives = container.querySelectorAll<HTMLElement>(
      'button, a[href], [role="button"]',
    );

    expect(interactives.length).toBeGreaterThan(0);

    for (const el of interactives) {
      const cls = el.className ?? "";
      expect(cls).not.toMatch(/\bcursor-(default|not-allowed|auto|none)\b/);

      const inlineCursor = el.style.cursor;
      expect(["", "pointer"]).toContain(inlineCursor);
    }
  });
});
