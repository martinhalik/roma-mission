"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import Link from "next/link";
import { useState } from "react";
import VideoModal from "@/components/VideoModal";
import { ArrowRight } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";

const LACO_VIDEO_ID = "PNhKEQtCrVo";

const TESTIMONY_KEYS = [
  "cibul",
  "fathers",
  "adrianDominik",
  "miroslava",
  "gemer",
] as const;

type TestimonyKey = (typeof TESTIMONY_KEYS)[number];

interface TestimonyMedia {
  image: string;
  imagePosition: string;
}

const TESTIMONY_MEDIA: Record<TestimonyKey, TestimonyMedia> = {
  cibul: {
    image: "miro-svetlana-cibul.jpeg",
    imagePosition: "center 30%",
  },
  fathers: {
    image: "roma-fathers-working.jpg",
    imagePosition: "center 25%",
  },
  adrianDominik: {
    image: "dominik-and-adrian-learning-how-to-cook.jpeg",
    imagePosition: "center 20%",
  },
  miroslava: {
    image: "miroslava.jpeg",
    imagePosition: "center 15%",
  },
  gemer: {
    image: "m-man-testimony.jpg",
    imagePosition: "center 35%",
  },
};

function SectionLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="w-[3px] h-[14px] bg-[var(--gold)]" />
      <span className="text-[11px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
        {text}
      </span>
    </div>
  );
}

function PlayButton() {
  return (
    <div className="w-14 h-14 rounded-full bg-white/10 border border-white/30 backdrop-blur-sm flex items-center justify-center">
      <div className="w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-l-[16px] border-l-white ml-1" />
    </div>
  );
}

function TestimonyQuote({
  source,
  translation,
  className,
}: {
  source: string;
  translation: string;
  className: string;
}) {
  const showTranslation = translation.length > 0 && translation !== source;
  return (
    <div className="flex flex-col gap-2">
      <blockquote className={className}>&ldquo;{source}&rdquo;</blockquote>
      {showTranslation && (
        <p className="text-[12px] text-[var(--text-muted)] leading-[1.6]">
          {translation}
        </p>
      )}
    </div>
  );
}

export default function StoriesPage() {
  const [videoOpen, setVideoOpen] = useState(false);
  const { t } = useTranslation();

  const featuredKey: TestimonyKey = "cibul";
  const otherKeys = TESTIMONY_KEYS.filter((k) => k !== featuredKey);
  const featuredMedia = TESTIMONY_MEDIA[featuredKey];

  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="stories" />

      {/* ── Hero ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-5 md:gap-6 max-w-[700px]">
          <SectionLabel text={t("stories.hero.label")} />
          <h1 className="text-[32px] md:text-[52px] font-bold tracking-[-1.5px] text-[var(--text-primary)] leading-[1.05]">
            {t("stories.hero.titleLine1")}
            <br />
            {t("stories.hero.titleLine2")}
          </h1>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.7] max-w-[560px]">
            {t("stories.hero.subtitle")}
          </p>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Featured Story — Laco ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-14">
          <SectionLabel text={t("stories.featured.label")} />
        </div>

        <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-start md:items-center">
          {/* Photo — click to play video */}
          <button
            onClick={() => setVideoOpen(true)}
            className="w-full md:w-[440px] h-[260px] md:h-[500px] bg-[var(--bg-elevated)] border border-[var(--border-default)] flex-shrink-0 overflow-hidden relative group cursor-pointer"
            aria-label={t("stories.featured.watchAria")}
          >
            <div
              className="w-full h-full bg-cover transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: "url('/images/testimony-lado.jpg')",
                backgroundPosition: "center 20%",
              }}
            />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors duration-300 flex items-center justify-center">
              <PlayButton />
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-white/60 uppercase">
                {t("stories.featured.watchOverlay")}
              </span>
            </div>
          </button>

          <div className="flex flex-col gap-6 flex-1">
            <span className="text-[var(--gold)] text-[100px] md:text-[120px] leading-[0.3] font-bold">
              &ldquo;
            </span>
            <blockquote className="text-[20px] md:text-[26px] font-medium text-[var(--text-primary)] leading-[1.45] -mt-6">
              {t("stories.featured.quoteSource")}
            </blockquote>
            {(() => {
              const tr = t("stories.featured.quoteTranslation");
              if (!tr || tr === t("stories.featured.quoteSource")) return null;
              return (
                <p className="text-[14px] md:text-[15px] text-[var(--text-muted)] leading-[1.6] -mt-3 italic">
                  {tr}
                </p>
              );
            })()}
            <p className="text-[12px] font-semibold tracking-[1.5px] text-[var(--text-muted)] uppercase">
              {t("stories.featured.attribution")}
            </p>

            <div className="h-px bg-[var(--border-default)] my-2" />

            <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.75]">
              {t("stories.featured.context")}
            </p>

            <button
              onClick={() => setVideoOpen(true)}
              className="group self-start flex items-center gap-3 text-[12px] font-semibold tracking-[1px] text-[var(--gold)] hover:opacity-80 transition-opacity cursor-pointer mt-2"
            >
              <div className="w-7 h-7 rounded-full border border-[var(--gold)] flex items-center justify-center flex-shrink-0">
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[8px] border-l-[var(--gold)] ml-0.5" />
              </div>
              {t("stories.featured.watchCta")}
            </button>
          </div>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Pull stat ── */}
      <section className="px-5 md:px-[120px] py-12 md:py-16 bg-[var(--warm-bg)]">
        <div className="flex flex-col md:flex-row gap-8 md:gap-0 md:divide-x divide-[var(--border-strong)]">
          {[
            {
              stat: t("stories.stats.fathersStat"),
              label: t("stories.stats.fathersLabel"),
              sub: t("stories.stats.fathersSub"),
            },
            {
              stat: t("stories.stats.yearsStat"),
              label: t("stories.stats.yearsLabel"),
              sub: t("stories.stats.yearsSub"),
            },
            {
              stat: t("stories.stats.workshopsStat"),
              label: t("stories.stats.workshopsLabel"),
              sub: t("stories.stats.workshopsSub"),
            },
          ].map((item) => (
            <div
              key={item.label}
              className="flex flex-col gap-2 md:px-12 first:pl-0 last:pr-0"
            >
              <span className="text-[36px] md:text-[44px] font-bold text-[var(--gold)] tracking-[-1px] leading-none">
                {item.stat}
              </span>
              <span className="text-[14px] font-semibold text-[var(--text-primary)]">
                {item.label}
              </span>
              <span className="text-[12px] text-[var(--text-muted)]">
                {item.sub}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Founder's Story ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-4 mb-10">
          <SectionLabel text={t("stories.founder.label")} />
        </div>

        <Link
          href="/our-story"
          className="group flex flex-col md:flex-row bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden hover:border-[var(--gold)]/40 transition-colors"
        >
          <div
            className="w-full md:w-[360px] h-[220px] md:h-[320px] bg-[var(--bg-elevated)] bg-cover flex-shrink-0 transition-transform duration-500 group-hover:scale-[1.02] origin-center overflow-hidden"
            style={{
              backgroundImage: "url('/images/mission-about-us.jpg')",
              backgroundPosition: "center 30%",
            }}
          />
          <div className="flex flex-col gap-4 p-6 md:p-10 justify-center">
            <span className="text-[10px] font-semibold tracking-[1.5px] text-[var(--gold)] uppercase">
              {t("stories.founder.eyebrow")}
            </span>
            <h3 className="text-[20px] md:text-[26px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2]">
              {t("stories.founder.title")}
            </h3>
            <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.75] max-w-[500px]">
              {t("stories.founder.body")}
            </p>
            <div className="flex items-center gap-2 text-[11px] font-bold tracking-[1.5px] text-[var(--gold)] uppercase mt-2 group-hover:gap-3 transition-all">
              {t("stories.founder.cta")} <ArrowRight size={13} />
            </div>
          </div>
        </Link>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── More Stories ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-14">
          <SectionLabel text={t("stories.more.label")} />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.0]">
            {t("stories.more.titleLine1")}
            <br />
            {t("stories.more.titleLine2")}
          </h2>
        </div>

        {/* Featured family story — full width, large photo */}
        <div className="flex flex-col md:flex-row bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden mb-5 md:mb-6">
          <div
            className="w-full md:w-[520px] h-[280px] md:h-[420px] bg-[var(--bg-elevated)] bg-cover flex-shrink-0"
            style={{
              backgroundImage: `url('/images/${featuredMedia.image}')`,
              backgroundPosition: featuredMedia.imagePosition,
            }}
          />
          <div className="flex flex-col gap-5 p-6 md:p-10 justify-center">
            <span className="text-[10px] font-semibold tracking-[1.5px] text-[var(--gold)] uppercase">
              {t(`stories.testimonies.${featuredKey}.country`)}
            </span>
            <TestimonyQuote
              source={t(`stories.testimonies.${featuredKey}.quoteSource`)}
              translation={t(
                `stories.testimonies.${featuredKey}.quoteTranslation`
              )}
              className="text-[15px] md:text-[17px] text-[var(--text-primary)] leading-[1.7] italic"
            />
            <p className="text-[11px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
              — {t(`stories.testimonies.${featuredKey}.author`)}
            </p>
            <div className="h-px bg-[var(--border-default)]" />
            <p className="text-[13px] text-[var(--text-muted)] leading-[1.7]">
              {t(`stories.testimonies.${featuredKey}.context`)}
            </p>
          </div>
        </div>

        {/* Remaining stories — 2×2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {otherKeys.map((key) => {
            const media = TESTIMONY_MEDIA[key];
            return (
              <div
                key={key}
                className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden flex-1"
              >
                <div
                  className="w-full h-[200px] md:h-[220px] bg-[var(--bg-elevated)] bg-cover"
                  style={{
                    backgroundImage: `url('/images/${media.image}')`,
                    backgroundPosition: media.imagePosition,
                  }}
                />
                <div className="flex flex-col gap-4 p-5 md:p-6 flex-1">
                  <span className="text-[10px] font-semibold tracking-[1.5px] text-[var(--gold)] uppercase">
                    {t(`stories.testimonies.${key}.country`)}
                  </span>
                  <TestimonyQuote
                    source={t(`stories.testimonies.${key}.quoteSource`)}
                    translation={t(
                      `stories.testimonies.${key}.quoteTranslation`
                    )}
                    className="text-[13px] md:text-[14px] text-[var(--text-primary)] leading-[1.65] italic flex-1"
                  />
                  <p className="text-[11px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
                    — {t(`stories.testimonies.${key}.author`)}
                  </p>
                  <div className="h-px bg-[var(--border-default)] mt-1" />
                  <p className="text-[12px] text-[var(--text-muted)] leading-[1.6]">
                    {t(`stories.testimonies.${key}.context`)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Anonymous vignette ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="max-w-[640px] mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-px bg-[var(--gold)]" />
            <span className="text-[10px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
              {t("stories.anonymous.eyebrow")}
            </span>
          </div>
          <p className="text-[18px] md:text-[22px] font-medium text-[var(--text-primary)] leading-[1.6]">
            {t("stories.anonymous.lead")}
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85]">
            {t("stories.anonymous.paragraph1")}
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85]">
            {t("stories.anonymous.paragraph2")}
          </p>
          <p className="text-[14px] text-[var(--text-muted)] leading-[1.8] italic">
            {t("stories.anonymous.closing")}
          </p>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Why Stories Matter ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="max-w-[680px]">
          <SectionLabel text={t("stories.closing.label")} />
          <h2 className="text-[26px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.1] mt-5 mb-6">
            {t("stories.closing.title")}
          </h2>
          <p className="text-[14px] md:text-[16px] text-[var(--text-secondary)] leading-[1.8] mb-4">
            {t("stories.closing.paragraph1")}
          </p>
          <p className="text-[14px] md:text-[16px] text-[var(--text-secondary)] leading-[1.8] mb-8">
            {t("stories.closing.paragraph2")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/get-involved"
              className="inline-flex items-center justify-center bg-[var(--gold)] text-black text-[12px] font-bold tracking-[1.5px] px-8 py-4 hover:opacity-90 transition-opacity uppercase"
            >
              {t("stories.closing.ctaSupport")}
            </Link>
            <Link
              href="/mission"
              className="inline-flex items-center justify-center border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-semibold tracking-[1px] px-8 py-4 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors uppercase"
            >
              {t("stories.closing.ctaLearn")}
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />

      <VideoModal
        videoId={LACO_VIDEO_ID}
        isOpen={videoOpen}
        onClose={() => setVideoOpen(false)}
      />
    </main>
  );
}
