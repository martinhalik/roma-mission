/**
 * Converts the Romani/Slovak liturgy songbook from .docx into the structured
 * JSON the site and the book builder both read.
 *
 *   npm run liturgy:convert
 *
 * Inputs   content/liturgy/source/spevnik-v1.1.docx
 * Outputs  content/liturgy/liturgy.json
 *          content/liturgy/TODO-liturgy.md
 *
 * The source document carries its structure in formatting rather than in Word
 * styles, so the rules below are derived from the v1.1 document. They are kept
 * in one place, `classify()`, and every paragraph the rules cannot place with
 * confidence is reported in the TODO file instead of being silently dropped.
 *
 * Nothing here "corrects" Romani. Text is copied verbatim, including the `*`
 * chant marks that divide musical phrases.
 */

import { createHash } from "node:crypto";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import JSZip from "jszip";
import { parser as saxParser } from "sax";
import type {
  LiturgyBlock,
  LiturgyDocument,
  LiturgyFootnote,
  LiturgyLine,
  LiturgySection,
  Rubric,
  Utterance,
  UtteranceRole,
} from "@/lib/liturgy/types";

// ─── Configuration ──────────────────────────────────────────────────────────

const ROOT = resolve(import.meta.dirname, "../..");
const SOURCE = resolve(ROOT, "content/liturgy/source/spevnik-v1.1.docx");
const OUT_JSON = resolve(ROOT, "content/liturgy/liturgy.json");
const OUT_TODO = resolve(ROOT, "content/liturgy/TODO-liturgy.md");

const VERSION = "1.1";
/** `dcterms:created` of the source document; last revised on Drive 2025-08-06. */
const SOURCE_DATE = "2025-08-06";
const TITLE_SK = "Svätá liturgia sv. Jána Zlatoústeho";
/**
 * The source document has no Romani title — its only H1 is the Slovak one.
 * A Romani title is deliberately NOT invented here: it belongs on the book
 * cover and in the page heading, and inventing liturgical Romani is exactly
 * what this project must not do. Fill it in once the translator supplies it;
 * until then the TODO asks for it and the UI falls back to Slovak.
 */
const TITLE_ROM: string | null = null;

/** Titles that are major parts of the service rather than ordinary sections. */
const PART_TITLES = ["liturgia katechumenov", "liturgia verných"];

/** Speaker label → role and language. `Čtec` occurs in both languages. */
const SPEAKERS: Record<string, { role: UtteranceRole; lang?: "sk" | "rom" }> = {
  "Kňaz": { role: "priest", lang: "sk" },
  "Rašaj": { role: "priest", lang: "rom" },
  "Ľud": { role: "people", lang: "sk" },
  "Roma": { role: "people", lang: "rom" },
  "Čtec": { role: "reader" }, // language decided by paragraph style
};

// ─── docx reading ───────────────────────────────────────────────────────────

const W = "w:";

interface Run {
  text: string;
  bold: boolean;
  italic: boolean;
  color: string | null;
  /** Half-points, as Word stores it. 20 = 10pt, i.e. the "small" size here. */
  size: number | null;
}

interface Para {
  index: number;
  style: string | null;
  runs: Run[];
  /** Plain text with `[[fn:N]]` markers where footnote references sit. */
  text: string;
}

/**
 * Walks `word/document.xml` (or `word/footnotes.xml`) in document order and
 * returns its paragraphs. `sax` is used rather than a DOM parser because run
 * order and the position of footnote references inside a paragraph both
 * matter, and both are lost by naive DOM text extraction.
 */
function parseParagraphs(
  xml: string,
  footnoteNumber: (id: string) => number | null
): Para[] {
  const paras: Para[] = [];
  const parser = saxParser(true, { trim: false, normalize: false });

  let para: Para | null = null;
  let run: Run | null = null;
  let inRunProps = false;
  let inParaProps = false;
  /** Depth counter for subtrees whose text must not be collected. */
  let skipDepth = 0;

  /**
   * Subtrees whose character data is not body text. `w:drawing` matters most:
   * its `<wp:posOffset>` layout values are element *content*, so without this
   * the image offsets land in the middle of a line as stray digits.
   */
  const SKIP_TAGS = new Set([
    `${W}instrText`,
    `${W}delText`,
    `${W}del`,
    `${W}commentRangeStart`,
    `${W}commentRangeEnd`,
    `${W}commentReference`,
    `${W}drawing`,
    `${W}pict`,
    `${W}object`,
  ]);

  parser.onopentag = (node) => {
    const name = node.name;
    const attrs = node.attributes as Record<string, string>;

    if (skipDepth > 0) {
      skipDepth++;
      return;
    }
    if (SKIP_TAGS.has(name)) {
      skipDepth = 1;
      return;
    }

    switch (name) {
      case `${W}p`:
        para = { index: paras.length, style: null, runs: [], text: "" };
        break;
      case `${W}pPr`:
        inParaProps = true;
        break;
      case `${W}pStyle`:
        if (inParaProps && para) para.style = attrs[`${W}val`] ?? null;
        break;
      case `${W}r`:
        run = { text: "", bold: false, italic: false, color: null, size: null };
        break;
      case `${W}rPr`:
        inRunProps = true;
        break;
      case `${W}b`:
        // <w:b w:val="0"/> switches bold off again.
        if (inRunProps && run && attrs[`${W}val`] !== "0") run.bold = true;
        break;
      case `${W}i`:
        if (inRunProps && run && attrs[`${W}val`] !== "0") run.italic = true;
        break;
      case `${W}color`:
        if (inRunProps && run) run.color = (attrs[`${W}val`] ?? "").toLowerCase();
        break;
      case `${W}sz`:
        if (inRunProps && run) run.size = Number(attrs[`${W}val`]) || null;
        break;
      case `${W}tab`:
        if (run) run.text += " ";
        break;
      case `${W}br`:
        if (run) run.text += "\n";
        break;
      case `${W}footnoteReference`: {
        const n = footnoteNumber(attrs[`${W}id`] ?? "");
        if (n !== null && run) run.text += `[[fn:${n}]]`;
        break;
      }
    }
  };

  parser.ontext = (text) => {
    if (skipDepth > 0) return;
    if (run && !inRunProps) run.text += text;
  };

  parser.onclosetag = (name) => {
    if (skipDepth > 0) {
      skipDepth--;
      return;
    }
    switch (name) {
      case `${W}rPr`:
        inRunProps = false;
        break;
      case `${W}pPr`:
        inParaProps = false;
        break;
      case `${W}r`:
        if (run && para) para.runs.push(run);
        run = null;
        break;
      case `${W}p`:
        if (para) {
          para.text = para.runs.map((r) => r.text).join("");
          paras.push(para);
        }
        para = null;
        break;
    }
  };

  parser.write(xml).close();
  return paras;
}

// ─── Formatting probes ──────────────────────────────────────────────────────

/** Runs that carry actual words — formatting of whitespace-only runs lies. */
function meaningfulRuns(p: Para): Run[] {
  const real = p.runs.filter((r) => r.text.trim().length > 0);
  return real.length > 0 ? real : p.runs;
}

function hasColor(p: Para, ...colors: string[]): boolean {
  return meaningfulRuns(p).some((r) => r.color !== null && colors.includes(r.color));
}

function isItalic(p: Para): boolean {
  const runs = meaningfulRuns(p);
  return runs.length > 0 && runs.every((r) => r.italic);
}

function isSmall(p: Para): boolean {
  return meaningfulRuns(p).some((r) => r.size !== null && r.size <= 20);
}

// ─── Romani detection ───────────────────────────────────────────────────────

/**
 * The source marks Romani lines with the `Heading4` style. One paragraph in
 * v1.1 (the response "Astaren the dikhen…") lost that style, which would
 * silently append Romani text to the Slovak line. This sniffer cross-checks
 * every unlabelled paragraph and any disagreement is reported in the TODO.
 */
const ROM_MARKERS =
  /\b(thaj|the|hin|náne|nane|andro|andre|savore|savóre|amáro|amáre|tiro|tíro|devla|devlá|devleskero|pes|bo|sar|kana|jekh|avel|oven|phúv|láčho|baripen|šaj|khangeri)\b/gi;
const SK_MARKERS =
  /\b(a|je|sa|na|v|za|ktorý|ktorí|ktorá|nech|aby|sme|sú|svätý|svätého|Hospodine|Hospodina|Bože|Tvoj|Tvojho|náš|nášho|i|so|k)\b/gi;

function looksRomani(text: string): boolean {
  const rom = (text.match(ROM_MARKERS) ?? []).length;
  const sk = (text.match(SK_MARKERS) ?? []).length;
  return rom > sk;
}

// ─── Classification ─────────────────────────────────────────────────────────

type Classified =
  | { type: "title"; text: string }
  | { type: "heading"; text: string; level: 1 | 2; inferred: boolean }
  | { type: "rubric"; text: string; tone: "direction" | "optional" }
  | {
      type: "line";
      role: UtteranceRole;
      lang: "sk" | "rom";
      label: string;
      text: string;
      quiet: boolean;
      variable: boolean;
      strayPrefix: string | null;
    }
  | { type: "continuation"; lang: "sk" | "rom"; text: string }
  | { type: "empty" };

/**
 * `Kňaz:` / `x Rašaj:` / `Kňaz (potichu):`.
 * Groups: 1 = stray prefix before the label, 2 = label, 3 = `(potichu)`.
 * Numbered rather than named because the repo targets ES2017.
 */
const LABEL_RE = /^([a-zA-Z]\s+)?(Kňaz|Rašaj|Ľud|Roma|Čtec)\s*(\(potichu\))?\s*:\s*/u;

function classify(p: Para): Classified {
  const raw = p.text.replace(/​/g, "").trim();
  if (!raw) return { type: "empty" };

  if (p.style === "Heading1") return { type: "title", text: raw };
  if (p.style === "Heading2") return { type: "heading", text: raw, level: 1, inferred: false };
  if (p.style === "Heading3") return { type: "heading", text: raw, level: 2, inferred: false };

  const match = LABEL_RE.exec(raw);
  if (match) {
    const [, stray, label, quiet] = match;
    const speaker = SPEAKERS[label];
    const lang = speaker.lang ?? (p.style === "Heading4" ? "rom" : "sk");
    return {
      type: "line",
      role: speaker.role,
      lang,
      label,
      text: raw.slice(match[0].length).trim(),
      quiet: Boolean(quiet) || (isItalic(p) && isSmall(p)),
      variable: hasColor(p, "999999"),
      strayPrefix: stray?.trim() ?? null,
    };
  }

  // Red italic = an instruction about the service.
  if (isItalic(p) && hasColor(p, "cc0000")) {
    return { type: "rubric", text: raw, tone: "direction" };
  }
  // Grey small, opening with `*` = "further petitions may be added here".
  if (hasColor(p, "999999") && raw.startsWith("*")) {
    return { type: "rubric", text: raw.replace(/^\*\s*/, ""), tone: "optional" };
  }
  // Small italics with no colour, short, no sentence-final full stop = a
  // section title the author never promoted to a Word heading.
  if (isItalic(p) && isSmall(p) && raw.length <= 60 && !raw.endsWith(".")) {
    const title = raw.replace(/:\s*$/, "");
    const level = PART_TITLES.includes(title.toLowerCase()) ? 1 : 2;
    return { type: "heading", text: title, level, inferred: true };
  }

  // Anything else continues the previous line in the same language.
  return {
    type: "continuation",
    lang: p.style === "Heading4" ? "rom" : "sk",
    text: raw,
  };
}

// ─── Build ──────────────────────────────────────────────────────────────────

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function collectNotes(text: string): number[] {
  return [...text.matchAll(/\[\[fn:(\d+)\]\]/g)].map((m) => Number(m[1]));
}

interface Issue {
  kind: string;
  where: string;
  detail: string;
}

function build(paras: Para[], footnotes: LiturgyFootnote[]) {
  const sections: LiturgySection[] = [];
  const issues: Issue[] = [];

  let section: LiturgySection | null = null;
  let utterance: Utterance | null = null;
  let counter = 0;
  const usedSlugs = new Set<string>();

  const startSection = (title: string, level: 1 | 2, inferred: boolean) => {
    let slug = slugify(title);
    let n = 2;
    while (usedSlugs.has(slug)) slug = `${slugify(title)}-${n++}`;
    usedSlugs.add(slug);
    section = {
      id: `s${sections.length + 1}`,
      slug,
      level,
      title,
      ...(inferred ? { inferred: true } : {}),
      blocks: [],
    };
    sections.push(section);
    utterance = null;
  };

  const push = (block: LiturgyBlock) => {
    if (!section) startSection(TITLE_SK, 1, true);
    section!.blocks.push(block);
  };

  for (const p of paras) {
    const c = classify(p);

    switch (c.type) {
      case "empty":
      case "title":
        break;

      case "heading":
        startSection(c.text, c.level, c.inferred);
        if (c.inferred) {
          issues.push({
            kind: "inferred-heading",
            where: `paragraph ${p.index}`,
            detail: `"${c.text}" is not a Word heading; recovered from its small-italic formatting and filed as a level-${c.level} section.`,
          });
        }
        break;

      case "rubric": {
        const rubric: Rubric = {
          kind: "rubric",
          id: `b${++counter}`,
          tone: c.tone,
          text: c.text,
        };
        push(rubric);
        utterance = null;
        break;
      }

      case "line": {
        if (c.strayPrefix) {
          issues.push({
            kind: "slovak-typo",
            where: `paragraph ${p.index}`,
            detail: `Speaker label reads "${c.strayPrefix} ${c.label}:" — a stray "${c.strayPrefix}" before the label. Dropped in the output; fix at source.`,
          });
        }

        const line: LiturgyLine = {
          label: c.label,
          text: c.text,
          notes: collectNotes(c.text),
        };

        // A line joins the open utterance when it supplies the other language
        // of the same role; otherwise it opens a new one.
        const joins =
          utterance !== null &&
          utterance.role === c.role &&
          utterance[c.lang] === undefined;

        if (joins && utterance) {
          utterance[c.lang] = line;
        } else {
          utterance = {
            kind: "utterance",
            id: `b${++counter}`,
            role: c.role,
            ...(c.quiet ? { quiet: true } : {}),
            ...(c.variable ? { variable: true } : {}),
            [c.lang]: line,
          } as Utterance;
          push(utterance);
        }
        break;
      }

      case "continuation": {
        if (!utterance) {
          issues.push({
            kind: "orphan-text",
            where: `paragraph ${p.index}`,
            detail: `Text with no preceding speaker line: "${c.text.slice(0, 80)}…". Appended as its own people's line — check it belongs there.`,
          });
          utterance = {
            kind: "utterance",
            id: `b${++counter}`,
            role: "people",
            [c.lang]: { label: "", text: c.text, notes: collectNotes(c.text) },
          } as Utterance;
          push(utterance);
          break;
        }

        // Cross-check the style-derived language against the text itself.
        let lang = c.lang;
        const sniffed = looksRomani(c.text) ? "rom" : "sk";
        if (sniffed !== lang) {
          issues.push({
            kind: "language-mismatch",
            where: `paragraph ${p.index}`,
            detail:
              `Paragraph is styled as ${lang === "rom" ? "Romani (Heading4)" : "Slovak (no style)"} ` +
              `but reads as ${sniffed === "rom" ? "Romani" : "Slovak"}: "${c.text.slice(0, 70)}…". ` +
              `Treated as ${sniffed}; the source paragraph is missing its style.`,
          });
          lang = sniffed;
        }

        const existing = utterance[lang];
        if (existing) {
          existing.text = `${existing.text}\n${c.text}`;
          existing.notes = collectNotes(existing.text);
        } else {
          utterance[lang] = {
            label: "",
            text: c.text,
            notes: collectNotes(c.text),
          };
        }
        break;
      }
    }
  }

  // Report utterances that never received their counterpart.
  for (const s of sections) {
    for (const b of s.blocks) {
      if (b.kind !== "utterance") continue;
      if (!b.rom && !b.quiet) {
        issues.push({
          kind: "missing-romani",
          where: `${s.title} / ${b.id}`,
          detail: `Slovak line has no Romani counterpart: "${b.sk?.text.slice(0, 70) ?? ""}…"`,
        });
      }
      if (!b.sk) {
        issues.push({
          kind: "missing-slovak",
          where: `${s.title} / ${b.id}`,
          detail: `Romani line has no Slovak counterpart: "${b.rom?.text.slice(0, 70) ?? ""}…"`,
        });
      }
    }
  }

  // Footnotes referenced nowhere, or referenced but absent.
  const referenced = new Set<number>();
  for (const s of sections) {
    for (const b of s.blocks) {
      if (b.kind !== "utterance") continue;
      for (const n of [...(b.sk?.notes ?? []), ...(b.rom?.notes ?? [])]) referenced.add(n);
    }
  }
  for (const f of footnotes) {
    if (!referenced.has(f.n)) {
      issues.push({
        kind: "unreferenced-footnote",
        where: `footnote ${f.n}`,
        detail: `Defined but never referenced in the text: "${f.text.slice(0, 70)}…"`,
      });
    }
  }

  return { sections, issues };
}

// ─── TODO report ────────────────────────────────────────────────────────────

const ISSUE_HEADINGS: Record<string, string> = {
  "slovak-typo": "Slovak typos (not corrected — fix at source)",
  "inferred-heading": "Section titles recovered from formatting (confirm these)",
  "language-mismatch": "Paragraphs whose style and language disagree",
  "orphan-text": "Text with no speaker",
  "missing-romani": "Slovak lines with no Romani counterpart",
  "missing-slovak": "Romani lines with no Slovak counterpart",
  "unreferenced-footnote": "Footnotes never referenced",
};

function writeTodo(doc: LiturgyDocument, issues: Issue[]) {
  const groups = new Map<string, Issue[]>();
  for (const i of issues) {
    const list = groups.get(i.kind) ?? [];
    list.push(i);
    groups.set(i.kind, list);
  }

  const lines: string[] = [
    "# Liturgy conversion — open questions",
    "",
    "Generated by `npm run liturgy:convert`. **Do not edit by hand** — it is",
    "rewritten on every run. Fix the items in the source `.docx` instead, then",
    "re-run the conversion.",
    "",
    `Source: \`${doc.meta.source.file}\` (v${doc.meta.version}, ${doc.meta.source.bytes} bytes, sha256 \`${doc.meta.source.sha256.slice(0, 16)}…\`)`,
    `Generated: ${doc.meta.generatedAt}`,
    "",
    `Parsed **${doc.meta.counts.sections} sections**, **${doc.meta.counts.utterances} utterances**, ` +
      `**${doc.meta.counts.rubrics} rubrics**, **${doc.meta.counts.footnotes} footnotes**.`,
    "",
    "---",
    "",
  ];

  for (const [kind, heading] of Object.entries(ISSUE_HEADINGS)) {
    const list = groups.get(kind);
    if (!list?.length) continue;
    lines.push(`## ${heading}`, "");
    for (const i of list) lines.push(`- **${i.where}** — ${i.detail}`);
    lines.push("");
  }

  const unknown = [...groups.keys()].filter((k) => !(k in ISSUE_HEADINGS));
  for (const kind of unknown) {
    lines.push(`## ${kind}`, "");
    for (const i of groups.get(kind)!) lines.push(`- **${i.where}** — ${i.detail}`);
    lines.push("");
  }

  if (issues.length === 0) lines.push("No open questions — the conversion was clean.", "");

  lines.push(
    "---",
    "",
    "## Standing questions for the translator",
    "",
    "These are not produced by the parser; they are the judgement calls made",
    "while building the pipeline.",
    "",
    "1. **The book has no Romani title.** The source document's only H1 is the",
    "   Slovak `Svätá liturgia sv. Jána Zlatoústeho`. The brief asks for a cover",
    "   with the title in Romani *and* Slovak, so I need the Romani form from you —",
    "   I have not invented one. Until you supply it, the cover, the page heading",
    "   and the EPUB metadata all fall back to Slovak. Set `TITLE_ROM` in",
    "   `scripts/liturgy/convert-docx.ts` and re-run.",
    "2. **The service has no section headings between the Great Litany and the",
    "   Litany of the Catechumens.** The source marks only `Liturgia Katechumenov`,",
    "   `Ekténia Veľká`, `Ektenia za katechumenov`, `Liturgia verných`,",
    "   `Prosebná ektenia` and `Žalm 33`. The Antiphons, the Little Entrance, the",
    "   Trisagion, the readings, the Cherubic Hymn, the Anaphora, the Communion",
    "   and the Dismissal all run on without a title. Nothing has been invented —",
    "   tell me the headings you want and where they start, and the converter will",
    "   place them.",
    "3. **Footnote language.** All 34 footnotes are the translator's notes in",
    "   Slovak, several with Czech spellings (`používá`, `což`, `rozhodol som se`,",
    "   `nedarí se mi`). Left verbatim. Say the word and I will list each one.",
    "4. **The `*` marks inside lines** are read as chant phrase divisions and",
    "   rendered as a thin separator on the web and in the book. Confirm that is",
    "   what they mean.",
    ""
  );

  mkdirSync(dirname(OUT_TODO), { recursive: true });
  writeFileSync(OUT_TODO, lines.join("\n"), "utf8");
}

// ─── Main ───────────────────────────────────────────────────────────────────

/**
 * Splits `word/footnotes.xml` into one chunk per `<w:footnote>`, skipping the
 * negative-id separator entries Word puts at the top of the part.
 */
function splitFootnotes(xml: string): Array<[string, string]> {
  const starts = [...xml.matchAll(/<w:footnote\b[^>]*w:id="(-?\d+)"/g)];
  const out: Array<[string, string]> = [];
  for (let i = 0; i < starts.length; i++) {
    const id = starts[i][1];
    if (Number(id) < 0) continue;
    const from = starts[i].index!;
    const limit = i + 1 < starts.length ? starts[i + 1].index! : xml.length;
    // Cut at this footnote's own closing tag so each chunk is well-formed XML
    // (the final one would otherwise carry the part's `</w:footnotes>`).
    const close = xml.lastIndexOf("</w:footnote>", limit);
    const to = close > from ? close + "</w:footnote>".length : limit;
    out.push([id, xml.slice(from, to)]);
  }
  return out;
}

async function main() {
  const bytes = readFileSync(SOURCE);
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const zip = await JSZip.loadAsync(bytes);

  const footnotesXml = await zip.file("word/footnotes.xml")!.async("string");
  const documentXml = await zip.file("word/document.xml")!.async("string");

  // Word footnote ids are arbitrary and include separator pseudo-notes, so the
  // display number a reader sees is the note's position among the real ones.
  // Build that mapping first — the document walk needs it to substitute
  // `[[fn:N]]` markers as it goes.
  const idToNumber = new Map<string, number>();
  const footnotes: LiturgyFootnote[] = [];

  for (const [id, xml] of splitFootnotes(footnotesXml)) {
    const text = parseParagraphs(xml, () => null)
      .map((p) => p.text.trim())
      .filter(Boolean)
      .join(" ")
      .trim();
    if (!text) continue;
    const n = footnotes.length + 1;
    idToNumber.set(id, n);
    footnotes.push({ n, text });
  }

  const paras = parseParagraphs(documentXml, (id) => idToNumber.get(id) ?? null);
  const { sections, issues } = build(paras, footnotes);

  const counts = {
    sections: sections.length,
    utterances: sections.reduce(
      (n, s) => n + s.blocks.filter((b) => b.kind === "utterance").length,
      0
    ),
    rubrics: sections.reduce(
      (n, s) => n + s.blocks.filter((b) => b.kind === "rubric").length,
      0
    ),
    footnotes: footnotes.length,
  };

  const doc: LiturgyDocument = {
    meta: {
      title: { rom: TITLE_ROM, sk: TITLE_SK },
      version: VERSION,
      sourceDate: SOURCE_DATE,
      generatedAt: new Date().toISOString().slice(0, 10),
      source: { file: "spevnik-v1.1.docx", sha256, bytes: bytes.length },
      counts,
    },
    footnotes,
    sections,
  };

  mkdirSync(dirname(OUT_JSON), { recursive: true });
  writeFileSync(OUT_JSON, `${JSON.stringify(doc, null, 2)}\n`, "utf8");
  writeTodo(doc, issues);

  console.log(`✓ ${OUT_JSON}`);
  console.log(
    `  ${counts.sections} sections · ${counts.utterances} utterances · ` +
      `${counts.rubrics} rubrics · ${counts.footnotes} footnotes`
  );
  console.log(`✓ ${OUT_TODO} (${issues.length} open item${issues.length === 1 ? "" : "s"})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
