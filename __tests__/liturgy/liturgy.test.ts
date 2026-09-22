import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { LITURGY, downloadSize, hasDownload } from "@/lib/liturgy/content";
import { FAQS, liturgyJsonLd } from "@/lib/liturgy/seo";
import { COGNATES, SCRIPTURE } from "@/lib/liturgy/language";
import { LOCALES } from "@/lib/i18n";
import { ROUTE_KEYS, ROUTE_SLUGS, buildPath, resolveRoute } from "@/lib/i18n/routes";
import downloads from "@/content/liturgy/downloads.json";

describe("liturgy routes", () => {
  it("resolves the two-segment text route in every locale", () => {
    for (const { code } of LOCALES) {
      const slug = ROUTE_SLUGS[code].liturgyText;
      expect(slug, `${code} has a liturgyText slug`).toBeTruthy();
      expect(slug.split("/"), `${code} slug is two segments`).toHaveLength(2);
      // The [sub] route joins the segments back together before resolving.
      expect(resolveRoute(code, slug)).toBe("liturgyText");
    }
  });

  it("builds the text path under the liturgy path, not beside it", () => {
    // Regression: the CTA once used a relative href, which resolved against
    // /en/liturgy to /en/text and 404'd.
    for (const { code } of LOCALES) {
      const parent = buildPath(code, "liturgy");
      const text = buildPath(code, "liturgyText");
      expect(text.startsWith(`${parent}/`)).toBe(true);
    }
  });

  it("gives every locale a distinct slug for every route", () => {
    for (const { code } of LOCALES) {
      const slugs = ROUTE_KEYS.map((k) => ROUTE_SLUGS[code][k]).filter(Boolean);
      expect(new Set(slugs).size, `${code} has no duplicate slugs`).toBe(slugs.length);
    }
  });
});

describe("liturgy downloads", () => {
  it("lists only files that are actually in public/", () => {
    for (const file of downloads.files) {
      const onDisk = join(process.cwd(), "public", file.href);
      expect(existsSync(onDisk), `${file.href} exists`).toBe(true);
    }
  });

  it("reports availability and size from the manifest", () => {
    const pdf = "/downloads/liturgy/spevnik-v1.1-a5.pdf";
    expect(hasDownload(pdf)).toBe(true);
    expect(downloadSize(pdf)).toMatch(/^\d+(\.\d)? [KM]B$/);
  });

  it("does not claim the thesis until someone supplies it", () => {
    const thesis = "/downloads/liturgy/rigorozna-praca-2024.pdf";
    // When the PDF lands, `npm run book` puts it in the manifest and this
    // flips — at which point the page shows a download instead of a citation.
    expect(hasDownload(thesis)).toBe(existsSync(join(process.cwd(), "public", thesis)));
  });
});

describe("liturgy content", () => {
  it("has the sections, utterances and footnotes the meta claims", () => {
    const utterances = LITURGY.sections.flatMap((s) =>
      s.blocks.filter((b) => b.kind === "utterance")
    );
    expect(LITURGY.sections).toHaveLength(LITURGY.meta.counts.sections);
    expect(utterances).toHaveLength(LITURGY.meta.counts.utterances);
    expect(LITURGY.footnotes).toHaveLength(LITURGY.meta.counts.footnotes);
  });

  it("references no footnote that does not exist", () => {
    const defined = new Set(LITURGY.footnotes.map((f) => f.n));
    for (const section of LITURGY.sections) {
      for (const block of section.blocks) {
        if (block.kind !== "utterance") continue;
        for (const n of [...(block.sk?.notes ?? []), ...(block.rom?.notes ?? [])]) {
          expect(defined.has(n), `footnote ${n} is defined`).toBe(true);
        }
      }
    }
  });

  it("gives every section a unique anchor", () => {
    const slugs = LITURGY.sections.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("keeps Romani diacritics intact", () => {
    const text = LITURGY.sections
      .flatMap((s) => s.blocks)
      .flatMap((b) => (b.kind === "utterance" ? [b.rom?.text ?? ""] : []))
      .join("");
    for (const ch of "ďťľňšččžáéíóúôä") {
      expect(text.includes(ch), `${ch} survives conversion`).toBe(true);
    }
  });

  it("leaves the Romani title null rather than inventing one", () => {
    // The source document has only a Slovak H1. If this ever becomes a string
    // it should be because the translator supplied it.
    expect(LITURGY.meta.title.rom).toBeNull();
    expect(LITURGY.meta.title.sk).toBeTruthy();
  });
});

describe("liturgy language notes", () => {
  it("only cites cognates that really occur in the text", () => {
    const romani = LITURGY.sections
      .flatMap((s) => s.blocks)
      .flatMap((b) => (b.kind === "utterance" && b.rom ? [b.rom.text] : []))
      .join(" ")
      .toLowerCase();
    for (const c of COGNATES) {
      expect(romani.includes(c.romani.toLowerCase()), `${c.romani} is in the text`).toBe(
        true
      );
    }
  });

  it("marks exactly one Scripture entry as ours", () => {
    expect(SCRIPTURE.filter((s) => s.ours)).toHaveLength(1);
  });
});

describe("structured data", () => {
  const graph = liturgyJsonLd("en", "Liturgy in Romani", "…")["@graph"];
  const byType = (t: string) =>
    graph.find((n) => {
      const type = (n as { "@type": string | string[] })["@type"];
      return Array.isArray(type) ? type.includes(t) : type === t;
    });

  it("names the author, consultant and publisher on the work", () => {
    const work = byType("Book") as Record<string, unknown>;
    expect(work).toBeDefined();
    expect((work.author as { name: string }).name).toBe("Martin Halík");
    expect((work.contributor as { name: string }).name).toBe("Ján Hero");
    expect(work.version).toBe(LITURGY.meta.version);
    expect(work.inLanguage).toContain("rmc");
  });

  it("links the work to the thesis it rests on", () => {
    const work = byType("Book") as Record<string, unknown>;
    const thesis = byType("Thesis") as Record<string, unknown>;
    expect((work.isBasedOn as { "@id": string })["@id"]).toBe(thesis["@id"]);
  });

  it("publishes every FAQ as a Question", () => {
    const faq = byType("FAQPage") as { mainEntity: unknown[] };
    expect(faq.mainEntity).toHaveLength(FAQS.length);
  });
});
