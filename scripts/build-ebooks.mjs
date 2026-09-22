#!/usr/bin/env node
// Builds the book in every language as EPUB 3 (Apple Books, Kindle via
// Send to Kindle, Kobo, Google Play Books, PocketBook, Tolino…) and PDF.
//
//   node scripts/build-ebooks.mjs            # all locales with a source file
//   node scripts/build-ebooks.mjs sk en      # only these
//
// Source:  content/book/<locale>.md  (syntax: content/book/FORMAT.md)
//          content/book/book.json    (titles, front-matter labels)
// Output:  public/ebook/<slug>-<locale>.epub | .pdf, cover-<locale>.png
//          lib/data/book-files.json  (file sizes, read by the download page)
//
// Requires: `zip` and a Chromium/Chrome binary (CHROME_PATH or auto-detected).

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const CONTENT_DIR = path.join(ROOT, "content/book");
const OUT_DIR = path.join(ROOT, "public/ebook");
const MANIFEST_PATH = path.join(ROOT, "lib/data/book-files.json");
const BOOK = JSON.parse(fs.readFileSync(path.join(CONTENT_DIR, "book.json"), "utf8"));
const FIXED_MTIME = new Date(`${BOOK.editionYear}-01-01T00:00:00Z`);

// ---------------------------------------------------------------------------
// Markdown subset parser
// ---------------------------------------------------------------------------

const FOOTNOTE_DEF = /^\[\^(\d+)\]:\s*(.*)$/;
const ORDERED_ITEM = /^\d+\.\s+(?!\d)/;

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

    if (line === "---") {
      flush(lineNo);
      return push({ type: "hr" }, lineNo);
    }

    if (line.startsWith(">")) {
      if (!quote) flush(lineNo);
      quote ??= { type: "quote", lines: [], attribution: null };
      const text = line.replace(/^>\s?/, "");
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
  sections.forEach((s, i) => {
    s.id = `s${String(i + 1).padStart(3, "0")}`;
    s.file = `${s.id}.xhtml`;
    let h3 = 0;
    for (const b of s.blocks) if (b.type === "h3") b.id = `${s.id}-${++h3}`;
  });
  validateFootnotes(sections, locale);
  return sections;
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

function blockTexts(b) {
  switch (b.type) {
    case "p":
    case "h3":
    case "footnote":
      return [b.text];
    case "quote":
      return [...b.lines, b.attribution ?? ""];
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
// Rendering
// ---------------------------------------------------------------------------

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// `noteHref(n)` returns the link target of footnote n (differs between the
// multi-file EPUB and the single-file PDF).
function inline(text, noteHref) {
  return text
    .split(/(<https?:\/\/[^>\s]+>|\[\^\d+\])/)
    .map((part) => {
      const link = /^<(https?:\/\/[^>\s]+)>$/.exec(part);
      if (link) return `<a class="url" href="${esc(link[1])}">${esc(link[1])}</a>`;
      const ref = /^\[\^(\d+)\]$/.exec(part);
      if (ref) {
        const n = ref[1];
        return `<sup><a class="noteref" epub:type="noteref" role="doc-noteref" id="fnref${n}" href="${noteHref(n)}">${n}</a></sup>`;
      }
      return esc(part)
        .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
        .replace(/\*(.+?)\*/g, "<em>$1</em>");
    })
    .join("");
}

function renderBlock(b, noteHref) {
  const r = (t) => inline(t, noteHref);
  switch (b.type) {
    case "p":
      return `<p>${r(b.text)}</p>`;
    case "h3":
      return `<h3 id="${b.id}">${r(b.text)}</h3>`;
    case "hr":
      return `<p class="break" role="separator">✦</p>`;
    case "quote": {
      const body = b.lines.map((l) => `<p>${r(l)}</p>`).join("\n");
      const cite = b.attribution ? `\n<p class="attribution">— ${r(b.attribution)}</p>` : "";
      return `<blockquote>\n${body}${cite}\n</blockquote>`;
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

function renderNotes(section, noteHref, backHref, label, epub) {
  const notes = section.blocks.filter((b) => b.type === "footnote");
  if (!notes.length) return "";
  const r = (t) => inline(t, noteHref);
  const items = notes.map((fn) => {
    const back = `<a class="noteback" href="${backHref(fn.n)}">${fn.n}</a>`;
    return epub
      ? `<aside epub:type="footnote" role="doc-footnote" id="fn${fn.n}" class="note"><p>${back} ${r(fn.text)}</p></aside>`
      : `<p class="note" id="fn${fn.n}">${back} ${r(fn.text)}</p>`;
  });
  return `<section class="notes" epub:type="footnotes" aria-label="${esc(label)}">\n<p class="notes-title">${esc(label)}</p>\n${items.join("\n")}\n</section>`;
}

function renderSectionBody(section, noteHref, backHref, labels, epub) {
  const blocks = section.blocks.map((b) => renderBlock(b, noteHref)).filter(Boolean);
  const isPart = section.level === 1 && !blocks.length;
  const tag = section.level === 1 ? "h1" : "h2";
  const type = isPart ? "part" : "chapter";
  const heading = `<${tag} id="${section.id}"${isPart ? ' class="part-title"' : ""}>${inline(section.title, noteHref)}</${tag}>`;
  const notes = renderNotes(section, noteHref, backHref, labels.notes, epub);
  return `<section epub:type="${type}" role="doc-${type}" class="${type}">\n${heading}\n${blocks.join("\n")}\n${notes}\n</section>`;
}

function tocTree(sections) {
  // Nest: level-1 → level-2 → h3.
  const tree = [];
  for (const s of sections) {
    const node = {
      title: s.title,
      href: `${s.file}#${s.id}`,
      children: s.blocks
        .filter((b) => b.type === "h3")
        .map((b) => ({ title: b.text, href: `${s.file}#${b.id}`, children: [] })),
    };
    const parent = tree[tree.length - 1];
    if (s.level === 2 && parent) parent.children.push(node);
    else tree.push(node);
  }
  return tree;
}

const plain = (t) => t.replace(/\[\^\d+\]/g, "").replace(/\*+/g, "");

// ---------------------------------------------------------------------------
// Shared styles
// ---------------------------------------------------------------------------

const BASE_CSS = `
body { font-family: Georgia, "Liberation Serif", "DejaVu Serif", serif; line-height: 1.5; }
h1, h2, h3 { font-family: "Liberation Sans", Helvetica, Arial, sans-serif; line-height: 1.25; font-weight: bold; page-break-after: avoid; break-after: avoid; hyphens: none; -webkit-hyphens: none; }
h1 { font-size: 1.6em; margin: 2em 0 1em; }
h2 { font-size: 1.3em; margin: 1.5em 0 0.8em; }
h3 { font-size: 1.05em; margin: 1.4em 0 0.5em; }
p { margin: 0; text-indent: 1.3em; text-align: justify; hyphens: auto; -webkit-hyphens: auto; orphans: 2; widows: 2; }
h1 + p, h2 + p, h3 + p, blockquote + p, table + p, ul + p, ol + p, .break + p { text-indent: 0; }
blockquote { margin: 1em 1.5em; font-style: italic; }
blockquote p { text-indent: 0; margin-bottom: 0.4em; }
blockquote .attribution { font-style: normal; font-size: 0.85em; text-align: right; }
ul, ol { margin: 0.6em 0 0.6em 1.5em; padding: 0; }
li { margin-bottom: 0.3em; }
table { border-collapse: collapse; width: 100%; margin: 1em 0; font-size: 0.8em; page-break-inside: auto; }
th, td { border: 1px solid #999; padding: 0.3em 0.4em; vertical-align: top; text-align: left; }
th { background: #eee; }
sup { font-size: 0.7em; line-height: 0; }
a { color: inherit; }
a.noteref { text-decoration: none; }
a.url { word-break: break-all; }
.break { text-align: center; text-indent: 0; margin: 1em 0; }
.part { text-align: center; }
.part-title { font-size: 2em; margin-top: 35%; text-transform: uppercase; letter-spacing: 0.1em; }
.notes { margin-top: 2em; border-top: 1px solid #999; padding-top: 0.5em; font-size: 0.8em; }
.notes-title { text-indent: 0; font-weight: bold; margin-bottom: 0.5em; }
.note p, p.note { text-indent: 0; text-align: left; margin-bottom: 0.3em; }
.titlepage { text-align: center; }
.titlepage .author { font-size: 1.2em; margin-top: 20%; text-indent: 0; text-align: center; }
.titlepage .title { font-size: 2em; margin: 1em 0 0.3em; }
.titlepage .subtitle { font-size: 1.3em; text-indent: 0; text-align: center; }
.titlepage .publisher { margin-top: 30%; text-indent: 0; text-align: center; font-size: 0.9em; }
.colophon p { text-indent: 0; text-align: left; font-size: 0.85em; margin-bottom: 0.8em; }
nav ol { list-style: none; margin-left: 0; }
nav ol ol { margin-left: 1.2em; }
`;

// ---------------------------------------------------------------------------
// Front matter
// ---------------------------------------------------------------------------

function titlePageHtml(ed) {
  return `<section class="titlepage" epub:type="titlepage">
<p class="author">${esc(BOOK.author)}</p>
<h1 class="title">${esc(ed.title)}</h1>
<p class="subtitle">${esc(ed.subtitle)}</p>
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

function navOl(nodes) {
  if (!nodes.length) return "";
  const items = nodes.map(
    (n) => `<li><a href="${n.href}">${esc(plain(n.title))}</a>${navOl(n.children)}</li>`
  );
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

function buildEpub(locale, sections, coverPng, outFile) {
  const ed = BOOK.editions[locale];
  const uid = `urn:uuid:${uuidFor(locale)}`;
  const fullTitle = `${ed.title} ${ed.subtitle}`;
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), `epub-${locale}-`));
  const ops = path.join(dir, "OEBPS");
  fs.mkdirSync(path.join(dir, "META-INF"), { recursive: true });
  fs.mkdirSync(ops);

  const noteFile = new Map();
  for (const s of sections) for (const b of s.blocks) if (b.type === "footnote") noteFile.set(String(b.n), s.file);
  const refFile = new Map();
  for (const s of sections) {
    for (const b of s.blocks) for (const t of blockTexts(b)) for (const m of t.matchAll(/\[\^(\d+)\]/g)) refFile.set(m[1], s.file);
  }
  const noteHref = (n) => `${noteFile.get(String(n))}#fn${n}`;
  const backHref = (n) => `${refFile.get(String(n))}#fnref${n}`;

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
  write("OEBPS/style.css", BASE_CSS);
  fs.copyFileSync(coverPng, path.join(ops, "cover.png"));
  write(
    "OEBPS/cover.xhtml",
    xhtmlDoc(
      locale,
      ed.cover,
      `<section epub:type="cover" class="cover"><img src="cover.png" alt="${esc(fullTitle)}" style="max-width:100%;max-height:100%;"/></section>`,
      "frontmatter"
    )
  );
  write("OEBPS/title.xhtml", xhtmlDoc(locale, ed.titlePage, titlePageHtml(ed), "frontmatter"));
  write("OEBPS/colophon.xhtml", xhtmlDoc(locale, fullTitle, colophonHtml(locale, ed), "frontmatter"));

  const tree = tocTree(sections);
  write(
    "OEBPS/nav.xhtml",
    xhtmlDoc(
      locale,
      ed.contents,
      `<nav epub:type="toc" role="doc-toc" id="toc">
<h1>${esc(ed.contents)}</h1>
${navOl(tree)}
</nav>
<nav epub:type="landmarks" hidden="hidden">
<ol>
<li><a epub:type="cover" href="cover.xhtml">${esc(ed.cover)}</a></li>
<li><a epub:type="toc" href="nav.xhtml">${esc(ed.contents)}</a></li>
<li><a epub:type="bodymatter" href="${sections[0].file}">${esc(plain(sections[0].title))}</a></li>
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
    write(`OEBPS/${s.file}`, xhtmlDoc(locale, plain(s.title), renderSectionBody(s, noteHref, backHref, ed, true)));
  }

  const manifest = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>`,
    `<item id="css" href="style.css" media-type="text/css"/>`,
    `<item id="cover-image" href="cover.png" media-type="image/png" properties="cover-image"/>`,
    `<item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>`,
    `<item id="title" href="title.xhtml" media-type="application/xhtml+xml"/>`,
    `<item id="colophon" href="colophon.xhtml" media-type="application/xhtml+xml"/>`,
    ...sections.map((s) => `<item id="${s.id}" href="${s.file}" media-type="application/xhtml+xml"/>`),
  ];
  const spine = [
    `<itemref idref="cover" linear="yes"/>`,
    `<itemref idref="title"/>`,
    `<itemref idref="colophon"/>`,
    `<itemref idref="nav"/>`,
    ...sections.map((s) => `<itemref idref="${s.id}"/>`),
  ];
  const modified = `${BOOK.editionYear}-01-01T00:00:00Z`;
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
<meta property="dcterms:modified">${modified}</meta>
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

  // Fixed timestamps → byte-identical rebuilds when the text has not changed.
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
// Cover + PDF (rendered with headless Chromium)
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

function chrome(args) {
  execFileSync(
    findChrome(),
    ["--headless", "--no-sandbox", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1", ...args],
    { stdio: ["ignore", "ignore", "pipe"] }
  );
}

const COVER_W = 1600;
const COVER_H = 2560;

function coverHtml(locale) {
  const ed = BOOK.editions[locale];
  return `<!DOCTYPE html><html lang="${locale}"><head><meta charset="UTF-8"/><style>
html, body { margin: 0; width: ${COVER_W}px; height: ${COVER_H}px; }
body { background: #111111; color: #F5F0E8; font-family: "Liberation Serif", Georgia, serif; display: flex; flex-direction: column; align-items: center; box-sizing: border-box; padding: 200px 150px 180px; text-align: center; }
.frame { position: absolute; inset: 70px; border: 4px solid #D4AF37; }
.frame::after { content: ""; position: absolute; inset: 18px; border: 1.5px solid rgba(212,175,55,0.45); }
.author { font-family: "Liberation Sans", Arial, sans-serif; font-size: 64px; letter-spacing: 14px; text-transform: uppercase; color: #D4AF37; margin-top: 60px; }
.cross { font-size: 230px; color: #D4AF37; line-height: 1; margin: auto 0 90px; }
.title { font-size: 150px; line-height: 1.08; font-weight: bold; margin: 0; }
.rule { width: 360px; height: 4px; background: #D4AF37; margin: 80px 0; }
.subtitle { font-size: 96px; font-style: italic; color: #D9D2C5; line-height: 1.15; margin-bottom: auto; }
.publisher { font-family: "Liberation Sans", Arial, sans-serif; font-size: 44px; letter-spacing: 10px; text-transform: uppercase; color: #A0A0A0; }
</style></head><body>
<div class="frame"></div>
<div class="author">${esc(BOOK.author)}</div>
<div class="cross">☦</div>
<h1 class="title">${esc(ed.title)}</h1>
<div class="rule"></div>
<div class="subtitle">${esc(ed.subtitle)}</div>
<div class="publisher">${esc(BOOK.publisher)}</div>
</body></html>`;
}

function buildCover(locale, outPng, tmp) {
  const html = path.join(tmp, `cover-${locale}.html`);
  fs.writeFileSync(html, coverHtml(locale));
  chrome([`--window-size=${COVER_W},${COVER_H}`, `--screenshot=${outPng}`, `file://${html}`]);
}

const PDF_CSS = `
@page { size: 148mm 210mm; margin: 18mm 16mm 20mm; @bottom-center { content: counter(page); font-family: "Liberation Serif", serif; font-size: 9pt; color: #555; } }
@page :first { @bottom-center { content: none; } }
@page front { @bottom-center { content: none; } }
html { font-size: 10.5pt; }
.front { page: front; }
.cover-page { page: front; break-after: page; margin: -18mm -16mm -20mm; height: 210mm; }
.cover-page img { width: 148mm; height: 210mm; object-fit: cover; display: block; }
.titlepage, .colophon, nav#toc { break-after: page; }
.colophon { padding-top: 55%; }
section.chapter, section.part { break-before: page; }
section.part { padding-top: 30%; }
section.part .part-title { margin-top: 0; }
nav#toc a { text-decoration: none; }
nav#toc > ol > li { margin-top: 0.5em; font-weight: bold; }
nav#toc li li { font-weight: normal; }
`;

function buildPdf(locale, sections, coverPng, outPdf, tmp) {
  const ed = BOOK.editions[locale];
  const noteHref = (n) => `#fn${n}`;
  const backHref = (n) => `#fnref${n}`;
  const tree = tocTree(sections);
  const localize = (nodes) =>
    nodes.map((n) => ({ ...n, href: `#${n.href.split("#")[1]}`, children: localize(n.children) }));
  const html = `<!DOCTYPE html>
<html lang="${locale}" xmlns:epub="http://www.idpf.org/2007/ops"><head><meta charset="UTF-8"/>
<title>${esc(`${ed.title} ${ed.subtitle}`)}</title>
<meta name="author" content="${esc(BOOK.author)}"/>
<style>${BASE_CSS}${PDF_CSS}</style></head><body>
<div class="cover-page"><img src="file://${coverPng}" alt=""/></div>
<div class="front">${titlePageHtml(ed)}${colophonHtml(locale, ed)}
<nav id="toc"><h1>${esc(ed.contents)}</h1>${navOl(localize(tree))}</nav></div>
${sections.map((s) => renderSectionBody(s, noteHref, backHref, ed, false)).join("\n")}
</body></html>`;
  const file = path.join(tmp, `print-${locale}.html`);
  fs.writeFileSync(file, html);
  chrome([
    "--no-pdf-header-footer",
    "--generate-pdf-document-outline",
    "--virtual-time-budget=10000",
    `--print-to-pdf=${outPdf}`,
    `file://${file}`,
  ]);
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

function main() {
  const requested = process.argv.slice(2);
  const available = Object.keys(BOOK.editions).filter((l) => fs.existsSync(path.join(CONTENT_DIR, `${l}.md`)));
  const locales = requested.length ? requested : available;
  for (const l of locales) {
    if (!BOOK.editions[l]) throw new Error(`unknown locale "${l}" (not in book.json)`);
    if (!available.includes(l)) throw new Error(`content/book/${l}.md does not exist`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const manifest = fs.existsSync(MANIFEST_PATH) ? JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8")) : {};
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "ebook-"));

  for (const locale of locales) {
    const sections = parseBook(fs.readFileSync(path.join(CONTENT_DIR, `${locale}.md`), "utf8"), locale);
    const base = `${BOOK.slug}-${locale}`;
    const cover = path.join(OUT_DIR, `cover-${locale}.png`);
    const epub = path.join(OUT_DIR, `${base}.epub`);
    const pdf = path.join(OUT_DIR, `${base}.pdf`);

    buildCover(locale, cover, tmp);
    buildEpub(locale, sections, cover, epub);
    buildPdf(locale, sections, cover, pdf, tmp);

    manifest[locale] = {
      epub: { file: `/ebook/${base}.epub`, bytes: fs.statSync(epub).size },
      pdf: { file: `/ebook/${base}.pdf`, bytes: fs.statSync(pdf).size },
      cover: `/ebook/cover-${locale}.png`,
      words: wordCount(sections),
    };
    console.log(
      `${locale}: ${sections.length} sections, ${manifest[locale].words} words → ` +
        `epub ${(manifest[locale].epub.bytes / 1024).toFixed(0)} KB, pdf ${(manifest[locale].pdf.bytes / 1024).toFixed(0)} KB`
    );
  }

  const sorted = Object.fromEntries(Object.keys(BOOK.editions).filter((l) => manifest[l]).map((l) => [l, manifest[l]]));
  fs.writeFileSync(MANIFEST_PATH, `${JSON.stringify(sorted, null, 2)}\n`);
  fs.rmSync(tmp, { recursive: true, force: true });
}

main();
