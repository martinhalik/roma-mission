"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import VideoModal from "@/components/VideoModal";
import MissionMap from "@/components/MissionMap";
import Link from "next/link";
import { Users, BookOpen, Crown, Heart, House, LucideIcon } from "lucide-react";
import { MEDIA_ITEMS, ytThumb } from "@/lib/media-data";
import SectionLabel from "@/components/SectionLabel";
import LangBadge from "@/components/LangBadge";
import { useTranslation } from "@/components/LanguageProvider";

const LACO_VIDEO_ID = "PNhKEQtCrVo";

function PlayButton({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const dims =
    size === "lg" ? "w-16 h-16" : size === "sm" ? "w-10 h-10" : "w-12 h-12";
  const arrow =
    size === "lg"
      ? "border-t-[10px] border-b-[10px] border-l-[18px]"
      : size === "sm"
      ? "border-t-[6px] border-b-[6px] border-l-[11px]"
      : "border-t-[8px] border-b-[8px] border-l-[14px]";
  return (
    <div
      className={`${dims} rounded-full bg-[var(--gold)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200 flex-shrink-0`}
    >
      <div
        className={`w-0 h-0 border-t-transparent border-b-transparent border-l-[var(--on-accent)] ml-1 ${arrow}`}
      />
    </div>
  );
}

const pillars: { num: string; titleKey: string; descKey: string }[] = [
  { num: "01", titleKey: "home.approach.pillar1Title", descKey: "home.approach.pillar1Desc" },
  { num: "02", titleKey: "home.approach.pillar2Title", descKey: "home.approach.pillar2Desc" },
  { num: "03", titleKey: "home.approach.pillar3Title", descKey: "home.approach.pillar3Desc" },
  { num: "04", titleKey: "home.approach.pillar4Title", descKey: "home.approach.pillar4Desc" },
  { num: "05", titleKey: "home.approach.pillar5Title", descKey: "home.approach.pillar5Desc" },
];

const resultCards: { Icon: LucideIcon; textKey: string }[] = [
  { Icon: Users, textKey: "home.results.cardFathers" },
  { Icon: BookOpen, textKey: "home.results.cardChildren" },
  { Icon: Crown, textKey: "home.results.cardDignity" },
  { Icon: Heart, textKey: "home.results.cardAddiction" },
  { Icon: House, textKey: "home.results.cardFamilies" },
];

const mediaItems = MEDIA_ITEMS.filter((item) => item.tag !== "TESTIMONY").slice(0, 3);

export default function HomePage() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);
  const { t } = useTranslation();

  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="home" />

      <VideoModal
        isOpen={!!activeVideoId}
        onClose={() => setActiveVideoId(null)}
        videoId={activeVideoId ?? ""}
      />

      {/* ── Hero ── */}
      <section className="relative w-full h-svh md:h-[720px] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/hero-home.png"
        >
          <source src="/images/hero-home-optimized.mp4" type="video/mp4" />
        </video>
        {/* Top fade — navbar readability */}
        <div className="absolute inset-x-0 top-0 h-[25%] bg-gradient-to-b from-[var(--bg-primary)]/70 to-transparent" />
        {/* Bottom-left — text area readability */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top right, var(--bg-primary) 0%, color-mix(in srgb, var(--bg-primary) 85%, transparent) 30%, color-mix(in srgb, var(--bg-primary) 40%, transparent) 60%, transparent 100%)",
          }}
        />
        {/* Bottom edge — seamless blend into page content */}
        <div className="absolute inset-x-0 bottom-0 h-[28%] bg-gradient-to-t from-[var(--bg-primary)] to-transparent" />
        <div className="relative z-10 flex flex-col justify-end h-full px-5 md:px-[120px] pb-12 md:pb-16">
          <div className="flex flex-col gap-5 md:gap-8 max-w-[800px]">
            <SectionLabel text={t("home.hero.label")} />
            <h1 className="text-[34px] md:text-[52px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              {t("home.hero.titleLine1")}
              <br />
              {t("home.hero.titleLine2")}
            </h1>
            <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
              {t("home.hero.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                href="/get-involved"
                className="px-6 md:px-8 py-4 bg-[var(--gold)] text-[var(--on-accent)] text-[11px] font-bold tracking-[1px] text-center hover:opacity-90 transition-opacity"
              >
                {t("home.hero.ctaSupport")}
              </Link>
              <Link
                href="/get-involved"
                className="px-6 md:px-8 py-4 border border-[var(--gold)] text-[var(--gold)] text-[11px] font-semibold tracking-[1px] text-center hover:bg-[var(--gold)] hover:text-[var(--on-accent)] transition-colors"
              >
                {t("home.hero.ctaVolunteer")}
              </Link>
              <Link
                href="/mission"
                className="px-6 md:px-8 py-4 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[11px] font-semibold tracking-[1px] text-center hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                {t("home.hero.ctaLearnMore")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Urgency ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-6 md:gap-8 max-w-[700px] mb-12 md:mb-16">
          <SectionLabel text={t("home.urgency.label")} />
          <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            {t("home.urgency.titleLine1")}
            <br />
            {t("home.urgency.titleLine2")}
          </h2>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.7]">
            {t("home.urgency.body")}
          </p>
        </div>

        {/* Urgency photos — 3-col row */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-12">
          <div className="h-[120px] md:h-[280px] overflow-hidden"><img src="/images/dolinka-od-mili-nov-2020-poster-00001.jpg" alt={t("home.imageAlt.urgencyFuture")} className="w-full h-full object-cover" /></div>
          <div className="h-[120px] md:h-[280px] overflow-hidden"><img src="/images/future.jpeg" alt={t("home.imageAlt.urgencyFuture")} className="w-full h-full object-cover" /></div>
          <div className="h-[120px] md:h-[280px] overflow-hidden"><img src="/images/future-church.jpg" alt={t("home.imageAlt.urgencyFuture")} className="w-full h-full object-cover" /></div>
        </div>

        {/* Statements */}
        <div className="flex flex-col gap-4 mb-6">
          {[t("home.urgency.statement1"), t("home.urgency.statement2")].map(
            (s) => (
              <p
                key={s}
                className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.7] border-l-2 border-[var(--border-strong)] pl-4"
              >
                {s}
              </p>
            ),
          )}
        </div>

        <div className="p-8 md:p-10 bg-[var(--bg-card)] border border-[var(--border-default)]">
          <p className="text-[15px] md:text-[17px] text-[var(--text-muted)] leading-[1.7]">
            {t("home.urgency.absentLead")}{" "}
            <span className="text-[var(--text-secondary)]">
              {t("home.urgency.absentEmph")}
            </span>
          </p>
          <p className="text-[15px] md:text-[17px] text-[var(--text-primary)] font-medium leading-[1.7] mt-2">
            {t("home.urgency.presentLead")}{" "}
            <span className="text-[var(--gold)]">
              {t("home.urgency.presentEmph")}
            </span>
          </p>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Results ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-6 max-w-[700px] mb-12 md:mb-16">
          <SectionLabel text={t("home.results.label")} />
          <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            {t("home.results.titleLine1")}
            <br />
            {t("home.results.titleLine2")}
          </h2>
        </div>

        {/* Results photos — 3-col row */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="h-[100px] md:h-[240px] overflow-hidden"><img src="/images/roma-population-growing.jpeg" alt={t("home.imageAlt.populationGrowing")} className="w-full h-full object-cover" /></div>
          <div className="h-[100px] md:h-[240px] overflow-hidden"><img src="/images/transformed-via-education.jpeg" alt={t("home.imageAlt.education")} className="w-full h-full object-cover" /></div>
          <div className="h-[100px] md:h-[240px] overflow-hidden"><img src="/images/dignity-returns.jpg" alt={t("home.imageAlt.dignity")} className="w-full h-full object-cover" /></div>
        </div>

        {/* Results icon cards — Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {resultCards.slice(0, 3).map(({ Icon, textKey }, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-7 bg-[var(--bg-card)] border border-[var(--border-default)]"
            >
              <Icon className="w-[22px] h-[22px] text-[var(--gold)]" />
              <p className="text-[14px] font-medium text-[var(--text-secondary)] leading-[1.5]">
                {t(textKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Results icon cards — Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resultCards.slice(3).map(({ Icon, textKey }, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-7 bg-[var(--bg-card)] border border-[var(--border-default)]"
            >
              <Icon className="w-[22px] h-[22px] text-[var(--gold)]" />
              <p className="text-[14px] font-medium text-[var(--text-secondary)] leading-[1.5]">
                {t(textKey)}
              </p>
            </div>
          ))}
          <div className="hidden md:block" />
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Our Approach ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-12">
          <SectionLabel text={t("home.approach.label")} />
          <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            {t("home.approach.title")}
          </h2>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
            {t("home.approach.subtitle")}
          </p>
        </div>

        {/* Approach photo */}
        <div className="w-full h-[180px] md:h-[360px] mb-8 md:mb-12 overflow-hidden rounded-sm"><img src="/images/our-approach.jpg" alt={t("home.imageAlt.approach")} className="w-full h-full object-cover" /></div>

        {/* Pillars Row 1 — 2 columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {pillars.slice(0, 2).map((p) => (
            <div
              key={p.num}
              className="flex flex-col gap-5 p-7 md:p-8 bg-[var(--bg-primary)] border border-[var(--border-default)]"
            >
              <span className="text-[var(--gold)] text-[36px] font-bold tracking-[-2px]">
                {p.num}
              </span>
              <h3 className="text-[14px] font-bold tracking-[1px] text-[var(--text-primary)] whitespace-pre-line leading-[1.3]">
                {t(p.titleKey)}
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                {t(p.descKey)}
              </p>
            </div>
          ))}
        </div>

        {/* Pillars Row 2 — 3 columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {pillars.slice(2).map((p) => (
            <div
              key={p.num}
              className="flex flex-col gap-5 p-7 md:p-8 bg-[var(--bg-primary)] border border-[var(--border-default)]"
            >
              <span className="text-[var(--gold)] text-[36px] font-bold tracking-[-2px]">
                {p.num}
              </span>
              <h3 className="text-[14px] font-bold tracking-[1px] text-[var(--text-primary)] whitespace-pre-line leading-[1.3]">
                {t(p.titleKey)}
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                {t(p.descKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Testimonial — Laco ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
          {/* Clickable photo with play overlay */}
          <button
            onClick={() => setActiveVideoId(LACO_VIDEO_ID)}
            className="w-full md:w-[380px] h-[240px] md:h-[480px] bg-[var(--bg-elevated)] border border-[var(--border-default)] flex-shrink-0 overflow-hidden relative group cursor-pointer"
            aria-label={t("home.testimony.watchAria")}
          >
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: "url('/images/testimony-lado.jpg')" }}
            />
            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
              <PlayButton size="lg" />
            </div>
          </button>

          <div className="flex flex-col gap-6">
            <div className="mb-[20px]">
              <SectionLabel text={t("home.testimony.label")} />
            </div>
            <span className="text-[var(--gold)] text-[120px] leading-[0.4] font-bold">
              &ldquo;
            </span>
            <blockquote className="text-[18px] md:text-[22px] font-medium text-[var(--text-primary)] leading-[1.5] -mt-8">
              {t("home.testimony.quote")}
            </blockquote>
            <p className="text-[13px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
              {t("home.testimony.attribution")}
            </p>
            <div className="flex items-center gap-5 flex-wrap">
              <button
                onClick={() => setActiveVideoId(LACO_VIDEO_ID)}
                className="group flex items-center gap-2.5 text-[12px] font-semibold tracking-[1px] text-[var(--gold)] hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full border border-[var(--gold)] flex items-center justify-center flex-shrink-0">
                  <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[7px] border-l-[var(--gold)] ml-0.5" />
                </div>
                {t("home.testimony.watchLabel")}
              </button>
              {/* <Link
                href="/stories"
                className="text-[12px] font-semibold tracking-[1px] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
              >
                Read more stories →
              </Link> */}
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Where We Serve ── */}
      <section className="py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-12 px-5 md:px-[120px]">
          <SectionLabel text={t("home.missionField.label")} />
          <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            {t("home.missionField.titleLine1")}
            <br />
            {t("home.missionField.titleLine2")}
          </h2>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
            {t("home.missionField.descriptionBefore")}
            <span className="text-[var(--text-primary)] font-medium">
              {t("home.missionField.descriptionHighlight")}
            </span>
            {t("home.missionField.descriptionAfter")}
          </p>
        </div>

        {/* Interactive map — full width */}
        <div className="mb-8">
          <MissionMap />
        </div>

        {/* Stats bar */}
        <div className="px-5 md:px-[120px]">
          <div className="grid grid-cols-3 border border-[var(--border-default)] mb-8">
            {[
              { value: "8", label: t("home.missionField.statParishes") },
              { value: "3", label: t("home.missionField.statChurches") },
              { value: "2016", label: t("home.missionField.statSince") },
            ].map((stat, i) => (
              <div
                key={stat.label}
                className={`flex flex-col gap-1 px-6 md:px-10 py-6 ${
                  i < 2 ? "border-r border-[var(--border-default)]" : ""
                }`}
              >
                <span className="text-[26px] md:text-[32px] font-bold text-[var(--gold)] leading-none">
                  {stat.value}
                </span>
                <span className="text-[10px] font-medium tracking-[1px] text-[var(--text-muted)] uppercase">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>

          <Link
            href="/locations"
            className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[1px] text-[var(--gold)] border border-[var(--gold)] px-8 py-4 hover:bg-[var(--gold)] hover:text-[var(--on-accent)] transition-colors"
          >
            {t("home.missionField.cta")}
          </Link>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Featured Media ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-12">
          <SectionLabel text={t("home.featuredMedia.label")} />
          <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            {t("home.featuredMedia.titleLine1")}
            <br />
            {t("home.featuredMedia.titleLine2")}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {mediaItems.map((item) => {
            const title = t(`media.items.${item.id}.title`);
            const desc = t(`media.items.${item.id}.shortDesc`);
            const source = t(`media.items.${item.id}.source`);
            const badgeLabel = t(`media.items.${item.id}.badgeLabel`);
            return (
              <button
                key={item.id}
                onClick={() => setActiveVideoId(item.videoId)}
                className="bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden flex flex-col text-left group hover:border-[var(--gold)]/50 transition-colors duration-200 cursor-pointer"
                aria-label={t("home.featuredMedia.watchAria", { title })}
              >
                {/* Thumbnail with play button */}
                <div
                  className="w-full h-[160px] md:h-[200px] bg-cover bg-center relative flex items-center justify-center"
                  style={{ backgroundImage: `url('${ytThumb(item.videoId)}')` }}
                >
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-200" />
                  <div className="relative">
                    <PlayButton size="md" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex flex-col gap-3 p-5 md:p-6 flex-1">
                  {/* Tag + language badges */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-semibold tracking-[1.5px] text-[var(--gold)]">
                      {item.tag}
                    </span>
                    <LangBadge label={badgeLabel} variant={item.badgeVariant} />
                  </div>

                  <h3 className="text-[15px] md:text-[17px] font-bold text-[var(--text-primary)] leading-[1.2] group-hover:text-[var(--gold)] transition-colors duration-200">
                    {title}
                  </h3>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-[1.5]">
                    {desc}
                  </p>

                  {/* Meta footer */}
                  <p className="text-[11px] text-[var(--text-muted)] mt-auto pt-3 border-t border-[var(--border-default)]">
                    {item.duration} · {source}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        <Link
          href="/media"
          className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[1px] text-[var(--gold)] border border-[var(--gold)] px-8 py-4 hover:bg-[var(--gold)] hover:text-[var(--on-accent)] transition-colors"
        >
          {t("home.featuredMedia.cta")}
        </Link>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
