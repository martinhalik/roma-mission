/** Non-HttpOnly cookie set by middleware. The donation UI reads it after mount. */
export const GEO_COUNTRY_COOKIE = "geo_country";

/**
 * `?country=` is a test override. It is disabled when either signal says
 * production: Vercel production (`VERCEL_ENV`) or a production Node runtime
 * (`NODE_ENV`). Preview, development, and the test runner may use it.
 */
export function countryOverrideAllowed(
  env: { NODE_ENV?: string; VERCEL_ENV?: string } = process.env,
): boolean {
  if (env.VERCEL_ENV === "production") return false;
  if (env.NODE_ENV === "production") return false;
  return true;
}

export function normalizeCountry(value: string | null | undefined): string | null {
  if (!value) return null;
  const code = value.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return null;
  return code;
}

/**
 * Country used for the English currency allowlist.
 * Header wins. The query and cookie are consulted only outside production.
 * Null means "not the United States" (local dev with no geo, or an unknown country).
 * A country field in a JSON body is never an input here.
 */
export function resolveVisitorCountry(input: {
  headerCountry: string | null;
  queryCountry: string | null;
  cookieCountry: string | null;
  allowOverride: boolean;
}): string | null {
  const header = normalizeCountry(input.headerCountry);
  if (header) return header;
  if (!input.allowOverride) return null;
  return normalizeCountry(input.queryCountry) ?? normalizeCountry(input.cookieCountry);
}
