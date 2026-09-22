#!/usr/bin/env node
// Builds the book in every language as EPUB 3 (Apple Books, Kindle via
// Send to Kindle, Kobo, Google Play Books, PocketBook, Tolino…) and as a
// print-faithful A5 PDF, both styled after the 2023 print edition
// (Palatino body, coral #F1614D accents, part openers, full-page pull quotes,
// running footers, footnotes at the foot of the page).
//
//   node scripts/build-ebooks.mjs            # all locales with a source file
//   node scripts/build-ebooks.mjs sk en      # only these
//
// Source:  content/book/<locale>.md   (syntax: content/book/FORMAT.md)
//          content/book/book.json     (titles, cover lines, labels, palette)
//          content/book/images/       (photos; images/<locale>/ overrides)
//          content/book/cover/        (cover photo + cross)
//          content/book/fonts/        (P052 for the PDF; OFL Literata + Playfair)
// Output:  public/ebook/<slug>-<locale>.epub | .pdf, cover-<locale>.jpg
//          lib/data/book-files.json   (file sizes, read by the download page)
//
// Requires: `zip`, a Chromium/Chrome binary (CHROME_PATH or auto-detected),
// and the dev dependencies puppeteer-core + pagedjs.

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import puppeteer from "puppeteer-core";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "content/book");
const IMAGES_DIR = path.join(CONTENT_DIR, "images");
const FONTS_DIR = path.join(CONTENT_DIR, "fonts");
const COVER_DIR = path.join(CONTENT_DIR, "cover");
const PAGED_JS = path.join(ROOT, "node_modules/pagedjs/dist/paged.polyfill.js");
const OUT_DIR = path.join(ROOT, "public/ebook");
const MANIFEST_PATH = path.join(ROOT, "lib/data/book-files.json");
const BOOK = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, "book.json"), "utf8"));
const COLORS = BOOK.palette;
const FIXED_MTIME = new Date(`${BOOK.editionYear}-01-01T00:00:00Z`);
const GENERATED_FIGURES = new Set(["trend-diagram.png"]);

// ---------------------------------------------------------------------------
// Markdown subset parser
// ---------------------------------------------------------------------------

const FOOTNOTE_DEF = /^\[\^(\d+)\]:\s*(.*)$/;
const ORDERED_ITEM = /^\d+\.\s+(?!\d)/;
const FIGURE = /^!\[(.*)\]\(([^)\s]+)\)$/;

function parseBook(src, locale) {
  const sections = [];
  let current = null;
  let paragraph = [];
  let list = null;
  let quote = null;
  let table = null;

  const fail = (lineNo, msg) => {
    throw new Error(`${locale}.md:${lineNo}: ${msg}`);
  };
  const push = (block, lineNo) => {
    if (!current) fail(lineNo, "content before the first heading");
    current.blocks.push(block);
  };
  const flush = (lineNo) => {
    if (paragraph.length) push({ type: "p", text: paragraph.join(" ") }, lineNo);
    if (list) push(list, lineNo);
    if (quote) push(quote, lineNo);
    if (table) push(table, lineNo);
    paragraph = [];
    list = quote = table = null;
  };

  src.split(/\r?\n/).forEach((rawLine, i) => {
    const lineNo = i + 1;
    const line = rawLine.trim();

    if (!line) return flush(lineNo);

    const heading = /^(#{1,3})\s+(.+)$/.exec(line);
    if (heading) {
      flush(lineNo);
      const level = heading[1].length;
      const title = heading[2].trim();
      if (level === 3) return push({ type: "h3", text: title }, lineNo);
      current = { level, title, blocks: [] };
      sections.push(current);
      return;
    }

    const footnote = FOOTNOTE_DEF.exec(line);
    if (footnote) {
      flush(lineNo);
      return push({ type: "footnote", n: Number(footnote[1]), text: footnote[2] }, lineNo);
    }

    const figure = FIGURE.exec(line);
    if (figure) {
      flush(lineNo);
      return push({ type: "figure", caption: figure[1].trim(), file: figure[2] }, lineNo);
    }

    if (line === "---") {
      flush(lineNo);
      return push({ type: "hr" }, lineNo);
    }

    if (line.startsWith(">")) {
      const kind = line.startsWith(">>") ? "pull" : "quote";
      if (!quote || quote.type !== kind) flush(lineNo);
      quote ??= { type: kind, lines: [], attribution: null };
      const text = line.replace(kind === "pull" ? /^>>\s?/ : /^>\s?/, "");
      if (/^[—–]\s/.test(text)) quote.attribution = text.replace(/^[—–]\s*/, "");
      else if (text) quote.lines.push(text);
      return;
    }

    if (line.startsWith("|")) {
      if (!table) flush(lineNo);
      table ??= { type: "table", rows: [] };
      const cells = line.replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      if (cells.every((c) => /^:?-{3,}:?$/.test(c))) return;
      table.rows.push(cells);
      return;
    }

    const bullet = /^[-*]\s+(.*)$/.exec(line);
    const ordered = ORDERED_ITEM.test(line) ? line.replace(ORDERED_ITEM, "") : null;
    if (bullet || ordered !== null) {
      const kind = bullet ? "ul" : "ol";
      if (!list || list.type !== kind) flush(lineNo);
      list ??= { type: kind, items: [] };
      list.items.push(bullet ? bullet[1] : ordered);
      return;
    }

    if (list || quote || table) flush(lineNo);
    paragraph.push(line);
  });
  flush(0);

  if (!sections.length) throw new Error(`${locale}.md: no headings found`);
  let part = 0;
  sections.forEach((s, i) => {
    s.id = `s${String(i + 1).padStart(3, "0")}`;
    s.file = `${s.id}.xhtml`;
    // A part opener: top-level heading followed only by (optional) pull quotes.
    s.isPart = s.level === 1 && s.blocks.every((b) => b.type === "pull");
    if (s.isPart) s.partNumber = toRoman(++part);
    // Footer text: the part a chapter belongs to, or the top-level title itself.
    s.running = s.level === 1 ? s.title : (sections.slice(0, i).reverse().find((p) => p.level === 1)?.title ?? s.title);
    let h3 = 0;
    for (const b of s.blocks) if (b.type === "h3") b.id = `${s.id}-${++h3}`;
  });
  validateFootnotes(sections, locale);
  validateFigures(sections, locale);
  return sections;
}

function toRoman(n) {
  return ["", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X"][n] ?? String(n);
}

function validateFootnotes(sections, locale) {
  const refs = new Map();
  const defs = new Map();
  for (const s of sections) {
    for (const b of s.blocks) {
      if (b.type === "footnote") {
        if (defs.has(b.n)) throw new Error(`${locale}.md: footnote [^${b.n}] defined twice`);
        defs.set(b.n, s);
      }
      for (const text of blockTexts(b)) {
        for (const m of text.matchAll(/\[\^(\d+)\]/g)) refs.set(Number(m[1]), s);
      }
    }
  }
  for (const n of refs.keys()) {
    if (!defs.has(n)) throw new Error(`${locale}.md: footnote [^${n}] referenced but not defined`);
  }
  for (const n of defs.keys()) {
    if (!refs.has(n)) throw new Error(`${locale}.md: footnote [^${n}] defined but never referenced`);
  }
}

function validateFigures(sections, locale) {
  for (const s of sections) {
    for (const b of s.blocks) {
      if (b.type !== "figure" || GENERATED_FIGURES.has(b.file)) continue;
      if (!imagePath(b.file, locale)) throw new Error(`${locale}.md: image "${b.file}" not found in content/book/images`);
    }
  }
}

function imagePath(file, locale) {
  const candidates = [path.join(IMAGES_DIR, locale, file), path.join(IMAGES_DIR, file)];
  return candidates.find((c) => fs.existsSync(c)) ?? null;
}

function blockTexts(b) {
  switch (b.type) {
    case "p":
    case "h3":
    case "footnote":
      return [b.text];
    case "quote":
    case "pull":
      return [...b.lines, b.attribution ?? ""];
    case "figure":
      return [b.caption];
    case "ul":
    case "ol":
      return b.items;
    case "table":
      return b.rows.flat();
    default:
      return [];
  }
}

// ---------------------------------------------------------------------------
// Rendering (shared by EPUB and PDF; `ctx` carries the format differences)
// ---------------------------------------------------------------------------

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const plain = (t) => t.replace(/\[\^\d+\]/g, "").replace(/\*+/g, "");

// ctx.noteRef(n) → markup for a footnote reference
// ctx.imageSrc(file) → URL of an image
function inline(text, ctx) {
  return text
    .split(/(<https?:\/\/[^>\s]+>|\[\^\d+\])/)
    .map((part) => {
      const link = /^<(https?:\/\/[^>\s]+)>$/.exec(part);
      if (link) return `<a class="url" href="${esc(link[1])}">${esc(link[1])}</a>`;
      const ref = /^\[\^(\d+)\]$/.exec(part);
      if (ref) return ctx.noteRef(ref[1]);
      return esc(part)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>");
    })
    .join("");
}

function renderBlock(b, ctx) {
  const r = (t) => inline(t, ctx);
  switch (b.type) {
    case "p":
      return `<p>${r(b.text)}</p>`;
    case "h3":
      return ctx.heading("h3", b.id, "subhead", r(b.text), b.text);
    case "hr":
      return `<p class="break" role="separator">✦</p>`;
    case "quote":
    case "pull": {
      const body = b.lines.map((l) => `<p>${r(l)}</p>`).join("\n");
      const cite = b.attribution ? `\n<p class="attribution">${r(b.attribution)}</p>` : "";
      return `<blockquote class="${b.type}">\n${body}${cite}\n</blockquote>`;
    }
    case "figure": {
      const caption = b.caption ? `\n<figcaption>${r(b.caption)}</figcaption>` : "";
      return `<figure class="photo">\n<img src="${ctx.imageSrc(b.file)}" alt="${esc(plain(b.caption))}"/>${caption}\n</figure>`;
    }
    case "ul":
    case "ol":
      return `<${b.type}>\n${b.items.map((i) => `<li>${r(i)}</li>`).join("\n")}\n</${b.type}>`;
    case "table": {
      const [head, ...rows] = b.rows;
      const th = head.map((c) => `<th>${r(c)}</th>`).join("");
      const trs = rows.map((row) => `<tr>${row.map((c) => `<td>${r(c)}</td>`).join("")}</tr>`);
      return `<table>\n<thead><tr>${th}</tr></thead>\n<tbody>\n${trs.join("\n")}\n</tbody>\n</table>`;
    }
    case "footnote":
      return "";
    default:
      throw new Error(`unknown block ${b.type}`);
  }
}

function renderSection(section, ctx) {
  if (section.isPart) {
    return `<section epub:type="part" role="doc-part" class="part">
${ctx.running(section)}
<div class="part-plate"><p class="part-number">${section.partNumber}</p></div>
<div class="part-page">${ctx.heading("h1", section.id, "part-title", inline(section.title, ctx), section.title)}</div>
${section.blocks.map((b) => renderBlock(b, ctx)).join("\n")}
</section>`;
  }
  const tag = section.level === 1 ? "h1" : "h2";
  // Pull quotes that open a chapter stand on their own page before the
  // chapter title, as in print (e.g. the epigraph before the Introduction).
  const lead = [];
  for (const b of section.blocks) {
    if (b.type !== "pull") break;
    lead.push(b);
  }
  const blocks = section.blocks.slice(lead.length).map((b) => renderBlock(b, ctx)).filter(Boolean);
  return `<section epub:type="chapter" role="doc-chapter" class="chapter level-${section.level}">
${ctx.running(section)}
${lead.map((b) => renderBlock(b, ctx)).join("\n")}
${ctx.heading(tag, section.id, "chapter-title", inline(section.title, ctx), section.title)}
${blocks.join("\n")}
${ctx.notes(section)}
</section>`;
}

function tocTree(sections) {
  const tree = [];
  for (const s of sections) {
    const node = {
      title: s.title,
      isPart: s.isPart,
      href: `${s.file}#${s.id}`,
      children: s.blocks
        .filter((b) => b.type === "h3")
        .map((b) => ({ title: b.text, href: `${s.file}#${b.id}`, children: [] })),
    };
    const parent = tree[tree.length - 1];
    if (s.level === 2 && parent?.isPart) parent.children.push(node);
    else tree.push(node);
  }
  return tree;
}

function footnoteTexts(sections) {
  const map = new Map();
  for (const s of sections) for (const b of s.blocks) if (b.type === "footnote") map.set(String(b.n), b.text);
  return map;
}

// ---------------------------------------------------------------------------
// Styles — values measured from the print PDF (Palatino 10/14 pt body,
// 18 pt bold chapter titles, 13 pt grey subheads, 8 pt footnotes and
// captions, coral #F1614D quotations, Playfair Display Italic pull quotes).
// ---------------------------------------------------------------------------

const BODY_FONTS = `"Palatino", "Palatino Linotype", "Book Antiqua", "P052", "URW Palladio L", "Literata", Georgia, serif`;
const DISPLAY_FONTS = `"Literata", "Palatino", "Palatino Linotype", "P052", Georgia, serif`;
const PULL_FONTS = `"Playfair Display", "Literata", Georgia, serif`;

function fontFaces(url) {
  return `
@font-face { font-family: "Literata"; font-weight: 400; font-style: normal; src: url("${url("Literata-Regular.ttf")}"); }
@font-face { font-family: "Literata"; font-weight: 600; font-style: normal; src: url("${url("Literata-SemiBold.ttf")}"); }
@font-face { font-family: "Literata"; font-weight: 400; font-style: italic; src: url("${url("Literata-Italic.ttf")}"); }
@font-face { font-family: "Playfair Display"; font-weight: 400; font-style: italic; src: url("${url("PlayfairDisplay-Italic.ttf")}"); }
`;
}

const BOOK_CSS = `
body { font-family: ${BODY_FONTS}; color: ${COLORS.ink}; line-height: 1.4; }
h1, h2, h3 { font-family: ${BODY_FONTS}; font-weight: bold; line-height: 1.2; page-break-after: avoid; break-after: avoid; hyphens: none; -webkit-hyphens: none; text-align: left; }
.chapter-title { font-family: ${BODY_FONTS}; font-weight: bold; font-size: 1.8em; line-height: 1.2; margin: 0 0 1.4em; text-align: left; page-break-after: avoid; break-after: avoid; }
h3, .subhead { font-family: ${BODY_FONTS}; font-weight: bold; font-size: 1.3em; line-height: 1.2; color: ${COLORS.gray}; margin: 1.6em 0 0.7em; text-align: left; page-break-after: avoid; break-after: avoid; }
p { margin: 0; text-indent: 2em; text-align: justify; hyphens: auto; -webkit-hyphens: auto; orphans: 2; widows: 2; }
h1 + p, h2 + p, h3 + p, .chapter-title + p, .subhead + p, blockquote + p, table + p, ul + p, ol + p, figure + p, .break + p { text-indent: 0; }
blockquote { margin: 1em 0; }
blockquote p { text-indent: 0; }
blockquote.quote p { color: ${COLORS.coral}; margin-bottom: 0.3em; }
blockquote .attribution { color: ${COLORS.ink}; font-size: 0.8em; text-align: left; }
blockquote.pull { font-family: ${PULL_FONTS}; font-style: italic; color: ${COLORS.coral}; font-size: 1.9em; line-height: 1.45; text-align: left; margin: 0; }
blockquote.pull p { text-align: left; hyphens: none; -webkit-hyphens: none; }
blockquote.pull .attribution { font-family: ${BODY_FONTS}; font-style: normal; font-size: 0.45em; margin-top: 1.5em; }
ul, ol { margin: 0.6em 0 0.6em 1.5em; padding: 0; }
li { margin-bottom: 0.3em; text-align: left; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.8em; }
th, td { border: 0.5pt solid ${COLORS.gray}; padding: 0.25em 0.4em; vertical-align: top; text-align: left; hyphens: auto; -webkit-hyphens: auto; }
th { background: #E4E4E4; font-weight: bold; }
figure.photo { margin: 1.2em 0; text-align: center; page-break-inside: avoid; break-inside: avoid; }
figure.photo img { max-width: 100%; height: auto; }
figure.photo img[src$="endorsement-portrait.jpg"] { max-width: 30%; }
figcaption { font-size: 0.8em; color: ${COLORS.gray}; line-height: 1.35; margin-top: 0.4em; text-align: center; }
sup { font-size: 0.65em; line-height: 0; vertical-align: super; }
a { color: inherit; text-decoration: none; }
a.url { word-break: break-all; }
.break { text-align: center; text-indent: 0; margin: 1em 0; color: ${COLORS.coral}; }
.part-plate { background: ${COLORS.coral}; color: #FFFFFF; text-align: center; }
.part-number { font-family: ${DISPLAY_FONTS}; font-weight: 600; font-size: 4em; text-indent: 0; text-align: center; color: #FFFFFF; margin: 0; }
.part-title { font-family: ${DISPLAY_FONTS}; font-weight: 600; color: ${COLORS.coral}; text-transform: uppercase; letter-spacing: 0.02em; font-size: 2em; line-height: 1.1; }
.notes p, p.note { text-indent: 0; text-align: left; font-size: 0.8em; margin-bottom: 0.3em; }
.titlepage { text-align: center; font-family: ${DISPLAY_FONTS}; }
.titlepage p { text-indent: 0; text-align: center; }
.titlepage .author { font-family: ${BODY_FONTS}; font-weight: bold; font-size: 1.15em; }
.titlepage .t-m { font-size: 1.9em; line-height: 1; }
.titlepage .t-xl { font-size: 3.8em; line-height: 0.95; }
.titlepage .t-xs { font-size: 0.75em; line-height: 1.6; font-weight: 600; }
.titlepage .t-l { font-size: 2.7em; line-height: 1; }
.titlepage .subtitle { font-size: 1.35em; margin-top: 0.3em; }
.titlepage .publisher { font-family: ${BODY_FONTS}; font-size: 0.8em; }
.colophon p { text-indent: 0; text-align: left; font-size: 0.8em; margin-bottom: 0.8em; }
nav ol { list-style: none; margin-left: 0; padding: 0; }
nav ol ol { margin-left: 1.2em; }
nav li.part > a { font-weight: bold; text-transform: uppercase; }
`;

const EPUB_CSS = `${fontFaces((f) => `fonts/${f}`)}
${BOOK_CSS}
section.part { page-break-before: always; }
.part-plate { padding: 3em 0; margin-bottom: 2em; }
.part-page { text-align: left; }
blockquote.pull { page-break-before: always; page-break-after: always; margin-top: 25%; }
.notes { margin-top: 2em; border-top: 0.5pt solid ${COLORS.ink}; padding-top: 0.5em; }
.titlepage .author { margin-top: 10%; }
.titlepage .title-block { margin: 20% 0 0; }
.titlepage .publisher { margin-top: 25%; }
.cover { text-align: center; margin: 0; padding: 0; }
.cover img { max-width: 100%; max-height: 100%; }
`;

const PDF_CSS = `${fontFaces((f) => pathToFileURL(path.join(FONTS_DIR, f)).href)}
@font-face { font-family: "P052"; font-weight: 400; font-style: normal; src: url("${pathToFileURL(path.join(FONTS_DIR, "P052-Roman.otf")).href}"); }
@font-face { font-family: "P052"; font-weight: 400; font-style: italic; src: url("${pathToFileURL(path.join(FONTS_DIR, "P052-Italic.otf")).href}"); }
@font-face { font-family: "P052"; font-weight: 700; font-style: normal; src: url("${pathToFileURL(path.join(FONTS_DIR, "P052-Bold.otf")).href}"); }
@font-face { font-family: "P052"; font-weight: 700; font-style: italic; src: url("${pathToFileURL(path.join(FONTS_DIR, "P052-BoldItalic.otf")).href}"); }
${BOOK_CSS}
html { font-size: 10pt; }
body { font-family: "P052", "Literata", serif; line-height: 14pt; }
h1, h2, h3 { font-family: "P052", "Literata", serif; }
.chapter-title { font-family: "P052", "Literata", serif; font-size: 18pt; line-height: 22pt; margin: 0 0 24pt; }
.subhead { font-family: "P052", "Literata", serif; font-size: 13pt; line-height: 16pt; margin: 18pt 0 8pt; }
/* Invisible one-line copy of each heading: Chrome builds the PDF bookmarks
   from it (it drops the spaces at line wraps of multi-line headings). */
.outline { position: absolute; width: 1px; height: 1px; overflow: hidden; white-space: nowrap; margin: 0; padding: 0; font-size: 1pt; }
p, h1 + p, h2 + p, h3 + p, .chapter-title + p, .subhead + p, figure + p { text-indent: 20pt; }
blockquote.quote { margin: 10pt 0; }
table { font-size: 8.5pt; line-height: 11pt; }
figcaption { font-size: 8pt; line-height: 10.5pt; }
figure.photo { margin: 10pt 0; }
figure.photo img { max-height: 95mm; }
a.url { word-break: break-all; }

@page {
  size: 148mm 210mm;
  margin: 15mm 16mm 19mm 16mm;
  @footnote { border-top: 0.5pt solid ${COLORS.ink}; padding-top: 4pt; margin-top: 8pt; }
}
@page :left {
  @bottom-left { content: counter(page); font-family: "Literata"; font-weight: 600; font-size: 9pt; vertical-align: top; padding-top: 7mm; }
}
@page :right {
  @bottom-center { content: string(part); text-align: right; font-family: "Literata"; font-size: 9pt; vertical-align: top; padding-top: 7mm; }
  @bottom-right { content: counter(page); text-align: right; font-family: "Literata"; font-weight: 600; font-size: 9pt; vertical-align: top; padding-top: 7mm; }
}
@page cover { margin: 0; @bottom-left { content: none; } @bottom-center { content: none; } @bottom-right { content: none; } }
@page front { @bottom-left { content: none; } @bottom-center { content: none; } @bottom-right { content: none; } }
@page plate { margin: 0; background: ${COLORS.coral}; @bottom-left { content: none; } @bottom-center { content: none; } @bottom-right { content: none; } }
@page cream { background: ${COLORS.cream}; @bottom-left { content: none; } @bottom-center { content: none; } @bottom-right { content: none; } }

.cover-page { page: cover; }
.cover-page img { display: block; width: 148mm; height: 210mm; object-fit: cover; }
.titlepage, .colophon, nav#toc { page: front; break-before: page; }
.titlepage { height: 176mm; display: flex; flex-direction: column; justify-content: space-between; }
.titlepage .title-block { margin-top: -20mm; }
.colophon { display: flex; flex-direction: column; justify-content: flex-end; height: 176mm; }
section.chapter { break-before: page; }
section.part { break-before: left; }
.part-plate { page: plate; height: 210mm; display: flex; align-items: center; justify-content: center; background: none; }
.part-number { font-size: 72pt; font-weight: 400; }
.part-page { page: cream; break-before: page; padding-top: 70mm; }
.part-title { font-size: 26pt; line-height: 28pt; }
.running { string-set: part content(text); height: 0; overflow: hidden; font-size: 0; line-height: 0; margin: 0; }
blockquote.pull { page: cream; break-before: page; break-after: page; padding-top: 30mm; font-size: 21pt; line-height: 30pt; }
blockquote.pull .attribution { font-size: 10pt; line-height: 14pt; margin-top: 18pt; }

.fn { float: footnote; font-size: 8pt; line-height: 10.5pt; text-indent: 0; text-align: left; font-style: normal; font-weight: normal; color: ${COLORS.ink}; hyphens: none; }
.fn::footnote-call { content: counter(footnote); font-size: 6.5pt; vertical-align: super; line-height: 0; }
.fn::footnote-marker { content: counter(footnote) "\\2002"; }

nav#toc .chapter-title { margin: 0 0 18pt; }
nav#toc li { margin: 0; }
nav#toc li.part { margin-top: 10pt; }
nav#toc li.part > a { font-weight: bold; }
nav#toc li.chapter > a { font-variant: small-caps; }
nav#toc a { display: flex; align-items: baseline; font-size: 9.5pt; line-height: 13pt; }
nav#toc li li li a { font-size: 9pt; }
nav#toc a .t { flex: 0 1 auto; }
nav#toc a .dots { flex: 1 1 auto; border-bottom: 1pt dotted ${COLORS.gray}; margin: 0 4pt; min-width: 8pt; transform: translateY(-3pt); }
nav#toc a::after { content: target-counter(attr(href), page); flex: 0 0 auto; }
`;

// ---------------------------------------------------------------------------
// Front matter
// ---------------------------------------------------------------------------

function titleBlock(ed) {
  const lines = ed.coverLines.map(([text, size]) => `<p class="t-${size}">${esc(text)}</p>`).join("\n");
  return `<div class="title-block">
${lines}
<p class="subtitle">${esc(ed.subtitle)}</p>
</div>`;
}

function titlePageHtml(ed) {
  return `<section class="titlepage" epub:type="titlepage">
<p class="author">${esc(BOOK.author)}</p>
${titleBlock(ed)}
<p class="publisher">${esc(BOOK.publisher)} · ${BOOK.editionYear}</p>
</section>`;
}

function colophonHtml(locale, ed) {
  const translated = locale !== "sk" && ed.translatedFrom
    ? `<p>${esc(ed.translatedFrom)}:<br/><em>${esc(BOOK.originalTitle)}</em></p>`
    : "";
  return `<section class="colophon" epub:type="copyright-page">
<p><strong>${esc(BOOK.authorTitle)}</strong><br/>${esc(ed.title)} ${esc(ed.subtitle)}</p>
${translated}
<p>${esc(ed.originalEdition)}: ${esc(BOOK.originalPublisher)}, ${esc(BOOK.originalPlace)} ${BOOK.originalYear}. ISBN ${esc(BOOK.originalIsbn)}</p>
<p>${esc(ed.ebookEdition)}: ${esc(BOOK.publisher)}, ${BOOK.editionYear}. <a class="url" href="${esc(BOOK.siteUrl)}">${esc(BOOK.siteUrl.replace(/^https?:\/\//, ""))}</a></p>
<p>© ${BOOK.originalYear} ${esc(BOOK.author)}. ${esc(ed.rights)}</p>
</section>`;
}

// The foreword precedes the contents, as in print.
function splitFront(sections) {
  const first = sections[0];
  return first && first.level === 1 && !first.isPart ? [[first], sections.slice(1)] : [[], sections];
}

// ---------------------------------------------------------------------------
// EPUB
// ---------------------------------------------------------------------------

function xhtmlDoc(locale, title, body, bodyType = "bodymatter") {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="${locale}" xml:lang="${locale}">
<head>
<meta charset="UTF-8"/>
<title>${esc(title)}</title>
<link rel="stylesheet" type="text/css" href="style.css"/>
</head>
<body epub:type="${bodyType}">
${body}
</body>
</html>
`;
}

function uuidFor(locale) {
  const h = createHash("sha1").update(`${BOOK.slug}:${locale}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

function navOl(nodes, pdf = false, depth = 0) {
  if (!nodes.length) return "";
  const items = nodes.map((n) => {
    const cls = n.isPart ? "part" : depth === 0 || (depth === 1 && !n.children?.length) ? "chapter" : "sub";
    const label = esc(plain(n.title));
    const link = pdf
      ? `<a href="${n.href}"><span class="t">${label}</span><span class="dots"></span></a>`
      : `<a href="${n.href}">${label}</a>`;
    return `<li class="${n.isPart ? "part" : depth <= 1 ? "chapter" : cls}">${link}${navOl(n.children, pdf, depth + 1)}</li>`;
  });
  return `<ol>\n${items.join("\n")}\n</ol>`;
}

function ncxPoints(nodes, counter) {
  return nodes
    .map((n) => {
      const order = ++counter.n;
      return `<navPoint id="np${order}" playOrder="${order}"><navLabel><text>${esc(plain(n.title))}</text></navLabel><content src="${n.href}"/>${ncxPoints(n.children, counter)}</navPoint>`;
    })
    .join("\n");
}

function mediaType(file) {
  const ext = path.extname(file).toLowerCase();
  return { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".ttf": "font/ttf" }[ext];
}

function buildEpub(locale, sections, assets, outFile) {
  const ed = BOOK.editions[locale];
  const uid = `urn:uuid:${uuidFor(locale)}`;
  const fullTitle = `${ed.title} ${ed.subtitle}`;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `epub-${locale}-`));
  const ops = path.join(dir, "OEBPS");
  fs.mkdirSync(path.join(dir, "META-INF"), { recursive: true });
  fs.mkdirSync(path.join(ops, "fonts"), { recursive: true });

  const noteFile = new Map();
  const refFile = new Map();
  for (const s of sections) {
    for (const b of s.blocks) {
      if (b.type === "footnote") noteFile.set(String(b.n), s.file);
      for (const t of blockTexts(b)) for (const m of t.matchAll(/\[\^(\d+)\]/g)) refFile.set(m[1], s.file);
    }
  }
  const ctx = {
    noteRef: (n) =>
      `<sup><a class="noteref" epub:type="noteref" role="doc-noteref" id="fnref${n}" href="${noteFile.get(n)}#fn${n}">${n}</a></sup>`,
    imageSrc: (file) => `images/${file}`,
    heading: (tag, id, cls, html) => `<${tag} class="${cls}" id="${id}">${html}</${tag}>`,
    running: () => "",
    notes: (section) => {
      const notes = section.blocks.filter((b) => b.type === "footnote");
      if (!notes.length) return "";
      const items = notes.map(
        (fn) =>
          `<aside epub:type="footnote" role="doc-footnote" id="fn${fn.n}" class="note"><p><a class="noteback" href="${refFile.get(String(fn.n))}#fnref${fn.n}">${fn.n}</a> ${inline(fn.text, ctx)}</p></aside>`
      );
      return `<section class="notes" epub:type="footnotes" aria-label="${esc(ed.notes)}">\n${items.join("\n")}\n</section>`;
    },
  };

  const write = (rel, content) => fs.writeFileSync(path.join(dir, rel), content);
  write("mimetype", "application/epub+zip");
  write(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
<rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>
`
  );
  write("OEBPS/style.css", EPUB_CSS);

  const fonts = ["Literata-Regular.ttf", "Literata-SemiBold.ttf", "Literata-Italic.ttf", "PlayfairDisplay-Italic.ttf"];
  for (const f of fonts) fs.copyFileSync(path.join(FONTS_DIR, f), path.join(ops, "fonts", f));
  fs.copyFileSync(assets.cover, path.join(ops, "cover.jpg"));
  const images = [...new Set(sections.flatMap((s) => s.blocks.filter((b) => b.type === "figure").map((b) => b.file)))];
  if (images.length) fs.mkdirSync(path.join(ops, "images"));
  for (const img of images) fs.copyFileSync(assets.image(img), path.join(ops, "images", img));

  write(
    "OEBPS/cover.xhtml",
    xhtmlDoc(
      locale,
      ed.cover,
      `<section epub:type="cover" class="cover"><img src="cover.jpg" alt="${esc(fullTitle)}"/></section>`,
      "frontmatter"
    )
  );
  write("OEBPS/title.xhtml", xhtmlDoc(locale, ed.titlePage, titlePageHtml(ed), "frontmatter"));
  write("OEBPS/colophon.xhtml", xhtmlDoc(locale, fullTitle, colophonHtml(locale, ed), "frontmatter"));

  const tree = tocTree(sections);
  const [front, main] = splitFront(sections);
  write(
    "OEBPS/nav.xhtml",
    xhtmlDoc(
      locale,
      ed.contents,
      `<nav epub:type="toc" role="doc-toc" id="toc">
<h1 class="chapter-title">${esc(ed.contents)}</h1>
${navOl(tree)}
</nav>
<nav epub:type="landmarks" hidden="hidden">
<ol>
<li><a epub:type="cover" href="cover.xhtml">${esc(ed.cover)}</a></li>
<li><a epub:type="toc" href="nav.xhtml">${esc(ed.contents)}</a></li>
<li><a epub:type="bodymatter" href="${main[0].file}">${esc(plain(main[0].title))}</a></li>
</ol>
</nav>`,
      "frontmatter"
    )
  );
  write(
    "OEBPS/toc.ncx",
    `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1" xml:lang="${locale}">
<head><meta name="dtb:uid" content="${uid}"/><meta name="dtb:depth" content="3"/><meta name="dtb:totalPageCount" content="0"/><meta name="dtb:maxPageNumber" content="0"/></head>
<docTitle><text>${esc(fullTitle)}</text></docTitle>
<navMap>
${ncxPoints(tree, { n: 0 })}
</navMap>
</ncx>
`
  );

  for (const s of sections) {
    write(`OEBPS/${s.file}`, xhtmlDoc(locale, plain(s.title), renderSection(s, ctx)));
  }

  const manifest = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
    `<item id="css" href="style.css" media-type="text/css"/>`,
    `<item id="cover-image" href="cover.jpg" media-type="image/jpeg" properties="cover-image"/>`,
    `<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>`,
    `<item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>`,
    `<item id="colophon" href="colophon.xhtml" media-type="application/xhtml+xml"/>`,
    ...fonts.map((f, i) => `<item id="font${i + 1}" href="fonts/${f}" media-type="${mediaType(f)}"/>`),
    ...images.map((f, i) => `<item id="img${i + 1}" href="images/${f}" media-type="${mediaType(f)}"/>`),
    ...sections.map((s) => `<item id="${s.id}" href="${s.file}" media-type="application/xhtml+xml"/>`),
  ];
  const spine = [
    `<itemref idref="cover" linear="yes"/>`,
    `<itemref idref="title"/>`,
    `<itemref idref="colophon"/>`,
    ...front.map((s) => `<itemref idref="${s.id}"/>`),
    `<itemref idref="nav"/>`,
    ...main.map((s) => `<itemref idref="${s.id}"/>`),
  ];
  write(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid" xml:lang="${locale}">
<metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
<dc:identifier id="uid">${uid}</dc:identifier>
<dc:title>${esc(fullTitle)}</dc:title>
<dc:creator id="author">${esc(BOOK.author)}</dc:creator>
<meta refines="#author" property="role" scheme="marc:relators">aut</meta>
<dc:language>${locale}</dc:language>
<dc:publisher>${esc(BOOK.publisher)}</dc:publisher>
<dc:date>${BOOK.editionYear}</dc:date>
<dc:rights>© ${BOOK.originalYear} ${esc(BOOK.author)}</dc:rights>
<dc:source>urn:isbn:${BOOK.originalIsbn.replace(/-/g, "")}</dc:source>
<meta property="dcterms:modified">${BOOK.editionYear}-01-01T00:00:00Z</meta>
<meta name="cover" content="cover-image"/>
</metadata>
<manifest>
${manifest.join("\n")}
</manifest>
<spine toc="ncx">
${spine.join("\n")}
</spine>
<guide><reference type="cover" title="${esc(ed.cover)}" href="cover.xhtml"/><reference type="toc" title="${esc(ed.contents)}" href="nav.xhtml"/></guide>
</package>
`
  );

  // Fixed timestamps → byte-identical rebuilds when nothing changed.
  for (const f of walk(dir)) fs.utimesSync(f, FIXED_MTIME, FIXED_MTIME);
  fs.rmSync(outFile, { force: true });
  execFileSync("zip", ["-X0q", outFile, "mimetype"], { cwd: dir });
  execFileSync("zip", ["-X9rq", outFile, "META-INF", "OEBPS"], { cwd: dir });
  fs.rmSync(dir, { recursive: true, force: true });
}

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? [p, ...walk(p)] : [p];
  });
}

// ---------------------------------------------------------------------------
// Browser-rendered assets: cover, diagram, PDF
// ---------------------------------------------------------------------------

function findChrome() {
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  const candidates = [];
  const pw = process.env.PLAYWRIGHT_BROWSERS_PATH ?? "/opt/pw-browsers";
  if (fs.existsSync(pw)) {
    for (const d of fs.readdirSync(pw).filter((d) => /^chromium-\d+$/.test(d)).sort().reverse()) {
      candidates.push(path.join(pw, d, "chrome-linux/chrome"));
    }
  }
  candidates.push(
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  );
  const found = candidates.find((c) => fs.existsSync(c));
  if (!found) throw new Error("Chromium not found — set CHROME_PATH");
  return found;
}

const COVER_W = 1600;
const COVER_H = 2263; // A5 proportions

// Layout measured from the print cover (fractions of the cover width/height).
function coverHtml(locale) {
  const ed = BOOK.editions[locale];
  const url = (f) => pathToFileURL(path.join(COVER_DIR, f)).href;
  const lines = ed.coverLines.map(([text, size]) => `<div class="line ${size}">${esc(text)}</div>`).join("");
  return `<!DOCTYPE html><html lang="${locale}"><head><meta charset="UTF-8"/><style>
${fontFaces((f) => pathToFileURL(path.join(FONTS_DIR, f)).href)}
@font-face { font-family: "P052"; font-weight: 700; src: url("${pathToFileURL(path.join(FONTS_DIR, "P052-Bold.otf")).href}"); }
html, body { margin: 0; width: ${COVER_W}px; height: ${COVER_H}px; overflow: hidden; }
body { position: relative; background: #7da0cf url("${url("cover-photo.jpg")}") center / cover no-repeat; font-family: "Literata", serif; }
.author { position: absolute; top: 118px; width: 100%; text-align: center; font: 700 70px "P052", serif; color: ${COLORS.coverAuthor}; }
.cross { position: absolute; top: 225px; left: 50%; width: 138px; height: 192px; transform: translateX(-50%); background: url("${url("cross.png")}") center / contain no-repeat; }
.box { position: absolute; left: 280px; right: 280px; top: 460px; height: 640px; background: rgba(210, 222, 242, 0.34); }
.title { position: absolute; left: 240px; right: 240px; top: 505px; text-align: center; color: #FFFFFF; text-shadow: 0 2px 10px rgba(0,0,0,0.18); }
.line { white-space: nowrap; line-height: 0.98; }
.m { font-size: 128px; }
.xl { font-size: 300px; line-height: 0.88; }
.xs { font-size: 46px; font-weight: 600; line-height: 1.5; }
.l { font-size: 196px; line-height: 0.92; }
.subtitle { margin-top: 26px; font-size: 104px; color: ${COLORS.coverSubtitle}; white-space: nowrap; }
</style></head><body>
<div class="author">${esc(BOOK.author)}</div>
<div class="cross"></div>
<div class="box"></div>
<div class="title">${lines}<div class="subtitle">${esc(ed.subtitle)}</div></div>
<script>
// Shrink any line that is wider than the title column (long words in some languages).
for (const el of document.querySelectorAll(".line, .subtitle")) {
  const max = el.parentElement.clientWidth;
  let size = parseFloat(getComputedStyle(el).fontSize);
  while (el.scrollWidth > max && size > 20) { size -= 2; el.style.fontSize = size + "px"; }
}
// Grow the translucent box to the title block.
const title = document.querySelector(".title").getBoundingClientRect();
const lines = [...document.querySelectorAll(".line")].map((e) => e.getBoundingClientRect());
const box = document.querySelector(".box");
box.style.top = (lines[0].top - 40) + "px";
box.style.height = (lines[lines.length - 1].bottom - lines[0].top + 70) + "px";
</script>
</body></html>`;
}

function diagramHtml(locale) {
  const [interest, reality, work] = BOOK.editions[locale].diagramLabels;
  return `<!DOCTYPE html><html lang="${locale}"><head><meta charset="UTF-8"/><style>
html, body { margin: 0; width: 1060px; height: 700px; background: #FFFFFF; }
body { background-image: radial-gradient(#D5D5D5 1.6px, transparent 1.6px); background-size: 40px 40px; font-family: "Liberation Sans", Arial, sans-serif; }
svg { position: absolute; inset: 0; }
.label { position: absolute; font-weight: bold; font-size: 30px; line-height: 1.35; color: #2B2B2B; text-align: center; width: 260px; }
.label span { background: linear-gradient(transparent 12%, #FFF176 12%, #FFF176 88%, transparent 88%); padding: 2px 10px; box-decoration-break: clone; -webkit-box-decoration-break: clone; }
</style></head><body>
<svg viewBox="0 0 1060 700" width="1060" height="700" fill="none" stroke="#4A4A4A" stroke-width="6" stroke-linecap="round" stroke-linejoin="round">
<path d="M118 525 C 160 400, 200 300, 255 262 C 300 245, 345 270, 365 330 C 385 400, 380 470, 390 505 C 398 530, 410 532, 440 533 C 520 540, 600 480, 700 440 C 800 400, 880 370, 960 350"/>
<path d="M280 355 L280 280 M265 300 L280 278 L296 300"/>
<path d="M545 308 L440 518 M437 490 L438 520 L465 506"/>
<path d="M870 490 L888 398 M872 415 L888 396 L898 420"/>
</svg>
<div class="label" style="left:120px; top:390px"><span>${esc(interest)}</span></div>
<div class="label" style="left:480px; top:285px"><span>${esc(reality)}</span></div>
<div class="label" style="left:670px; top:485px"><span>${esc(work)}</span></div>
</body></html>`;
}

async function renderScreenshot(browser, html, width, height, out, type) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  const file = path.join(os.tmpdir(), `render-${process.pid}-${path.basename(out)}.html`);
  fs.writeFileSync(file, html);
  await page.goto(pathToFileURL(file).href, { waitUntil: "load" });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: out, type, ...(type === "jpeg" ? { quality: 86 } : {}), clip: { x: 0, y: 0, width, height } });
  await page.close();
  fs.rmSync(file, { force: true });
}

async function buildPdf(browser, locale, sections, assets, outPdf, tmp) {
  const ed = BOOK.editions[locale];
  const notes = footnoteTexts(sections);
  const ctx = {
    noteRef: (n) => `<span class="fn">${inline(notes.get(n), { ...ctx, noteRef: () => "" })}</span>`,
    imageSrc: (file) => pathToFileURL(assets.image(file)).href,
    running: (section) => `<div class="running" aria-hidden="true">${esc(plain(section.running))}</div>`,
    heading: (tag, id, cls, html, text) =>
      `<${tag} class="outline" id="${id}">${esc(plain(text))}</${tag}><div class="${cls}">${html}</div>`,
    notes: () => "",
  };
  const localize = (nodes) => nodes.map((n) => ({ ...n, href: `#${n.href.split("#")[1]}`, children: localize(n.children) }));
  const [front, main] = splitFront(sections);
  const html = `<!DOCTYPE html>
<html lang="${locale}"><head><meta charset="UTF-8"/>
<title>${esc(`${ed.title} ${ed.subtitle}`)}</title>
<meta name="author" content="${esc(BOOK.author)}"/>
<style>${PDF_CSS}</style>
<script>window.PagedConfig = { auto: true, after: () => { window.__pagedDone = true; } };</script>
<script src="${pathToFileURL(PAGED_JS).href}"></script>
</head><body>
<div class="cover-page"><img src="${pathToFileURL(assets.cover).href}" alt=""/></div>
${titlePageHtml(ed)}
${colophonHtml(locale, ed)}
${front.map((s) => renderSection(s, ctx)).join("\n")}
<nav id="toc"><h1 class="chapter-title">${esc(ed.contents)}</h1>${navOl(localize(tocTree(main)), true)}</nav>
${main.map((s) => renderSection(s, ctx)).join("\n")}
</body></html>`;
  const file = path.join(tmp, `print-${locale}.html`);
  fs.writeFileSync(file, html);

  const page = await browser.newPage();
  page.on("pageerror", (err) => console.error(`  [${locale} pdf] ${err.message}`));
  await page.goto(pathToFileURL(file).href, { waitUntil: "load", timeout: 120000 });
  await page.waitForFunction("window.__pagedDone === true", { timeout: 300000, polling: 500 });
  await page.pdf({ path: outPdf, preferCSSPageSize: true, printBackground: true, outline: true, tagged: true, timeout: 300000 });
  const pages = await page.evaluate(() => document.querySelectorAll(".pagedjs_page").length);
  await page.close();
  return pages;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function wordCount(sections) {
  return sections.reduce(
    (sum, s) => sum + s.blocks.flatMap(blockTexts).join(" ").split(/\s+/).filter(Boolean).length,
    0
  );
}

async function main() {
  const requested = process.argv.slice(2);
  const available = Object.keys(BOOK.editions).filter((l) => fs.existsSync(path.join(CONTENT_DIR, `${l}.md`)));
  const locales = requested.length ? requested : available;
  for (const l of locales) {
    if (!BOOK.editions[l]) throw new Error(`unknown locale "${l}" (not in book.json)`);
    if (!available.includes(l)) throw new Error(`content/book/${l}.md does not exist`);
  }
  if (!fs.existsSync(PAGED_JS)) throw new Error("pagedjs is not installed — run npm install");

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifest = fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) : {};
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ebook-"));
  const browser = await puppeteer.launch({
    executablePath: findChrome(),
    headless: true,
    args: ["--no-sandbox", "--disable-gpu", "--allow-file-access-from-files", "--font-render-hinting=none"],
  });

  try {
    for (const locale of locales) {
      const sections = parseBook(fs.readFileSync(path.join(CONTENT_DIR, `${locale}.md`), "utf8"), locale);
      const base = `${BOOK.slug}-${locale}`;
      const cover = path.join(OUT_DIR, `cover-${locale}.jpg`);
      const epub = path.join(OUT_DIR, `${base}.epub`);
      const pdf = path.join(OUT_DIR, `${base}.pdf`);

      const generated = path.join(tmp, locale);
      fs.mkdirSync(generated, { recursive: true });
      await renderScreenshot(browser, coverHtml(locale), COVER_W, COVER_H, cover, "jpeg");
      await renderScreenshot(browser, diagramHtml(locale), 1060, 700, path.join(generated, "trend-diagram.png"), "png");
      const assets = {
        cover,
        image: (file) => (GENERATED_FIGURES.has(file) ? path.join(generated, file) : imagePath(file, locale)),
      };

      buildEpub(locale, sections, assets, epub);
      const pages = await buildPdf(browser, locale, sections, assets, pdf, tmp);

      manifest[locale] = {
        epub: { file: `/ebook/${base}.epub`, bytes: fs.statSync(epub).size },
        pdf: { file: `/ebook/${base}.pdf`, bytes: fs.statSync(pdf).size },
        cover: `/ebook/cover-${locale}.jpg`,
        words: wordCount(sections),
      };
      fs.rmSync(path.join(OUT_DIR, `cover-${locale}.png`), { force: true });
      console.log(
        `${locale}: ${sections.length} sections, ${manifest[locale].words} words → ` +
          `epub ${(manifest[locale].epub.bytes / 1024).toFixed(0)} KB, pdf ${pages} pages ${(manifest[locale].pdf.bytes / 1024).toFixed(0)} KB`
      );
    }
  } finally {
    await browser.close();
    if (process.env.KEEP_BUILD_TMP) console.log(`intermediate files kept in ${tmp}`);
    else fs.rmSync(tmp, { recursive: true, force: true });
  }

  const sorted = Object.fromEntries(Object.keys(BOOK.editions).filter((l) => manifest[l]).map((l) => [l, manifest[l]]));
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
