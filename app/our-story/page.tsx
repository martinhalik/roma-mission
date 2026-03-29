"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import VideoModal from "@/components/VideoModal";
import Link from "next/link";

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
  onPlay: (id: string) => void;
}

function StoryVideo({ videoId, caption, onPlay }: StoryVideoProps) {
  return (
    <figure className="my-10 -mx-5 md:mx-0">
      <button
        onClick={() => onPlay(videoId)}
        className="group relative w-full overflow-hidden cursor-pointer block"
        aria-label="Play video"
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
              className="text-[10px] font-semibold tracking-[1.5px] text-[var(--text-muted)] uppercase hover:text-[var(--gold)] transition-colors w-fit"
            >
              ← Back to Mission
            </Link>
            <SectionLabel text="The Founder's Story" />
            <h1 className="text-[32px] md:text-[50px] font-bold tracking-[-1.5px] text-[var(--text-primary)] leading-[1.05]">
              One Detour.
              <br />
              One Decision.
              <br />
              A Mission That Stayed.
            </h1>
            <p className="text-[13px] md:text-[15px] text-[var(--text-muted)] leading-[1.6]">
              Klenovec, Slovakia · 2016 – 2020
            </p>
          </div>
        </div>
      </section>

      {/* ── Story Body ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px]">
        <div className="max-w-[700px]">

          <Year year="Before 2016" />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            The Dream
          </h2>

          <PullQuote
            quote="My dream was to become a famous designer, earn a lot of money, and lecture all over the world."
            original="Mým snem bylo stát se slavným designerem, vydělávat hodně peněz a přednášet po celém světě."
            author="Martin, Founder"
          />

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            It seemed to be working out. He was not yet nineteen and orders were already coming in from all over the world and from the biggest Czech companies. He became lead designer at Kiwi.com — then the fastest-growing Czech startup — and assembled the entire design team from the start.
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            Remote work, international clients, a career that pointed in every direction he'd planned for. The future was open.
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          <Year year="2016" />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            The Wrong Turn
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            Together with colleagues, he bought a house in Klenovec — a village in central Slovakia. The region had long stayed with him: severe unemployment, high divorce rates, drugs. They were young, they thought they could help.
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            One day, on the way to a tradesman, he took a shortcut — and turned into a dead-end lane at the edge of the village. Directly into a Roma settlement.
          </p>

          <StoryPhoto
            src="/images/krm-history-2016.png"
            alt="The Ents.co team in Klenovec after buying the house, 2016"
            caption="The Ents.co team in Klenovec after buying the house, 2016. Left to right: Jan Henneberg, Milan Seitler, David Kotík, Martin, and Filip Daniško."
            position="center top"
          />

          <PullQuote
            quote="Until that moment, I had not faced poverty directly. It struck my heart — and even though I had no love for Roma, quite the opposite, I wanted to help."
            original="Až do té doby jsem nehleděl chudobě tváří v tvář. Zasáhlo to moje srdce a ačkoli jsem neměl Romy v lásce, spíše naopak, chtěl jsem jim pomoci."
            author="Martin"
          />

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            He is honest about the prejudice. Most people in Slovakia carry it. He is also honest that something shifted immediately — not despite it, but through the encounter itself. The reality was too specific, too human to fit the category.
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          <Year year="2017" />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            Balloons, Broken Guitars, and Persistence
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            For several months he gathered courage and simply prayed. Then he took a handful of balloons, hoping to engage the children and start playing. It worked. But what followed required something more than enthusiasm.
          </p>

          <PullQuote
            quote="It took persistence, many moments on my knees, frequent Holy Communion, countless lost balloons, several broken guitars and skateboards split into firewood — but gradually I managed to earn the trust of the community."
            original="Stálo to vytrvalost, mnohé chvíle na kolenou, časté svaté přijímání, nepočítaně ztracených balonů, několik rozbitých kytar a skateboardů rozštípaných na dříví, ale postupně se mi podařilo získat důvěru komunity."
          />

          <StoryVideo
            videoId={UKULELE_VIDEO_ID}
            caption="Martin teaching Roma children ukulele — Klenovec, 2017. Click to watch."
            onPlay={setActiveVideoId}
          />

          <StoryPhoto
            src="/images/krm-sports-club.jpg"
            alt="Children from the sports club at Klenovec elementary school"
            caption="Children from the sports club at Klenovec elementary school."
          />

          <StoryVideo
            videoId={SETTLEMENT_VIDEO_ID}
            caption="A girl in the Roma settlement, in front of her parents' cottage. Click to watch."
            onPlay={setActiveVideoId}
          />

          <div className="h-px bg-[var(--border-default)] my-12" />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            Moving In
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            There are small sacrifices, and then there are larger ones. He understood that if he was serious about helping, he needed to live among them — to know them from the inside. That meant moving into a wooden cottage in the settlement.
          </p>

          <PullQuote
            quote="Sometimes God asks small sacrifices of us so that we can mature into larger ones — for He gave His entire life for us. I knew that if I meant to take this help seriously, I needed to live among them, to know them from the inside."
            original="Někdy však od nás Bůh žádá drobné oběti, abychom dozráli do obětí větších... Věděl jsem, že pokud to chci s pomocí myslet vážně, potřebuju žít mezi nimi, poznat je zevnitř, jinými slovy přestěhovat se do dřevěné chatrče v osadě."
          />

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            Looking back, he says it was one of the happiest periods of his life. He was still working remotely — still at Kiwi — but his heart had already stayed in Klenovec. The two worlds were running in parallel, and the gap was becoming harder to ignore.
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          <Year year="2018" />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            Michaela
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            Then something unexpected happened. While in prayer and reading Scripture, he felt led to leave the growing mission in Klenovec and return to Brno. He couldn't explain it logically.
          </p>

          <div className="bg-[var(--bg-card)] border border-[var(--border-default)] p-6 md:p-8 my-10">
            <span className="font-georgia text-[var(--gold)] text-[14px] italic block mb-3">
              John 3:8
            </span>
            <p className="text-[16px] md:text-[18px] font-georgia italic text-[var(--text-primary)] leading-[1.7]">
              &ldquo;The wind blows where it wants; you hear its sound but do not know where it comes from or where it is going. So it is with everyone who is born of the Spirit.&rdquo;
            </p>
          </div>

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            In Brno he met Michaela — Michalka. A trained psychologist. When he told her what he was doing in Klenovec, she understood it in a way that mattered. They married on August 25, 2018, and she moved with him.
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            Michalka brought something the work had been missing: gentleness, a warm heart, and someone who could work with girls in the community. She didn't come to assist with his project. It became theirs.
          </p>

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5 italic text-[var(--text-muted)]">
            &ldquo;Michalka je vystudovaná psycholožka, ale teďka hlavně vzorná maminka a hospodyňka. Dala celé práci něhu a laskavé srdce, které jí před tím scházely. Také doplnila chybějící článek práce s děvčaty.&rdquo;
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          <Year year="2019" />

          <StoryPhoto
            src="/images/krm-michalka-2019.jpg"
            alt="Michalka with children after a small local game, 2019"
            caption="Michalka with children, after presenting prizes for a small local game — 2019."
          />

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            Together they worked toward what they had come to believe mattered most: leading people toward diligence and honesty, teaching children to read and write properly, and forming them in Christian faith and morals.
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            In October 2019, their son Adam was born.
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          <Year year="2020" />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            Formalized
          </h2>

          <StoryPhoto
            src="/images/krm-michalka-cross-2020.jpeg"
            alt="Michalka distributing sweets to children at the cross blessing celebration, Mútnik 2020"
            caption="Michalka distributing sweets to children at the cross blessing celebration on Mútnik — 2020."
          />

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            In the summer of 2020, they formally established the Kresťanská rómska misia — the Christian Roma Mission. A registered nonprofit. This gave the work its official form: the ability to employ staff, launch vocational training programs, and be accountable beyond their own intentions.
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            In May 2021, their daughter Mária was born.
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          <Year year="Today" />

          <h2 className="text-[22px] md:text-[28px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.2] mb-5">
            East, and Still Moving
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            Martin and Michaela now live in eastern Slovakia with their four children. The work has expanded — new communities, new parishes, new workers in training. What began with a handful of balloons in Klenovec is now a network of parishes reaching Roma communities across Slovakia.
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.85] mb-5">
            What has not changed is the principle: you don't send help from a distance. You go. You stay. You let it cost you something real.
          </p>

          <div className="h-px bg-[var(--border-default)] my-12" />

          {/* Documentary catch */}
          <div className="flex flex-col gap-4 mb-6">
            <SectionLabel text="The Documentary" />
          </div>

          <button
            onClick={() => setActiveVideoId(DOCUMENTARY_VIDEO_ID)}
            className="group relative w-full overflow-hidden border border-[var(--border-default)] hover:border-[var(--gold)]/40 transition-colors text-left cursor-pointer"
            aria-label="Watch the documentary: From IT to Priesthood"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`https://img.youtube.com/vi/${DOCUMENTARY_VIDEO_ID}/hqdefault.jpg`}
              alt="From IT to Priesthood — Czech Television documentary"
              className="w-full h-[220px] md:h-[320px] object-cover transition-transform duration-500 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/55 transition-colors flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/10 border border-white/30 backdrop-blur-sm flex items-center justify-center group-hover:scale-110 transition-transform">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[18px] border-l-white ml-1" />
              </div>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-5 md:p-7">
              <span className="text-[9px] font-bold tracking-[2px] text-[var(--gold)] uppercase block mb-1">
                Czech Television · 30 min
              </span>
              <p className="text-[15px] md:text-[17px] font-bold text-white leading-[1.3]">
                From IT to Priesthood
              </p>
              <p className="text-[12px] text-white/60 mt-1">
                The story you just read — on film.
              </p>
            </div>
          </button>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-4 mt-12 pt-10 border-t border-[var(--border-default)]">
            <Link
              href="/mission"
              className="inline-flex items-center justify-center bg-[var(--gold)] text-black text-[12px] font-bold tracking-[1.5px] px-8 py-4 hover:opacity-90 transition-opacity uppercase"
            >
              See the Mission
            </Link>
            <Link
              href="/stories"
              className="inline-flex items-center justify-center border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-semibold tracking-[1px] px-8 py-4 hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors uppercase"
            >
              Read Community Stories
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
