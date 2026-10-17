import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Hyphenate from "@/components/Hyphenate";
import LanguageProvider, { useTranslation } from "@/components/LanguageProvider";
import { DICTIONARIES } from "../../../lib/i18n";
import type { Locale } from "../../../lib/i18n/locales";
import { withSoftHyphens } from "../../../lib/i18n/softHyphens";

const SOFT_HYPHEN = "\u00AD";

function visible(text: string) {
  return text.replaceAll(SOFT_HYPHEN, "");
}

function collectStrings(value: unknown, hits: string[]) {
  if (typeof value === "string") {
    hits.push(value);
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const child of Object.values(value)) collectStrings(child, hits);
}

const DICTIONARY_STRINGS: string[] = [];
collectStrings(DICTIONARIES, DICTIONARY_STRINGS);

const CASED_KEYS = [
  "Задокументировано",
  "Самообеспечивающийся",
  "конфиденциальности",
  "конфиденциальность",
  "Datenschutzerklärung",
  "Nutzungsbedingungen",
  "Официально",
  "населения",
  "Bevölkerung",
  "становништва",
  "населението",
];

function PlainProbe({ path }: { path: string }) {
  const { t } = useTranslation();
  return <span>{t(path)}</span>;
}

describe("withSoftHyphens", () => {
  it("inserts soft hyphens and leaves the visible letters unchanged", () => {
    const rendered = withSoftHyphens("Задокументировано.");
    expect(rendered).toBe(`Задоку${SOFT_HYPHEN}ментиро${SOFT_HYPHEN}вано.`);
    expect(visible(rendered)).toBe("Задокументировано.");
    expect(withSoftHyphens(rendered)).toBe(rendered);
  });

  it("keeps every piece at least three letters", () => {
    for (const sample of CASED_KEYS) {
      const pieces = withSoftHyphens(sample).split(SOFT_HYPHEN);
      expect(pieces.length).toBeGreaterThan(1);
      for (const piece of pieces) {
        expect(piece.length).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it("matches the casing used in the dictionaries", () => {
    for (const key of CASED_KEYS) {
      const hit = DICTIONARY_STRINGS.find((value) =>
        value.toLocaleLowerCase().includes(key.toLocaleLowerCase()),
      );
      expect(hit, key).toBeTruthy();
      const rendered = withSoftHyphens(hit ?? "");
      expect(rendered).toContain(SOFT_HYPHEN);
      expect(visible(rendered)).toBe(hit);
    }
    expect(withSoftHyphens("От населения")).toBe(`От насе${SOFT_HYPHEN}ления`);
    expect(withSoftHyphens("ОТ НАСЕЛЕНИЯ")).toBe(`ОТ НАСЕ${SOFT_HYPHEN}ЛЕНИЯ`);
    expect(visible(withSoftHyphens("официально"))).toBe("официально");
  });

  it("prefers the longer конфиденциальности break", () => {
    expect(withSoftHyphens("конфиденциальности").split(SOFT_HYPHEN)).toEqual([
      "кон",
      "фид",
      "енц",
      "иал",
      "ьно",
      "сти",
    ]);
  });

  it("does not put soft hyphens in the copy dictionaries", () => {
    expect(JSON.stringify(DICTIONARIES)).not.toContain(SOFT_HYPHEN);
    for (const value of DICTIONARY_STRINGS) {
      expect(visible(withSoftHyphens(value))).toBe(value);
    }
  });
});

describe("t()", () => {
  const paths = [
    "home.featuredMedia.titleLine1",
    "mission.vision.titleLine1",
    "privacyPolicy.title",
    "termsOfUse.title",
    "mission.countries.cardOfficial",
    "mission.countries.cardOfPopulation",
    "mission.countries.cardEstimated",
  ];

  it.each(["ru", "de"] as Locale[])("returns no soft hyphen for %s", (locale) => {
    const { container } = render(
      <LanguageProvider locale={locale}>
        {paths.map((path) => (
          <PlainProbe key={path} path={path} />
        ))}
      </LanguageProvider>,
    );
    for (const node of container.querySelectorAll("span")) {
      expect(node.textContent ?? "").not.toContain(SOFT_HYPHEN);
    }
  });

  it("hyphenates only through Hyphenate", () => {
    const { container } = render(
      <LanguageProvider locale="ru">
        <PlainProbe path="mission.countries.cardOfPopulation" />
      </LanguageProvider>,
    );
    const plain = container.querySelector("span")?.textContent ?? "";
    expect(plain).toBe("От населения");
    const { container: hyphenated } = render(<Hyphenate>{plain}</Hyphenate>);
    expect(hyphenated.textContent).toBe(`От насе${SOFT_HYPHEN}ления`);
  });
});
