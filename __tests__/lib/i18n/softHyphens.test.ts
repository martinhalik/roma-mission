import { describe, expect, it } from "vitest";
import { DICTIONARIES } from "../../../lib/i18n";
import { withSoftHyphens } from "../../../lib/i18n/softHyphens";

const SOFT_HYPHEN = "\u00AD";

const SAMPLES = [
  "Задокументировано.",
  "Самообеспечивающийся приход",
  "Политика конфиденциальности",
  "Datenschutzerklärung",
  "Nutzungsbedingungen",
  "Официально оформлено",
];

function visible(text: string) {
  return text.replaceAll(SOFT_HYPHEN, "");
}

describe("withSoftHyphens", () => {
  it("inserts soft hyphens and leaves the visible letters unchanged", () => {
    for (const sample of SAMPLES) {
      const rendered = withSoftHyphens(sample);
      expect(rendered).toContain(SOFT_HYPHEN);
      expect(visible(rendered)).toBe(sample);
    }
  });

  it("keeps the longer конфиденциальности break and does not rewrite twice", () => {
    const rendered = withSoftHyphens("конфиденциальности");
    expect(rendered.split(SOFT_HYPHEN)).toEqual([
      "кон",
      "фи",
      "ден",
      "ци",
      "аль",
      "но",
      "сти",
    ]);
    expect(withSoftHyphens(rendered)).toBe(rendered);
  });

  it("does not put soft hyphens in the copy dictionaries", () => {
    expect(JSON.stringify(DICTIONARIES)).not.toContain(SOFT_HYPHEN);
  });
});
