import { notFound } from "next/navigation";
import { isLocale } from "@/lib/i18n";
import { resolveRoute } from "@/lib/i18n/routes";
import MissionPage from "../_components/MissionPage";
import OurStoryPage from "@/app/our-story/page";
import LocationsPage from "@/app/locations/page";
import StoriesPage from "@/app/stories/page";
import MediaPage from "@/app/media/page";
import GetInvolvedPage from "@/app/get-involved/page";
import ThankYouPage from "@/app/thank-you/page";
import PrivacyPolicyPage from "@/app/privacy-policy/page";
import TermsOfUsePage from "@/app/terms-of-use/page";

export default async function LocaleSlugPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  if (!isLocale(locale)) notFound();

  const routeKey = resolveRoute(locale, slug);
  if (!routeKey) notFound();

  // PR 1: only `mission` lives under [locale]/_components.
  // The remaining routes are temporarily rendered from the old top-level
  // page components — PR 2 moves them into _components and deletes the
  // old route directories.
  switch (routeKey) {
    case "home":
      // Home has its own page at [locale]/page.tsx; this branch should not
      // be reachable because the empty slug doesn't match this segment.
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
