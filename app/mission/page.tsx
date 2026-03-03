import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";

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

const stats = [
  { value: "8", label: "Parishes supported" },
  { value: "3", label: "Churches planted" },
  { value: "1", label: "Mission Center Built" },
  { value: "1", label: "Mission Center in Progress" },
];

const beliefs = [
  {
    icon: "☦",
    title: "Sacramental Life First",
    desc: "The parish — with its Liturgy, Baptism, Chrismation, and Confession — is the primary instrument of transformation. Programs and services flow from the altar.",
  },
  {
    icon: "✦",
    title: "Long-Term Commitment",
    desc: "We do not run short-term programs. We plant and we stay. A self-sustaining parish requires years of presence, accountability, and relationship.",
  },
  {
    icon: "✦",
    title: "Community Ownership",
    desc: "Our goal is always to transfer leadership to local Roma priests and deacons. The church must belong to the community it serves.",
  },
];

export default function MissionPage() {
  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="mission" />

      {/* ── Hero ── */}
      <section className="relative w-full h-[420px] md:h-[480px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/mission-hero.jpg')" }}
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
            <SectionLabel text="Our Mission" />
            <h1 className="text-[34px] md:text-[48px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              Planting Orthodox Parishes
              <br />
              Among the Roma
            </h1>
            <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
              A long-term commitment to church planting, discipleship, and
              community transformation across Central and Eastern Europe.
            </p>
          </div>
        </div>
      </section>

      {/* ── Our Story ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)] flex flex-col md:flex-row gap-12 md:gap-20 items-center">
        <div className="w-full md:w-[500px] h-[260px] md:h-[400px] bg-[var(--bg-card)] border border-[var(--border-default)] flex-shrink-0 overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/images/story-photo.jpg')" }}
          />
        </div>
        <div className="flex flex-col gap-5 md:gap-6 flex-1">
          <SectionLabel text="Our Story" />
          <h2 className="text-[28px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            How It Started
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.7]">
            The mission began when a small group of Orthodox Christians visited
            Roma settlements in Eastern Slovakia and witnessed communities with
            no access to regular worship, no parish structure, and no spiritual
            formation for children or families.
          </p>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.7]">
            What started as short-term visits grew into a long-term presence.
            Today, the mission operates across five countries, planting parishes
            that serve as anchors for community transformation.
          </p>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Vision & Stats ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-5 md:gap-6 max-w-[700px] mb-12 md:mb-16">
          <SectionLabel text="Our Vision" />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[0.95]">
            A Self-Sustaining Parish
            <br />
            in Every Roma Community
          </h2>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.7]">
            We don&apos;t plant projects — we plant parishes. Our goal is a
            permanent, self-governing church community with its own priest, its
            own liturgical life, and its own identity within the Orthodox
            tradition.
          </p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border-t border-[var(--border-default)]">
          {stats.map((s, i) => (
            <div
              key={s.label}
              className={`flex flex-col gap-2 py-8 px-5 md:px-8 ${
                i < stats.length - 1
                  ? "border-b md:border-b-0 md:border-r border-[var(--border-default)]"
                  : ""
              }`}
            >
              <span className="text-[36px] md:text-[48px] font-bold text-[var(--gold)]">
                {s.value}
              </span>
              <span className="text-[12px] md:text-[13px] text-[var(--text-secondary)] tracking-[1px] uppercase">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Guiding Principles ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-16">
          <SectionLabel text="What We Believe" />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[0.95]">
            Guiding Principles
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {beliefs.map((b) => (
            <div
              key={b.title}
              className="flex flex-col gap-5 p-7 md:p-9 bg-[var(--bg-card)] border border-[var(--border-default)]"
            >
              <span className="font-georgia text-[28px] text-[var(--gold)]">
                {b.icon}
              </span>
              <h3 className="text-[16px] md:text-[17px] font-bold text-[var(--text-primary)]">
                {b.title}
              </h3>
              <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.7]">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
