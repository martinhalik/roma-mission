const SOFT_HYPHEN = "\u00AD";

/**
 * Breaks for words that overflow a phone heading or a mission stat label.
 * Each piece is at least three letters, so a line cannot end on an orphan.
 * Chromium and WebKit in this stack do not ship a hyphenation dictionary for
 * every locale, and `hyphens: auto` then lets `overflow-wrap` slice the word
 * with no hyphen. The marks are inserted by `<Hyphenate>` at the visible
 * heading and label, which sets `hyphens: manual` so a dictionary cannot
 * pick a different point. German compounds break once, at the boundary.
 * `t()` and the dictionaries stay unchanged.
 * A soft hyphen is invisible unless the line actually breaks there.
 * Matching is case-insensitive so the dictionary's own casing is covered.
 */
const SOFT_HYPHEN_PATTERNS: { key: string; parts: string[] }[] = [
  { key: "Задокументировано", parts: ["Задоку", "ментиро", "вано"] },
  { key: "Самообеспечивающийся", parts: ["Само", "обеспе", "чиваю", "щийся"] },
  { key: "конфиденциальности", parts: ["кон", "фид", "енц", "иал", "ьно", "сти"] },
  { key: "конфиденциальность", parts: ["кон", "фид", "енц", "иал", "ьно", "сть"] },
  { key: "Datenschutzerklärung", parts: ["Datenschutz", "erklärung"] },
  { key: "Nutzungsbedingungen", parts: ["Nutzungs", "bedingungen"] },
  { key: "Официально", parts: ["Офици", "ально"] },
  { key: "Официјално", parts: ["Офици", "јално"] },
  { key: "населения", parts: ["насе", "ления"] },
  { key: "населението", parts: ["насе", "лението"] },
  { key: "становништва", parts: ["ста", "нов", "ништва"] },
  { key: "Проценето", parts: ["Проце", "нето"] },
  { key: "Bevölkerung", parts: ["Bevöl", "kerung"] },
  { key: "Geschätzt", parts: ["Gesch", "ätzt"] },
  { key: "πληθυσμού", parts: ["πληθυσ", "μού"] },
  { key: "Offiziell", parts: ["Offi", "ziell"] },
  { key: "Oficiálne", parts: ["Ofici", "álne"] },
  { key: "Oficiálně", parts: ["Ofici", "álně"] },
  { key: "populácie", parts: ["popu", "lácie"] },
  { key: "populație", parts: ["popu", "lație"] },
  { key: "populace", parts: ["popu", "lace"] },
  { key: "Population", parts: ["Popu", "lation"] },
  { key: "Estimated", parts: ["Esti", "mated"] },
  { key: "Званично", parts: ["Зва", "нично"] },
  { key: "Εκτίμηση", parts: ["Εκτί", "μηση"] },
];

const SOFT_HYPHEN_KEYS = [...SOFT_HYPHEN_PATTERNS].sort(
  (a, b) => b.key.length - a.key.length,
);

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function applyPattern(match: string, parts: string[]) {
  let index = 0;
  const slices: string[] = [];
  for (const part of parts) {
    slices.push(match.slice(index, index + part.length));
    index += part.length;
  }
  if (index !== match.length) return match;
  return slices.join(SOFT_HYPHEN);
}

export function withSoftHyphens(text: string): string {
  let out = text;
  for (const pattern of SOFT_HYPHEN_KEYS) {
    const expression = new RegExp(escapeRegExp(pattern.key), "gi");
    out = out.replace(expression, (match) => applyPattern(match, pattern.parts));
  }
  return out;
}
