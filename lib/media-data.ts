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
  },
  {
    id: "int-1",
    tag: "INTERVIEW",
    videoId: INTERVIEW_1_ID,
    duration: "48 min",
    badgeVariant: "audio",
    hasGuest: true,
  },
  {
    id: "int-2",
    tag: "INTERVIEW",
    videoId: INTERVIEW_2_ID,
    duration: "35 min",
    badgeVariant: "audio",
    hasGuest: true,
  },
  {
    id: "testimony-laco",
    tag: "TESTIMONY",
    videoId: TESTIMONY_LACO_ID,
    duration: "12 min",
    badgeVariant: "audio",
    hasGuest: true,
  },
  {
    id: "pres-usa",
    tag: "PRESENTATION",
    videoId: PRESENTATION_USA_ID,
    duration: "",
    badgeVariant: "audio",
    hasGuest: false,
    englishOnly: true,
  },
];

export function isMediaItemVisible(item: MediaItem, locale: Locale) {
  if (item.englishOnly && locale !== "en") return false;
  return true;
}
