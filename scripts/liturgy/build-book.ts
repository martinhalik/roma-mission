/**
 * Builds the print edition and the e-book from `content/liturgy/liturgy.json`.
 *
 *   npm run book            # convert the docx, then build both
 *   npm run book -- --mono  # single-colour PDF (responses black, not red)
 *
 * Outputs to public/downloads/liturgy/:
 *   spevnik-v1.1-a5.pdf   A5 print edition, paginated by Paged.js
 *   spevnik-v1.1-a5-mono.pdf  the same, single-colour (only with --mono)
 *   spevnik-v1.1.epub     reflowable e-book
 *   spevnik-v1.1.docx     the source document, copied for download
 *
 * Toolchain: headless Chromium (already present for Playwright) plus the
 * vendored Paged.js polyfill. Chromium alone cannot produce running headers or
 * page counters in margin boxes, which a service book needs; Paged.js
 * polyfills those CSS Paged Media features in the page before printing.
 * Nothing here needs LaTeX, Pandoc or a network connection.
 */

import {
  copyFileSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import JSZip from "jszip";
import { chromium } from "playwright-core";
import type {
  LiturgyDocument,
  LiturgySection,
  Utterance,
} from "@/lib/liturgy/types";

// ─── Paths ──────────────────────────────────────────────────────────────────

const ROOT = resolve(import.meta.dirname, "../..");
const BOOK_DIR = resolve(ROOT, "scripts/liturgy/book");
const BUILD_DIR = resolve(BOOK_DIR, ".build");
const OUT_DIR = resolve(ROOT, "public/downloads/liturgy");
const SOURCE_DOCX = resolve(ROOT, "content/liturgy/source/spevnik-v1.1.docx");

const PAGED_POLYFILL = resolve(BOOK_DIR, "vendor/paged.polyfill.min.js");
const BOOK_CSS = resolve(BOOK_DIR, "book.css");

/**
 * Chromium comes from Playwright's shared browser directory when one is
 * configured (as in CI and the dev container); otherwise playwright-core finds
 * its own installation.
 */
const CHROMIUM = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium";

const MONO = process.argv.includes("--mono");

// ─── Credits and imprint ────────────────────────────────────────────────────

const PUBLISHER = "Kresťanská rómska misia";
const TRANSLATOR = "Martin Halík";
const CONSULTANT = "Ján Hero";
const CONTACT = "martin.halik@krm.sk";
const YEAR = new Date().getFullYear();

// ─── HTML helpers ───────────────────────────────────────────────────────────

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Renders a line: escapes it, turns `[[fn:N]]` into an endnote reference, and
 * wraps the `*` chant marks so they can be toned down without being lost.
 */
function renderLine(text: string): string {
  return escapeHtml(text)
    .replace(
      /\[\[fn:(\d+)\]\]/g,
      (_, n) => `<a class="noteref" href="#note-${n}" id="noteref-${n}">${n}</a>`
    )
    .replace(/\*/g, '<span class="chant">*</span>')
    .replace(/\n/g, "<br/>");
}

function renderUtterance(u: Utterance): string {
  const classes = ["utterance", u.role];
  if (u.quiet) classes.push("quiet");
  if (u.variable) classes.push("variable");

  const parts: string[] = [`<div class="${classes.join(" ")}">`];
  if (u.rom) {
    parts.push(
      `<p class="line-rom" lang="rom">` +
        (u.rom.label ? `<span class="speaker">${escapeHtml(u.rom.label)}</span>` : "") +
        renderLine(u.rom.text) +
        `</p>`
    );
  }
  if (u.sk) {
    parts.push(
      `<p class="line-sk" lang="sk">` +
        (u.sk.label ? `<span class="speaker">${escapeHtml(u.sk.label)}</span>` : "") +
        renderLine(u.sk.text) +
        `</p>`
    );
  }
  parts.push("</div>");
  return parts.join("");
}

function renderSection(section: LiturgySection): string {
  const heading =
    section.level === 1
      ? `<h1 class="part-title" id="${section.slug}" lang="sk">${escapeHtml(section.title)}</h1>`
      : `<h2 class="section-title" id="${section.slug}" lang="sk">${escapeHtml(section.title)}</h2>`;

  const blocks = section.blocks
    .map((block) =>
      block.kind === "rubric"
        ? `<p class="rubric ${block.tone}" lang="sk">${escapeHtml(block.text)}</p>`
        : renderUtterance(block)
    )
    .join("");

  return `<section>${heading}${blocks}</section>`;
}

/**
 * The source document has no Romani title (see the conversion TODO), so the
 * cover leads with Slovak until the translator supplies one.
 */
function coverTitles(doc: LiturgyDocument): string {
  const { rom, sk } = doc.meta.title;
  if (rom) {
    return (
      `<h1 class="cover-title-rom" lang="rom">${escapeHtml(rom)}</h1>` +
      `<p class="cover-title-sk" lang="sk">${escapeHtml(sk)}</p>`
    );
  }
  return `<h1 class="cover-title-rom" lang="sk">${escapeHtml(sk)}</h1>`;
}

function buildHtml(doc: LiturgyDocument, css: string): string {
  const toc = doc.sections
    .map(
      (s) =>
        `<li class="level-${s.level}"><a href="#${s.slug}" lang="sk">${escapeHtml(s.title)}</a></li>`
    )
    .join("");

  const notes = doc.footnotes
    .map(
      (n) =>
        `<li id="note-${n.n}" value="${n.n}" lang="sk">${escapeHtml(n.text)}</li>`
    )
    .join("");

  const monoOverride = MONO
    ? `<style>:root{--ink-people:#000;--ink-rubric:#000;}</style>`
    : "";

  return `<!DOCTYPE html>
<html lang="sk">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(doc.meta.title.sk)}</title>
<style>${css}</style>
${monoOverride}
</head>
<body>

<div class="cover">
  <div class="cover-cross">☦</div>
  <div>
    ${coverTitles(doc)}
    <hr class="cover-rule"/>
    <p class="cover-publisher">${escapeHtml(PUBLISHER)}</p>
  </div>
  <div>
    <p class="cover-edition">Verzia ${escapeHtml(doc.meta.version)} · ${YEAR}</p>
  </div>
</div>

<div class="frontmatter colophon">
  <h2>Tiráž</h2>
  <dl>
    <dt>Preklad</dt><dd>${escapeHtml(TRANSLATOR)}</dd>
    <dt>Konzultant</dt><dd>${escapeHtml(CONSULTANT)}</dd>
    <dt>Vydal</dt><dd>${escapeHtml(PUBLISHER)}, ${YEAR}</dd>
    <dt>Verzia</dt><dd>${escapeHtml(doc.meta.version)} · ${escapeHtml(doc.meta.sourceDate)}</dd>
  </dl>
  <p class="colophon-note">
    Toto je pracovná verzia textu. Preklad sa stále opravuje a dopĺňa.
    Pripomienky a opravy posielajte na
    <a href="mailto:${CONTACT}">${CONTACT}</a>.
  </p>
</div>

<div class="frontmatter toc">
  <h2>Obsah</h2>
  <ol>${toc}</ol>
</div>

${doc.sections.map(renderSection).join("")}

<section class="notes">
  <h1 class="part-title">Poznámky prekladateľa</h1>
  <!-- Feeds the recto running head; see the note in book.css. -->
  <h2 class="section-title head-only" aria-hidden="true">Poznámky prekladateľa</h2>
  <ol>${notes}</ol>
</section>

</body>
</html>`;
}

// ─── PDF ────────────────────────────────────────────────────────────────────

async function buildPdf(html: string): Promise<string> {
  mkdirSync(BUILD_DIR, { recursive: true });
  const htmlPath = resolve(BUILD_DIR, "book.html");
  writeFileSync(htmlPath, html, "utf8");

  const browser = await chromium.launch({
    executablePath: CHROMIUM,
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--font-render-hinting=none"],
  });

  try {
    const page = await browser.newPage();
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(String(e)));

    await page.goto(pathToFileURL(htmlPath).href, { waitUntil: "load" });

    // Paged.js paginates the DOM in the page, then signals completion. Without
    // waiting for it the PDF would be the unpaginated document.
    await page.addScriptTag({ path: PAGED_POLYFILL });
    await page.waitForFunction(
      () => document.querySelector(".pagedjs_pages") !== null,
      undefined,
      { timeout: 180_000 }
    );
    await page.waitForFunction(
      () => {
        const root = document.querySelector(".pagedjs_pages");
        return root !== null && root.childElementCount > 0;
      },
      undefined,
      { timeout: 180_000 }
    );
    // Let the last page settle before printing.
    await page.waitForTimeout(1500);

    const pageCount = await page.evaluate(
      () => document.querySelectorAll(".pagedjs_page").length
    );
    if (errors.length) {
      console.warn(`  ! page errors during pagination:\n    ${errors.join("\n    ")}`);
    }

    mkdirSync(OUT_DIR, { recursive: true });
    // The mono build gets its own name so it never overwrites the colour
    // edition that the website links to.
    const pdfPath = resolve(
      OUT_DIR,
      MONO ? "spevnik-v1.1-a5-mono.pdf" : "spevnik-v1.1-a5.pdf"
    );
    await page.pdf({
      path: pdfPath,
      preferCSSPageSize: true,
      printBackground: true,
      displayHeaderFooter: false,
    });

    console.log(`  ${pageCount} pages${MONO ? " (mono)" : ""}`);
    return pdfPath;
  } finally {
    await browser.close();
  }
}

// ─── EPUB ───────────────────────────────────────────────────────────────────

/** Minimal reflowable EPUB 3. One XHTML document per section. */
async function buildEpub(doc: LiturgyDocument): Promise<string> {
  const zip = new JSZip();
  const uid = `urn:uuid:krm-spevnik-${doc.meta.version}-${doc.meta.source.sha256.slice(0, 12)}`;
  const modified = `${new Date().toISOString().slice(0, 19)}Z`;

  // The mimetype entry must come first and be stored uncompressed.
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  zip.file(
    "META-INF/container.xml",
    `<?xml version="1.0" encoding="UTF-8"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles><rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/></rootfiles>
</container>`
  );

  const css = `
body { font-family: Georgia, "Liberation Serif", serif; line-height: 1.45; margin: 0 6%; }
h1.part-title { font-size: 1.5em; font-weight: normal; text-align: center;
  border-bottom: 1px solid #8c1c13; padding-bottom: .3em; margin: 1.2em 0 1em; }
h2.section-title { font-size: .78em; letter-spacing: .12em; text-transform: uppercase;
  color: #8c1c13; text-align: center; margin: 1.8em 0 .8em; }
.utterance { margin-bottom: .75em; }
.speaker { font-size: .62em; letter-spacing: .1em; text-transform: uppercase;
  color: #666; margin-right: .5em; }
.line-rom { margin: 0; }
.utterance.people .line-rom { font-weight: bold; color: #8c1c13; }
.utterance.people .speaker { color: #8c1c13; }
.line-sk { margin: .2em 0 0 1.4em; font-size: .82em; font-style: italic; color: #444; }
.utterance.quiet .line-rom, .utterance.quiet .line-sk {
  font-size: .82em; font-style: italic; color: #666; font-weight: normal; }
.rubric { font-size: .84em; font-style: italic; text-align: center; color: #8c1c13; margin: .9em 1.5em; }
.rubric.optional { color: #666; }
.chant { color: #999; }
.noteref { font-size: .7em; vertical-align: super; color: #8c1c13; text-decoration: none; }
.cover { text-align: center; margin-top: 22%; }
.cover-title-rom { font-size: 1.7em; font-weight: normal; }
.cover-title-sk { font-style: italic; color: #444; }
.cover-publisher { font-size: .8em; letter-spacing: .14em; text-transform: uppercase; color: #444; }
.colophon dt { font-size: .7em; letter-spacing: .08em; text-transform: uppercase; color: #666; margin-top: .8em; }
.colophon dd { margin: .1em 0 0; }
.notes ol { font-size: .85em; color: #333; }
`.trim();
  zip.file("OEBPS/style.css", css);

  const xhtml = (title: string, body: string) =>
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="sk" xml:lang="sk">
<head><meta charset="utf-8"/><title>${escapeHtml(title)}</title>
<link rel="stylesheet" type="text/css" href="style.css"/></head>
<body>${body}</body>
</html>`;

  interface Doc {
    id: string;
    file: string;
    title: string;
    inToc: boolean;
  }
  const docs: Doc[] = [];

  const romTitle = doc.meta.title.rom;
  docs.push({ id: "cover", file: "cover.xhtml", title: doc.meta.title.sk, inToc: false });
  zip.file(
    "OEBPS/cover.xhtml",
    xhtml(
      doc.meta.title.sk,
      `<div class="cover">
  ${
    romTitle
      ? `<h1 class="cover-title-rom" lang="rom">${escapeHtml(romTitle)}</h1>
     <p class="cover-title-sk" lang="sk">${escapeHtml(doc.meta.title.sk)}</p>`
      : `<h1 class="cover-title-rom" lang="sk">${escapeHtml(doc.meta.title.sk)}</h1>`
  }
  <p class="cover-publisher">${escapeHtml(PUBLISHER)}</p>
  <p>Verzia ${escapeHtml(doc.meta.version)} · ${YEAR}</p>
</div>`
    )
  );

  docs.push({ id: "colophon", file: "colophon.xhtml", title: "Tiráž", inToc: true });
  zip.file(
    "OEBPS/colophon.xhtml",
    xhtml(
      "Tiráž",
      `<div class="colophon">
  <h1 class="part-title">Tiráž</h1>
  <dl>
    <dt>Preklad</dt><dd>${escapeHtml(TRANSLATOR)}</dd>
    <dt>Konzultant</dt><dd>${escapeHtml(CONSULTANT)}</dd>
    <dt>Vydal</dt><dd>${escapeHtml(PUBLISHER)}, ${YEAR}</dd>
    <dt>Verzia</dt><dd>${escapeHtml(doc.meta.version)} · ${escapeHtml(doc.meta.sourceDate)}</dd>
  </dl>
  <p><i>Toto je pracovná verzia textu. Preklad sa stále opravuje a dopĺňa.
  Pripomienky a opravy posielajte na
  <a href="mailto:${CONTACT}">${CONTACT}</a>.</i></p>
</div>`
    )
  );

  doc.sections.forEach((section, i) => {
    const file = `s${i + 1}-${section.slug}.xhtml`;
    docs.push({ id: `sec${i + 1}`, file, title: section.title, inToc: true });
    zip.file("OEBPS/" + file, xhtml(section.title, renderSection(section)));
  });

  docs.push({ id: "notes", file: "notes.xhtml", title: "Poznámky prekladateľa", inToc: true });
  zip.file(
    "OEBPS/notes.xhtml",
    xhtml(
      "Poznámky prekladateľa",
      `<section class="notes"><h1 class="part-title">Poznámky prekladateľa</h1><ol>${doc.footnotes
        .map((n) => `<li id="note-${n.n}" value="${n.n}">${escapeHtml(n.text)}</li>`)
        .join("")}</ol></section>`
    )
  );

  const navItems = docs
    .filter((d) => d.inToc)
    .map((d) => `<li><a href="${d.file}">${escapeHtml(d.title)}</a></li>`)
    .join("");
  zip.file(
    "OEBPS/nav.xhtml",
    `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml" xmlns:epub="http://www.idpf.org/2007/ops" lang="sk" xml:lang="sk">
<head><meta charset="utf-8"/><title>Obsah</title></head>
<body><nav epub:type="toc" id="toc"><h1>Obsah</h1><ol>${navItems}</ol></nav></body>
</html>`
  );

  const manifest = [
    `<item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>`,
    `<item id="css" href="style.css" media-type="text/css"/>`,
    ...docs.map(
      (d) => `<item id="${d.id}" href="${d.file}" media-type="application/xhtml+xml"/>`
    ),
  ].join("");
  const spine = docs.map((d) => `<itemref idref="${d.id}"/>`).join("");

  zip.file(
    "OEBPS/content.opf",
    `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="pub-id" xml:lang="sk">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="pub-id">${uid}</dc:identifier>
    <dc:title>${escapeHtml(doc.meta.title.sk)}</dc:title>
    <dc:language>sk</dc:language>
    <dc:language>rom</dc:language>
    <dc:creator>${escapeHtml(TRANSLATOR)}</dc:creator>
    <dc:contributor>${escapeHtml(CONSULTANT)}</dc:contributor>
    <dc:publisher>${escapeHtml(PUBLISHER)}</dc:publisher>
    <dc:description>Svätá liturgia sv. Jána Zlatoústeho v stredoslovenskom dialekte rómčiny. Pracovná verzia ${escapeHtml(doc.meta.version)}.</dc:description>
    <meta property="dcterms:modified">${modified}</meta>
  </metadata>
  <manifest>${manifest}</manifest>
  <spine>${spine}</spine>
</package>`
  );

  mkdirSync(OUT_DIR, { recursive: true });
  const epubPath = resolve(OUT_DIR, "spevnik-v1.1.epub");
  const buffer = await zip.generateAsync({
    type: "nodebuffer",
    mimeType: "application/epub+zip",
    compression: "DEFLATE",
  });
  writeFileSync(epubPath, buffer);
  return epubPath;
}

// ─── Main ───────────────────────────────────────────────────────────────────

async function main() {
  const doc = JSON.parse(
    readFileSync(resolve(ROOT, "content/liturgy/liturgy.json"), "utf8")
  ) as LiturgyDocument;
  const css = readFileSync(BOOK_CSS, "utf8");

  console.log("Building the print edition…");
  const pdfPath = await buildPdf(buildHtml(doc, css));
  console.log(`✓ ${pdfPath}`);

  console.log("Building the e-book…");
  const epubPath = await buildEpub(doc);
  console.log(`✓ ${epubPath}`);

  mkdirSync(OUT_DIR, { recursive: true });
  copyFileSync(SOURCE_DOCX, resolve(OUT_DIR, "spevnik-v1.1.docx"));
  console.log(`✓ ${resolve(OUT_DIR, "spevnik-v1.1.docx")}`);

  writeManifest();
}

/**
 * Records which downloads actually exist, so the website can decide what to
 * link without touching the filesystem at request time.
 *
 * `existsSync` from a server component is not safe here: Next.js only traces
 * files it can see being imported, so `public/` may not be present next to the
 * running function on a serverless deployment, and every download would
 * silently vanish from the page. Importing a committed manifest cannot fail
 * that way.
 *
 * Files not produced by this script — the thesis PDF — are picked up too, so
 * dropping one into `public/downloads/liturgy/` and re-running is all it takes.
 */
function writeManifest() {
  const files = readdirSync(OUT_DIR)
    .filter((name) => !name.startsWith("."))
    .sort()
    .map((name) => ({
      href: `/downloads/liturgy/${name}`,
      bytes: statSync(resolve(OUT_DIR, name)).size,
    }));

  const manifestPath = resolve(ROOT, "content/liturgy/downloads.json");
  writeFileSync(
    manifestPath,
    `${JSON.stringify({ generatedAt: new Date().toISOString().slice(0, 10), files }, null, 2)}\n`,
    "utf8"
  );
  console.log(`✓ ${manifestPath} (${files.length} files)`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
