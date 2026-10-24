"use client";

import { useEffect, useState } from "react";
import { ArrowRight, ChevronDown, Download } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { LOCALES } from "@/lib/i18n";
import { formatDecimal } from "@/lib/i18n/format";

/**
 * The Children's Bible downloads, listed from manifest.json on the public file
 * store. The lessons' build tools rewrite that file whenever a PDF is rebuilt or
 * a translation is finished, so new files appear here without a site release.
 */
const MANIFEST_URL =
  "https://kp65dxq6zoqzaiwk.public.blob.vercel-storage.com/manifest.json";

/** The language the book is written in; every other language falls back to it. */
const SOURCE_LANGUAGE = "sk";

const NAMED_EDITIONS = ["jezis", "isus"] as const;
type NamedEdition = (typeof NAMED_EDITIONS)[number];

interface ManifestFile {
  url: string;
  mb: number;
}

interface ManifestStory {
  title: string;
  story?: ManifestFile;
  sheet?: ManifestFile;
}

interface ManifestBooklet {
  booklet?: ManifestFile;
  cover?: ManifestFile;
}

interface ManifestEdition {
  bible?: ManifestFile;
  worksheets?: ManifestFile;
  stories: Record<string, ManifestStory>;
  booklets: Record<string, ManifestBooklet>;
}

/** language code -> edition key (`jezis`, `isus`, `one`) -> files */
type ManifestLanguages = Record<string, Record<string, ManifestEdition>>;

type LoadState =
  | { status: "loading" }
  | { status: "error" }
  | { status: "ready"; languages: ManifestLanguages };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** The manifest is outside data: only https links with a numeric size get through. */
function toFile(value: unknown): ManifestFile | undefined {
  if (!isRecord(value)) return undefined;
  const { url, mb } = value;
  if (typeof url !== "string" || !url.startsWith("https://")) return undefined;
  if (typeof mb !== "number" || !Number.isFinite(mb)) return undefined;
  return { url, mb };
}

function toEdition(value: unknown): ManifestEdition {
  const raw = isRecord(value) ? value : {};
  const stories: Record<string, ManifestStory> = {};
  for (const [n, s] of Object.entries(isRecord(raw.stories) ? raw.stories : {})) {
    if (!isRecord(s)) continue;
    stories[n] = {
      title: typeof s.title === "string" ? s.title : "",
      story: toFile(s.story),
      sheet: toFile(s.sheet),
    };
  }
  const booklets: Record<string, ManifestBooklet> = {};
  for (const [range, b] of Object.entries(isRecord(raw.booklets) ? raw.booklets : {})) {
    if (!isRecord(b)) continue;
    booklets[range] = { booklet: toFile(b.booklet), cover: toFile(b.cover) };
  }
  return {
    bible: toFile(raw.bible),
    worksheets: toFile(raw.worksheets),
    stories,
    booklets,
  };
}

function parseManifest(value: unknown): ManifestLanguages | null {
  if (!isRecord(value) || !isRecord(value.languages)) return null;
  const languages: ManifestLanguages = {};
  for (const [code, editions] of Object.entries(value.languages)) {
    if (!isRecord(editions)) continue;
    const parsed: Record<string, ManifestEdition> = {};
    for (const [key, edition] of Object.entries(editions)) {
      parsed[key] = toEdition(edition);
    }
    if (Object.keys(parsed).length > 0) languages[code] = parsed;
  }
  return Object.keys(languages).length > 0 ? languages : null;
}

/** The page's own language first, then Slovak, then the rest in site order. */
function orderLanguages(codes: string[], pageLocale: string): string[] {
  const rank = (code: string) => {
    if (code === pageLocale) return -2;
    if (code === SOURCE_LANGUAGE) return -1;
    const index = LOCALES.findIndex((l) => l.code === code);
    return index === -1 ? LOCALES.length : index;
  };
  return [...codes].sort((a, b) => rank(a) - rank(b));
}

function languageName(code: string): string {
  return LOCALES.find((l) => l.code === code)?.label ?? code.toUpperCase();
}

function isNamedEdition(key: string): key is NamedEdition {
  return (NAMED_EDITIONS as readonly string[]).includes(key);
}

/** "01-10" -> { from: "1", to: "10" } */
function parseRange(range: string): { from: string; to: string } {
  const parts = range.split("-").map((part) => {
    const n = Number.parseInt(part, 10);
    return Number.isNaN(n) ? part : String(n);
  });
  return { from: parts[0] ?? range, to: parts[1] ?? parts[0] ?? range };
}

interface ChoiceGroupProps {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (value: string) => void;
}

function ChoiceGroup({ id, label, options, selected, onSelect }: ChoiceGroupProps) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <p
        id={id}
        className="text-[11px] font-semibold tracking-[1.5px] text-[var(--text-secondary)] uppercase sm:w-24 sm:shrink-0"
      >
        {label}
      </p>
      <div role="group" aria-labelledby={id} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const isSelected = option.value === selected;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onSelect(option.value)}
              className={`min-h-[44px] rounded-full border px-5 text-[14px] font-medium transition-colors ${
                isSelected
                  ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--on-accent)]"
                  : "border-[var(--border-strong)] text-[var(--text-secondary)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

interface FileCardProps {
  file: ManifestFile;
  title: string;
  meta: string;
}

function FileCard({ file, title, meta }: FileCardProps) {
  const { t, locale } = useTranslation();
  const size = t("childrensBible.downloads.size", {
    size: formatDecimal(file.mb, locale),
  });
  return (
    <li>
      <a
        href={file.url}
        download
        className="group flex h-full min-h-[44px] items-center gap-4 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-4 transition-colors hover:border-[var(--gold)]"
      >
        <Download className="size-5 shrink-0 text-[var(--gold)]" aria-hidden="true" />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] font-medium text-[var(--text-primary)]">
            {title}
          </span>
          <span className="block text-[13px] text-[var(--text-secondary)]">
            {meta} · {size}
          </span>
        </span>
        <ArrowRight
          className="size-4 shrink-0 text-[var(--text-secondary)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--gold)]"
          aria-hidden="true"
        />
      </a>
    </li>
  );
}

interface StoryLinkProps {
  file: ManifestFile;
  label: string;
  title: string;
}

function StoryLink({ file, label, title }: StoryLinkProps) {
  const { t, locale } = useTranslation();
  return (
    <a
      href={file.url}
      download
      className="inline-flex min-h-[44px] items-center gap-1.5 text-[14px] text-[var(--gold)] hover:underline"
    >
      <Download className="size-3.5 shrink-0" aria-hidden="true" />
      <span className="sr-only">{title}: </span>
      {label} · {t("childrensBible.downloads.size", { size: formatDecimal(file.mb, locale) })}
    </a>
  );
}

interface EditionFilesProps {
  edition: ManifestEdition;
  language: string;
  /** The Slovak edition whose titles stand in for untranslated ones. */
  fallback: ManifestEdition | undefined;
}

function EditionFiles({ edition, language, fallback }: EditionFilesProps) {
  const { t } = useTranslation();
  const numbers = Object.keys(edition.stories).sort((a, b) => Number(a) - Number(b));
  const ranges = Object.keys(edition.booklets).sort();

  return (
    <>
      {(edition.bible || edition.worksheets) && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {edition.bible && (
            <FileCard
              file={edition.bible}
              title={t("childrensBible.downloads.bibleTitle")}
              meta={t("childrensBible.downloads.bibleMeta")}
            />
          )}
          {edition.worksheets && (
            <FileCard
              file={edition.worksheets}
              title={t("childrensBible.downloads.worksheetsTitle")}
              meta={t("childrensBible.downloads.worksheetsMeta")}
            />
          )}
        </ul>
      )}

      {numbers.length > 0 && (
        <details className="group mt-6 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
          <summary className="flex min-h-[44px] items-center justify-between gap-3 px-5 py-3 text-[14px] font-medium text-[var(--text-primary)] [&::-webkit-details-marker]:hidden">
            {t("childrensBible.downloads.storiesToggle", { count: numbers.length })}
            <ChevronDown
              className="size-4 shrink-0 text-[var(--gold)] transition-transform group-open:rotate-180"
              aria-hidden="true"
            />
          </summary>
          <ol className="border-t border-[var(--border-default)] px-5">
            {numbers.map((n) => {
              const story = edition.stories[n];
              const ownTitle = story.title.trim();
              const title = ownTitle || fallback?.stories[n]?.title || "";
              const titleLanguage = ownTitle ? language : SOURCE_LANGUAGE;
              return (
                <li
                  key={n}
                  className="flex flex-wrap items-center gap-x-3 border-b border-[var(--border-default)] py-2 last:border-0"
                >
                  <span className="w-8 shrink-0 font-georgia text-[16px] text-[var(--gold)] tabular-nums">
                    {n}.
                  </span>
                  <span
                    lang={titleLanguage}
                    className="min-w-0 flex-1 text-[15px] text-[var(--text-primary)]"
                  >
                    {title}
                  </span>
                  <span className="flex basis-full flex-wrap gap-x-5 pl-11 sm:basis-auto sm:pl-0">
                    {story.story && (
                      <StoryLink
                        file={story.story}
                        label={t("childrensBible.downloads.story")}
                        title={title}
                      />
                    )}
                    {story.sheet && (
                      <StoryLink
                        file={story.sheet}
                        label={t("childrensBible.downloads.sheet")}
                        title={title}
                      />
                    )}
                  </span>
                </li>
              );
            })}
          </ol>
        </details>
      )}

      <h3 className="mt-10 mb-4 text-[17px] font-medium text-[var(--text-primary)]">
        {t("childrensBible.downloads.bookletsTitle")}
      </h3>
      {ranges.length > 0 ? (
        <ul className="grid gap-3 sm:grid-cols-2">
          {ranges.flatMap((range) => {
            const { booklet, cover } = edition.booklets[range];
            const vars = parseRange(range);
            return [
              booklet && (
                <FileCard
                  key={`${range}-booklet`}
                  file={booklet}
                  title={t("childrensBible.downloads.bookletStories", vars)}
                  meta={t("childrensBible.downloads.bookletMeta")}
                />
              ),
              cover && (
                <FileCard
                  key={`${range}-cover`}
                  file={cover}
                  title={t("childrensBible.downloads.bookletCover", vars)}
                  meta={t("childrensBible.downloads.coverMeta")}
                />
              ),
            ];
          })}
        </ul>
      ) : (
        <p className="text-[15px] text-[var(--text-secondary)]">
          {t("childrensBible.downloads.noBooklets")}
        </p>
      )}
    </>
  );
}

export default function ChildrensBibleDownloads() {
  const { t, locale } = useTranslation();
  const [state, setState] = useState<LoadState>({ status: "loading" });
  const [pickedLanguage, setPickedLanguage] = useState<string | null>(null);
  const [pickedEdition, setPickedEdition] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch(MANIFEST_URL, { cache: "no-cache", signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`manifest.json: HTTP ${response.status}`);
        return response.json();
      })
      .then((json: unknown) => {
        const languages = parseManifest(json);
        if (!languages) throw new Error("manifest.json: no languages");
        setState({ status: "ready", languages });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) return;
        console.warn("Children's Bible downloads unavailable", error);
        setState({ status: "error" });
      });
    return () => controller.abort();
  }, []);

  if (state.status !== "ready") {
    return (
      <p
        role="status"
        className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-5 py-4 text-[15px] text-[var(--text-secondary)]"
      >
        {state.status === "loading"
          ? t("childrensBible.downloads.loading")
          : t("childrensBible.downloads.error")}
      </p>
    );
  }

  const { languages } = state;
  const codes = orderLanguages(Object.keys(languages), locale);
  const language =
    pickedLanguage && languages[pickedLanguage] ? pickedLanguage : codes[0];
  const editionKeys = Object.keys(languages[language]);
  const editionKey =
    pickedEdition && editionKeys.includes(pickedEdition) ? pickedEdition : editionKeys[0];
  const sourceEditions = languages[SOURCE_LANGUAGE];
  const fallback = sourceEditions
    ? (sourceEditions[editionKey] ?? Object.values(sourceEditions)[0])
    : undefined;

  function handleLanguage(code: string) {
    setPickedLanguage(code);
    setPickedEdition(null);
  }

  return (
    <div className="space-y-6">
      {!languages[locale] && (
        <p className="rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)] px-5 py-4 text-[15px] leading-relaxed text-[var(--text-secondary)]">
          {t("childrensBible.downloads.preparing")}
        </p>
      )}

      {codes.length > 1 && (
        <ChoiceGroup
          id="childrens-bible-language"
          label={t("childrensBible.downloads.languageGroup")}
          options={codes.map((code) => ({ value: code, label: languageName(code) }))}
          selected={language}
          onSelect={handleLanguage}
        />
      )}

      {editionKeys.length > 1 && (
        <ChoiceGroup
          id="childrens-bible-edition"
          label={t("childrensBible.downloads.editionGroup")}
          options={editionKeys.map((key) => ({
            value: key,
            label: isNamedEdition(key) ? t(`childrensBible.downloads.editions.${key}`) : key,
          }))}
          selected={editionKey}
          onSelect={setPickedEdition}
        />
      )}

      {isNamedEdition(editionKey) && (
        <p className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
          {t(`childrensBible.downloads.editionNotes.${editionKey}`)}
        </p>
      )}

      <div>
        <EditionFiles
          edition={languages[language][editionKey]}
          language={language}
          fallback={fallback}
        />
      </div>
    </div>
  );
}
