import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { resolveRoute } from "@/lib/i18n/routes";
import { buildLocaleMetadata } from "@/lib/i18n/metadata";
import MissionPage from "../_components/MissionPage";
import OurStoryPage from "../_components/OurStoryPage";
import LocationsPage from "../_components/LocationsPage";
import StoriesPage from "../_components/StoriesPage";
import MediaPage from "../_components/MediaPage";
import HeritagePage from "../_components/HeritagePage";
import GetInvolvedPage from "../_components/GetInvolvedPage";
import ThankYouPage from "../_components/ThankYouPage";
import PrivacyPolicyPage from "../_components/PrivacyPolicyPage";
import TermsOfUsePage from "../_components/TermsOfUsePage";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  if (!isLocale(locale)) return {};
  const routeKey = resolveRoute(locale, slug);
  if (!routeKey || routeKey === "home") return {};
  return buildLocaleMetadata(locale, routeKey);
}

export default async function LocaleSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const routeKey = resolveRoute(locale, slug);
  if (!routeKey) notFound();

  switch (routeKey) {
    case "home":
      notFound();
    case "mission":
      return <MissionPage />;
    case "ourStory":
      return <OurStoryPage />;
    case "locations":
      return <LocationsPage />;
    case "stories":
      return <StoriesPage />;
    case "media":
      return <MediaPage />;
    case "heritage":
      return <HeritagePage />;
    case "getInvolved":
      return <GetInvolvedPage />;
    case "thankYou":
      return <ThankYouPage />;
    case "privacy":
      return <PrivacyPolicyPage />;
    case "terms":
      return <TermsOfUsePage />;
  }
}
