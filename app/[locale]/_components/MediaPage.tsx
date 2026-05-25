"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import VideoModal from "@/components/VideoModal";
import {
  MEDIA_ITEMS,
  DOCUMENTARY_VIDEO_ID,
  isMediaItemVisible,
  ytThumb,
} from "@/lib/media-data";
import SectionLabel from "@/components/SectionLabel";
import LangBadge from "@/components/LangBadge";
import { useTranslation } from "@/components/LanguageProvider";

const documentary = MEDIA_ITEMS.find((item) => item.tag === "DOCUMENTARY")!;

export default function MediaPage() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const { t, locale } = useTranslation();

  const visibleItems = MEDIA_ITEMS.filter((item) =>
    isMediaItemVisible(item, locale),
  );
  const interviews = visibleItems.filter((item) => item.tag === "INTERVIEW");
  const testimonies = visibleItems.filter((item) => item.tag === "TESTIMONY");
  const presentations = visibleItems.filter(
    (item) => item.tag === "PRESENTATION",
  );

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

      {/* ── Documentary ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)] flex flex-col md:flex-row gap-10 md:gap-16 items-center">
        <button
          onClick={() => setActiveVideoId(DOCUMENTARY_VIDEO_ID)}
          className="w-full md:w-[600px] h-[220px] md:h-[400px] bg-[var(--bg-card)] border border-[var(--border-default)] flex-shrink-0 overflow-hidden relative group cursor-pointer"
          aria-label={t("media.documentarySection.watchAria")}
        >
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('${ytThumb(DOCUMENTARY_VIDEO_ID)}')` }}
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
            />
          </div>
          <button
            onClick={() => setActiveVideoId(DOCUMENTARY_VIDEO_ID)}
            className="self-start px-8 py-4 bg-[var(--gold)] text-[var(--on-accent)] text-[12px] font-bold tracking-[1px] hover:opacity-90 transition-opacity"
          >
            {t("media.documentarySection.watchCta")}
          </button>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Interviews ── */}
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
                {/* Thumbnail */}
                <div
                  className="w-full h-[160px] bg-cover bg-center relative flex items-center justify-center"
                  style={{ backgroundImage: `url('${ytThumb(ep.videoId)}')` }}
                >
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-200" />
                  <div className="relative w-12 h-12 rounded-full bg-[var(--gold)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-[var(--on-accent)] ml-1" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-4 p-6 md:p-7 flex-1">
                  {/* Language badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <LangBadge label={badgeLabel} variant={ep.badgeVariant} />
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
                        <LangBadge label={badgeLabel} variant={ep.badgeVariant} />
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
                {/* Thumbnail */}
                <div
                  className="w-full h-[200px] bg-cover bg-center relative flex items-center justify-center"
                  style={{ backgroundImage: `url('${ytThumb(ep.videoId)}')` }}
                >
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-200" />
                  <div className="relative w-12 h-12 rounded-full bg-[var(--gold)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-[var(--on-accent)] ml-1" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-4 p-6 md:p-7 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <LangBadge label={badgeLabel} variant={ep.badgeVariant} />
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

      <CTASection />
      <Footer />
    </main>
  );
}
