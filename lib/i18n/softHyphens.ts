const SOFT_HYPHEN = "\u00AD";

/**
 * Syllable breaks for words that overflow a phone column. Chromium and WebKit
 * in this stack do not ship a hyphenation dictionary for every locale, so
 * `hyphens: auto` alone still slices these words with no hyphen. The marks
 * are inserted when the string is rendered; the dictionaries stay unchanged.
 * A soft hyphen is invisible unless the line actually breaks there.
 */
const SOFT_HYPHENATED: Record<string, string> = {
  Задокументировано: shy("За", "до", "ку", "мен", "ти", "ро", "ва", "но"),
  Самообеспечивающийся: shy("Са", "мо", "обес", "пе", "чи", "ва", "ю", "щий", "ся"),
  конфиденциальности: shy("кон", "фи", "ден", "ци", "аль", "но", "сти"),
  конфиденциальность: shy("кон", "фи", "ден", "ци", "аль", "ность"),
  Datenschutzerklärung: shy("Daten", "schutz", "er", "klä", "rung"),
  Nutzungsbedingungen: shy("Nutzungs", "be", "din", "gun", "gen"),
  Официально: shy("Офи", "ци", "аль", "но"),
};

const SOFT_HYPHEN_KEYS = Object.keys(SOFT_HYPHENATED).sort(
  (a, b) => b.length - a.length,
);

function shy(...parts: string[]): string {
  return parts.join(SOFT_HYPHEN);
}

export function withSoftHyphens(text: string): string {
  let out = text;
  for (const key of SOFT_HYPHEN_KEYS) {
    if (!out.includes(key)) continue;
    out = out.split(key).join(SOFT_HYPHENATED[key]);
  }
  return out;
}
