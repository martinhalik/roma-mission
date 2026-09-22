import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { resolveRoute } from "@/lib/i18n/routes";
import { buildLocaleMetadata } from "@/lib/i18n/metadata";
import LiturgyTextPage from "../../_components/LiturgyTextPage";

/**
 * Two-segment routes. `ROUTE_SLUGS` stores these with the slash in the slug
 * (`liturgy/text`, `liturgia/text`), so both segments are joined before being
 * resolved — the same lookup the one-segment catch-all does.
 */
function resolveSubRoute(locale: string, slug: string, sub: string) {
  if (!isLocale(locale)) return null;
  return resolveRoute(locale, `${slug}/${sub}`);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string; sub: string }>;
}): Promise<Metadata> {
  const { locale, slug, sub } = await params;
  const routeKey = resolveSubRoute(locale, slug, sub);
  if (!routeKey || !isLocale(locale)) return {};
  return buildLocaleMetadata(locale, routeKey);
}

export default async function LocaleSubPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string; sub: string }>;
}) {
  const { locale, slug, sub } = await params;
  if (!isLocale(locale)) notFound();

  const routeKey = resolveSubRoute(locale, slug, sub);
  if (routeKey !== "liturgyText") notFound();

  return <LiturgyTextPage locale={locale} />;
}
