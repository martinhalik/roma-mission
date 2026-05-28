import type { Metadata } from "next";
import { DICTIONARIES, LOCALES, type Locale } from "@/lib/i18n";
import { ROUTE_KEYS, buildPath, type RouteKey } from "@/lib/i18n/routes";

const SITE_URL =
  process.env.NEXT_PUBLIC_URL ?? "https://romamission.eu";

const OG_IMAGE: Record<RouteKey, string> = {
  home: "/images/mission-about-us.jpg",
  mission: "/images/our-approach.jpg",
  ourStory: "/images/mission-about-us.jpg",
  locations: "/images/klenovec-chapel.jpeg",
  stories: "/images/testimony-lado.jpg",
  media: "/images/dolinka-od-mili-nov-2020-poster-00001.jpg",
  heritage: "/images/heritage/hero.webp",
  activity: "/images/klenovec-chapel.jpeg",
  getInvolved: "/images/mission-about-us.jpg",
  thankYou: "/images/mission-about-us.jpg",
  privacy: "/images/mission-about-us.jpg",
  terms: "/images/mission-about-us.jpg",
};

const PRIVATE_ROUTES: ReadonlySet<RouteKey> = new Set([
  "privacy",
  "terms",
  "thankYou",
]);

export function buildLocaleMetadata(
  locale: Locale,
  routeKey: RouteKey
): Metadata {
  const dict = DICTIONARIES[locale] ?? DICTIONARIES.en;
  const entry = dict.metadata[routeKey];
  const fallback = DICTIONARIES.en.metadata[routeKey];

  const title = entry.title || fallback.title;
  const description = entry.description || fallback.description;
  const ogTitle = entry.ogTitle ?? title;
  const ogDescription = entry.ogDescription ?? description;

  const canonical = buildPath(locale, routeKey);
  const ogImage = OG_IMAGE[routeKey];
  const isPrivate = PRIVATE_ROUTES.has(routeKey);

  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[l.code] = buildPath(l.code, routeKey);
  }
  languages["x-default"] = buildPath("en", routeKey);

  return {
    title,
    description,
    alternates: {
      canonical,
      languages,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: `${SITE_URL}${canonical}`,
      siteName: dict.footer.brand,
      type: "website",
      locale,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: ogTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
    ...(isPrivate ? { robots: { index: false, follow: true } } : {}),
  };
}

export { ROUTE_KEYS };
