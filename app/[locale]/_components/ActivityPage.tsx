"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import SectionLabel from "@/components/SectionLabel";
import ShareButton from "@/components/ShareButton";
import { useTranslation } from "@/components/LanguageProvider";
import { ArrowRight, Bell, Eye, HandHeart, Play, Share2 } from "lucide-react";
import type { TelegramPost, TelegramChannelStats } from "@/lib/telegram";

const TELEGRAM_URL = "https://t.me/romamissioneu";

const POST_KEYS = ["post1", "post2", "post3", "post4", "post5", "post6"] as const;
type PostKey = (typeof POST_KEYS)[number];

const PILLARS = [
  {
    Icon: HandHeart,
    titleKey: "activity.why.pillarPrayTitle",
    bodyKey: "activity.why.pillarPrayBody",
  },
  {
    Icon: Eye,
    titleKey: "activity.why.pillarWitnessTitle",
    bodyKey: "activity.why.pillarWitnessBody",
  },
  {
    Icon: Share2,
    titleKey: "activity.why.pillarShareTitle",
    bodyKey: "activity.why.pillarShareBody",
  },
] as const;

const STAT_TILES = [
  { valueKey: "activity.stats.stat1Value", labelKey: "activity.stats.stat1Label", subKey: "activity.stats.stat1Sub" },
  { valueKey: "activity.stats.stat2Value", labelKey: "activity.stats.stat2Label", subKey: "activity.stats.stat2Sub" },
  { valueKey: "activity.stats.stat3Value", labelKey: "activity.stats.stat3Label", subKey: "activity.stats.stat3Sub" },
  { valueKey: "activity.stats.stat4Value", labelKey: "activity.stats.stat4Label", subKey: "activity.stats.stat4Sub" },
] as const;

const WITNESS_KEYS = ["anna", "thomas", "eleni"] as const;
type WitnessKey = (typeof WITNESS_KEYS)[number];

function TelegramIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M21.944 4.317a1.07 1.07 0 0 0-1.142-.18L2.78 11.36a1.07 1.07 0 0 0 .067 2.013l4.142 1.297 1.602 5.111a1.07 1.07 0 0 0 1.81.37l2.32-2.412 4.244 3.118a1.07 1.07 0 0 0 1.69-.616l3.5-15.022a1.07 1.07 0 0 0-.211-.902ZM9.83 14.42l-.523 3.55-1.18-3.768 9.85-6.226-8.147 6.444Z" />
    </svg>
  );
}

function formatRelativeDate(iso: string, locale: string): string {
  if (!iso) return "";
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "";
  const diffMs = Date.now() - then;
  const minutes = Math.round(diffMs / 60_000);
  const hours = Math.round(diffMs / 3_600_000);
  const days = Math.round(diffMs / 86_400_000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (minutes < 60) return rtf.format(-minutes, "minute");
  if (hours < 24) return rtf.format(-hours, "hour");
  if (days < 30) return rtf.format(-days, "day");
  return new Date(then).toLocaleDateString(locale, { month: "short", day: "numeric" });
}

function TelegramPostCard({ post }: { post: TelegramPost }) {
  const { locale } = useTranslation();
  const primaryMedia = post.media[0];
  const extraMedia = Math.max(0, post.media.length - 1);
  const relative = formatRelativeDate(post.datetime, locale);

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] hover:border-[var(--gold)] transition-colors overflow-hidden"
    >
      {primaryMedia && (
        <div className="relative aspect-[4/3] overflow-hidden bg-[var(--bg-elevated)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primaryMedia.kind === "photo" ? primaryMedia.url : primaryMedia.poster}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {primaryMedia.kind === "video" && (
            <>
              <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-[var(--gold)] flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Play size={22} className="text-[var(--on-accent)] ml-0.5" fill="currentColor" />
                </div>
              </div>
            </>
          )}
          {extraMedia > 0 && (
            <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold tracking-[1px] rounded">
              +{extraMedia}
            </div>
          )}
        </div>
      )}

      <div className={`flex-1 flex flex-col gap-3 p-5 ${!primaryMedia ? "md:p-7" : ""}`}>
        <div className="flex items-center gap-2">
          <TelegramIcon size={12} />
          <span className="text-[10px] font-bold tracking-[1.5px] text-[var(--gold)] uppercase">
            @romamissioneu
          </span>
          {relative && (
            <>
              <span className="text-[var(--border-strong)]">·</span>
              <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">
                {relative}
              </span>
            </>
          )}
        </div>
        {post.text && (
          <p
            className={`text-[14px] md:text-[15px] text-[var(--text-primary)] leading-[1.6] whitespace-pre-line ${
              primaryMedia ? "line-clamp-4" : "line-clamp-6"
            }`}
          >
            {post.text}
          </p>
        )}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border-default)]">
          {post.views ? (
            <span className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)]">
              <Eye size={12} />
              {post.views}
            </span>
          ) : (
            <span />
          )}
          <span className="flex items-center gap-1 text-[10px] font-bold tracking-[1px] text-[var(--gold)] uppercase">
            <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </a>
  );
}

function StaticPostCard({ postKey }: { postKey: PostKey }) {
  const { t } = useTranslation();
  return (
    <article className="bg-[var(--bg-card)] border border-[var(--border-default)] p-5 md:p-6 hover:border-[var(--gold)] transition-colors flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <span className="text-[10px] font-bold tracking-[1.5px] text-[var(--gold)] uppercase">
          {t(`activity.channel.posts.${postKey}.place`)}
        </span>
        <span className="text-[var(--border-strong)]">·</span>
        <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">
          {t(`activity.channel.posts.${postKey}.date`)}
        </span>
      </div>
      <p className="text-[14px] md:text-[15px] text-[var(--text-primary)] leading-[1.65]">
        {t(`activity.channel.posts.${postKey}.body`)}
      </p>
      <div className="flex items-center gap-2 mt-auto pt-4 border-t border-[var(--border-default)]">
        <Eye size={12} className="text-[var(--text-muted)]" />
        <span className="text-[11px] text-[var(--text-muted)]">
          {t(`activity.channel.posts.${postKey}.views`)} {t("activity.channel.viewLabel")}
        </span>
      </div>
    </article>
  );
}

function HeroPreviewPost({ post }: { post: TelegramPost }) {
  const { locale } = useTranslation();
  const primaryMedia = post.media[0];
  const relative = formatRelativeDate(post.datetime, locale);

  return (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex gap-3 p-3 border-b border-[var(--border-default)] last:border-b-0 hover:bg-[var(--bg-elevated)] transition-colors"
    >
      {primaryMedia ? (
        <div className="relative w-16 h-16 flex-shrink-0 overflow-hidden bg-[var(--bg-elevated)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={primaryMedia.kind === "photo" ? primaryMedia.url : primaryMedia.poster}
            alt=""
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {primaryMedia.kind === "video" && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Play size={14} className="text-white ml-0.5" fill="currentColor" />
            </div>
          )}
        </div>
      ) : (
        <div className="w-16 h-16 flex-shrink-0 bg-[var(--bg-elevated)] flex items-center justify-center">
          <TelegramIcon size={20} />
        </div>
      )}
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        {relative && (
          <span className="text-[9px] tracking-[1px] text-[var(--gold)] uppercase font-bold">
            {relative}
          </span>
        )}
        <p className="text-[12px] text-[var(--text-primary)] leading-[1.4] line-clamp-3">
          {post.text || "Photo from the field"}
        </p>
      </div>
    </a>
  );
}

function StaticHeroPreviewItem({ postKey }: { postKey: PostKey }) {
  const { t } = useTranslation();
  return (
    <div className="p-4 border-b border-[var(--border-default)] last:border-b-0">
      <div className="flex items-center gap-2 mb-1.5">
        <span className="text-[9px] font-bold tracking-[1.5px] text-[var(--gold)] uppercase">
          {t(`activity.channel.posts.${postKey}.place`)}
        </span>
        <span className="text-[var(--border-strong)] text-[10px]">·</span>
        <span className="text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase">
          {t(`activity.channel.posts.${postKey}.date`)}
        </span>
      </div>
      <p className="text-[12px] text-[var(--text-primary)] leading-[1.5] line-clamp-3">
        {t(`activity.channel.posts.${postKey}.body`)}
      </p>
    </div>
  );
}

function WitnessCard({ witnessKey }: { witnessKey: WitnessKey }) {
  const { t } = useTranslation();
  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 md:p-8 flex flex-col gap-4">
      <span className="font-georgia text-[40px] text-[var(--gold)] leading-none">&ldquo;</span>
      <blockquote className="font-georgia text-[16px] md:text-[17px] text-[var(--text-primary)] leading-[1.55] italic">
        {t(`activity.witnesses.items.${witnessKey}.quote`)}
      </blockquote>
      <div className="mt-2 pt-4 border-t border-[var(--border-default)]">
        <p className="text-[13px] font-bold text-[var(--text-primary)]">
          {t(`activity.witnesses.items.${witnessKey}.author`)}
        </p>
        <p className="text-[11px] text-[var(--text-muted)] mt-1">
          {t(`activity.witnesses.items.${witnessKey}.context`)}
        </p>
      </div>
    </div>
  );
}

interface ActivityPageProps {
  posts?: TelegramPost[];
  stats?: TelegramChannelStats;
}

const FALLBACK_SUBSCRIBER_COUNT = "1,200+";

export default function ActivityPage({ posts = [], stats }: ActivityPageProps) {
  const { t } = useTranslation();
  const hasRealPosts = posts.length > 0;
  const heroPosts = posts.slice(0, 3);
  const feedPosts = posts;
  const subscriberCount = stats?.subscribers ?? FALLBACK_SUBSCRIBER_COUNT;

  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="activity" />

      {/* ── Hero ── */}
      <section className="relative w-full pt-24 md:pt-32 pb-16 md:pb-24 overflow-hidden bg-[var(--bg-primary)]">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-60"
          style={{
            background:
              "radial-gradient(circle at 80% 30%, color-mix(in srgb, var(--gold) 18%, transparent) 0%, transparent 55%)",
          }}
        />
        <div className="relative px-5 md:px-[120px] flex flex-col lg:flex-row items-start gap-10 lg:gap-16">
          <div className="flex-1 flex flex-col gap-5 md:gap-7 max-w-[640px]">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-60" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[var(--gold)]" />
              </span>
              <SectionLabel text={t("activity.hero.eyebrow")} />
            </div>
            <h1 className="text-[40px] md:text-[64px] font-bold tracking-[-1.5px] text-[var(--text-primary)] leading-[1.02]">
              {t("activity.hero.titleLine1")}
              <br />
              <span className="text-[var(--gold)]">{t("activity.hero.titleLine2")}</span>
            </h1>
            <p className="text-[16px] md:text-[19px] text-[var(--text-secondary)] leading-[1.6]">
              {t("activity.hero.subtitle")}
            </p>

            <div className="inline-flex items-center gap-3 self-start px-4 py-2.5 bg-[var(--bg-card)] border border-[var(--border-default)] rounded-full">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[var(--gold)] border-2 border-[var(--bg-card)]" />
                <div className="w-6 h-6 rounded-full bg-[var(--cream)] border-2 border-[var(--bg-card)]" />
                <div className="w-6 h-6 rounded-full bg-[var(--bg-elevated)] border-2 border-[var(--bg-card)]" />
              </div>
              <span className="text-[12px] text-[var(--text-secondary)]">
                {t("activity.hero.subscriberBadge", { count: subscriberCount })}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2.5 px-7 py-4 bg-[var(--gold)] text-[var(--on-accent)] text-[12px] font-bold tracking-[1px] hover:opacity-90 transition-opacity"
              >
                <TelegramIcon size={18} />
                {t("activity.hero.ctaJoin")}
              </a>
              <a
                href="#feed"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 border border-[var(--border-strong)] text-[var(--text-primary)] text-[12px] font-semibold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                {t("activity.hero.ctaFeed")}
                <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Right: phone-style channel preview */}
          <div className="w-full lg:w-[380px] flex-shrink-0">
            <div className="bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.4)]">
              <div className="flex items-center gap-3 p-4 bg-[var(--bg-elevated)] border-b border-[var(--border-default)]">
                <div className="w-12 h-12 rounded-full bg-[var(--gold)] flex items-center justify-center flex-shrink-0">
                  <span className="font-georgia text-[24px] text-[var(--on-accent)]">☦</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[var(--text-primary)] truncate">
                    {t("activity.channel.channelName")}
                  </p>
                  <p className="text-[11px] text-[var(--text-muted)] truncate">
                    {t("activity.channel.memberCount", { count: subscriberCount })}
                  </p>
                </div>
                <div className="flex items-center gap-1 px-2 py-1 bg-[var(--gold)]/15 rounded">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse" />
                  <span className="text-[9px] font-bold tracking-[1px] text-[var(--gold)]">
                    {t("activity.channel.liveDot")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col">
                {hasRealPosts
                  ? heroPosts.map((p) => <HeroPreviewPost key={p.id} post={p} />)
                  : POST_KEYS.slice(0, 3).map((k) => (
                      <StaticHeroPreviewItem key={k} postKey={k} />
                    ))}
              </div>

              <a
                href={TELEGRAM_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 py-3.5 bg-[var(--bg-elevated)] text-[var(--gold)] text-[11px] font-bold tracking-[1px] hover:opacity-80 transition-opacity"
              >
                <TelegramIcon size={14} />
                {t("activity.channel.openInTelegram")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Channel feed ── */}
      <section id="feed" className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)] scroll-mt-24">
        <div className="flex flex-col gap-4 max-w-[640px] mb-10 md:mb-14">
          <SectionLabel text={t("activity.channel.label")} />
          <h2 className="text-[30px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            {t("activity.channel.title")}
          </h2>
          <p className="text-[15px] md:text-[17px] text-[var(--text-secondary)] leading-[1.6]">
            {t("activity.channel.intro")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {hasRealPosts
            ? feedPosts.map((p) => <TelegramPostCard key={p.id} post={p} />)
            : POST_KEYS.map((k) => <StaticPostCard key={k} postKey={k} />)}
        </div>

        <div className="flex justify-center mt-10 md:mt-12">
          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-[var(--gold)] text-[var(--on-accent)] text-[12px] font-bold tracking-[1px] hover:opacity-90 transition-opacity"
          >
            <TelegramIcon size={18} />
            {t("activity.channel.seeAllOnTelegram")}
          </a>
        </div>
      </section>

      {/* ── Why follow ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-4 max-w-[640px] mb-10 md:mb-14">
          <SectionLabel text={t("activity.why.label")} />
          <h2 className="text-[30px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            {t("activity.why.titleLine1")}
            <br />
            {t("activity.why.titleLine2")}
          </h2>
          <p className="text-[15px] md:text-[17px] text-[var(--text-secondary)] leading-[1.6]">
            {t("activity.why.intro")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {PILLARS.map(({ Icon, titleKey, bodyKey }) => (
            <div key={titleKey} className="flex flex-col gap-4">
              <div className="w-12 h-12 flex items-center justify-center bg-[var(--gold)]/10 border border-[var(--gold)]/30">
                <Icon size={22} className="text-[var(--gold)]" />
              </div>
              <h3 className="text-[14px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                {t(titleKey)}
              </h3>
              <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.65]">
                {t(bodyKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-4 items-center text-center max-w-[640px] mx-auto mb-10 md:mb-14">
          <SectionLabel text={t("activity.stats.label")} />
          <h2 className="text-[30px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            {t("activity.stats.title")}
          </h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
          {STAT_TILES.map(({ valueKey, labelKey, subKey }, i) => {
            const overrideValue = i === 0 && stats?.subscribers ? stats.subscribers : null;
            return (
              <div
                key={valueKey}
                className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 md:p-8 flex flex-col gap-2"
              >
                <p className="font-georgia text-[40px] md:text-[56px] text-[var(--gold)] leading-none">
                  {overrideValue ?? t(valueKey)}
                </p>
                <p className="text-[12px] md:text-[13px] font-bold tracking-[1px] text-[var(--text-primary)] uppercase mt-2">
                  {t(labelKey)}
                </p>
                <p className="text-[11px] md:text-[12px] text-[var(--text-muted)]">
                  {t(subKey)}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Witnesses ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-4 max-w-[640px] mb-10 md:mb-14">
          <SectionLabel text={t("activity.witnesses.label")} />
          <h2 className="text-[30px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            {t("activity.witnesses.title")}
          </h2>
          <p className="text-[15px] md:text-[17px] text-[var(--text-secondary)] leading-[1.6]">
            {t("activity.witnesses.intro")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {WITNESS_KEYS.map((k) => (
            <WitnessCard key={k} witnessKey={k} />
          ))}
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="relative px-5 md:px-[120px] py-20 md:py-[120px] bg-[linear-gradient(180deg,var(--warm-bg)_0%,var(--bg-primary)_100%)] overflow-hidden">
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--gold) 22%, transparent) 0%, transparent 60%)",
          }}
        />
        <div className="relative flex flex-col items-center text-center max-w-[760px] mx-auto gap-7 md:gap-9">
          <span className="font-georgia text-[48px] md:text-[64px] text-[var(--gold)] leading-none">☦</span>
          <SectionLabel text={t("activity.cta.label")} />
          <h2 className="text-[34px] md:text-[56px] font-bold tracking-[-1.5px] text-[var(--text-primary)] leading-[1.02]">
            {t("activity.cta.titleLine1")}
            <br />
            <span className="text-[var(--gold)]">{t("activity.cta.titleLine2")}</span>
          </h2>
          <p className="text-[16px] md:text-[19px] text-[var(--text-secondary)] leading-[1.6] max-w-[560px]">
            {t("activity.cta.body")}
          </p>

          <a
            href={TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-[var(--gold)] text-[var(--on-accent)] text-[13px] font-bold tracking-[1.5px] hover:opacity-90 transition-opacity"
          >
            <TelegramIcon size={20} />
            {t("activity.cta.primary")}
          </a>

          <div className="flex flex-col items-center gap-4 pt-2">
            <p className="text-[10px] font-semibold tracking-[2px] text-[var(--text-muted)] uppercase flex items-center gap-2">
              <Bell size={12} />
              {t("activity.cta.shareLabel")}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <a
                href={`https://wa.me/?text=${encodeURIComponent(
                  `${t("activity.cta.titleLine1")} ${t("activity.cta.titleLine2")} — ${TELEGRAM_URL}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 border border-[var(--border-strong)] text-[var(--text-primary)] text-[11px] font-semibold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                {t("activity.cta.shareWhatsapp")}
              </a>
              <a
                href={`https://t.me/share/url?url=${encodeURIComponent(TELEGRAM_URL)}&text=${encodeURIComponent(
                  `${t("activity.cta.titleLine1")} ${t("activity.cta.titleLine2")}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 border border-[var(--border-strong)] text-[var(--text-primary)] text-[11px] font-semibold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                {t("activity.cta.shareTelegram")}
              </a>
              <ShareButton
                title={t("activity.hero.titleLine1") + " " + t("activity.hero.titleLine2")}
                text={t("activity.hero.subtitle")}
                url={TELEGRAM_URL}
                label="MORE"
                className="px-5 py-3 border border-[var(--border-strong)] text-[var(--text-primary)] text-[11px] font-semibold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 mt-6 pt-8 border-t border-[var(--border-default)] w-full max-w-[480px]">
            <blockquote className="font-georgia italic text-[16px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6]">
              {t("activity.cta.scripture")}
            </blockquote>
            <p className="text-[11px] tracking-[1.5px] text-[var(--gold)] font-semibold uppercase">
              — {t("activity.cta.scriptureRef")}
            </p>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
