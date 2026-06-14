import type { Locale } from "@/lib/i18n/locales";

/**
 * Downloadable / printable materials offered for the work of the mission —
 * liturgical translations, Scripture, the founder's book, and teaching
 * resources. Mirrors the data-driven shape of `media-data.ts`: a typed array of
 * items here, presentation in `ResourcesPage`, copy in the dictionaries.
 *
 * Files live in `/public/materials`. A download's `url` is left undefined until
 * the file is added — the page then shows a "coming soon" state instead of a
 * broken link, so an item can be published the moment its file lands.
 */

export type ResourceCategory = "liturgy" | "scripture" | "book" | "teaching";

export type ResourceFormat = "PDF" | "EPUB" | "DOCX" | "ZIP";

export interface ResourceDownload {
  /** Language of this particular file. */
  locale: Locale;
  format: ResourceFormat;
  /**
   * Public path under `/materials` (e.g. `/materials/divine-liturgy-sk.pdf`) or
   * an absolute URL. Leave undefined until the file exists.
   */
  url?: string;
  /** Optional human-readable size, e.g. "1.8 MB". */
  size?: string;
}

export interface ResourceItem {
  id: string;
  category: ResourceCategory;
  downloads: ResourceDownload[];
  /**
   * Dictionary key for a free-text language label, used when the work is not in
   * one of our UI locales (e.g. Romani). When set, it is shown instead of the
   * flag badges derived from `downloads`.
   */
  languageLabelKey?: string;
  /** External info/source link — for third-party works we point to, not host. */
  externalUrl?: string;
  /** Someone else's translation — renders attribution rather than downloads. */
  thirdParty?: boolean;
  /** Intended for printing — shows the print-and-share hint. */
  printable?: boolean;
}

/** Display order of the category sections on the page. */
export const RESOURCE_CATEGORY_ORDER: readonly ResourceCategory[] = [
  "liturgy",
  "scripture",
  "book",
  "teaching",
] as const;

export const RESOURCE_ITEMS: ResourceItem[] = [
  {
    id: "divine-liturgy",
    category: "liturgy",
    printable: true,
    downloads: [
      { locale: "sk", format: "PDF" },
      { locale: "ro", format: "PDF" },
      { locale: "sr", format: "PDF" },
    ],
  },
  {
    id: "gospel-mark-romani",
    category: "scripture",
    thirdParty: true,
    languageLabelKey: "resources.ui.langRomani",
    externalUrl: "https://en.wikipedia.org/wiki/Bible_translations_into_Romani",
    downloads: [],
  },
  {
    id: "founder-book",
    category: "book",
    printable: true,
    downloads: [
      { locale: "sk", format: "EPUB" },
      { locale: "sk", format: "PDF" },
      { locale: "en", format: "EPUB" },
      { locale: "en", format: "PDF" },
    ],
  },
  {
    id: "catechesis-worksheets",
    category: "teaching",
    printable: true,
    downloads: [{ locale: "sk", format: "PDF" }],
  },
  {
    id: "childrens-bible",
    category: "teaching",
    printable: true,
    downloads: [{ locale: "sk", format: "PDF" }],
  },
];

/** Items belonging to a category, in declared order. */
export function resourcesByCategory(category: ResourceCategory): ResourceItem[] {
  return RESOURCE_ITEMS.filter((item) => item.category === category);
}

/** Unique download locales for an item, preserving first-seen order. */
export function downloadLocales(item: ResourceItem): Locale[] {
  const seen: Locale[] = [];
  for (const d of item.downloads) {
    if (!seen.includes(d.locale)) seen.push(d.locale);
  }
  return seen;
}

/** Downloads offered for a given locale within an item, in declared order. */
export function downloadsForLocale(
  item: ResourceItem,
  locale: Locale,
): ResourceDownload[] {
  return item.downloads.filter((d) => d.locale === locale);
}
