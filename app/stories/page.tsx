"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import Link from "next/link";
import { useState } from "react";
import VideoModal from "@/components/VideoModal";

const LACO_VIDEO_ID = "PNhKEQtCrVo";

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

interface Story {
  image: string;
  country: string;
  name: string;
  quote: string;
  author: string;
  context: string;
}

const featuredStory: Story = {
  image: "miro-svetlana-cibul.jpeg",
  country: "Slovakia",
  name: "Mirko & Svetlana Cibuľ",
  quote:
    "When we were quarantined with our eight children and had nothing to eat, they came with groceries and games. We couldn't reach anyone else. Only them.",
  author: "Svetlana Cibuľová, Klenovec",
  context:
    "In the early weeks of COVID, nobody knew what the virus would do. People were afraid of death itself. Roma settlements were abandoned — too risky, too crowded, too unknown. Martin and Misha went anyway. Belief in the resurrection is not a metaphor for them. It is what gave them the courage to walk toward what everyone else was walking away from.",
};

const stories: Story[] = [
  {
    image: "roma-fathers-working.jpg",
    country: "Slovakia",
    name: "The fathers of Klenovec",
    quote:
      "I used to come here when I needed men for a day's work. After a few years I came again — and I couldn't find anyone. They were all already hired.",
    author: "Local carpenter, Klenovec region",
    context:
      "When the mission arrived, around 30% of men in the settlement had any work. Four years later, a local carpenter who regularly hired from the settlement came looking — and left empty-handed. Not because men refused. Because there was nobody left to hire. They were all at work.",
  },
  {
    image: "transformed-via-education.jpeg",
    country: "Slovakia",
    name: "Adrian & Dominik",
    quote:
      "The others who weren't in the course didn't pass the test. We did.",
    author: "Adrian, Klenovec",
    context:
      "Adrian came from a special school — the kind teachers write off. Through the mission's multimedia workshop, he sat the government exam for 9th grade completion. Something his teachers once called impossible. His brother Dominik prints t-shirts, including for those same teachers. One now works a job he got because he could pass a computer skills test others couldn't.",
  },
  {
    // TODO: replace with Mirka's photo when provided
    image: "future-church.jpg",
    country: "Slovakia",
    name: "Mirka",
    quote:
      "I don't know, but since I am coming here, I stopped lying. I started helping home. I started behaving well. I started learning better.",
    author: "Mirka, Klenovec",
    context:
      "She cannot explain it theologically. She just knows something changed. Her parents confirm it — of all the children who attend, she is the most helpful. Grace is often like that: you don't understand it. You just live differently.",
  },
  {
    // TODO: replace with his photo when provided + confirm name with him
    image: "future.jpeg",
    country: "Slovakia",
    name: "A man from the settlement",
    quote:
      "I thought having children would change me. It didn't. Coming to the Eucharist every week — that did.",
    author: "Community member, Klenovec",
    context:
      "He had struggled with addiction for years. He believed fatherhood would be the turning point. It wasn't. When he began attending the parish and receiving Communion regularly, something shifted. He got married — to make his relationship right before God. The addiction lost its hold. He still comes every week.",
  },
];

export default function StoriesPage() {
  const [videoOpen, setVideoOpen] = useState(false);

  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="stories" />

      {/* ── Hero ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-5 md:gap-6 max-w-[700px]">
          <SectionLabel text="Testimonies" />
          <h1 className="text-[32px] md:text-[52px] font-bold tracking-[-1.5px] text-[var(--text-primary)] leading-[1.05]">
            Real People.
            <br />
            Real Change.
          </h1>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.7] max-w-[560px]">
            Every story here is a real person in a real settlement in Slovakia.
            Not statistics. Not composites. People whose lives changed because
            the Church showed up and stayed.
          </p>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Featured Story — Laco ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-14">
          <SectionLabel text="Featured Testimony" />
        </div>

        <div className="flex flex-col md:flex-row gap-10 md:gap-20 items-start md:items-center">
          {/* Photo — click to play video */}
          <button
            onClick={() => setVideoOpen(true)}
            className="w-full md:w-[440px] h-[260px] md:h-[500px] bg-[var(--bg-elevated)] border border-[var(--border-default)] flex-shrink-0 overflow-hidden relative group cursor-pointer"
            aria-label="Watch Laco's story"
          >
            <div
              className="w-full h-full bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
              style={{ backgroundImage: "url('/images/testimony-lado.jpg')" }}
            />
            <div className="absolute inset-0 bg-black/25 group-hover:bg-black/45 transition-colors duration-300 flex items-center justify-center">
              <PlayButton />
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <span className="text-[10px] font-semibold tracking-[2px] text-white/60 uppercase">
                Watch his testimony
              </span>
            </div>
          </button>

          <div className="flex flex-col gap-6 flex-1">
            <span className="text-[var(--gold)] text-[100px] md:text-[120px] leading-[0.3] font-bold">
              &ldquo;
            </span>
            <blockquote className="text-[20px] md:text-[26px] font-medium text-[var(--text-primary)] leading-[1.45] -mt-6">
              Before the mission came, I had no reason to stop drinking. No one
              expected anything from me. Now I serve in the altar. My children
              see me pray. That changed everything.
            </blockquote>
            <p className="text-[12px] font-semibold tracking-[1.5px] text-[var(--text-muted)] uppercase">
              — Laco, Slovakia
            </p>

            <div className="h-px bg-[var(--border-default)] my-2" />

            <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.75]">
              Laco was among the first men baptized when the mission arrived in
              his settlement. For years he had no structure, no community, no
              sense of being needed. The parish gave him all three. Today he
              serves as a reader, leads prayers with his family, and mentors
              younger men navigating the same road he walked.
            </p>

            <button
              onClick={() => setVideoOpen(true)}
              className="group self-start flex items-center gap-3 text-[12px] font-semibold tracking-[1px] text-[var(--gold)] hover:opacity-80 transition-opacity cursor-pointer mt-2"
            >
              <div className="w-7 h-7 rounded-full border border-[var(--gold)] flex items-center justify-center flex-shrink-0">
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-l-[8px] border-l-[var(--gold)] ml-0.5" />
              </div>
              WATCH HIS STORY
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
              stat: "90%+",
              label: "of settlement fathers now employed",
              sub: "Was around 30% when the mission arrived",
            },
            {
              stat: "12+",
              label: "years of continuous presence",
              sub: "Not a project. A permanent parish.",
            },
            {
              stat: "2",
              label: "vocational workshops running",
              sub: "Masonry and multimedia — real skills, real futures",
            },
          ].map((item) => (
            <div
              key={item.stat}
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

      {/* ── More Stories ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-14">
          <SectionLabel text="From the Settlement" />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.0]">
            More Voices From
            <br />
            Klenovec
          </h2>
        </div>

        {/* Featured family story — full width, large photo */}
        <div className="flex flex-col md:flex-row bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden mb-5 md:mb-6">
          <div
            className="w-full md:w-[520px] h-[280px] md:h-[420px] bg-[var(--bg-elevated)] bg-cover bg-center flex-shrink-0"
            style={{ backgroundImage: `url('/images/${featuredStory.image}')` }}
          />
          <div className="flex flex-col gap-5 p-6 md:p-10 justify-center">
            <span className="text-[10px] font-semibold tracking-[1.5px] text-[var(--gold)] uppercase">
              {featuredStory.country}
            </span>
            <h3 className="text-[16px] md:text-[18px] font-bold text-[var(--text-primary)]">
              {featuredStory.name}
            </h3>
            <blockquote className="text-[15px] md:text-[17px] text-[var(--text-primary)] leading-[1.7] italic">
              &ldquo;{featuredStory.quote}&rdquo;
            </blockquote>
            <p className="text-[11px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
              — {featuredStory.author}
            </p>
            <div className="h-px bg-[var(--border-default)]" />
            <p className="text-[13px] text-[var(--text-muted)] leading-[1.7]">
              {featuredStory.context}
            </p>
          </div>
        </div>

        {/* Remaining stories — 2×2 grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          {stories.map((s) => (
            <div
              key={s.name}
              className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden flex-1"
            >
              <div
                className="w-full h-[200px] md:h-[220px] bg-[var(--bg-elevated)] bg-cover bg-center"
                style={{ backgroundImage: `url('/images/${s.image}')` }}
              />
              <div className="flex flex-col gap-4 p-5 md:p-6 flex-1">
                <span className="text-[10px] font-semibold tracking-[1.5px] text-[var(--gold)] uppercase">
                  {s.country}
                </span>
                <h3 className="text-[13px] font-bold text-[var(--text-primary)] tracking-[0.5px]">
                  {s.name}
                </h3>
                <blockquote className="text-[13px] md:text-[14px] text-[var(--text-primary)] leading-[1.65] italic flex-1">
                  &ldquo;{s.quote}&rdquo;
                </blockquote>
                <p className="text-[11px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
                  — {s.author}
                </p>
                <div className="h-px bg-[var(--border-default)] mt-1" />
                <p className="text-[12px] text-[var(--text-muted)] leading-[1.6]">
                  {s.context}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Anonymous vignette ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="max-w-[640px] mx-auto flex flex-col gap-6">
          <div className="flex items-center gap-4">
            <div className="w-8 h-px bg-[var(--gold)]" />
            <span className="text-[10px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
              Not every story has a photo
            </span>
          </div>
          <p className="text-[18px] md:text-[22px] font-medium text-[var(--text-primary)] leading-[1.6]">
            There is a girl we visit three times a year.
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85]">
            Her mother is in prison. Her grandmother — the one person who held
            things together — died recently. She is now living with her aunt.
            We cannot show her face. We will not share her name. But we will
            keep coming back.
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85]">
            Three visits a year is not much. But for her, it may be the only
            consistent thing in her life right now. Someone who shows up. Not
            because she asked. Not because it's convenient. Because she
            matters.
          </p>
          <p className="text-[14px] text-[var(--text-muted)] leading-[1.8] italic">
            This is why we don't measure success in numbers. Some of the most
            important work we do will never appear in a report.
          </p>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Why Stories Matter ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="max-w-[680px]">
          <SectionLabel text="The Work Continues" />
          <h2 className="text-[26px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.1] mt-5 mb-6">
            Every story here started with someone choosing to stay.
          </h2>
          <p className="text-[14px] md:text-[16px] text-[var(--text-secondary)] leading-[1.8] mb-4">
            Martin and Misha moved to Klenovec permanently. Not as visitors, not
            as NGO workers on a contract. They bought a house, raised children,
            and built a parish — because the Roma communities they serve have
            been let down by every initiative that eventually packed up and left.
          </p>
          <p className="text-[14px] md:text-[16px] text-[var(--text-secondary)] leading-[1.8] mb-8">
            In 2025, donors contributed roughly €3,000. Actual mission costs
            were €16,900. The gap is covered from Martin's personal income.
            Every euro you give goes directly to sustaining what you&rsquo;ve
            just read.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/get-involved"
              className="inline-flex items-center justify-center bg-[var(--gold)] text-black text-[12px] font-bold tracking-[1.5px] px-8 py-4 hover:opacity-90 transition-opacity uppercase"
            >
              Support This Mission
            </Link>
            <Link
              href="/mission"
              className="inline-flex items-center justify-center border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-semibold tracking-[1px] px-8 py-4 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors uppercase"
            >
              Learn How It Works
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
