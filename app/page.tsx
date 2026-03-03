import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import Link from "next/link";
import { Users, BookOpen, Crown, Heart, House, LucideIcon } from "lucide-react";

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

const mediaItems = [
  {
    tag: "DOCUMENTARY",
    title: "30-Minute Documentary",
    desc: "The full story of the mission — from first contact to parish life.",
  },
  {
    tag: "PODCAST",
    title: "Mission Podcast",
    desc: "Conversations with priests, volunteers, and community leaders on the ground.",
  },
  {
    tag: "NEWS",
    title: "News Articles",
    desc: "Press coverage and field reports from our mission parishes.",
  },
];

const countries = ["ROMANIA", "HUNGARY", "SLOVAKIA", "BULGARIA", "SERBIA"];

export default function HomePage() {
  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="home" />

      {/* ── Hero ── */}
      <section className="relative w-full h-[480px] md:h-[720px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/hero-home.png')" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, #111111EE 0%, #11111188 10%, #11111144 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-end h-full px-5 md:px-[120px] pb-12 md:pb-16">
          <div className="flex flex-col gap-5 md:gap-8 max-w-[800px]">
            <SectionLabel text="Orthodox Roma Mission Europe" />
            <h1 className="text-[34px] md:text-[52px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              When Christ Is Present,
              <br />
              Everything Changes.
            </h1>
            <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
              Serving Roma communities in Europe through education, activities,
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
          <div className="bg-[var(--bg-card)] h-[120px] md:h-[280px] border border-[var(--border-default)]" />
          <div className="bg-[var(--bg-card)] h-[120px] md:h-[280px] border border-[var(--border-default)]" />
          <div className="bg-[var(--bg-card)] h-[120px] md:h-[280px] border border-[var(--border-default)]" />
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
            <span className="text-[var(--text-secondary)]">
              instability grows.
            </span>
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
          <div className="bg-[var(--bg-card)] h-[100px] md:h-[240px] border border-[var(--border-default)]" />
          <div className="bg-[var(--bg-card)] h-[100px] md:h-[240px] border border-[var(--border-default)]" />
          <div className="bg-[var(--bg-card)] h-[100px] md:h-[240px] border border-[var(--border-default)]" />
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
        <div className="w-full h-[180px] md:h-[360px] bg-[var(--bg-elevated)] border border-[var(--border-default)] mb-8 md:mb-12 overflow-hidden rounded-sm" />

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

      {/* ── Testimonial ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col md:flex-row gap-8 md:gap-16 items-center">
          <div className="w-full md:w-[380px] h-[240px] md:h-[480px] bg-[var(--bg-elevated)] border border-[var(--border-default)] flex-shrink-0 overflow-hidden">
            <div
              className="w-full h-full bg-cover bg-center"
              style={{ backgroundImage: "url('/images/testimony-lado.jpg')" }}
            />
          </div>
          <div className="flex flex-col gap-6">
            <SectionLabel text="Testimony" />
            <span className="text-[var(--gold)] text-[120px] leading-[0.4] font-bold">
              &ldquo;
            </span>
            <blockquote className="text-[18px] md:text-[22px] font-medium text-[var(--text-primary)] leading-[1.5] -mt-8">
              Before the mission came, I had no reason to stop drinking. No one
              expected anything from me. Now I serve in the altar. My children
              see me pray. That changed everything.
            </blockquote>
            <p className="text-[13px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
              — Lado, Romania
            </p>
            <Link
              href="/stories"
              className="text-[12px] font-semibold tracking-[1px] text-[var(--gold)] hover:opacity-80 transition-opacity"
            >
              Read more stories →
            </Link>
          </div>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Where We Serve ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-12">
          <SectionLabel text="Our Locations" />
          <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            Where We Serve
          </h2>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
            Active mission parishes across Romania, Hungary, Slovakia, Bulgaria,
            and Serbia.
          </p>
        </div>

        {/* Map with countries overlay at bottom */}
        <div className="relative w-full h-[240px] md:h-[400px] bg-[var(--bg-elevated)] border border-[var(--border-default)] mb-8 overflow-hidden">
          <span className="absolute top-5 left-5 text-[11px] font-semibold tracking-[2px] text-[var(--text-muted)]">
            INTERACTIVE MAP
          </span>
          <div className="absolute bottom-0 left-0 right-0 px-5 py-4 flex items-center gap-6 flex-wrap">
            {countries.map((c, i) => (
              <span key={c} className="flex items-center gap-6">
                <span className="text-[10px] font-medium tracking-[1.5px] text-[var(--text-secondary)]">
                  {c}
                </span>
                {i < countries.length - 1 && (
                  <span className="w-1 h-1 rounded-full bg-[var(--border-strong)] inline-block" />
                )}
              </span>
            ))}
          </div>
        </div>

        <Link
          href="/locations"
          className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[1px] text-[var(--gold)] border border-[var(--gold)] px-8 py-4 hover:bg-[var(--gold)] hover:text-[#111111] transition-colors"
        >
          VIEW LOCATIONS
        </Link>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Media ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-12">
          <SectionLabel text="Media" />
          <h2 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            Documented. Recorded.
            <br />
            Transparent.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-4 mb-8">
          {mediaItems.map((item) => (
            <div
              key={item.tag}
              className="bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden flex flex-col"
            >
              <div className="w-full h-[140px] md:h-[220px] bg-[var(--bg-elevated)]" />
              <div className="flex flex-col gap-3 p-5 md:p-6">
                <span className="text-[10px] font-semibold tracking-[1.5px] text-[var(--gold)]">
                  {item.tag}
                </span>
                <h3 className="text-[16px] md:text-[18px] font-bold text-[var(--text-primary)] leading-[1.1]">
                  {item.title}
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-[1.5]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
        <Link
          href="/media"
          className="inline-flex items-center gap-2 text-[12px] font-semibold tracking-[1px] text-[var(--gold)] border border-[var(--gold)] px-8 py-4 hover:bg-[var(--gold)] hover:text-[#111111] transition-colors"
        >
          EXPLORE MEDIA
        </Link>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
