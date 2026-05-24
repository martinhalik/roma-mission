"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  DICTIONARIES,
  isLocale,
  type Dictionary,
  type Locale,
} from "@/lib/i18n";
import {
  ROUTE_KEYS,
  ROUTE_SLUGS,
  buildPath,
  type RouteKey,
} from "@/lib/i18n/routes";

interface LanguageContextValue {
  locale: Locale;
  routeKey: RouteKey;
  setLocale: (locale: Locale) => void;
  dict: Dictionary;
  t: (path: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function resolve(dict: Dictionary, path: string): string {
  const parts = path.split(".");
  let cur: unknown = dict;
  for (const p of parts) {
    if (cur && typeof cur === "object" && p in cur) {
      cur = (cur as Record<string, unknown>)[p];
    } else {
      return path;
    }
  }
  return typeof cur === "string" ? cur : path;
}

function interpolate(template: string, vars?: Record<string, string | number>) {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) =>
    key in vars ? String(vars[key]) : `{${key}}`
  );
}

function inferRouteKey(pathname: string, locale: Locale): RouteKey {
  const segments = pathname.split("/").filter(Boolean);
  // Drop the locale segment if present
  const rest = isLocale(segments[0]) ? segments.slice(1) : segments;
  if (rest.length === 0) return "home";
  const slug = rest[0];
  const map = ROUTE_SLUGS[locale];
  for (const key of ROUTE_KEYS) {
    if (map[key] === slug) return key;
  }
  // Fall back: try matching English slugs (helpful when an old top-level path
  // is still served from app/<route>/page.tsx during the migration).
  const en = ROUTE_SLUGS.en;
  for (const key of ROUTE_KEYS) {
    if (en[key] === slug) return key;
  }
  return "home";
}

export default function LanguageProvider({
  locale: localeProp,
  children,
}: {
  locale?: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname() ?? "/";

  const locale: Locale = localeProp ?? DEFAULT_LOCALE;
  const routeKey = useMemo(
    () => inferRouteKey(pathname, locale),
    [pathname, locale]
  );

  const setLocale = useCallback(
    (next: Locale) => {
      router.push(buildPath(next, routeKey));
    },
    [router, routeKey]
  );

  const value = useMemo<LanguageContextValue>(() => {
    const dict = DICTIONARIES[locale] ?? DICTIONARIES[DEFAULT_LOCALE];
    const fallback = DICTIONARIES[DEFAULT_LOCALE];
    return {
      locale,
      routeKey,
      setLocale,
      dict,
      t: (path, vars) => {
        const found = resolve(dict, path);
        if (found === path && dict !== fallback) {
          return interpolate(resolve(fallback, path), vars);
        }
        return interpolate(found, vars);
      },
    };
  }, [locale, routeKey, setLocale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error("useTranslation must be used inside <LanguageProvider>");
  }
  return ctx;
}
