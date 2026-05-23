// Server-side fetcher for the public Telegram channel preview at
// https://t.me/s/<channel>. Telegram exposes a static HTML view that
// requires no auth and no bot token — we parse the posts out of it.
//
// We rely on the structure currently emitted by Telegram (Dec 2025) for the
// `tgme_widget_message_wrap` blocks. If Telegram changes the markup, the
// parser degrades to an empty result and the page falls back to its static
// feed. We never crash the page.

export type TelegramMedia =
  | { kind: "photo"; url: string }
  | { kind: "video"; poster: string; url?: string; durationSeconds?: number };

export interface TelegramPost {
  id: string;
  url: string;
  datetime: string;
  html: string;
  text: string;
  views?: string;
  media: TelegramMedia[];
}

export interface TelegramChannelStats {
  subscribers: string | null;
  photos: string | null;
  videos: string | null;
}

export interface TelegramFeed {
  posts: TelegramPost[];
  stats: TelegramChannelStats;
}

const CHANNEL = "romamissioneu";
const FEED_URL = `https://t.me/s/${CHANNEL}`;

const FETCH_OPTS: RequestInit & { next: { revalidate: number } } = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (compatible; RomaMissionBot/1.0; +https://romamission.eu)",
    "Accept-Language": "en",
  },
  next: { revalidate: 1800 },
};

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+\n/g, "\n")
    .trim();
}

function unescapeUrl(s: string): string {
  return s.replace(/\\\//g, "/").replace(/&amp;/g, "&");
}

function extractMessageBlocks(html: string): string[] {
  const blocks: string[] = [];
  const open = /<div class="tgme_widget_message_wrap[^"]*"[^>]*>/g;
  let m: RegExpExecArray | null;
  while ((m = open.exec(html)) !== null) {
    const start = m.index;
    // Find the matching closing </div> by counting depth from the opening.
    let depth = 0;
    let i = start;
    while (i < html.length) {
      const openTag = html.indexOf("<div", i);
      const closeTag = html.indexOf("</div>", i);
      if (closeTag === -1) break;
      if (openTag !== -1 && openTag < closeTag) {
        depth++;
        i = openTag + 4;
      } else {
        depth--;
        i = closeTag + 6;
        if (depth === 0) {
          blocks.push(html.slice(start, i));
          break;
        }
      }
    }
  }
  return blocks;
}

function parsePost(block: string): TelegramPost | null {
  const postAttr = /data-post="([^"]+)"/.exec(block);
  if (!postAttr) return null;
  const slug = postAttr[1];
  const id = slug.split("/").pop() ?? slug;

  const time = /<time[^>]*datetime="([^"]+)"/.exec(block);
  const datetime = time?.[1] ?? "";

  const textMatch =
    /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>\s*(?:<div class="tgme_widget_message_(?:footer|reply|forwarded)|<a class="tgme_widget_message_views)/i.exec(
      block
    ) ?? /<div class="tgme_widget_message_text[^"]*"[^>]*>([\s\S]*?)<\/div>/i.exec(block);
  const rawHtml = textMatch?.[1] ?? "";
  const text = stripTags(rawHtml);

  const views = /<span class="tgme_widget_message_views">([^<]+)<\/span>/.exec(block)?.[1];

  const media: TelegramMedia[] = [];
  const photoRe = /class="tgme_widget_message_photo_wrap[^"]*"[^>]*style="[^"]*background-image:url\('([^']+)'\)/g;
  let p: RegExpExecArray | null;
  while ((p = photoRe.exec(block)) !== null) {
    media.push({ kind: "photo", url: unescapeUrl(p[1]) });
  }

  const videoRe = /class="tgme_widget_message_video_thumb[^"]*"[^>]*style="[^"]*background-image:url\('([^']+)'\)/g;
  let v: RegExpExecArray | null;
  while ((v = videoRe.exec(block)) !== null) {
    const poster = unescapeUrl(v[1]);
    const after = block.slice(v.index);
    const src = /<video[^>]*src="([^"]+)"/.exec(after)?.[1];
    const dur = /<time class="message_video_duration"[^>]*>([0-9:]+)<\/time>/.exec(after)?.[1];
    media.push({
      kind: "video",
      poster,
      url: src ? unescapeUrl(src) : undefined,
      durationSeconds: dur ? parseDuration(dur) : undefined,
    });
  }

  return {
    id,
    url: `https://t.me/${slug}`,
    datetime,
    html: rawHtml,
    text,
    views,
    media,
  };
}

function parseDuration(s: string): number {
  const parts = s.split(":").map((p) => parseInt(p, 10));
  if (parts.some(Number.isNaN)) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] ?? 0;
}

function parseChannelStats(html: string): TelegramChannelStats {
  const stats: TelegramChannelStats = { subscribers: null, photos: null, videos: null };
  const re = /<div class="tgme_channel_info_counter">\s*<span class="counter_value">([^<]+)<\/span>\s*<span class="counter_type">([^<]+)<\/span>\s*<\/div>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const value = m[1].trim();
    const type = m[2].trim().toLowerCase();
    if (type.startsWith("subscriber") || type.startsWith("member")) stats.subscribers = value;
    else if (type.startsWith("photo")) stats.photos = value;
    else if (type.startsWith("video")) stats.videos = value;
  }
  return stats;
}

export async function fetchTelegramFeed(): Promise<TelegramFeed> {
  try {
    const res = await fetch(FEED_URL, FETCH_OPTS);
    if (!res.ok) return { posts: [], stats: { subscribers: null, photos: null, videos: null } };
    const html = await res.text();
    const blocks = extractMessageBlocks(html);
    const posts = blocks
      .map(parsePost)
      .filter((p): p is TelegramPost => p !== null)
      .reverse();
    const stats = parseChannelStats(html);
    return { posts, stats };
  } catch {
    return { posts: [], stats: { subscribers: null, photos: null, videos: null } };
  }
}

export async function fetchTelegramPosts(): Promise<TelegramPost[]> {
  const feed = await fetchTelegramFeed();
  return feed.posts;
}

export const TELEGRAM_CHANNEL_URL = `https://t.me/${CHANNEL}`;
export const TELEGRAM_CHANNEL_HANDLE = `@${CHANNEL}`;
