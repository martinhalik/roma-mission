import type { TelegramPost } from "./telegram";
import type { InstagramPost } from "./instagram";

export type SocialPost =
  | {
      source: "telegram";
      id: string;
      url: string;
      datetime: string;
      text: string;
      imageUrl?: string;
      isVideo: boolean;
      views?: string;
      extraMediaCount: number;
    }
  | {
      source: "instagram";
      id: string;
      url: string;
      datetime: string;
      text: string;
      imageUrl: string;
      isVideo: boolean;
      likes?: number;
      comments?: number;
    };

export function telegramToSocial(p: TelegramPost): SocialPost {
  const primary = p.media[0];
  const imageUrl =
    primary?.kind === "photo" ? primary.url : primary?.kind === "video" ? primary.poster : undefined;
  return {
    source: "telegram",
    id: `tg-${p.id}`,
    url: p.url,
    datetime: p.datetime,
    text: p.text,
    imageUrl,
    isVideo: primary?.kind === "video",
    views: p.views,
    extraMediaCount: Math.max(0, p.media.length - 1),
  };
}

export function instagramToSocial(p: InstagramPost): SocialPost {
  return {
    source: "instagram",
    id: `ig-${p.id}`,
    url: p.url,
    datetime: p.datetime,
    text: p.text,
    imageUrl: p.imageUrl,
    isVideo: p.isVideo,
    likes: p.likes,
    comments: p.comments,
  };
}

export function mergeSocialPosts(
  telegram: TelegramPost[],
  instagram: InstagramPost[]
): SocialPost[] {
  const unified: SocialPost[] = [
    ...telegram.map(telegramToSocial),
    ...instagram.map(instagramToSocial),
  ];
  // Newest first; posts without datetime sink to the bottom.
  return unified.sort((a, b) => {
    const ta = a.datetime ? Date.parse(a.datetime) : 0;
    const tb = b.datetime ? Date.parse(b.datetime) : 0;
    return tb - ta;
  });
}
