import { NextRequest, NextResponse } from "next/server";
import { LOCALES, DEFAULT_LOCALE, type Locale } from "@/lib/i18n/locales";
import { isSupportedLocaleSegment } from "@/lib/i18n/routes";

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

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Bare root: redirect to detected locale
  if (pathname === "/") {
    const locale = detectLocale(req);
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}`;
    return NextResponse.redirect(url, 302);
  }

  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];

  // If first segment is a supported locale, pass through.
  if (first && isSupportedLocaleSegment(first)) {
    return NextResponse.next();
  }

  // Non-locale top-level path: prepend the detected locale and redirect.
  // PR 4 adds alias resolution (e.g. /ro/mission → /ro/misiune).
  const locale = detectLocale(req);
  const url = req.nextUrl.clone();
  url.pathname = `/${locale}${pathname}`;
  url.search = search;
  return NextResponse.redirect(url, 302);
}

export const config = {
  // Exclude API routes, Next internals, and static assets.
  matcher: [
    "/((?!api|_next/static|_next/image|images|icon.svg|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)",
  ],
};
