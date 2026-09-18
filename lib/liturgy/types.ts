/**
 * Data model for the Divine Liturgy of St John Chrysostom in the
 * Central-Slovak dialect of Romani.
 *
 * The shape is produced by `scripts/liturgy/convert-docx.ts` from the source
 * .docx and consumed by both the website (`app/[locale]/_components/Liturgy*`)
 * and the book builder (`scripts/liturgy/build-book.ts`). It is deliberately
 * flat and serialisable — no classes, no functions.
 */

/** Language of a single rendered line. Romani is tagged `rom` (ISO 639-3). */
export type LiturgyLang = "rom" | "sk";

/** Who says the line. Mirrors the four-line pattern of the source document. */
export type UtteranceRole = "priest" | "people" | "reader";

/**
 * A rubric is an instruction *about* the service rather than a spoken line
 * ("Tu kňaz číta z Biblie evanjelium…"). `direction` rubrics are always
 * performed; `optional` rubrics mark places where petitions may be added.
 */
export type RubricTone = "direction" | "optional";

/**
 * One language side of an utterance.
 *
 * `text` keeps the source text verbatim, including the `*` chant marks that
 * separate musical phrases, and carries inline footnote markers of the form
 * `[[fn:12]]` at the exact position they occupy in the docx.
 */
export interface LiturgyLine {
  /** Speaker label as printed in the source: "Kňaz", "Rašaj", "Ľud", "Roma", "Čtec". */
  label: string;
  /** Verbatim text with `*` chant marks and `[[fn:N]]` footnote markers. */
  text: string;
  /** Footnote numbers referenced by this line, in order of appearance. */
  notes: number[];
}

export interface Utterance {
  kind: "utterance";
  id: string;
  role: UtteranceRole;
  /**
   * Said quietly by the priest (the source sets these in small italics).
   * Printed in the book but visually recessed, as in a real service book.
   */
  quiet?: boolean;
  /**
   * Variable commemorations — the source greys these out because they carry
   * `(meno)` placeholders that change from parish to parish.
   */
  variable?: boolean;
  sk?: LiturgyLine;
  rom?: LiturgyLine;
}

export interface Rubric {
  kind: "rubric";
  id: string;
  tone: RubricTone;
  /** Rubrics exist only in Slovak in the source. */
  text: string;
}

export type LiturgyBlock = Utterance | Rubric;

export interface LiturgySection {
  id: string;
  /** URL-safe slug, used for in-page anchors and EPUB chapter filenames. */
  slug: string;
  /** 1 = major part (Liturgy of the Catechumens), 2 = section (Great Litany). */
  level: 1 | 2;
  /** Section titles exist only in Slovak in the source. */
  title: string;
  /**
   * True when the title was not marked as a Word heading and was recovered
   * from its formatting. Surfaced in the TODO file for review.
   */
  inferred?: boolean;
  blocks: LiturgyBlock[];
}

export interface LiturgyFootnote {
  /** 1-based display number. */
  n: number;
  /** Translator's note. Slovak. */
  text: string;
}

export interface LiturgyMeta {
  /**
   * `rom` is null until the translator supplies a Romani title — the source
   * document has only a Slovak one, and it is not this pipeline's place to
   * invent liturgical Romani. Consumers fall back to `sk`.
   */
  title: { rom: string | null; sk: string };
  version: string;
  /** ISO date the source document was last revised. */
  sourceDate: string;
  generatedAt: string;
  source: {
    file: string;
    sha256: string;
    bytes: number;
  };
  counts: {
    sections: number;
    utterances: number;
    rubrics: number;
    footnotes: number;
  };
}

export interface LiturgyDocument {
  meta: LiturgyMeta;
  footnotes: LiturgyFootnote[];
  sections: LiturgySection[];
}

/** Narrowing helper — `kind` is the discriminant. */
export function isUtterance(block: LiturgyBlock): block is Utterance {
  return block.kind === "utterance";
}

/** Narrowing helper — `kind` is the discriminant. */
export function isRubric(block: LiturgyBlock): block is Rubric {
  return block.kind === "rubric";
}
