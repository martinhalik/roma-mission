"use client";

import LangBadge from "@/components/LangBadge";
import { useTranslation } from "@/components/LanguageProvider";
import { getLocaleMeta, type Locale } from "@/lib/i18n/locales";
import { mediaBadgeFlagLocale, type MediaItem } from "@/lib/media-data";

const DOC_AUDIO_LOCALES: Locale[] = ["sk", "cs"];

function flagsFor(locales: Locale[]) {
  return locales.map((l) => getLocaleMeta(l).flag).join("");
}

export default function MediaBadges({ item }: { item: MediaItem }) {
  const { t, locale } = useTranslation();

  if (item.id === "documentary") {
    const subLocales = item.languages.filter(
      (l) => !DOC_AUDIO_LOCALES.includes(l),
    );
    return (
      <>
        <LangBadge
          variant="audio"
          flag={flagsFor(DOC_AUDIO_LOCALES)}
          label={t("media.items.documentary.audioBadge")}
        />
        {subLocales.length > 0 && (
          <LangBadge
            variant="sub"
            flag={flagsFor(subLocales)}
            label={t("media.items.documentary.badgeLabel")}
          />
        )}
      </>
    );
  }

  const flagLocale = mediaBadgeFlagLocale(item, locale);
  return (
    <LangBadge
      variant={item.badgeVariant}
      flag={flagLocale ? getLocaleMeta(flagLocale).flag : undefined}
      label={t(`media.items.${item.id}.badgeLabel`)}
    />
  );
}
