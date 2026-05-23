import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// Guards the base-layer rule that gives every interactive element a
// pointer cursor. Tailwind v4 no longer ships this default, so the
// project relies on the rule below. If anyone removes or weakens it,
// this test fires before the PR can land.
describe("globals.css — cursor: pointer base rule", () => {
  const css = readFileSync(
    join(process.cwd(), "app/globals.css"),
    "utf8",
  );

  it("applies cursor: pointer to non-disabled <button>", () => {
    expect(css).toMatch(/button:not\(:disabled\)/);
  });

  it("applies cursor: pointer to [role=\"button\"]", () => {
    expect(css).toMatch(/\[role="button"\]:not\(\[aria-disabled="true"\]\)/);
  });

  it("declares cursor: pointer in the same rule block", () => {
    // Grab the block opened by `button:not(:disabled)` and confirm it
    // ends with `cursor: pointer;` before the next `}`.
    const block = css.match(
      /button:not\(:disabled\)[^}]*cursor:\s*pointer;[^}]*}/,
    );
    expect(block).not.toBeNull();
  });
});
