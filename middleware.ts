import { NextRequest, NextResponse } from "next/server";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import {
  ROUTE_SLUGS,
  isSupportedLocaleSegment,
  resolveRoute,
  type RouteKey,
} from "@/lib/i18n/routes";

const LOCALE_CODES = LOCALES.map((l) => l.code) as readonly Locale[];

function detectLocale(req: NextRequest): Locale {
  const header = req.headers.get("accept-language");
  if (!header) return DEFAULT_LOCALE;
  const parts = header
    .split(",")
    .map((p) => p.trim().split(";")[0]?.slice(0, 2).toLowerCase())
    .filter(Boolean) as string[];
  for (const code of parts) {
    if (LOCALE_CODES.includes(code as Locale)) return code as Locale;
  }
  return DEFAULT_LOCALE;
}

// Reverse map: any slug that is canonical in *some* locale → its RouteKey.
// Used when a path arrives without a locale prefix and we need to know which
// route it refers to before we can prepend a locale.
const SLUG_TO_KEY: Record<string, RouteKey> = (() => {
  const map: Record<string, RouteKey> = {};
  for (const loc of LOCALE_CODES) {
    const slugs = ROUTE_SLUGS[loc];
    for (const k in slugs) {
      const key = k as RouteKey;
      const slug = slugs[key];
      if (!slug) continue;
      if (!(slug in map)) map[slug] = key;
    }
  }
  return map;
})();

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Bare root: redirect to detected locale.
  if (pathname === "/") {
    const locale = detectLocale(req);
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url, 302);
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  // Path starts with a supported locale.
  if (first && isSupportedLocaleSegment(first)) {
    const slug = segments[1] ?? "";

    // No slug → home; pass through.
    if (!slug) {
      const res = NextResponse.next();
      res.headers.set("x-roma-locale", first);
      res.headers.set("x-roma-pathname", pathname);
      return res;
    }

    // The slug is canonical for the URL's locale → pass through.
    const directMatch = resolveRoute(first, slug);
    if (directMatch) {
      const res = NextResponse.next();
      res.headers.set("x-roma-locale", first);
      res.headers.set("x-roma-pathname", pathname);
      return res;
    }

    // Slug is the English alias of a route → 301 to the locale's canonical slug.
    // Example: /ro/mission → /ro/misiune. We only honour the English slug as
    // an alias (the canonical SEO URL set); other locales' slugs land in 404
    // so we don't muddy the canonical with cross-locale redirects.
    const englishKey = resolveRoute("en", slug);
    if (englishKey) {
      const canonical = ROUTE_SLUGS[first][englishKey];
      const url = req.nextUrl.clone();
      url.pathname = canonical ? `/${first}/${canonical}` : `/${first}`;
      url.search = search;
      return NextResponse.redirect(url, 301);
    }

    // Unknown slug under a known locale → pass through; the catch-all 404s.
    const res = NextResponse.next();
    res.headers.set("x-roma-locale", first);
    res.headers.set("x-roma-pathname", pathname);
    return res;
  }

  // Non-locale top-level path. Try to resolve the first segment as a known
  // slug (English canonical) and redirect to the locale's canonical form.
  const detected = detectLocale(req);
  const englishKey: RouteKey | undefined = first
    ? SLUG_TO_KEY[first]
    : undefined;
  const url = req.nextUrl.clone();

  if (englishKey) {
    const canonical = ROUTE_SLUGS[detected][englishKey];
    const rest = segments.slice(1);
    const restPath = rest.length ? `/${rest.join("/")}` : "";
    url.pathname = canonical
      ? `/${detected}/${canonical}${restPath}`
      : `/${detected}${restPath}`;
  } else {
    // Unrecognized path; still prepend the locale so the catch-all can 404.
    url.pathname = `/${detected}${pathname}`;
  }
  url.search = search;
  return NextResponse.redirect(url, 302);
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|images|icon.svg|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
