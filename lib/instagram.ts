// Server-side fetcher for a public Instagram profile feed.
//
// Instagram is far more hostile to scraping than Telegram. There is no
// equivalent of t.me/s/<channel> for unauthenticated viewing. The endpoint
// we use here — `i.instagram.com/api/v1/users/web_profile_info/` — is what
// the official web client hits for profile pages; it returns JSON and
// accepts the public web app id header without a token.
//
// Two important caveats:
//   1. Instagram aggressively rate-limits and may return 401/429 from
//      shared IPs. We swallow every failure and return an empty array so
//      the page never breaks.
//   2. The response shape can change at any time. We treat unexpected
//      structure as "no posts" rather than crashing.

const HANDLE = "bohjezivy";
const APP_ID = "936619743392459";
const FEED_URL = `https://www.instagram.com/api/v1/users/web_profile_info/?username=${HANDLE}`;
export const INSTAGRAM_PROFILE_URL = `https://www.instagram.com/${HANDLE}/`;
export const INSTAGRAM_HANDLE = `@${HANDLE}`;

export interface InstagramPost {
  id: string;
  url: string;
  datetime: string;
  text: string;
  imageUrl: string;
  isVideo: boolean;
  videoUrl?: string;
  likes?: number;
  comments?: number;
}

const FETCH_OPTS: RequestInit & { next: { revalidate: number } } = {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "X-IG-App-ID": APP_ID,
    "Accept": "*/*",
    "Accept-Language": "en-US,en;q=0.9",
    "Referer": INSTAGRAM_PROFILE_URL,
  },
  next: { revalidate: 1800 },
};

interface IgEdge {
  node: {
    id?: string;
    shortcode?: string;
    display_url?: string;
    thumbnail_src?: string;
    is_video?: boolean;
    video_url?: string;
    taken_at_timestamp?: number;
    edge_media_to_caption?: { edges: Array<{ node: { text: string } }> };
    edge_liked_by?: { count: number };
    edge_media_preview_like?: { count: number };
    edge_media_to_comment?: { count: number };
  };
}

interface IgResponse {
  data?: {
    user?: {
      edge_owner_to_timeline_media?: {
        edges?: IgEdge[];
      };
    };
  };
}

function pickCaption(node: IgEdge["node"]): string {
  const edges = node.edge_media_to_caption?.edges ?? [];
  return edges[0]?.node?.text ?? "";
}

export async function fetchInstagramPosts(): Promise<InstagramPost[]> {
  try {
    const res = await fetch(FEED_URL, FETCH_OPTS);
    if (!res.ok) return [];
    const json = (await res.json()) as IgResponse;
    const edges = json.data?.user?.edge_owner_to_timeline_media?.edges ?? [];

    const posts: InstagramPost[] = [];
    for (const { node } of edges) {
      const shortcode = node.shortcode;
      const image = node.display_url ?? node.thumbnail_src;
      if (!shortcode || !image) continue;

      const datetime = node.taken_at_timestamp
        ? new Date(node.taken_at_timestamp * 1000).toISOString()
        : "";

      posts.push({
        id: node.id ?? shortcode,
        url: `https://www.instagram.com/p/${shortcode}/`,
        datetime,
        text: pickCaption(node),
        imageUrl: image,
        isVideo: !!node.is_video,
        videoUrl: node.video_url,
        likes: node.edge_liked_by?.count ?? node.edge_media_preview_like?.count,
        comments: node.edge_media_to_comment?.count,
      });
    }
    return posts;
  } catch {
    return [];
  }
}
