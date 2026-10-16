import { describe, expect, it } from "vitest";
import { DICTIONARIES } from "../../../lib/i18n";
import { LOCALES, type Locale } from "../../../lib/i18n/locales";

const DOLLAR_WORD =
  /dollar|dolár|dolar|доллар|долар|δολάρι|δολαρι/iu;
const CURRENCY_CODE = /\bUSD\b/;
const DOLLAR_SIGN = /\$/;

const IMPACT_BASE: Record<Locale, string> = {
  en: "Every euro goes directly to the field.",
  sk: "Každé euro ide priamo do terénu.",
  cs: "Každé euro jde přímo do terénu.",
  ro: "Fiecare euro ajunge direct pe teren.",
  de: "Jeder Euro fließt direkt in die Arbeit vor Ort.",
  sr: "Сваки евро иде директно на терен.",
  ru: "Каждый евро идёт напрямую на служение.",
  mk: "Секое евро оди директно на терен.",
  el: "Κάθε ευρώ πηγαίνει απευθείας στο έργο της αποστολής.",
};

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
    "impactBase in %s talks about euro",
    (locale) => {
      expect(DICTIONARIES[locale].donation.impactBase).toBe(IMPACT_BASE[locale]);
    }
  );

  it("has no dollar, USD, or $ left in any dictionary", () => {
    const hits: string[] = [];
    for (const locale of LOCALES.map((entry) => entry.code)) {
      collectStrings(DICTIONARIES[locale], locale, hits);
    }
    expect(hits).toEqual([]);
  });
});
