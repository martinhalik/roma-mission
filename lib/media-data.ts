export type BadgeVariant = "audio" | "sub";

export interface MediaBadge {
  label: string;
  variant: BadgeVariant;
}

export interface MediaItem {
  id: string;
  tag: "DOCUMENTARY" | "INTERVIEW";
  videoId: string;
  title: string;
  /** Short description — used on homepage media grid */
  shortDesc: string;
  /** Full description — used on media page */
  fullDesc: string;
  badges: MediaBadge[];
  duration: string;
  source: string;
  guest?: string;
}

export const DOCUMENTARY_VIDEO_ID = "K-IDNefOa98";
export const INTERVIEW_1_ID = "A3-IfJL_vt4";
export const INTERVIEW_2_ID = "7tdFd08wUis";

export function ytThumb(id: string) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

export const MEDIA_ITEMS: MediaItem[] = [
  {
    id: "documentary",
    tag: "DOCUMENTARY",
    videoId: DOCUMENTARY_VIDEO_ID,
    title: "From IT to Priesthood",
    shortDesc:
      "Official Czech Television production. The director's journey from IT career to Orthodox priesthood among Roma communities in Slovakia.",
    fullDesc:
      "An official Czech Television documentary. The film follows the director of Christian Roma Mission on his personal journey from a career in IT to Orthodox priesthood in Roma communities across Slovakia — alongside his wife and children. It offers an honest look at daily parish life, family ministry on the mission field, and the long-term sacrifice behind a calling to communities shaped by poverty, exclusion, and deep spiritual need.",
    badges: [{ label: "Working on EN Subtitles", variant: "sub" }],
    duration: "30 min",
    source: "Czech Television",
  },
  {
    id: "int-1",
    tag: "INTERVIEW",
    videoId: INTERVIEW_1_ID,
    title: "Why the Roma? Why Now?",
    shortDesc:
      "A Slovak-language interview on the origins of the mission and why Orthodox Church planting among Roma matters.",
    fullDesc:
      "Boys from the slums — learning to bow their heads, lift their voices, and call on the living God. This conversation goes inside the daily rhythm of Roma mission: how they pray, how they worship, and what it looks like when the Gospel takes root where no one expected it.",
    badges: [{ label: "Slovak Audio", variant: "audio" }],
    duration: "48 min",
    source: "Orthodox Faculty Dean Podcast",
    guest: "Fr. Nikolaj Petrov",
  },
  {
    id: "int-2",
    tag: "INTERVIEW",
    videoId: INTERVIEW_2_ID,
    title: "Long-Term Presence Over Programs",
    shortDesc:
      "Why short-term mission models fail, and what a generational commitment to a community looks like.",
    fullDesc:
      "What does it actually cost to answer a call? This interview traces the first four years of the Klenovec mission — a family uprooting their life and moving to Slovakia, learning to belong to a community that had been forgotten, and discovering what it means to stay.",
    badges: [{ label: "Slovak Audio", variant: "audio" }],
    duration: "35 min",
    source: "Orthodox Faculty Dean Podcast",
    guest: "Miroslava Horváth",
  },
];
