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
//      shared IPs (notably Vercel). We swallow every failure and return
//      an empty result so the page never breaks.
//   2. The response shape can change at any time. We treat unexpected
//      structure as "no posts" rather than crashing.

const HANDLE = "bohjezivy";
const APP_ID = "936619743392459";
const ENDPOINTS = [
  `https://www.instagram.com/api/v1/users/web_profile_info/?username=${HANDLE}`,
  `https://i.instagram.com/api/v1/users/web_profile_info/?username=${HANDLE}`,
];
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

export interface InstagramChannelStats {
  followers: number | null;
  following: number | null;
  postCount: number | null;
}

export interface InstagramFeed {
  posts: InstagramPost[];
  stats: InstagramChannelStats;
}

const EMPTY_STATS: InstagramChannelStats = { followers: null, following: null, postCount: null };

const HEADERS: HeadersInit = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "X-IG-App-ID": APP_ID,
  Accept: "*/*",
  "Accept-Language": "en-US,en;q=0.9",
  Referer: INSTAGRAM_PROFILE_URL,
};

const FETCH_OPTS: RequestInit & { next: { revalidate: number } } = {
  headers: HEADERS,
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

interface IgUser {
  edge_owner_to_timeline_media?: { edges?: IgEdge[]; count?: number };
  edge_followed_by?: { count: number };
  edge_follow?: { count: number };
}

interface IgResponse {
  data?: { user?: IgUser };
}

function pickCaption(node: IgEdge["node"]): string {
  const edges = node.edge_media_to_caption?.edges ?? [];
  return edges[0]?.node?.text ?? "";
}

function parseUser(user: IgUser | undefined): InstagramFeed {
  if (!user) return { posts: [], stats: EMPTY_STATS };
  const edges = user.edge_owner_to_timeline_media?.edges ?? [];
  const posts: InstagramPost[] = [];
  for (const { node } of edges) {
    const shortcode = node.shortcode;
    const image = node.display_url ?? node.thumbnail_src;
    if (!shortcode || !image) continue;
    posts.push({
      id: node.id ?? shortcode,
      url: `https://www.instagram.com/p/${shortcode}/`,
      datetime: node.taken_at_timestamp ? new Date(node.taken_at_timestamp * 1000).toISOString() : "",
      text: pickCaption(node),
      imageUrl: image,
      isVideo: !!node.is_video,
      videoUrl: node.video_url,
      likes: node.edge_liked_by?.count ?? node.edge_media_preview_like?.count,
      comments: node.edge_media_to_comment?.count,
    });
  }
  return {
    posts,
    stats: {
      followers: user.edge_followed_by?.count ?? null,
      following: user.edge_follow?.count ?? null,
      postCount: user.edge_owner_to_timeline_media?.count ?? null,
    },
  };
}

export async function fetchInstagramFeed(): Promise<InstagramFeed> {
  // Preferred path: Instagram Graph API. Activates when both env vars are set.
  // See README on how to obtain a long-lived Page Access Token + IG user id.
  const token = process.env.INSTAGRAM_GRAPH_TOKEN;
  const userId = process.env.INSTAGRAM_IG_USER_ID;
  if (token && userId) {
    const graphFeed = await fetchFromGraphApi(userId, token);
    if (graphFeed) return graphFeed;
  }

  // Fallback: unauthenticated public web JSON endpoint. Fragile (Vercel IPs
  // often hit 401/429), retained only so /live is never completely empty
  // during initial setup.
  for (const url of ENDPOINTS) {
    try {
      const res = await fetch(url, FETCH_OPTS);
      if (!res.ok) continue;
      const json = (await res.json()) as IgResponse;
      const feed = parseUser(json.data?.user);
      if (feed.posts.length > 0 || feed.stats.followers !== null) return feed;
    } catch {
      // try next endpoint
    }
  }
  return { posts: [], stats: EMPTY_STATS };
}

interface GraphMediaItem {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
  timestamp: string;
  like_count?: number;
  comments_count?: number;
}

interface GraphUserResponse {
  followers_count?: number;
  follows_count?: number;
  media_count?: number;
}

interface GraphMediaResponse {
  data?: GraphMediaItem[];
}

async function fetchFromGraphApi(
  userId: string,
  token: string
): Promise<InstagramFeed | null> {
  const base = "https://graph.facebook.com/v19.0";
  const userUrl = `${base}/${userId}?fields=followers_count,follows_count,media_count&access_token=${encodeURIComponent(token)}`;
  const mediaUrl = `${base}/${userId}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count&limit=12&access_token=${encodeURIComponent(token)}`;

  try {
    const [userRes, mediaRes] = await Promise.all([
      fetch(userUrl, { next: { revalidate: 1800 } }),
      fetch(mediaUrl, { next: { revalidate: 1800 } }),
    ]);
    if (!userRes.ok || !mediaRes.ok) return null;
    const user = (await userRes.json()) as GraphUserResponse;
    const media = (await mediaRes.json()) as GraphMediaResponse;

    const posts: InstagramPost[] = (media.data ?? []).map((m) => ({
      id: m.id,
      url: m.permalink,
      datetime: m.timestamp,
      text: m.caption ?? "",
      imageUrl:
        m.media_type === "VIDEO" ? (m.thumbnail_url ?? m.media_url ?? "") : (m.media_url ?? m.thumbnail_url ?? ""),
      isVideo: m.media_type === "VIDEO",
      videoUrl: m.media_type === "VIDEO" ? m.media_url : undefined,
      likes: m.like_count,
      comments: m.comments_count,
    }));

    return {
      posts,
      stats: {
        followers: user.followers_count ?? null,
        following: user.follows_count ?? null,
        postCount: user.media_count ?? null,
      },
    };
  } catch {
    return null;
  }
}

export async function fetchInstagramPosts(): Promise<InstagramPost[]> {
  const feed = await fetchInstagramFeed();
  return feed.posts;
}

