import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Stories",
  description:
    "Real testimonies from Roma communities where the Orthodox Church has taken root. Lives changed through baptism, discipleship, and the presence of a local parish.",
  openGraph: {
    title: "Stories — Roma Mission",
    description:
      "Real testimonies from Roma communities where the Orthodox Church has taken root. Lives changed through baptism, discipleship, and the presence of a local parish.",
    url: "https://romamission.eu/stories",
    images: [{ url: "/images/testimony-lado.jpg", width: 1200, height: 630, alt: "Transformed lives — Roma Mission" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Stories — Roma Mission",
    description:
      "Real testimonies from Roma communities where the Orthodox Church has taken root. Lives changed through baptism, discipleship, and the presence of a local parish.",
    images: ["/images/testimony-lado.jpg"],
  },
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";

const SHARE_URL = "https://romamission.eu/stories";
const SHARE_TITLE = "Lives Transformed — Roma Mission";
const SHARE_TEXT =
  "These are real stories from Roma communities where the Orthodox Church has taken root. Worth reading.";

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

const moreStories = [
  {
    image: "story-1.jpg",
    country: "Slovakia",
    name: "Elena & her children",
    quote:
      "The priest started coming every week. My children began attending Sunday school. Now they can read. I never could.",
    author: "Elena, Eastern Slovakia",
  },
  {
    image: "story-2.jpg",
    country: "Romania",
    name: "Gheorghe",
    quote:
      "I was ashamed to walk into any church. Father Nikolaj came to us. He baptized me in the river. That was three years ago. I haven't missed a Liturgy since.",
    author: "Gheorghe, Bucharest region",
  },
  {
    image: "story-3.jpg",
    country: "Hungary",
    name: "The Horváth family",
    quote:
      "We had four children and no structure. The parish became our structure. My husband stopped drinking. My children go to school.",
    author: "Maria Horváth, Northern Hungary",
  },
];

export default function StoriesPage() {
  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="mission" />

      {/* ── Stories Hero (no image — text-based) ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-5 md:gap-6 max-w-[700px]">
          <SectionLabel text="Stories" />
          <h1 className="text-[32px] md:text-[48px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            Lives Transformed by
            <br />
            Parish Life
          </h1>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6]">
            Real stories from Roma communities where the Church has taken root.
            Every name and testimony is shared with permission.
          </p>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Featured Story ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col md:flex-row gap-10 md:gap-16 items-start md:items-center">
          <div className="w-full md:w-[480px] h-[240px] md:h-[420px] bg-[var(--bg-elevated)] border border-[var(--border-default)] flex-shrink-0 overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{
                backgroundImage: "url('/images/story-lado.jpg')",
              }}
            />
          </div>
          <div className="flex flex-col gap-5 md:gap-6 flex-1">
            <span className="text-[10px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
              Featured Testimony
            </span>
            <blockquote className="text-[18px] md:text-[24px] font-medium text-[var(--text-primary)] leading-[1.5]">
              &ldquo;Before the mission came, I had no reason to stop drinking.
              No one expected anything from me. Now I serve in the altar. My
              children see me pray. That changed everything.&rdquo;
            </blockquote>
            <p className="text-[13px] md:text-[14px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
              — Laco, Slovaki
            </p>
            <p className="text-[13px] md:text-[15px] text-[var(--text-secondary)] leading-[1.7]">
              Lado was one of the first men baptized when the mission arrived in
              his settlement in 2012. Today he serves as a reader in the parish
              and mentors younger men in the community.
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── More Stories ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-12">
          <SectionLabel text="More Testimonies" />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[0.95]">
            From the Communities
          </h2>
        </div>

        <div className="flex flex-col md:flex-row gap-5 md:gap-6">
          {moreStories.map((s) => (
            <div
              key={s.name}
              className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden flex-1"
            >
              <div
                className="w-full h-[180px] md:h-[200px] bg-[var(--bg-elevated)] bg-cover bg-center"
                style={{ backgroundImage: `url('/images/${s.image}')` }}
              />
              <div className="flex flex-col gap-4 p-5 md:p-6">
                <span className="text-[10px] font-semibold tracking-[1.5px] text-[var(--gold)] uppercase">
                  {s.country}
                </span>
                <blockquote className="text-[13px] md:text-[14px] text-[var(--text-primary)] leading-[1.6] italic">
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
                <p className="text-[11px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
                  — {s.author}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/get-involved"
            className="px-8 py-4 bg-[var(--gold)] text-[#111111] text-[12px] font-bold tracking-[1px] hover:opacity-90 transition-opacity"
          >
            SUPPORT THIS MISSION
          </Link>
          <ShareButton
            title={SHARE_TITLE}
            text={SHARE_TEXT}
            url={SHARE_URL}
            label="SHARE THESE STORIES"
            className="px-8 py-4 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-bold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
          />
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
