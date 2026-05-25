import type { Locale } from "@/lib/i18n/locales";

export type BadgeVariant = "audio" | "sub";

export interface MediaItem {
  id: string;
  tag: "DOCUMENTARY" | "INTERVIEW" | "TESTIMONY" | "PRESENTATION";
  videoId: string;
  /** Display duration — not translated (number + locale-stable unit) */
  duration: string;
  /** Visual variant of the language badge attached to the item */
  badgeVariant: BadgeVariant;
  /** Whether this item has a `guest` field in the dictionary */
  hasGuest: boolean;
  /** Locales whose speakers can follow the content (audio or subtitles). */
  languages: Locale[];
  /** When true, the item is only rendered on the English locale */
  englishOnly?: boolean;
}

export const DOCUMENTARY_VIDEO_ID = "K-IDNefOa98";
export const INTERVIEW_1_ID = "A3-IfJL_vt4";
export const INTERVIEW_2_ID = "7tdFd08wUis";
export const TESTIMONY_LACO_ID = "PNhKEQtCrVo";
export const PRESENTATION_USA_ID = "LcUcxm6k7xo";

export function ytThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export const MEDIA_ITEMS: MediaItem[] = [
  {
    id: "documentary",
    tag: "DOCUMENTARY",
    videoId: DOCUMENTARY_VIDEO_ID,
    duration: "30 min",
    badgeVariant: "sub",
    hasGuest: false,
    languages: ["cs", "sk", "en", "ro", "de", "sr", "ru", "mk", "el"],
  },
  {
    id: "int-1",
    tag: "INTERVIEW",
    videoId: INTERVIEW_1_ID,
    duration: "48 min",
    badgeVariant: "audio",
    hasGuest: true,
    languages: ["sk", "cs"],
  },
  {
    id: "int-2",
    tag: "INTERVIEW",
    videoId: INTERVIEW_2_ID,
    duration: "35 min",
    badgeVariant: "audio",
    hasGuest: true,
    languages: ["sk", "cs"],
  },
  {
    id: "testimony-laco",
    tag: "TESTIMONY",
    videoId: TESTIMONY_LACO_ID,
    duration: "12 min",
    badgeVariant: "audio",
    hasGuest: true,
    languages: ["en"],
  },
  {
    id: "pres-usa",
    tag: "PRESENTATION",
    videoId: PRESENTATION_USA_ID,
    duration: "",
    badgeVariant: "audio",
    hasGuest: false,
    languages: ["en"],
    englishOnly: true,
  },
];

export function isMediaItemVisible(item: MediaItem, locale: Locale) {
  if (item.englishOnly && locale !== "en") return false;
  return true;
}

export interface MediaLanguageFilter {
  id: string;
  /** Locale codes considered a match — null means "all" */
  langs: Locale[] | null;
  flag: string;
  /** Dictionary key under `media.filters` */
  labelKey: string;
}

export const MEDIA_LANGUAGE_FILTERS: MediaLanguageFilter[] = [
  { id: "all", langs: null, flag: "", labelKey: "media.filters.all" },
  { id: "en", langs: ["en"], flag: "🇬🇧", labelKey: "media.filters.en" },
  { id: "sk-cs", langs: ["sk", "cs"], flag: "🇸🇰🇨🇿", labelKey: "media.filters.skCs" },
  { id: "ro", langs: ["ro"], flag: "🇷🇴", labelKey: "media.filters.ro" },
  { id: "de", langs: ["de"], flag: "🇩🇪", labelKey: "media.filters.de" },
  { id: "sr", langs: ["sr"], flag: "🇷🇸", labelKey: "media.filters.sr" },
  { id: "ru", langs: ["ru"], flag: "🇷🇺", labelKey: "media.filters.ru" },
  { id: "mk", langs: ["mk"], flag: "🇲🇰", labelKey: "media.filters.mk" },
  { id: "el", langs: ["el"], flag: "🇬🇷", labelKey: "media.filters.el" },
];

export function matchesFilter(item: MediaItem, filter: MediaLanguageFilter) {
  if (filter.langs === null) return true;
  return item.languages.some((l) => filter.langs!.includes(l));
}

/**
 * Picks featured media for the home page. The documentary is pinned first
 * (it's the flagship piece), then items whose languages include the current
 * locale, then the remaining items in their declared order. Testimonies are
 * excluded — they have a dedicated section on the home page.
 */
export function getFeaturedMedia(locale: Locale, count = 3): MediaItem[] {
  const candidates = MEDIA_ITEMS.filter(
    (item) => item.tag !== "TESTIMONY" && isMediaItemVisible(item, locale),
  );
  return candidates
    .map((item, idx) => ({ item, idx }))
    .sort((a, b) => {
      if (a.item.tag === "DOCUMENTARY" && b.item.tag !== "DOCUMENTARY") return -1;
      if (b.item.tag === "DOCUMENTARY" && a.item.tag !== "DOCUMENTARY") return 1;
      const aMatch = a.item.languages.includes(locale) ? 0 : 1;
      const bMatch = b.item.languages.includes(locale) ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return a.idx - b.idx;
    })
    .slice(0, count)
    .map(({ item }) => item);
}
