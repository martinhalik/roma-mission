"use client";

import { useEffect, useState } from "react";
import {
  ChevronDown,
  Plus,
  Minus,
  MapPin,
  Cross,
  ArrowRight,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import LocaleLink from "@/components/LocaleLink";
import ShareButton from "@/components/ShareButton";
import { useTranslation } from "@/components/LanguageProvider";
import { buildPath } from "@/lib/i18n/routes";

const SHARE_URL_PATH = "/heritage";
const SITE_URL = "https://romamission.eu";

const TIMELINE_KEYS = ["era1", "era2", "era3", "era4", "era5"] as const;
type EraKey = (typeof TIMELINE_KEYS)[number];

const TRADITION_KEYS = [
  "slava",
  "feastDays",
  "baptism",
  "music",
  "icons",
  "language",
] as const;
type TraditionKey = (typeof TRADITION_KEYS)[number];

const COUNTRY_KEYS = [
  "ro",
  "bg",
  "rs",
  "mk",
  "gr",
  "ua",
  "ru",
  "sk",
] as const;
type CountryKey = (typeof COUNTRY_KEYS)[number];

const COUNTRY_META: Record<
  CountryKey,
  { iso: string; flag: string; pop: string }
> = {
  ro: { iso: "RO", flag: "🇷🇴", pop: "~1.9M" },
  bg: { iso: "BG", flag: "🇧🇬", pop: "~750K" },
  rs: { iso: "RS", flag: "🇷🇸", pop: "~600K" },
  mk: { iso: "MK", flag: "🇲🇰", pop: "~200K" },
  gr: { iso: "GR", flag: "🇬🇷", pop: "~265K" },
  ua: { iso: "UA", flag: "🇺🇦", pop: "~260K" },
  ru: { iso: "RU", flag: "🇷🇺", pop: "~205K" },
  sk: { iso: "SK", flag: "🇸🇰", pop: "~440K" },
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

function StructuredData({
  locale,
  url,
  title,
  description,
}: {
  locale: string;
  url: string;
  title: string;
  description: string;
}) {
  const data = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        "@id": `${url}#article`,
        headline: title,
        description,
        inLanguage: locale,
        image: `${SITE_URL}/images/klenovec-chapel.jpeg`,
        author: { "@type": "Organization", name: "Christian Roma Mission" },
        publisher: {
          "@type": "Organization",
          name: "Christian Roma Mission",
          logo: {
            "@type": "ImageObject",
            url: `${SITE_URL}/logo.png`,
          },
        },
        mainEntityOfPage: url,
        about: [
          { "@type": "Thing", name: "Roma people" },
          { "@type": "Thing", name: "Orthodox Christianity" },
          { "@type": "Thing", name: "Byzantine Empire" },
          { "@type": "Thing", name: "Romani language" },
          { "@type": "Thing", name: "Religious heritage" },
        ],
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/${locale}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: title,
            item: url,
          },
        ],
      },
    ],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string>(ids[0] ?? "");
  useEffect(() => {
    if (typeof window === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort(
            (a, b) =>
              (a.target.getBoundingClientRect().top || 0) -
              (b.target.getBoundingClientRect().top || 0)
          );
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-30% 0px -55% 0px", threshold: 0 }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);
  return active;
}

function TOC() {
  const { t } = useTranslation();
  const active = useActiveSection([
    "origins",
    "timeline",
    "faith",
    "traditions",
    "today",
    "continue",
  ]);
  const items: { id: string; label: string }[] = [
    { id: "origins", label: t("heritage.toc.origins") },
    { id: "timeline", label: t("heritage.toc.timeline") },
    { id: "faith", label: t("heritage.toc.faith") },
    { id: "traditions", label: t("heritage.toc.traditions") },
    { id: "today", label: t("heritage.toc.today") },
    { id: "continue", label: t("heritage.toc.continue") },
  ];
  return (
    <nav
      aria-label={t("heritage.toc.label")}
      className="hidden xl:block sticky top-32 self-start"
    >
      <div className="text-[10px] font-bold tracking-[2px] text-[var(--gold)] uppercase mb-4">
        {t("heritage.toc.label")}
      </div>
      <ul className="flex flex-col gap-3 border-l border-[var(--border-default)] pl-4">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`block text-[12px] tracking-[1px] uppercase transition-colors ${
                  isActive
                    ? "text-[var(--gold)] font-semibold"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

function FactCard({
  stat,
  title,
  body,
}: {
  stat: string;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-3 bg-[var(--bg-card)] border border-[var(--border-default)] p-6 md:p-7 hover:border-[var(--gold)]/40 transition-colors">
      <span className="text-[28px] md:text-[32px] font-georgia text-[var(--gold)] leading-none">
        {stat}
      </span>
      <h3 className="text-[15px] md:text-[16px] font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.65]">
        {body}
      </p>
    </div>
  );
}

function TimelineAccordion() {
  const { t } = useTranslation();
  const [open, setOpen] = useState<EraKey | null>("era1");
  return (
    <ol className="flex flex-col" role="list">
      {TIMELINE_KEYS.map((era, idx) => {
        const isOpen = open === era;
        return (
          <li
            key={era}
            className="border-t border-[var(--border-default)] last:border-b"
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : era)}
              aria-expanded={isOpen}
              aria-controls={`era-panel-${era}`}
              className="w-full flex items-start gap-4 md:gap-8 py-6 md:py-7 text-left cursor-pointer group"
            >
              <span className="hidden md:block w-10 text-[11px] font-bold tracking-[2px] text-[var(--gold)] uppercase pt-1 shrink-0">
                {String(idx + 1).padStart(2, "0")}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-[11px] font-bold tracking-[2px] text-[var(--gold)] uppercase mb-2">
                  {t(`heritage.timeline.eras.${era}.range`)}
                </div>
                <h3 className="text-[18px] md:text-[22px] font-semibold text-[var(--text-primary)] leading-[1.3]">
                  {t(`heritage.timeline.eras.${era}.heading`)}
                </h3>
              </div>
              <span
                className={`shrink-0 mt-1 transition-transform duration-300 text-[var(--text-secondary)] group-hover:text-[var(--gold)] ${
                  isOpen ? "rotate-45" : ""
                }`}
                aria-hidden
              >
                <Plus size={20} />
              </span>
            </button>
            <div
              id={`era-panel-${era}`}
              hidden={!isOpen}
              className="pb-7 md:pl-[72px] md:pr-12 -mt-2"
            >
              <p className="text-[14px] md:text-[16px] text-[var(--text-secondary)] leading-[1.75] font-georgia">
                {t(`heritage.timeline.eras.${era}.body`)}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function TraditionCard({ id }: { id: TraditionKey }) {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      onClick={() => setOpen((v) => !v)}
      aria-expanded={open}
      className="group text-left bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--gold)]/50 transition-colors cursor-pointer flex flex-col"
    >
      <div className="flex items-start justify-between gap-3 p-5 md:p-6">
        <div className="flex-1 min-w-0">
          <div className="text-[10px] font-bold tracking-[2px] text-[var(--gold)] uppercase mb-2">
            {t(`heritage.traditions.cards.${id}.subtitle`)}
          </div>
          <h3 className="text-[20px] md:text-[24px] font-georgia text-[var(--text-primary)] leading-[1.2]">
            {t(`heritage.traditions.cards.${id}.title`)}
          </h3>
        </div>
        <span
          className="shrink-0 text-[var(--text-muted)] group-hover:text-[var(--gold)] transition-colors mt-1"
          aria-hidden
        >
          {open ? <Minus size={18} /> : <Plus size={18} />}
        </span>
      </div>
      {open && (
        <div className="px-5 md:px-6 pb-5 md:pb-6 pt-1">
          <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.7]">
            {t(`heritage.traditions.cards.${id}.body`)}
          </p>
        </div>
      )}
    </button>
  );
}

function CountryCard({ id }: { id: CountryKey }) {
  const { t } = useTranslation();
  const meta = COUNTRY_META[id];
  return (
    <div className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden">
      <div className="flex items-center justify-between gap-3 p-5 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-[22px] leading-none">{meta.flag}</span>
          <h3 className="text-[15px] md:text-[16px] font-bold text-[var(--text-primary)] truncate">
            {t(`countries.${meta.iso}`)}
          </h3>
        </div>
        <span className="text-[11px] font-semibold tracking-[1px] text-[var(--gold)] uppercase shrink-0">
          {meta.pop}
        </span>
      </div>
      <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.7] p-5">
        {t(`heritage.today.countries.${id}`)}
      </p>
    </div>
  );
}

export default function HeritagePage() {
  const { t, locale } = useTranslation();
  const url = `${SITE_URL}${buildPath(locale, "heritage")}`;
  const shareTitle = t("metadata.heritage.ogTitle");
  const shareText = t("heritage.shareNudge.text");

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <Navbar activePage="heritage" />
      <StructuredData
        locale={locale}
        url={url}
        title={t("metadata.heritage.title")}
        description={t("metadata.heritage.description")}
      />

      {/* ────────────────────────────────────────────────────────── HERO ── */}
      <section className="relative pt-32 lg:pt-40 pb-16 md:pb-24 overflow-hidden">
        {/* Backdrop image */}
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "url('/images/klenovec-chapel.jpeg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.18,
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "linear-gradient(180deg, var(--bg-primary) 0%, rgba(17,17,17,0.55) 45%, var(--bg-primary) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.12] pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, var(--gold) 0, transparent 35%), radial-gradient(circle at 80% 85%, var(--gold) 0, transparent 40%)",
          }}
        />
        <div className="relative max-w-[1400px] mx-auto px-5 md:px-10 xl:px-20">
          <div className="max-w-[820px]">
            <div className="flex items-center gap-4 mb-8">
              <span className="font-georgia text-[44px] md:text-[56px] text-[var(--gold)] leading-none">
                ☦
              </span>
              <div className="h-px flex-1 bg-[var(--gold)]/40 max-w-[160px]" />
              <SectionLabel text={t("heritage.hero.label")} />
            </div>
            <h1 className="font-georgia text-[42px] md:text-[64px] xl:text-[80px] leading-[1.05] text-[var(--text-primary)] tracking-tight">
              {t("heritage.hero.titleLine1")}
              <br />
              <span className="text-[var(--gold)] italic">
                {t("heritage.hero.titleLine2")}
              </span>
            </h1>
            <p className="mt-8 md:mt-10 text-[16px] md:text-[20px] leading-[1.65] text-[var(--text-secondary)] max-w-[680px] font-georgia">
              {t("heritage.hero.subtitle")}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#origins"
                className="inline-flex items-center gap-2 bg-[var(--gold)] text-[var(--on-accent)] px-6 py-4 text-[11px] font-bold tracking-[1.5px] uppercase hover:opacity-90 transition-opacity"
              >
                {t("heritage.hero.scrollHint")}
                <ChevronDown size={14} />
              </a>
              <ShareButton
                title={shareTitle}
                text={shareText}
                url={url}
                label={t("heritage.hero.shareLabel").toUpperCase()}
                className="px-6 py-4 border border-[var(--border-strong)] text-[11px] font-bold tracking-[1.5px] uppercase hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────────────────────────────────── BODY + TOC ── */}
      <div className="max-w-[1400px] mx-auto px-5 md:px-10 xl:px-20 grid xl:grid-cols-[200px_minmax(0,1fr)] gap-12">
        <TOC />

        <div className="flex flex-col gap-24 md:gap-32 pb-24">
          {/* ───── ORIGINS ─────────────────────────────────────────── */}
          <section id="origins" className="scroll-mt-28">
            <SectionLabel text={t("heritage.origins.label")} />
            <h2 className="mt-6 font-georgia text-[32px] md:text-[44px] xl:text-[56px] leading-[1.1] text-[var(--text-primary)] max-w-[820px]">
              {t("heritage.origins.title")}
            </h2>
            <div className="mt-10 grid lg:grid-cols-2 gap-10 lg:gap-16 max-w-[1000px]">
              <p className="text-[15px] md:text-[17px] leading-[1.8] text-[var(--text-secondary)] font-georgia">
                {t("heritage.origins.intro")}
              </p>
              <div className="flex flex-col gap-6">
                <p className="text-[14px] md:text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  {t("heritage.origins.body1")}
                </p>
                <p className="text-[14px] md:text-[15px] leading-[1.8] text-[var(--text-secondary)]">
                  {t("heritage.origins.body2")}
                </p>
              </div>
            </div>
            <div className="mt-12 grid md:grid-cols-3 gap-4 md:gap-6">
              <FactCard
                stat={t("heritage.origins.factCards.a.stat")}
                title={t("heritage.origins.factCards.a.title")}
                body={t("heritage.origins.factCards.a.body")}
              />
              <FactCard
                stat={t("heritage.origins.factCards.b.stat")}
                title={t("heritage.origins.factCards.b.title")}
                body={t("heritage.origins.factCards.b.body")}
              />
              <FactCard
                stat={t("heritage.origins.factCards.c.stat")}
                title={t("heritage.origins.factCards.c.title")}
                body={t("heritage.origins.factCards.c.body")}
              />
            </div>
          </section>

          {/* ───── TIMELINE ────────────────────────────────────────── */}
          <section id="timeline" className="scroll-mt-28">
            <SectionLabel text={t("heritage.timeline.label")} />
            <h2 className="mt-6 font-georgia text-[32px] md:text-[44px] xl:text-[56px] leading-[1.1] text-[var(--text-primary)] max-w-[820px]">
              {t("heritage.timeline.title")}
            </h2>
            <p className="mt-6 text-[14px] md:text-[15px] text-[var(--text-secondary)] max-w-[640px]">
              {t("heritage.timeline.intro")}
            </p>
            <div className="mt-10 max-w-[920px]">
              <TimelineAccordion />
            </div>
          </section>

          {/* ───── SHARED FAITH ────────────────────────────────────── */}
          <section id="faith" className="scroll-mt-28">
            <SectionLabel text={t("heritage.faith.label")} />
            <h2 className="mt-6 font-georgia text-[32px] md:text-[44px] xl:text-[56px] leading-[1.1] text-[var(--text-primary)] max-w-[820px]">
              {t("heritage.faith.title")}
            </h2>
            <p className="mt-6 text-[15px] md:text-[17px] leading-[1.8] text-[var(--text-secondary)] max-w-[820px] font-georgia">
              {t("heritage.faith.intro")}
            </p>

            {/* Catechumen callout — the heart of the framing */}
            <div className="mt-10 relative border-l-2 border-[var(--gold)] bg-[var(--bg-card)] p-6 md:p-10 max-w-[920px]">
              <div className="flex items-center gap-3 mb-4">
                <Cross size={16} className="text-[var(--gold)]" />
                <span className="text-[10px] font-bold tracking-[2px] text-[var(--gold)] uppercase">
                  {t("heritage.faith.catechumenLabel")}
                </span>
              </div>
              <p className="text-[16px] md:text-[19px] leading-[1.75] text-[var(--text-primary)] font-georgia">
                {t("heritage.faith.catechumenBody")}
              </p>
            </div>

            <div className="mt-12 grid md:grid-cols-3 gap-5 md:gap-6">
              {(["byzantium", "balkans", "liturgy"] as const).map((col) => (
                <div
                  key={col}
                  className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 md:p-7"
                >
                  <div className="text-[10px] font-bold tracking-[2px] text-[var(--gold)] uppercase mb-3">
                    {t(`heritage.faith.columns.${col}.title`)}
                  </div>
                  <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.75]">
                    {t(`heritage.faith.columns.${col}.body`)}
                  </p>
                </div>
              ))}
            </div>

            <figure className="mt-14 max-w-[820px]">
              <blockquote className="border-l-2 border-[var(--gold)] pl-6 py-2">
                <p className="text-[18px] md:text-[24px] font-georgia italic text-[var(--text-primary)] leading-[1.5]">
                  &ldquo;{t("heritage.faith.pullQuote")}&rdquo;
                </p>
              </blockquote>
              <figcaption className="mt-4 pl-6 text-[11px] font-semibold tracking-[1.5px] text-[var(--text-muted)] uppercase">
                — {t("heritage.faith.pullQuoteAttribution")}
              </figcaption>
            </figure>
          </section>

          {/* ───── LIVING TRADITIONS ───────────────────────────────── */}
          <section id="traditions" className="scroll-mt-28">
            <SectionLabel text={t("heritage.traditions.label")} />
            <h2 className="mt-6 font-georgia text-[32px] md:text-[44px] xl:text-[56px] leading-[1.1] text-[var(--text-primary)] max-w-[820px]">
              {t("heritage.traditions.title")}
            </h2>
            <p className="mt-6 text-[14px] md:text-[15px] text-[var(--text-secondary)] max-w-[640px]">
              {t("heritage.traditions.intro")}
            </p>
            <p className="mt-3 text-[11px] tracking-[1.5px] uppercase text-[var(--text-muted)]">
              {t("heritage.traditions.tapHint")}
            </p>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
              {TRADITION_KEYS.map((k) => (
                <TraditionCard key={k} id={k} />
              ))}
            </div>
          </section>

          {/* ───── TODAY ───────────────────────────────────────────── */}
          <section id="today" className="scroll-mt-28">
            <SectionLabel text={t("heritage.today.label")} />
            <h2 className="mt-6 font-georgia text-[32px] md:text-[44px] xl:text-[56px] leading-[1.1] text-[var(--text-primary)] max-w-[900px]">
              {t("heritage.today.title")}
            </h2>
            <p className="mt-6 text-[15px] md:text-[17px] leading-[1.8] text-[var(--text-secondary)] max-w-[820px] font-georgia">
              {t("heritage.today.intro")}
            </p>
            <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {COUNTRY_KEYS.map((c) => (
                <CountryCard key={c} id={c} />
              ))}
            </div>
            <p className="mt-6 text-[11px] text-[var(--text-muted)] italic max-w-[820px] leading-[1.6]">
              {t("heritage.today.footnote")}
            </p>
          </section>

          {/* ───── CONTINUE / CTA ──────────────────────────────────── */}
          <section id="continue" className="scroll-mt-28">
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-8 md:p-14 relative overflow-hidden">
              <div
                aria-hidden
                className="absolute -top-10 -right-10 font-georgia text-[200px] text-[var(--gold)]/[0.06] leading-none select-none"
              >
                ☦
              </div>
              <SectionLabel text={t("heritage.closing.label")} />
              <h2 className="mt-6 font-georgia text-[28px] md:text-[40px] xl:text-[48px] leading-[1.15] text-[var(--text-primary)] max-w-[720px]">
                {t("heritage.closing.title")}
              </h2>
              <p className="mt-6 text-[15px] md:text-[17px] leading-[1.8] text-[var(--text-secondary)] max-w-[760px]">
                {t("heritage.closing.body")}
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-4">
                <LocaleLink
                  routeKey="getInvolved"
                  className="inline-flex items-center gap-2 bg-[var(--gold)] text-[var(--on-accent)] px-6 py-4 text-[11px] font-bold tracking-[1.5px] uppercase hover:opacity-90 transition-opacity"
                >
                  {t("heritage.closing.ctaSupport")}
                  <ArrowRight size={14} />
                </LocaleLink>
                <LocaleLink
                  routeKey="mission"
                  className="inline-flex items-center gap-2 px-6 py-4 border border-[var(--border-strong)] text-[11px] font-bold tracking-[1.5px] uppercase hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
                >
                  <MapPin size={14} />
                  {t("heritage.closing.ctaMission")}
                </LocaleLink>
              </div>
            </div>

            {/* Share nudge */}
            <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-5 border-t border-[var(--border-default)] pt-10">
              <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] max-w-[600px] leading-[1.7]">
                {t("heritage.shareNudge.text")}
              </p>
              <ShareButton
                title={shareTitle}
                text={shareText}
                url={url}
                label={t("heritage.shareNudge.shareLabel").toUpperCase()}
                className="px-6 py-4 bg-[var(--gold)] text-[var(--on-accent)] text-[11px] font-bold tracking-[1.5px] uppercase hover:opacity-90 transition-opacity shrink-0"
              />
            </div>
          </section>
        </div>
      </div>

      <CTASection />
      <Footer />
    </div>
  );
}
