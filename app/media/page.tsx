"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import VideoModal from "@/components/VideoModal";

const DOCUMENTARY_VIDEO_ID = "K-IDNefOa98";
const SPOTIFY_URL =
  "https://open.spotify.com/show/7kLQFO0PBwfj1eWoMK2Ubb?si=54601aa410854140";

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

const episodes = [
  {
    num: "EP 01",
    title: "Why the Roma? Why Now?",
    guest: "Fr. Nikolaj Petrov",
    duration: "42 min",
    desc: "An introduction to the mission — its origins, its theology, and why the Roma are one of the most underserved communities in European Orthodoxy.",
  },
  {
    num: "EP 02",
    title: "What a Parish Does to a Community",
    guest: "Deacon Andrej Kovač",
    duration: "38 min",
    desc: "A conversation about the concrete effects of stable parish life — from family stability to literacy and economic participation.",
  },
  {
    num: "EP 03",
    title: "Long-Term Presence Over Programs",
    guest: "Miroslava Horváth",
    duration: "51 min",
    desc: "Why short-term mission models fail, and what it looks like to make a generational commitment to a community.",
  },
];

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
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="media" />
      <VideoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        videoId={DOCUMENTARY_VIDEO_ID}
      />

      {/* ── Hero ── */}
      <section className="relative w-full h-[400px] md:h-[480px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/media-hero.jpg')" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, #111111EE 0%, #11111188 70%, #11111144 100%)",
          }}
        />
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
          onClick={() => setModalOpen(true)}
          className="w-full md:w-[600px] h-[220px] md:h-[400px] bg-[var(--bg-card)] border border-[var(--border-default)] flex-shrink-0 overflow-hidden relative group cursor-pointer"
          aria-label="Watch documentary"
        >
          <div
            className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
            style={{ backgroundImage: "url('/images/documentary-thumb.jpg')" }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-[var(--gold)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
              <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[18px] border-l-[#111111] ml-1" />
            </div>
          </div>
        </button>
        <div className="flex flex-col gap-6 flex-1">
          <SectionLabel text="Documentary" />
          <h2 className="text-[28px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            From IT to Priesthood
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.7]">
            An official Czech Television documentary. The film follows the
            director of Christian Roma Mission on his personal journey from a
            career in IT to Orthodox priesthood in Roma communities across
            Slovakia — alongside his wife and children. It offers an honest look
            at daily parish life, family ministry on the mission field, and the
            long-term sacrifice behind a calling to communities shaped by
            poverty, exclusion, and deep spiritual need.
          </p>
          <div className="flex items-center gap-6 text-[12px] text-[var(--text-muted)]">
            <span>30 min</span>
            <span>·</span>
            <span>Czech Television</span>
            <span>·</span>
            <span>English captions available</span>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="self-start px-8 py-4 bg-[var(--gold)] text-[#111111] text-[12px] font-bold tracking-[1px] hover:opacity-90 transition-opacity"
          >
            WATCH DOCUMENTARY
          </button>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Podcast ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col md:flex-row justify-between items-start gap-6 mb-10 md:mb-12">
          <div className="flex flex-col gap-4 max-w-[500px]">
            <SectionLabel text="Podcast" />
            <h2 className="text-[28px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[0.95]">
              Mission Conversations
            </h2>
            <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              Conversations with priests, volunteers, and community leaders on
              the ground.
            </p>
          </div>
          <a
            href={SPOTIFY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="border border-[var(--gold)] text-[var(--gold)] text-[12px] font-semibold tracking-[1px] px-7 py-[14px] hover:bg-[var(--gold)] hover:text-[#111111] transition-colors flex-shrink-0"
          >
            ALL EPISODES
          </a>
        </div>

        <div className="flex flex-col md:flex-row gap-4 md:gap-6">
          {episodes.map((ep) => (
            <div
              key={ep.num}
              className="flex flex-col gap-4 p-6 md:p-7 bg-[var(--bg-primary)] border border-[var(--border-default)] flex-1"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold tracking-[1px] text-[var(--gold)]">
                  {ep.num}
                </span>
                <span className="text-[11px] text-[var(--text-muted)]">
                  {ep.duration}
                </span>
              </div>
              <h3 className="text-[15px] md:text-[16px] font-bold text-[var(--text-primary)] leading-[1.3]">
                {ep.title}
              </h3>
              <p className="text-[12px] md:text-[13px] text-[var(--text-secondary)] leading-[1.6]">
                {ep.desc}
              </p>
              <p className="text-[11px] text-[var(--text-muted)] mt-auto pt-2 border-t border-[var(--border-default)]">
                with {ep.guest}
              </p>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Field Reports / News ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
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
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
