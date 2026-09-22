#!/usr/bin/env node
// Verifies that content/book/<locale>.md has the same structure as the Slovak
// original (sk.md): same heading levels and numbering, same footnote numbers
// in the same order, same number of quotes, list items and table rows.
//
//   node scripts/check-book-translation.mjs en      # one locale
//   node scripts/check-book-translation.mjs         # every translation

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const DIR = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../content/book");

function outline(src) {
  const lines = src.split(/\r?\n/).map((l) => l.trim());
  const headings = lines
    .filter((l) => /^#{1,3}\s/.test(l))
    .map((l) => {
      const [, hashes, title] = /^(#{1,3})\s+(.*)$/.exec(l);
      const number = /^(\d+\.\d+\.)/.exec(title)?.[1] ?? "";
      return `${hashes} ${number}`.trim();
    });
  return {
    headings,
    refs: [...src.matchAll(/\[\^(\d+)\](?!:)/g)].map((m) => m[1]).join(","),
    defs: lines.filter((l) => /^\[\^\d+\]:/.test(l)).map((l) => /^\[\^(\d+)\]/.exec(l)[1]).join(","),
    quoteLines: lines.filter((l) => l.startsWith(">")).length,
    pullQuoteLines: lines.filter((l) => l.startsWith(">>")).length,
    figures: lines.filter((l) => l.startsWith("![")).map((l) => /\]\(([^)]+)\)/.exec(l)?.[1] ?? "?").join(","),
    listItems: lines.filter((l) => /^([-*]|\d+\.)\s+(?!\d)/.test(l) && !/^#/.test(l)).length,
    tableRows: lines.filter((l) => l.startsWith("|")).length,
    paragraphs: lines.filter((l) => l && !/^(#|>|\||!\[|[-*]\s|\d+\.\s|\[\^\d+\]:|---$)/.test(l)).length,
  };
}

function check(locale, source) {
  const file = path.join(DIR, `${locale}.md`);
  if (!fs.existsSync(file)) return [`${locale}.md does not exist`];
  const target = outline(fs.readFileSync(file, "utf8"));
  const problems = [];

  const len = Math.max(source.headings.length, target.headings.length);
  for (let i = 0; i < len; i++) {
    if (source.headings[i] !== target.headings[i]) {
      problems.push(`heading #${i + 1}: expected "${source.headings[i] ?? "(none)"}", found "${target.headings[i] ?? "(none)"}"`);
      break;
    }
  }
  for (const key of ["refs", "defs"]) {
    if (source[key] !== target[key]) problems.push(`footnote ${key} differ from sk.md`);
  }
  if (source.figures !== target.figures) problems.push(`figures differ: sk.md has [${source.figures}], ${locale}.md has [${target.figures}]`);
  for (const key of ["quoteLines", "pullQuoteLines", "listItems", "tableRows"]) {
    if (source[key] !== target[key]) problems.push(`${key}: sk.md has ${source[key]}, ${locale}.md has ${target[key]}`);
  }
  const ratio = target.paragraphs / source.paragraphs;
  if (ratio < 0.95 || ratio > 1.05) {
    problems.push(`paragraphs: sk.md has ${source.paragraphs}, ${locale}.md has ${target.paragraphs} — was something skipped or split?`);
  }
  return problems;
}

const source = outline(fs.readFileSync(path.join(DIR, "sk.md"), "utf8"));
const requested = process.argv.slice(2);
const locales = requested.length
  ? requested
  : fs.readdirSync(DIR).filter((f) => /^[a-z]{2}\.md$/.test(f) && f !== "sk.md").map((f) => f.slice(0, 2));

let failed = false;
for (const locale of locales) {
  const problems = check(locale, source);
  if (problems.length) {
    failed = true;
    console.log(`✗ ${locale}\n  - ${problems.join("\n  - ")}`);
  } else {
    console.log(`✓ ${locale}: structure matches sk.md`);
  }
}
process.exit(failed ? 1 : 0);
