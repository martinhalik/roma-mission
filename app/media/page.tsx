"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import VideoModal from "@/components/VideoModal";
import { MEDIA_ITEMS, DOCUMENTARY_VIDEO_ID, ytThumb, BadgeVariant } from "@/lib/media-data";
import SectionLabel from "@/components/SectionLabel";

function LangBadge({ label, variant }: { label: string; variant: BadgeVariant }) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-semibold tracking-[0.5px] px-2 py-[3px] leading-none ${
        variant === "audio"
          ? "bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/40"
          : "text-[var(--text-muted)] border border-[var(--border-strong)]"
      }`}
    >
      {label}
    </span>
  );
}

const documentary = MEDIA_ITEMS.find((item) => item.tag === "DOCUMENTARY")!;

const interviews = MEDIA_ITEMS
  .filter((item) => item.tag === "INTERVIEW")
  .map((item) => ({
    ...item,
    thumb: ytThumb(item.videoId),
    desc: item.fullDesc,
  }));

const news = [
  {
    tag: "Field Report",
    date: "January 2026",
    title: "Three Baptisms in the Košice Settlement",
    desc: "Following months of catechism, three men from the Košice Roma community received Holy Baptism on the feast of Theophany.",
  },
  {
    tag: "Update",
    date: "December 2025",
    title: "New Parish Council Elected in Bucharest",
    desc: "The Bucharest mission parish held its first local parish council election, transferring leadership fully to local Roma laymen.",
  },
  {
    tag: "Field Report",
    date: "November 2025",
    title: "Youth Formation Program Reaches 80 Children",
    desc: "The expanded children's catechism program now serves 80 children weekly across four parishes in Romania and Slovakia.",
  },
];

export default function MediaPage() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

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
            <SectionLabel text="Media" />
            <h1 className="text-[34px] md:text-[48px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              Documented. Recorded.
              <br />
              Transparent.
            </h1>
            <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
              We believe in full transparency. Every story, every challenge,
              every breakthrough — documented and shared openly.
            </p>
          </div>
        </div>
      </section>

      {/* ── Documentary ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)] flex flex-col md:flex-row gap-10 md:gap-16 items-center">
        <button
          onClick={() => setActiveVideoId(DOCUMENTARY_VIDEO_ID)}
          className="w-full md:w-[600px] h-[220px] md:h-[400px] bg-[var(--bg-card)] border border-[var(--border-default)] flex-shrink-0 overflow-hidden relative group cursor-pointer"
          aria-label="Watch documentary"
        >
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: `url('${ytThumb(DOCUMENTARY_VIDEO_ID)}')` }}
          />
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-200" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[var(--gold)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[18px] border-l-[#111111] ml-1" />
            </div>
          </div>
        </button>
        <div className="flex flex-col gap-6 flex-1">
          <SectionLabel text="Documentary" />
          <h2 className="text-[28px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            {documentary.title}
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.7]">
            {documentary.fullDesc}
          </p>
          <div className="flex items-center gap-3 flex-wrap text-[12px] text-[var(--text-muted)]">
            <span>{documentary.duration}</span>
            <span>·</span>
            <span>{documentary.source}</span>
            <span>·</span>
            {documentary.badges.map((badge) => (
              <LangBadge key={badge.label} label={badge.label} variant={badge.variant} />
            ))}
          </div>
          <button
            onClick={() => setActiveVideoId(DOCUMENTARY_VIDEO_ID)}
            className="self-start px-8 py-4 bg-[var(--gold)] text-[#111111] text-[12px] font-bold tracking-[1px] hover:opacity-90 transition-opacity"
          >
            WATCH DOCUMENTARY
          </button>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Interviews ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-4 max-w-[500px] mb-10 md:mb-12">
          <SectionLabel text="Interviews" />
          <h2 className="text-[28px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[0.95]">
            Mission Conversations
          </h2>
          <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.6]">
            In-depth conversations about the mission — recorded in Slovak with
            English subtitles available on select episodes.
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {interviews.map((ep) => (
            <button
              key={ep.id}
              onClick={() => setActiveVideoId(ep.videoId)}
              className="flex flex-col gap-0 bg-[var(--bg-primary)] border border-[var(--border-default)] flex-1 text-left group hover:border-[var(--gold)]/50 transition-colors duration-200 overflow-hidden"
              aria-label={`Watch: ${ep.title}`}
            >
              {/* Thumbnail */}
              <div
                className="w-full h-[160px] bg-cover bg-center relative flex items-center justify-center"
                style={{ backgroundImage: `url('${ep.thumb}')` }}
              >
                <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors duration-200" />
                <div className="relative w-12 h-12 rounded-full bg-[var(--gold)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-b-[8px] border-b-transparent border-l-[14px] border-l-[#111111] ml-1" />
                </div>
              </div>

              {/* Info */}
              <div className="flex flex-col gap-4 p-6 md:p-7 flex-1">
                {/* Language badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  {ep.badges.map((badge) => (
                    <LangBadge
                      key={badge.label}
                      label={badge.label}
                      variant={badge.variant}
                    />
                  ))}
                </div>

                <div>
                  <h3 className="text-[15px] md:text-[16px] font-bold text-[var(--text-primary)] leading-[1.3] group-hover:text-[var(--gold)] transition-colors duration-200 mb-2">
                    {ep.title}
                  </h3>
                  <p className="text-[12px] md:text-[13px] text-[var(--text-secondary)] leading-[1.6]">
                    {ep.desc}
                  </p>
                </div>

                <div className="flex items-center justify-between mt-auto pt-3 border-t border-[var(--border-default)]">
                  <p className="text-[11px] text-[var(--text-muted)]">
                    with {ep.guest}
                  </p>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {ep.duration}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Field Reports / News ── */}
      {/* <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-10 md:mb-12">
          <div className="flex flex-col gap-4">
            <SectionLabel text="News" />
            <h2 className="text-[28px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[0.95]">
              Field Reports
            </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-5 md:gap-6">
          {news.map((n) => (
            <div
              key={n.title}
              className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden flex-1"
            >
              <div className="w-full h-[160px] bg-[var(--bg-elevated)]" />
              <div className="flex flex-col gap-3 p-5 md:p-6">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-semibold tracking-[1px] text-[var(--gold)] border border-[#D4AF3740] px-2 py-0.5">
                    {n.tag.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)]">
                    {n.date}
                  </span>
                </div>
                <h3 className="text-[15px] font-semibold text-[var(--text-primary)] leading-[1.3]">
                  {n.title}
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-[1.6]">
                  {n.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section> */}

      <CTASection />
      <Footer />
    </main>
  );
}
