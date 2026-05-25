"use client";

import { useMemo, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import VideoModal from "@/components/VideoModal";
import {
  MEDIA_ITEMS,
  MEDIA_LANGUAGE_FILTERS,
  isMediaItemVisible,
  matchesFilter,
  mediaBadgeFlagLocale,
  ytThumb,
  type MediaItem,
  type MediaLanguageFilter,
} from "@/lib/media-data";
import { getLocaleMeta } from "@/lib/i18n/locales";
import SectionLabel from "@/components/SectionLabel";
import LangBadge from "@/components/LangBadge";
import { useTranslation } from "@/components/LanguageProvider";

export default function MediaPage() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string>("all");
  const { t, locale } = useTranslation();

  const visibleItems = useMemo(
    () => MEDIA_ITEMS.filter((item) => isMediaItemVisible(item, locale)),
    [locale],
  );

  const activeFilter =
    MEDIA_LANGUAGE_FILTERS.find((f) => f.id === activeFilterId) ??
    MEDIA_LANGUAGE_FILTERS[0];

  const filteredItems = visibleItems.filter((item) =>
    matchesFilter(item, activeFilter),
  );

  const documentary = filteredItems.find((item) => item.tag === "DOCUMENTARY");
  const interviews = filteredItems.filter((item) => item.tag === "INTERVIEW");
  const testimonies = filteredItems.filter((item) => item.tag === "TESTIMONY");
  const presentations = filteredItems.filter(
    (item) => item.tag === "PRESENTATION",
  );

  const badgeFlag = (item: MediaItem) => {
    const flagLocale = mediaBadgeFlagLocale(item, locale);
    return flagLocale ? getLocaleMeta(flagLocale).flag : undefined;
  };

  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="media" />
      <VideoModal
        isOpen={!!activeVideoId}
        onClose={() => setActiveVideoId(null)}
        videoId={activeVideoId ?? ""}
      />

      {/* ── Hero ── */}
      <section className="relative w-full h-[400px] md:h-[480px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/media-hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,color-mix(in_srgb,var(--bg-primary)_93%,transparent)_0%,color-mix(in_srgb,var(--bg-primary)_53%,transparent)_70%,color-mix(in_srgb,var(--bg-primary)_27%,transparent)_100%)]" />
        <div className="relative z-10 flex flex-col justify-end h-full px-5 md:px-[120px] pb-12 md:pb-16">
          <div className="flex flex-col gap-5 md:gap-6 max-w-[700px]">
            <SectionLabel text={t("media.hero.label")} />
            <h1 className="text-[34px] md:text-[48px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              {t("media.hero.titleLine1")}
              <br />
              {t("media.hero.titleLine2")}
            </h1>
            <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
              {t("media.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      <FilterBar
        activeFilterId={activeFilterId}
        onSelect={setActiveFilterId}
        visibleItems={visibleItems}
      />

      {filteredItems.length === 0 ? (
        <EmptyState filter={activeFilter} />
      ) : (
        <>
          {/* ── Documentary ── */}
          {documentary && (
            <>
              <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)] flex flex-col md:flex-row gap-10 md:gap-16 items-center">
                <button
                  onClick={() => setActiveVideoId(documentary.videoId)}
                  className="w-full md:w-[600px] h-[220px] md:h-[400px] bg-[var(--bg-card)] border border-[var(--border-default)] flex-shrink-0 overflow-hidden relative group cursor-pointer"
                  aria-label={t("media.documentarySection.watchAria")}
                >
                  <div
                    className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                    style={{ backgroundImage: `url('${ytThumb(documentary.videoId)}')` }}
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-200" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-[var(--gold)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                      <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[18px] border-l-[var(--on-accent)] ml-1" />
                    </div>
                  </div>
                </button>
                <div className="flex flex-col gap-6 flex-1">
                  <SectionLabel text={t("media.documentarySection.label")} />
                  <h2 className="text-[28px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
                    {t(`media.items.${documentary.id}.title`)}
                  </h2>
                  <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.7]">
                    {t(`media.items.${documentary.id}.fullDesc`)}
                  </p>
                  <div className="flex items-center gap-3 flex-wrap text-[12px] text-[var(--text-muted)]">
                    <span>{documentary.duration}</span>
                    <span>·</span>
                    <span>{t(`media.items.${documentary.id}.source`)}</span>
                    <span>·</span>
                    <LangBadge
                      label={t(`media.items.${documentary.id}.badgeLabel`)}
                      variant={documentary.badgeVariant}
                      flag={badgeFlag(documentary)}
                    />
                  </div>
                  <button
                    onClick={() => setActiveVideoId(documentary.videoId)}
                    className="self-start px-8 py-4 bg-[var(--gold)] text-[var(--on-accent)] text-[12px] font-bold tracking-[1px] hover:opacity-90 transition-opacity"
                  >
                    {t("media.documentarySection.watchCta")}
                  </button>
                </div>
              </section>
              <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />
            </>
          )}

          {/* ── Interviews ── */}
          {interviews.length > 0 && (
            <>
              <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
                <div className="flex flex-col gap-4 max-w-[500px] mb-10 md:mb-12">
                  <SectionLabel text={t("media.interviewsSection.label")} />
                  <h2 className="text-[28px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[0.95]">
                    {t("media.interviewsSection.title")}
                  </h2>
                  <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.6]">
                    {t("media.interviewsSection.intro")}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {interviews.map((ep) => {
                    const title = t(`media.items.${ep.id}.title`);
                    const desc = t(`media.items.${ep.id}.fullDesc`);
                    const guest = t(`media.items.${ep.id}.guest`);
                    const badgeLabel = t(`media.items.${ep.id}.badgeLabel`);
                    return (
                      <button
                        key={ep.id}
                        onClick={() => setActiveVideoId(ep.videoId)}
                        className="flex flex-col gap-0 bg-[var(--bg-primary)] border border-[var(--border-default)] flex-1 text-left group hover:border-[var(--gold)]/50 transition-colors duration-200 overflow-hidden"
                        aria-label={t("media.card.watchAria", { title })}
                      >
                        <div
                          className="w-full h-[160px] bg-cover bg-center relative flex items-center justify-center"
                          style={{ backgroundImage: `url('${ytThumb(ep.videoId)}')` }}
                        >
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-200" />
                          <div className="relative w-12 h-12 rounded-full bg-[var(--gold)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-[var(--on-accent)] ml-1" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 p-6 md:p-7 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <LangBadge label={badgeLabel} variant={ep.badgeVariant} flag={badgeFlag(ep)} />
                          </div>

                          <div>
                            <h3 className="text-[15px] md:text-[16px] font-bold text-[var(--text-primary)] leading-[1.3] group-hover:text-[var(--gold)] transition-colors duration-200 mb-2">
                              {title}
                            </h3>
                            <p className="text-[12px] md:text-[13px] text-[var(--text-secondary)] leading-[1.6]">
                              {desc}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border-default)]">
                            <p className="text-[11px] text-[var(--text-muted)]">
                              {t("media.card.withGuest", { guest })}
                            </p>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {ep.duration}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
              <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />
            </>
          )}

          {/* ── Presentations ── */}
          {presentations.length > 0 && (
            <>
              <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
                <div className="flex flex-col gap-4 max-w-[500px] mb-10 md:mb-12">
                  <SectionLabel text={t("media.presentationsSection.label")} />
                  <h2 className="text-[28px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[0.95]">
                    {t("media.presentationsSection.title")}
                  </h2>
                  <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.6]">
                    {t("media.presentationsSection.intro")}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {presentations.map((ep) => {
                    const title = t(`media.items.${ep.id}.title`);
                    const desc = t(`media.items.${ep.id}.fullDesc`);
                    const source = t(`media.items.${ep.id}.source`);
                    const badgeLabel = t(`media.items.${ep.id}.badgeLabel`);
                    return (
                      <button
                        key={ep.id}
                        onClick={() => setActiveVideoId(ep.videoId)}
                        className="flex flex-col gap-0 bg-[var(--bg-card)] border border-[var(--border-default)] md:max-w-[480px] text-left group hover:border-[var(--gold)]/50 transition-colors duration-200 overflow-hidden"
                        aria-label={t("media.card.watchAria", { title })}
                      >
                        <div
                          className="w-full h-[200px] bg-cover bg-center relative flex items-center justify-center"
                          style={{ backgroundImage: `url('${ytThumb(ep.videoId)}')` }}
                        >
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-200" />
                          <div className="relative w-12 h-12 rounded-full bg-[var(--gold)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-[var(--on-accent)] ml-1" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 p-6 md:p-7 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <LangBadge label={badgeLabel} variant={ep.badgeVariant} flag={badgeFlag(ep)} />
                          </div>

                          <div>
                            <h3 className="text-[15px] md:text-[16px] font-bold text-[var(--text-primary)] leading-[1.3] group-hover:text-[var(--gold)] transition-colors duration-200 mb-2">
                              {title}
                            </h3>
                            <p className="text-[12px] md:text-[13px] text-[var(--text-secondary)] leading-[1.6]">
                              {desc}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border-default)]">
                            <p className="text-[11px] text-[var(--text-muted)]">
                              {source}
                            </p>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {ep.duration}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
              <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />
            </>
          )}

          {/* ── Testimonies ── */}
          {testimonies.length > 0 && (
            <>
              <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
                <div className="flex flex-col gap-4 max-w-[500px] mb-10 md:mb-12">
                  <SectionLabel text={t("media.testimoniesSection.label")} />
                  <h2 className="text-[28px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[0.95]">
                    {t("media.testimoniesSection.title")}
                  </h2>
                  <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.6]">
                    {t("media.testimoniesSection.intro")}
                  </p>
                </div>

                <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                  {testimonies.map((ep) => {
                    const title = t(`media.items.${ep.id}.title`);
                    const desc = t(`media.items.${ep.id}.fullDesc`);
                    const guest = ep.hasGuest ? t(`media.items.${ep.id}.guest`) : "";
                    const badgeLabel = t(`media.items.${ep.id}.badgeLabel`);
                    return (
                      <button
                        key={ep.id}
                        onClick={() => setActiveVideoId(ep.videoId)}
                        className="flex flex-col gap-0 bg-[var(--bg-card)] border border-[var(--border-default)] md:max-w-[480px] text-left group hover:border-[var(--gold)]/50 transition-colors duration-200 overflow-hidden"
                        aria-label={t("media.card.watchAria", { title })}
                      >
                        <div
                          className="w-full h-[200px] bg-cover bg-center relative flex items-center justify-center"
                          style={{ backgroundImage: `url('${ytThumb(ep.videoId)}')` }}
                        >
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-200" />
                          <div className="relative w-12 h-12 rounded-full bg-[var(--gold)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-[var(--on-accent)] ml-1" />
                          </div>
                        </div>

                        <div className="flex flex-col gap-4 p-6 md:p-7 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <LangBadge label={badgeLabel} variant={ep.badgeVariant} flag={badgeFlag(ep)} />
                          </div>

                          <div>
                            <h3 className="text-[15px] md:text-[16px] font-bold text-[var(--text-primary)] leading-[1.3] group-hover:text-[var(--gold)] transition-colors duration-200 mb-2">
                              {title}
                            </h3>
                            <p className="text-[12px] md:text-[13px] text-[var(--text-secondary)] leading-[1.6]">
                              {desc}
                            </p>
                          </div>

                          <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border-default)]">
                            <p className="text-[11px] text-[var(--text-muted)]">
                              {guest}
                            </p>
                            <span className="text-[11px] text-[var(--text-muted)]">
                              {ep.duration}
                            </span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </section>
              <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />
            </>
          )}
        </>
      )}

      <CTASection />
      <Footer />
    </main>
  );
}

function FilterBar({
  activeFilterId,
  onSelect,
  visibleItems,
}: {
  activeFilterId: string;
  onSelect: (id: string) => void;
  visibleItems: MediaItem[];
}) {
  const { t } = useTranslation();
  return (
    <section className="px-5 md:px-[120px] py-8 md:py-10 bg-[var(--bg-primary)] border-b border-[var(--border-default)]">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        <span className="text-[10px] font-semibold tracking-[1.5px] text-[var(--text-muted)] uppercase">
          {t("media.filters.title")}
        </span>
        <div className="flex flex-wrap gap-2">
          {MEDIA_LANGUAGE_FILTERS.map((filter) => {
            const count = visibleItems.filter((item) =>
              matchesFilter(item, filter),
            ).length;
            const isActive = filter.id === activeFilterId;
            const isEmpty = filter.langs !== null && count === 0;
            return (
              <button
                key={filter.id}
                onClick={() => onSelect(filter.id)}
                className={`inline-flex items-center gap-2 px-3 py-2 text-[11px] font-semibold tracking-[0.5px] border transition-colors duration-150 ${
                  isActive
                    ? "bg-[var(--gold)] text-[var(--on-accent)] border-[var(--gold)]"
                    : isEmpty
                      ? "bg-transparent text-[var(--text-muted)] border-[var(--border-default)] hover:border-[var(--border-strong)]"
                      : "bg-transparent text-[var(--text-secondary)] border-[var(--border-strong)] hover:text-[var(--gold)] hover:border-[var(--gold)]"
                }`}
                aria-pressed={isActive}
              >
                {filter.flag && <span aria-hidden>{filter.flag}</span>}
                <span>{t(filter.labelKey)}</span>
                {isEmpty && (
                  <span
                    className={`text-[9px] font-medium tracking-[0.5px] px-1.5 py-[2px] leading-none ${
                      isActive
                        ? "bg-[var(--on-accent)]/15 text-[var(--on-accent)]"
                        : "bg-[var(--border-default)] text-[var(--text-muted)]"
                    }`}
                  >
                    {t("media.filters.comingSoon")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function EmptyState({ filter }: { filter: MediaLanguageFilter }) {
  const { t } = useTranslation();
  const language = filter.langs ? t(filter.labelKey) : "";
  return (
    <section className="px-5 md:px-[120px] py-20 md:py-[120px] bg-[var(--bg-primary)] text-center flex flex-col items-center gap-4">
      <span className="text-[10px] font-semibold tracking-[1.5px] text-[var(--gold)] uppercase">
        {t("media.filters.comingSoon")}
      </span>
      <h2 className="text-[24px] md:text-[32px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.15] max-w-[640px]">
        {t("media.filters.emptyTitle", { language })}
      </h2>
      <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.6] max-w-[560px]">
        {t("media.filters.emptyBody")}
      </p>
    </section>
  );
}
