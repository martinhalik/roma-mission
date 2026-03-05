"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import VideoModal from "@/components/VideoModal";
import Link from "next/link";
import { Users, BookOpen, Crown, Heart, House, LucideIcon } from "lucide-react";
import { MEDIA_ITEMS, ytThumb } from "@/lib/media-data";
import SectionLabel from "@/components/SectionLabel";
import LangBadge from "@/components/LangBadge";

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
        className={`w-0 h-0 border-t-transparent border-b-transparent border-l-[#111111] ml-1 ${arrow}`}
      />
    </div>
  );
}

const pillars = [
  {
    num: "01",
    title: "YOUTH AND CHILDREN\nFORMATION",
    desc: "Teaching young people through catechism, literacy, and structured programs rooted in the Church.",
  },
  {
    num: "02",
    title: "REMOVE SINS\nNOT CULTURE",
    desc: "We learn their language, way of speaking, cooking and culture. They learn our faith.",
  },
  {
    num: "03",
    title: "PRAYERS AND \nCHURCH INTEGRATION",
    desc: "We live a Eucharistic life, invite to church, and connect with other believers.",
  },
  {
    num: "04",
    title: "DISCIPLESHIP OF\nMEN AND FATHERS",
    desc: "Forming male leadership within the community through accountability and mentorship.",
  },
  {
    num: "05",
    title: "CHURCH PLANTING WITH\nLONG-TERM PRESENCE",
    desc: "Establishing permanent parishes, not short-term projects. We stay until the community owns its parish.",
  },
];

const resultCards: { Icon: LucideIcon; text: string }[] = [
  { Icon: Users, text: "Fathers begin working and providing for their families." },
  { Icon: BookOpen, text: "Children learn to read and write through church programs." },
  { Icon: Crown, text: "Public behavior changes — dignity returns." },
  { Icon: Heart, text: "Addiction decreases." },
  { Icon: House, text: "Families reconcile." },
];

const mediaItems = MEDIA_ITEMS.map((item) => ({
  ...item,
  thumb: ytThumb(item.videoId),
  desc: item.shortDesc,
  meta: `${item.duration} · ${item.source}`,
}));

export default function HomePage() {
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

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
            <SectionLabel text="Orthodox Roma Mission Europe" />
            <h1 className="text-[34px] md:text-[52px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              When Christ Is Present,
              <br />
              Everything Changes.
            </h1>
            <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
              Serving Roma communities in Slovakia for 10 years through education, activities,
              parish life, discipleship, and church planting.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-2">
              <Link
                href="/get-involved"
                className="px-6 md:px-8 py-4 bg-[var(--gold)] text-[#111111] text-[11px] font-bold tracking-[1px] text-center hover:opacity-90 transition-opacity"
              >
                SUPPORT THE MISSION
              </Link>
              <Link
                href="/get-involved"
                className="px-6 md:px-8 py-4 border border-[var(--gold)] text-[var(--gold)] text-[11px] font-semibold tracking-[1px] text-center hover:bg-[var(--gold)] hover:text-[#111111] transition-colors"
              >
                VOLUNTEER
              </Link>
              <Link
                href="/mission"
                className="px-6 md:px-8 py-4 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[11px] font-semibold tracking-[1px] text-center hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                LEARN MORE
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Urgency ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-6 md:gap-8 max-w-[700px] mb-12 md:mb-16">
          <SectionLabel text="The Urgency" />
          <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            The Future Is Being
            <br />
            Formed Now
          </h2>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.7]">
            Roma communities are the youngest and fastest-growing population in
            Europe — nearly 5 million people. Slovakia has the highest concentration in the world.
          </p>
        </div>

        {/* Urgency photos — 3-col row */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8 md:mb-12">
          <div className="h-[120px] md:h-[280px] overflow-hidden"><img src="/images/dolinka-od-mili-nov-2020-poster-00001.jpg" alt="Future" className="w-full h-full object-cover" /></div>
          <div className="h-[120px] md:h-[280px] overflow-hidden"><img src="/images/future.jpeg" alt="Future" className="w-full h-full object-cover" /></div>
          <div className="h-[120px] md:h-[280px] overflow-hidden"><img src="/images/future-church.jpg" alt="Future" className="w-full h-full object-cover" /></div>
        </div>

        {/* Statements */}
        <div className="flex flex-col gap-4 mb-6">
          {[
            "In many areas, parish life is weak or absent. Children are graduating unable to read or write.",
            "A generation is growing up without guidance.",
          ].map((s) => (
            <p
              key={s}
              className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.7] border-l-2 border-[var(--border-strong)] pl-4"
            >
              {s}
            </p>
          ))}
        </div>

        <div className="p-8 md:p-10 bg-[var(--bg-card)] border border-[var(--border-default)]">
          <p className="text-[15px] md:text-[17px] text-[var(--text-muted)] leading-[1.7]">
            If Christ is absent,{" "}
            <span className="text-[var(--text-secondary)]">instability grows.</span>
          </p>
          <p className="text-[15px] md:text-[17px] text-[var(--text-primary)] font-medium leading-[1.7] mt-2">
            If Christ is present,{" "}
            <span className="text-[var(--gold)]">families stabilize.</span>
          </p>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Results ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-6 max-w-[700px] mb-12 md:mb-16">
          <SectionLabel text="The Results" />
          <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            What Happens When
            <br />a Parish Is Planted
          </h2>
        </div>

        {/* Results photos — 3-col row */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="h-[100px] md:h-[240px] overflow-hidden"><img src="/images/roma-population-growing.jpeg" alt="Roma population growing" className="w-full h-full object-cover" /></div>
          <div className="h-[100px] md:h-[240px] overflow-hidden"><img src="/images/transformed-via-education.jpeg" alt="Roma children transformed via education" className="w-full h-full object-cover" /></div>
          <div className="h-[100px] md:h-[240px] overflow-hidden"><img src="/images/dignity-returns.jpg" alt="Dignity returns" className="w-full h-full object-cover" /></div>
        </div>

        {/* Results icon cards — Row 1 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {resultCards.slice(0, 3).map(({ Icon, text }, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-7 bg-[var(--bg-card)] border border-[var(--border-default)]"
            >
              <Icon className="w-[22px] h-[22px] text-[var(--gold)]" />
              <p className="text-[14px] font-medium text-[var(--text-secondary)] leading-[1.5]">
                {text}
              </p>
            </div>
          ))}
        </div>

        {/* Results icon cards — Row 2 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {resultCards.slice(3).map(({ Icon, text }, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 p-7 bg-[var(--bg-card)] border border-[var(--border-default)]"
            >
              <Icon className="w-[22px] h-[22px] text-[var(--gold)]" />
              <p className="text-[14px] font-medium text-[var(--text-secondary)] leading-[1.5]">
                {text}
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
          <SectionLabel text="Our Approach" />
          <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            Our Approach
          </h2>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
            Five pillars that ground every mission parish we plant.
          </p>
        </div>

        {/* Approach photo */}
        <div className="w-full h-[180px] md:h-[360px] mb-8 md:mb-12 overflow-hidden rounded-sm"><img src="/images/our-approach.jpg" alt="Our approach" className="w-full h-full object-cover" /></div>

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
                {p.title}
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                {p.desc}
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
                {p.title}
              </h3>
              <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                {p.desc}
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
            aria-label="Watch Laco's story"
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
              <SectionLabel text="Testimony" />
            </div>
            <span className="text-[var(--gold)] text-[120px] leading-[0.4] font-bold">
              &ldquo;
            </span>
            <blockquote className="text-[18px] md:text-[22px] font-medium text-[var(--text-primary)] leading-[1.5] -mt-8">
              That's why we were angry with him for not doing anything and he left us.
            </blockquote>
            <p className="text-[13px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
              — Laco, Slovakia
            </p>
            <div className="flex items-center gap-5 flex-wrap">
              <button
                onClick={() => setActiveVideoId(LACO_VIDEO_ID)}
                className="group flex items-center gap-2.5 text-[12px] font-semibold tracking-[1px] text-[var(--gold)] hover:opacity-80 transition-opacity cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full border border-[var(--gold)] flex items-center justify-center flex-shrink-0">
                  <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[7px] border-l-[var(--gold)] ml-0.5" />
                </div>
                WATCH HIS STORY
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
          <SectionLabel text="Mission Field" />
          <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            Where We Serve.
            <br />
            What&rsquo;s At Stake.
          </h2>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
            Slovakia has the highest Roma concentration per capita in Central
            Europe. We operate{" "}
            <span className="text-[var(--text-primary)] font-medium">
              12 active locations
            </span>{" "}
            — 8 parishes supported, 3 planted, 1 mission center, and another being built.
          </p>
        </div>

        {/* Interactive map — full width */}
        <div className="mb-8">
          {/* TEMP: Replace MissionMap with placeholder while debugging hydration issues */}
          <div className="relative w-full h-[420px] md:h-[540px] bg-[#0D0D0D] flex items-center justify-center">
            <span className="text-[11px] font-semibold tracking-[2px] text-[#444]">MAP (placeholder)</span>
          </div>
          {/* <MissionMap /> */}
        </div>

        {/* Stats bar */}
        <div className="px-5 md:px-[120px]">
          <div className="grid grid-cols-3 border border-[var(--border-default)] mb-8">
            {[
              { value: "8", label: "Parishes supported" },
              { value: "3", label: "Churches planted" },
              { value: "2016", label: "Active in Slovakia" },
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

          {/* <Link
            href="/locations"
            className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[1px] text-[var(--gold)] border border-[var(--gold)] px-8 py-4 hover:bg-[var(--gold)] hover:text-[#111111] transition-colors"
          >
            VIEW ALL LOCATIONS →
          </Link> */}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Featured Media ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-12">
          <SectionLabel text="Media Library" />
          <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            Documented. Recorded.
            <br />
            Transparent.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {mediaItems.map((item) => (
            <button
              key={item.tag + item.title}
              onClick={() => setActiveVideoId(item.videoId)}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden flex flex-col text-left group hover:border-[var(--gold)]/50 transition-colors duration-200 cursor-pointer"
              aria-label={`Watch: ${item.title}`}
            >
              {/* Thumbnail with play button */}
              <div
                className="w-full h-[160px] md:h-[200px] bg-cover bg-center relative flex items-center justify-center"
                style={{ backgroundImage: `url('${item.thumb}')` }}
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
                  {item.badges.map((badge) => (
                    <LangBadge
                      key={badge.label}
                      label={badge.label}
                      variant={badge.variant}
                    />
                  ))}
                </div>

                <h3 className="text-[15px] md:text-[17px] font-bold text-[var(--text-primary)] leading-[1.2] group-hover:text-[var(--gold)] transition-colors duration-200">
                  {item.title}
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-[1.5]">
                  {item.desc}
                </p>

                {/* Meta footer */}
                <p className="text-[11px] text-[var(--text-muted)] mt-auto pt-3 border-t border-[var(--border-default)]">
                  {item.meta}
                </p>
              </div>
            </button>
          ))}
        </div>

        <Link
          href="/media"
          className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[1px] text-[var(--gold)] border border-[var(--gold)] px-8 py-4 hover:bg-[var(--gold)] hover:text-[#111111] transition-colors"
        >
          EXPLORE MEDIA LIBRARY
        </Link>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
