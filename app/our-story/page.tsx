"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import VideoModal from "@/components/VideoModal";
import Link from "next/link";
import { useTranslation } from "@/components/LanguageProvider";

const DOCUMENTARY_VIDEO_ID = "K-IDNefOa98";
const UKULELE_VIDEO_ID = "e8br0VciKcI";
const SETTLEMENT_VIDEO_ID = "WTOKmft8p6M";

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

function Year({ year }: { year: string }) {
  return (
    <div className="flex items-center gap-4 mb-8">
      <span className="text-[11px] font-bold tracking-[3px] text-[var(--gold)] uppercase">
        {year}
      </span>
      <div className="flex-1 h-px bg-[var(--border-default)]" />
    </div>
  );
}

function PullQuote({ quote, author, original }: { quote: string; author?: string; original?: string }) {
  return (
    <div className="border-l-2 border-[var(--gold)] pl-6 py-2 my-10">
      <p className="text-[17px] md:text-[20px] font-georgia italic text-[var(--text-primary)] leading-[1.7]">
        &ldquo;{quote}&rdquo;
      </p>
      {original && (
        <p className="text-[12px] text-[var(--text-muted)] leading-[1.6] mt-2 italic">
          &ldquo;{original}&rdquo;
        </p>
      )}
      {author && (
        <p className="text-[11px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase mt-3">
          — {author}
        </p>
      )}
    </div>
  );
}

interface StoryPhotoProps {
  src: string;
  alt: string;
  caption: string;
  position?: string;
}

function StoryPhoto({ src, alt, caption, position = "center" }: StoryPhotoProps) {
  return (
    <figure className="my-10 -mx-5 md:mx-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="w-full max-h-[480px] object-cover"
        style={{ objectPosition: position }}
      />
      <figcaption className="px-5 md:px-0 pt-3 text-[11px] text-[var(--text-muted)] leading-[1.6] italic border-t border-[var(--border-default)] mt-3">
        {caption}
      </figcaption>
    </figure>
  );
}

interface StoryVideoProps {
  videoId: string;
  caption: string;
  playLabel: string;
  onPlay: (id: string) => void;
}

function StoryVideo({ videoId, caption, playLabel, onPlay }: StoryVideoProps) {
  return (
    <figure className="my-10 -mx-5 md:mx-0">
      <button
        onClick={() => onPlay(videoId)}
        className="group relative w-full overflow-hidden cursor-pointer block"
        aria-label={playLabel}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          alt={caption}
          className="w-full max-h-[480px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors flex items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-white/10 border border-white/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
            <div className="w-0 h-0 border-t-[9px] border-t-transparent border-b-[9px] border-b-transparent border-l-[16px] border-l-white ml-1" />
          </div>
        </div>
      </button>
      <figcaption className="px-5 md:px-0 pt-3 text-[11px] text-[var(--text-muted)] leading-[1.6] italic border-t border-[var(--border-default)] mt-3">
        {caption}
      </figcaption>
    </figure>
  );
}

export default function OurStoryPage() {
  const { t } = useTranslation();
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="mission" />

      {/* ── Hero video ── */}
      <section className="relative w-full h-[380px] md:h-[500px] overflow-hidden">
        <video
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/images/dolinka-od-mili-nov-2020-poster-00001.jpg"
        >
          <source src="/images/dolinka-od-mili-nov-2020-transcode.mp4" type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, #111111F5 0%, #11111199 55%, #11111155 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-end h-full px-5 md:px-[120px] pb-12 md:pb-16">
          <div className="flex flex-col gap-4 max-w-[680px]">
            <Link
              href="/mission"
              className="text-[10px] font-semibold tracking-[1.5px] text-white/70 hover:text-white transition-colors w-fit"
            >
              {t("ourStory.hero.backToMission")}
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-[3px] h-[14px] bg-[var(--gold)]" />
              <span className="text-[11px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
                {t("ourStory.hero.label")}
              </span>
            </div>
            <h1 className="text-[32px] md:text-[50px] font-bold tracking-[-1.5px] text-white leading-[1.05]">
              {t("ourStory.hero.titleLine1")}
              <br />
              {t("ourStory.hero.titleLine2")}
              <br />
              {t("ourStory.hero.titleLine3")}
            </h1>
            <p className="text-[13px] md:text-[15px] text-white/80 leading-[1.6]">
              {t("ourStory.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Story Body ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px]">
        <div className="max-w-[700px]">

          <Year year={t("ourStory.timeline.yearLabel.before2016")} />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            {t("ourStory.timeline.before2016.heading")}
          </h2>

          <PullQuote
            quote={t("ourStory.timeline.before2016.pullQuote")}
            original={t("ourStory.timeline.before2016.pullQuoteOriginal")}
            author={t("ourStory.authorMartinFounder")}
          />

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.before2016.body1")}
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.before2016.body2")}
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          <Year year={t("ourStory.timeline.yearLabel.y2016")} />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            {t("ourStory.timeline.year2016.heading")}
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.year2016.body1")}
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.year2016.body2")}
          </p>

          <StoryPhoto
            src="/images/krm-history-2016.png"
            alt={t("ourStory.timeline.year2016.photoAlt")}
            caption={t("ourStory.timeline.year2016.photoCaption")}
            position="center top"
          />

          <PullQuote
            quote={t("ourStory.timeline.year2016.pullQuote")}
            original={t("ourStory.timeline.year2016.pullQuoteOriginal")}
            author={t("ourStory.authorMartin")}
          />

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.year2016.body3")}
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          <Year year={t("ourStory.timeline.yearLabel.y2017")} />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            {t("ourStory.timeline.year2017.heading")}
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.year2017.body1")}
          </p>

          <PullQuote
            quote={t("ourStory.timeline.year2017.pullQuote")}
            original={t("ourStory.timeline.year2017.pullQuoteOriginal")}
          />

          <StoryVideo
            videoId={UKULELE_VIDEO_ID}
            caption={t("ourStory.timeline.year2017.videoCaptionUkulele")}
            playLabel={t("ourStory.videoPlayAria")}
            onPlay={setActiveVideoId}
          />

          <StoryPhoto
            src="/images/krm-sports-club.jpg"
            alt={t("ourStory.timeline.year2017.photoAlt")}
            caption={t("ourStory.timeline.year2017.photoCaption")}
          />

          <StoryVideo
            videoId={SETTLEMENT_VIDEO_ID}
            caption={t("ourStory.timeline.year2017.videoCaptionSettlement")}
            playLabel={t("ourStory.videoPlayAria")}
            onPlay={setActiveVideoId}
          />

          <div className="h-px bg-[var(--border-default)] my-12" />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            {t("ourStory.timeline.movingIn.heading")}
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.movingIn.body1")}
          </p>

          <PullQuote
            quote={t("ourStory.timeline.movingIn.pullQuote")}
            original={t("ourStory.timeline.movingIn.pullQuoteOriginal")}
          />

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.movingIn.body2")}
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          <Year year={t("ourStory.timeline.yearLabel.y2018")} />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            {t("ourStory.timeline.year2018.heading")}
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.year2018.body1")}
          </p>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 md:p-8 my-10">
            <span className="font-georgia text-[var(--gold)] text-[14px] italic block mb-3">
              {t("ourStory.timeline.year2018.bibleRef")}
            </span>
            <p className="text-[16px] md:text-[18px] font-georgia italic text-[var(--text-primary)] leading-[1.7]">
              &ldquo;{t("ourStory.timeline.year2018.bibleQuote")}&rdquo;
            </p>
          </div>

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.year2018.body2")}
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.year2018.body3")}
          </p>

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5 italic text-[var(--text-muted)]">
            &ldquo;{t("ourStory.timeline.year2018.michalkaQuote")}&rdquo;
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          <Year year={t("ourStory.timeline.yearLabel.y2019")} />

          <StoryPhoto
            src="/images/krm-michalka-2019.jpg"
            alt={t("ourStory.timeline.year2019.photoAlt")}
            caption={t("ourStory.timeline.year2019.photoCaption")}
          />

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.year2019.body1")}
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.year2019.body2")}
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          <Year year={t("ourStory.timeline.yearLabel.y2020")} />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            {t("ourStory.timeline.year2020.heading")}
          </h2>

          <StoryPhoto
            src="/images/krm-michalka-cross-2020.jpeg"
            alt={t("ourStory.timeline.year2020.photoAlt")}
            caption={t("ourStory.timeline.year2020.photoCaption")}
          />

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.year2020.body1")}
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.year2020.body2")}
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          <Year year={t("ourStory.timeline.yearLabel.today")} />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            {t("ourStory.timeline.today.heading")}
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.today.body1")}
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            {t("ourStory.timeline.today.body2")}
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          {/* Documentary catch */}
          <div className="flex flex-col gap-4 mb-6">
            <SectionLabel text={t("ourStory.documentary.label")} />
          </div>

          <button
            onClick={() => setActiveVideoId(DOCUMENTARY_VIDEO_ID)}
            className="group relative w-full overflow-hidden border border-[var(--border-default)] hover:border-[var(--gold)]/40 transition-colors text-left cursor-pointer"
            aria-label={t("ourStory.documentary.watchAria")}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://img.youtube.com/vi/${DOCUMENTARY_VIDEO_ID}/hqdefault.jpg`}
              alt={t("ourStory.documentary.imageAlt")}
              className="w-full h-[220px] md:h-[320px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[18px] border-l-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
              <span className="text-[9px] font-bold tracking-[2px] text-[var(--gold)] uppercase block mb-1">
                {t("ourStory.documentary.tag")}
              </span>
              <p className="text-[15px] md:text-[17px] font-bold text-white leading-[1.3]">
                {t("ourStory.documentary.title")}
              </p>
              <p className="text-[12px] text-white/60 mt-1">
                {t("ourStory.documentary.subtitle")}
              </p>
            </div>
          </button>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-10 border-t border-[var(--border-default)]">
            <Link
              href="/mission"
              className="inline-flex items-center justify-center bg-[var(--gold)] text-black text-[12px] font-bold tracking-[1.5px] px-8 py-4 hover:opacity-90 transition-opacity uppercase"
            >
              {t("ourStory.cta.seeMission")}
            </Link>
            <Link
              href="/stories"
              className="inline-flex items-center justify-center border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-semibold tracking-[1px] px-8 py-4 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors uppercase"
            >
              {t("ourStory.cta.readStories")}
            </Link>
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />

      <VideoModal
        videoId={activeVideoId ?? ""}
        isOpen={!!activeVideoId}
        onClose={() => setActiveVideoId(null)}
      />
    </main>
  );
}
