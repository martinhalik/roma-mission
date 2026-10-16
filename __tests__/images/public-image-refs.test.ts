import { describe, expect, it } from "vitest";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative } from "node:path";

const ROOT = process.cwd();
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css"]);
const SKIP_DIRECTORIES = new Set([
  "node_modules",
  ".next",
  "dist",
  "coverage",
  ".git",
]);

// A local path only counts when it starts immediately after a quote,
// an opening parenthesis, or a backtick. That skips full URLs such as
// https://cdn.example.com/images/hero.jpg, where the character before
// /images/ is part of the host.
const IMAGE_LITERAL =
  /(?<=["'(`])\/images\/[A-Za-z0-9_./-]+\.(?:jpe?g|png|webp|gif|svg|avif|mp4)/g;

function collectSourceFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (SKIP_DIRECTORIES.has(entry)) continue;
    const full = join(dir, entry);
    const info = statSync(full);
    if (info.isDirectory()) {
      collectSourceFiles(full, out);
      continue;
    }
    if (SOURCE_EXTENSIONS.has(extname(entry))) out.push(full);
  }
  return out;
}

function imageLiterals(source: string): string[] {
  return source.match(IMAGE_LITERAL) ?? [];
}

describe("public image references", () => {
  const files = collectSourceFiles(ROOT);
  const refs = files.flatMap((file) =>
    imageLiterals(readFileSync(file, "utf8")).map((url) => ({
      url,
      file: relative(ROOT, file),
    })),
  );

  it("finds image literals to check", () => {
    expect(refs.length).toBeGreaterThan(0);
  });

  it("ignores /images/ inside a full external URL", () => {
    const remote =
      'see https://cdn.example.com/images/missing-hero.jpg for context';
    expect(imageLiterals(remote)).toEqual([]);
    expect(imageLiterals('"/images/our-approach.jpg"')).toEqual([
      "/images/our-approach.jpg",
    ]);
    expect(imageLiterals("'/images/our-approach.jpg'")).toEqual([
      "/images/our-approach.jpg",
    ]);
    expect(imageLiterals("`/images/our-approach.jpg`")).toEqual([
      "/images/our-approach.jpg",
    ]);
    expect(imageLiterals("url(/images/our-approach.jpg)")).toEqual([
      "/images/our-approach.jpg",
    ]);
  });

  it("every /images/... literal exists under public/", () => {
    const missing = refs.filter(
      ({ url }) => !existsSync(join(ROOT, "public", url.slice(1))),
    );
    expect(missing).toEqual([]);
  });
});
