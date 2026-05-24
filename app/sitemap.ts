import type { MetadataRoute } from "next";
import { LOCALES, DEFAULT_LOCALE } from "@/lib/i18n";
import { ROUTE_KEYS, buildPath } from "@/lib/i18n/routes";

const SITE_URL =
  process.env.NEXT_PUBLIC_URL ?? "https://romamission.eu";

// Lower priority / less frequent updates for utility pages.
const LOW_PRIORITY = new Set(["privacy", "terms", "thankYou"]);
const NOINDEX = new Set(["thankYou"]);

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];

  for (const routeKey of ROUTE_KEYS) {
    if (NOINDEX.has(routeKey)) continue;

    // hreflang alternates pointing at every locale's canonical for this route.
    const languages: Record<string, string> = {};
    for (const l of LOCALES) {
      languages[l.code] = `${SITE_URL}${buildPath(l.code, routeKey)}`;
    }
    languages["x-default"] = `${SITE_URL}${buildPath(DEFAULT_LOCALE, routeKey)}`;

    for (const loc of LOCALES) {
      entries.push({
        url: `${SITE_URL}${buildPath(loc.code, routeKey)}`,
        lastModified: new Date(),
        changeFrequency:
          routeKey === "home"
            ? "weekly"
            : LOW_PRIORITY.has(routeKey)
            ? "yearly"
            : "monthly",
        priority:
          routeKey === "home"
            ? 1.0
            : LOW_PRIORITY.has(routeKey)
            ? 0.2
            : 0.7,
        alternates: { languages },
      });
    }
  }

  return entries;
}
