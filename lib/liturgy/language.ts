/**
 * Background material for the "language" part of /liturgy: where this dialect
 * sits, what Scripture already exists in Romani, and what the language is.
 *
 * Every claim here is either (a) taken from the translator's own footnotes in
 * the spevník — those are first-hand and cited by footnote number — or (b)
 * from a public source recorded in `SOURCES`. Nothing is drawn from the 2024
 * rigorózna práca, which is not in the repository; when it arrives, its
 * material should be added here with the citation rather than inlined into
 * the page component.
 */

/** A word in the liturgy whose root travelled with the Roma from India. */
export interface Cognate {
  /** Exactly as it appears in the liturgy text. */
  romani: string;
  /** Sense in the liturgy. */
  gloss: string;
  /** The modern Hindi/Urdu relative, transliterated. */
  hindi: string;
  /** How many times the root occurs in the converted text. */
  occurrences: number;
}

/**
 * Counted from `content/liturgy/liturgy.json` — every one of these can be
 * found by the reader on /liturgy/text, which is the point of showing them.
 */
export const COGNATES: Cognate[] = [
  /*
   * The bare nominative `Devel` never occurs — the Liturgy always addresses or
   * inflects it. `Devla` is the vocative the people actually cry, 113 times;
   * the count is for the whole `Devl-` root, as the column says.
   */
  { romani: "Devla", gloss: "God (“O God!”)", hindi: "dev — god", occurrences: 176 },
  { romani: "Dad", gloss: "Father", hindi: "dādā — elder, grandfather", occurrences: 33 },
  { romani: "Čhavo", gloss: "Son", hindi: "chāvā — young one", occurrences: 31 },
  { romani: "manuš", gloss: "person", hindi: "manuṣya — human being", occurrences: 26 },
  { romani: "jekh", gloss: "one", hindi: "ek", occurrences: 26 },
  { romani: "anav", gloss: "name", hindi: "nām", occurrences: 20 },
  { romani: "dživipen", gloss: "life", hindi: "jīnā — to live", occurrences: 13 },
  { romani: "trin", gloss: "three", hindi: "tīn", occurrences: 7 },
  { romani: "kher", gloss: "house", hindi: "ghar", occurrences: 3 },
  { romani: "phral", gloss: "brother", hindi: "bhāī", occurrences: 3 },
  { romani: "paňi", gloss: "water", hindi: "pānī", occurrences: 1 },
];

/** A place where the translator recorded what another variety says instead. */
export interface DialectNote {
  /** The word or phrase in this translation. */
  term: string;
  gloss: string;
  /** What other varieties say, as recorded in the footnote. */
  variants: { where: string; form: string }[];
  /** Footnote number in the spevník, so the claim is checkable. */
  note: number;
}

/**
 * Drawn verbatim from the translator's footnotes. These are the useful kind of
 * difference: not spelling, but a different word chosen for the same prayer.
 */
export const DIALECT_NOTES: DialectNote[] = [
  {
    term: "Bachtalophenďo",
    gloss: "“Blessed”, literally “beautifully said”",
    variants: [
      { where: "Serbian Romani", form: "Bahtarďo" },
      { where: "Romanian Romani", form: "śukarphendo" },
    ],
    note: 1,
  },
  {
    term: "Amiň",
    gloss: "“Amen” — kept distinct because amen already means “we” in Romani",
    variants: [
      { where: "Serbian and Romanian Romani", form: "also avoid amen" },
    ],
    note: 2,
  },
  {
    term: "prepáčinen",
    gloss: "“have mercy” — Romani has no everyday word for it",
    variants: [
      { where: "Serbian Romani", form: "bahtalipe — “make us happy”" },
      { where: "Romanian Romani", form: "miluisar — borrowed from Church Slavonic" },
    ],
    note: 4,
  },
  {
    term: "hola",
    gloss: "“wrath” — one of the words that barely changes anywhere",
    variants: [
      { where: "Eastern Slovakia", form: "choli" },
      { where: "Serbian Romani", form: "holi" },
      { where: "Romanian Romani", form: "xoliatar" },
    ],
    note: 7,
  },
  {
    term: "Pokeresštašno",
    gloss: "“was crucified” — built on the word for cross",
    variants: [{ where: "Klenovec", form: "keresto — the cross" }],
    note: 11,
  },
  {
    term: "neboske",
    gloss: "“of heaven”",
    variants: [
      { where: "Klenovec", form: "cinlagi — known now only to the oldest" },
      { where: "Romanian Romani", form: "čéri" },
    ],
    note: 17,
  },
];

/** A landmark translation of Scripture into a Romani variety. */
export interface ScriptureEdition {
  variety: string;
  /** ISO 639-3 code where the edition is catalogued under one. */
  iso?: string;
  what: string;
  who: string;
  year: string;
  /** True for the variety this liturgy is written in. */
  ours?: boolean;
}

/**
 * Landmarks rather than a complete inventory: there is no settled public list
 * of every Romani Scripture edition, and portions exist in many more varieties
 * than appear here. Ordered oldest first.
 */
export const SCRIPTURE: ScriptureEdition[] = [
  {
    variety: "Caló (Spain)",
    iso: "rmr",
    what: "Gospel of Luke — the first Gospel in any Romani variety",
    who: "George Borrow, British and Foreign Bible Society",
    year: "1837",
  },
  {
    variety: "Arlija (Balkan)",
    iso: "rmn",
    what: "Gospel portions",
    who: "—",
    year: "1912",
  },
  {
    variety: "Latvian Romani (Chúkhno)",
    iso: "rml",
    what: "Gospel of John, the Lord's Prayer, the Ten Commandments",
    who: "Jānis Leimanis",
    year: "1933",
  },
  {
    variety: "Kalderash (Vlax)",
    iso: "rmy",
    what: "Psalms, then the New Testament",
    who: "Matéo Maximoff, French Bible Society",
    year: "1984 / 1995",
  },
  {
    variety: "Eastern Slovak Romani",
    iso: "rmc",
    what: "New Testament — E Nevi Zmluva pal o Romanes",
    who: "Slovo pre svet / The Word for the World",
    year: "2014",
  },
  {
    variety: "Carpathian Romani",
    iso: "rmc",
    what: "The whole Bible — Le Devleskero Lav andre romaňi čhib",
    who: "The Word for the World Slovakia",
    year: "2021",
  },
  {
    variety: "Central-Slovak Romani",
    iso: "rmc",
    what: "The Divine Liturgy of St John Chrysostom — this translation",
    who: "Martin Halík, Kresťanská rómska misia",
    year: "2024",
    ours: true,
  },
];

export interface Source {
  label: string;
  href?: string;
}

export const SOURCES: Source[] = [
  {
    label:
      "Matras, Y. (2002). Romani: A Linguistic Introduction — the five-group classification",
  },
  {
    label: "ISO 639-3: the rom macrolanguage (rmc, rmf, rml, rmn, rmo, rmw, rmy)",
    href: "https://iso639-3.sil.org/code/rom",
  },
  {
    label: "E Nevi Zmluva pal o Romanes (2014) and Le Devleskero Lav (2021)",
    href: "https://www.bible.com/versions/992-rmc-le-devleskero-lav-andre-roma%C5%88i-%C4%8Chib-slovensko-2021",
  },
  {
    label: "Translator's footnotes in Spevník v1.1 — cited by number above",
  },
];
