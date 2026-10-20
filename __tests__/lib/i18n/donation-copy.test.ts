import { describe, expect, it } from "vitest";
import { DICTIONARIES } from "../../../lib/i18n";
import { LOCALES, type Locale } from "../../../lib/i18n/locales";

const DOLLAR_WORD =
  /dollar|dolár|dolar|доллар|долар|δολάρι|δολαρι/iu;
const CURRENCY_CODE = /\bUSD\b/;
const DOLLAR_SIGN = /\$/;

const IMPACT_BASE: Record<Locale, string> = {
  en: "Every dollar goes directly to the field.",
  sk: "Každé euro ide priamo do terénu.",
  cs: "Každá koruna jde přímo do terénu.",
  ro: "Fiecare leu ajunge direct pe teren.",
  de: "Jeder Euro fließt direkt in die Arbeit vor Ort.",
  sr: "Сваки динар иде директно на терен.",
  ru: "Каждый доллар идёт напрямую на служение.",
  mk: "Секој денар оди директно на терен.",
  el: "Κάθε ευρώ πηγαίνει απευθείας στο έργο της αποστολής.",
};

const DOLLAR_LOCALES = new Set<Locale>(["en", "ru"]);

function collectStrings(value: unknown, path: string, hits: string[]) {
  if (typeof value === "string") {
    if (DOLLAR_WORD.test(value) || CURRENCY_CODE.test(value) || DOLLAR_SIGN.test(value)) {
      hits.push(`${path}: ${value}`);
    }
    return;
  }
  if (!value || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    collectStrings(child, `${path}.${key}`, hits);
  }
}

describe("donation copy", () => {
  it.each(LOCALES.map((locale) => locale.code))(
    "impactBase in %s names that locale's currency",
    (locale) => {
      expect(DICTIONARIES[locale].donation.impactBase).toBe(IMPACT_BASE[locale]);
    }
  );

  it("keeps an English euro sentence for the switcher", () => {
    expect(DICTIONARIES.en.donation.impactBaseEur).toBe(
      "Every euro goes directly to the field.",
    );
  });

  it("mentions dollars only in the English and Russian dictionaries", () => {
    const hits: string[] = [];
    for (const locale of LOCALES.map((entry) => entry.code)) {
      if (DOLLAR_LOCALES.has(locale)) continue;
      collectStrings(DICTIONARIES[locale], locale, hits);
    }
    expect(hits).toEqual([]);
    expect(DICTIONARIES.en.donation.impactBase).toMatch(/dollar/i);
    expect(DICTIONARIES.ru.donation.impactBase).toMatch(/доллар/);
  });
});
