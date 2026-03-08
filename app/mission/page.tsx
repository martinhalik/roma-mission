import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import SectionLabel from "@/components/SectionLabel";
import ShareButton from "@/components/ShareButton";

const SHARE_URL = "https://romamission.com/mission";
const SHARE_TITLE = "Roma Mission — Europe's Most Neglected People";
const SHARE_TEXT =
  "Five million Roma in Europe. Most unreached. One Orthodox mission committed to staying until there's a parish. Worth knowing about:";

// ── Types ──────────────────────────────────────────────────────────────────────

type Presence = "active" | "orthodox" | "opportunity" | "next-steps";
type TranslationStatus = "available" | "partial" | "progress" | "needed";

interface CountryData {
  country: string;
  flag: string;
  officialPop: string;
  unofficialPop: string;
  sharePercent: string;
  presence: Presence;
  presenceLabel: string;
  scripture: TranslationStatus;
  scriptureNote: string;
  liturgy: TranslationStatus;
  liturgyNote: string;
  knownWorkers: string;
  sourceUrl: string;
}

// ── Data ───────────────────────────────────────────────────────────────────────

const countryData: CountryData[] = [
  // We're Here
  {
    country: "Slovakia",
    flag: "🇸🇰",
    officialPop: "~105,000",
    unofficialPop: "~500,000",
    sharePercent: "~9%",
    presence: "active",
    presenceLabel: "We're Here",
    scripture: "partial",
    scriptureNote: "Romani NT exists; Slovak Bible widely used in parishes",
    liturgy: "partial",
    liturgyNote: "Liturgical materials actively being developed by our mission",
    knownWorkers: "KRM (our mission), Greek-Catholic Church missions",
    sourceUrl: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/slovakia_en",
  },
  // Next Steps
  {
    country: "Czechia",
    flag: "🇨🇿",
    officialPop: "~13,000",
    unofficialPop: "200,000–300,000",
    sharePercent: "2–3%",
    presence: "next-steps",
    presenceLabel: "Next Steps",
    scripture: "partial",
    scriptureNote: "Czech Bible widely available; very limited Romani Scripture",
    liturgy: "needed",
    liturgyNote: "No Roma-language liturgical materials exist",
    knownWorkers: "Caritas Czech Republic, some evangelical outreach programs",
    sourceUrl: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/czech-republic_en",
  },
  // Orthodox Active — sorted by share of population descending
  {
    country: "Romania",
    flag: "🇷🇴",
    officialPop: "~621,000",
    unofficialPop: "~1.85 million",
    sharePercent: "~8%",
    presence: "orthodox",
    presenceLabel: "Orthodox Active",
    scripture: "available",
    scriptureNote: "Romanian Bible widely available; partial Romani translations",
    liturgy: "partial",
    liturgyNote: "Romanian Orthodox liturgy used; limited Roma-specific materials",
    knownWorkers: "Romanian Orthodox Church, Romani CRISS, Romanian Bible Society",
    sourceUrl: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/romania_en",
  },
  {
    country: "Moldova",
    flag: "🇲🇩",
    officialPop: "~107,000",
    unofficialPop: "200,000–300,000",
    sharePercent: "4–8%",
    presence: "orthodox",
    presenceLabel: "Orthodox Active",
    scripture: "partial",
    scriptureNote: "Romanian Bible widely used; no Romani Scripture translations",
    liturgy: "needed",
    liturgyNote: "Moldovan Orthodox liturgy used; no Roma-specific materials",
    knownWorkers: "Moldovan Orthodox Church, some Protestant mission groups",
    sourceUrl: "https://www.worldbank.org/en/country/moldova/brief/roma-in-moldova",
  },
  {
    country: "Serbia",
    flag: "🇷🇸",
    officialPop: "~147,000",
    unofficialPop: "400,000–600,000",
    sharePercent: "2–8%",
    presence: "orthodox",
    presenceLabel: "Orthodox Active",
    scripture: "partial",
    scriptureNote: "Serbian Bible available; very limited Romani Scripture",
    liturgy: "needed",
    liturgyNote: "No dedicated Roma-language liturgy",
    knownWorkers: "Serbian Orthodox Church (limited reach), Pentecostal missions",
    sourceUrl: "https://minorityrights.org/communities/roma-14/",
  },
  {
    country: "Greece",
    flag: "🇬🇷",
    officialPop: "~111,000",
    unofficialPop: "250,000–350,000",
    sharePercent: "2–3%",
    presence: "orthodox",
    presenceLabel: "Orthodox Active",
    scripture: "partial",
    scriptureNote: "Greek Bible widely available; limited Romani Scripture translations",
    liturgy: "partial",
    liturgyNote: "Greek Orthodox liturgy used; Roma-specific materials very limited",
    knownWorkers: "Greek Orthodox Church, local parish outreach programs",
    sourceUrl: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/greece_en",
  },
  // Opportunity
  {
    country: "Hungary",
    flag: "🇭🇺",
    officialPop: "~315,000",
    unofficialPop: "~700,000",
    sharePercent: "~7%",
    presence: "opportunity",
    presenceLabel: "Opportunity",
    scripture: "partial",
    scriptureNote: "Hungarian Bible available; very limited Romani Scripture",
    liturgy: "needed",
    liturgyNote: "No Roma-language liturgical materials exist",
    knownWorkers: "Hungarian Baptist Aid, Reformed Church of Hungary programs",
    sourceUrl: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/hungary_en",
  },
  {
    country: "Bulgaria",
    flag: "🇧🇬",
    officialPop: "~325,000",
    unofficialPop: "700,000–900,000",
    sharePercent: "5–12%",
    presence: "opportunity",
    presenceLabel: "Opportunity",
    scripture: "partial",
    scriptureNote: "Bulgarian Bible available; very limited Romani Scripture",
    liturgy: "needed",
    liturgyNote: "No Roma-language liturgical materials exist",
    knownWorkers: "Amalipe Center (Roma NGO), various evangelical groups",
    sourceUrl: "https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/combatting-discrimination/roma-eu/roma-equality-inclusion-and-participation-eu-country/bulgaria_en",
  },
  {
    country: "North Macedonia",
    flag: "🇲🇰",
    officialPop: "~54,000",
    unofficialPop: "200,000+",
    sharePercent: "2–12%",
    presence: "opportunity",
    presenceLabel: "Opportunity",
    scripture: "partial",
    scriptureNote: "Macedonian Bible available; small Romani NT project ongoing",
    liturgy: "progress",
    liturgyNote: "Active Romani liturgical translation projects underway",
    knownWorkers: "Roma NGOs in Shutka district, some Protestant missions",
    sourceUrl: "https://minorityrights.org/country/macedonia/",
  },
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

const stats = [
  { value: "8", label: "Parishes supported" },
  { value: "2", label: "Churches active" },
  { value: "1", label: "Mission Center Built" },
  { value: "1", label: "Mission Center in Progress" },
];

// ── Sub-components ─────────────────────────────────────────────────────────────

function PresenceBadge({ presence, label }: { presence: Presence; label: string }) {
  const styles: Record<Presence, string> = {
    active:
      "bg-[#22c55e20] text-[#22c55e] border border-[#22c55e]/40",
    orthodox:
      "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/40",
    opportunity:
      "bg-transparent text-[var(--text-muted)] border border-[var(--border-default)]",
    "next-steps":
      "bg-[#f9731620] text-[#f97316] border border-[#f97316]/40",
  };
  return (
    <span
      className={`text-[9px] font-bold tracking-[1px] px-3 py-1.5 uppercase whitespace-nowrap ${styles[presence]}`}
    >
      {label}
    </span>
  );
}

function TranslationBadge({
  status,
  note,
}: {
  status: TranslationStatus;
  note: string;
}) {
  const config: Record<TranslationStatus, { label: string; cls: string }> = {
    available: {
      label: "AVAILABLE",
      cls: "text-[var(--gold)] bg-[#D4AF3712] border border-[var(--gold)]/30",
    },
    partial: {
      label: "PARTIAL",
      cls: "text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border-default)]",
    },
    progress: {
      label: "IN PROGRESS",
      cls: "text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border-strong)]",
    },
    needed: {
      label: "NEEDED",
      cls: "text-[var(--text-muted)] bg-transparent border border-[var(--border-default)]",
    },
  };
  const { label, cls } = config[status];
  return (
    <div className="flex flex-col gap-1.5">
      <span className={`text-[9px] font-bold tracking-[1px] px-2 py-[3px] w-fit ${cls}`}>
        {label}
      </span>
      <span className="text-[11px] text-[var(--text-muted)] leading-[1.6]">
        {note}
      </span>
    </div>
  );
}

function CountryCard({ data }: { data: CountryData }) {
  return (
    <div className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-5 md:p-6 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <span className="text-[22px] leading-none">{data.flag}</span>
          <h3 className="text-[16px] md:text-[18px] font-bold text-[var(--text-primary)]">
            {data.country}
          </h3>
        </div>
        <PresenceBadge presence={data.presence} label={data.presenceLabel} />
      </div>

      {/* Population stats */}
      <div className="grid grid-cols-3 divide-x divide-[var(--border-default)] border-b border-[var(--border-default)]">
        <div className="flex flex-col gap-1 p-4 md:p-5">
          <span className="text-[13px] md:text-[15px] font-bold text-[var(--text-primary)]">
            {data.officialPop}
          </span>
          <span className="text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase">
            Official
          </span>
        </div>
        <div className="flex flex-col gap-1 p-4 md:p-5">
          <span className="text-[13px] md:text-[15px] font-bold text-[var(--text-secondary)]">
            {data.unofficialPop}
          </span>
          <span className="text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase">
            Estimated
          </span>
        </div>
        <div className="flex flex-col gap-1 p-4 md:p-5">
          <span className="text-[13px] md:text-[15px] font-bold text-[var(--gold)]">
            {data.sharePercent}
          </span>
          <span className="text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase">
            Of Population
          </span>
        </div>
      </div>

      {/* Translation info */}
      <div className="grid grid-cols-2 gap-5 p-5 md:p-6 border-b border-[var(--border-default)]">
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
            Scripture
          </span>
          <TranslationBadge status={data.scripture} note={data.scriptureNote} />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
            Liturgy
          </span>
          <TranslationBadge status={data.liturgy} note={data.liturgyNote} />
        </div>
      </div>

      {/* Known workers */}
      <div className="p-5 md:p-6 border-b border-[var(--border-default)]">
        <span className="text-[9px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase block mb-2">
          Known Workers
        </span>
        <p className="text-[12px] text-[var(--text-secondary)] leading-[1.6]">
          {data.knownWorkers}
        </p>
      </div>

      {/* Source */}
      <div className="px-5 md:px-6 py-3">
        <a
          href={data.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] tracking-[0.5px] text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors duration-150"
        >
          Source ↗
        </a>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function MissionPage() {
  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="mission" />

      {/* ── Hero ── */}
      <section className="relative w-full h-[420px] md:h-[540px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/mission-hero.jpg')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,color-mix(in_srgb,var(--bg-primary)_94%,transparent)_0%,color-mix(in_srgb,var(--bg-primary)_53%,transparent)_70%,color-mix(in_srgb,var(--bg-primary)_27%,transparent)_100%)]" />
        <div className="relative z-10 flex flex-col justify-end h-full px-5 md:px-[120px] pb-12 md:pb-16">
          <div className="flex flex-col gap-5 md:gap-6 max-w-[720px]">
            <SectionLabel text="Our Mission" />
            <h1 className="text-[34px] md:text-[52px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              Bring Roma to Christ.
              <br />
              Plant a Parish. Stay.
            </h1>
            <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[620px]">
              Five million Roma people live across Southeast and Central Europe.
              Most have never heard the Gospel in a way that reached them. We
              are here to change that — one parish at a time.
            </p>
          </div>
        </div>
      </section>

      {/* ── Why: Start with Why ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
          {/* Left — headline + pull stat */}
          <div className="flex flex-col gap-6 md:gap-8 md:w-[380px] flex-shrink-0">
            <SectionLabel text="Why the Roma" />
            <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.0]">
              Europe&apos;s Most
              <br />
              Neglected People
            </h2>

            {/* Pull stat */}
            <div className="border-l-2 border-[var(--gold)] pl-6 py-2">
              <span className="text-[48px] md:text-[64px] font-bold text-[var(--gold)] leading-none block">
                10M+
              </span>
              <span className="text-[13px] text-[var(--text-secondary)] tracking-[1px] uppercase">
                Roma in Europe
              </span>
            </div>

            <p className="text-[14px] text-[var(--text-muted)] leading-[1.7]">
              No other ethnic group in Europe lives in comparable conditions.
            </p>
          </div>

          {/* Right — reasons */}
          <div className="flex flex-col gap-5 flex-1">
            {[
              {
                label: "The Poorest Group in Europe",
                body: "Roma communities consistently rank last on every measure of economic wellbeing across the continent. In many settlements, families go to bed hungry. Children grow up without running water, reliable heat, or educational access.",
              },
              {
                label: "Traditional Orthodox Roots",
                body: "The majority of Roma in Southeast and Central Europe come from traditionally Orthodox backgrounds. They are not outside the Church's historical reach — they are inside it, waiting to be called home. This is not a mission to strangers. It is a return to a family.",
              },
              {
                label: "The Youngest, Fastest-Growing Population",
                body: "Roma communities are the youngest demographic in Europe. Their birth rates are high; their life expectancy is low. The generation being formed right now will shape Central and Eastern Europe for decades. The window to invest is now.",
              }
            ].map((item, i) => (
              <div
                key={item.label}
                className="flex gap-5 p-6 md:p-7 bg-[var(--bg-card)] border border-[var(--border-default)]"
              >
                <span className="text-[var(--gold)] font-bold text-[13px] flex-shrink-0 pt-0.5">
                  0{i + 1}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[14px] md:text-[15px] font-bold text-[var(--text-primary)]">
                    {item.label}
                  </h3>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                    {item.body}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Our Story ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)] flex flex-col md:flex-row gap-12 md:gap-20 items-center">
        {/* Photo */}
        <div className="w-full md:w-[460px] h-[260px] md:h-[520px] bg-[var(--bg-card)] border border-[var(--border-default)] flex-shrink-0 overflow-hidden">
          <div
            className="w-full h-full bg-cover bg-center"
            style={{ backgroundImage: "url('/images/mission-about-us.jpg')" }}
          />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-5 md:gap-7 flex-1">
          <SectionLabel text="Our Story" />
          <h2 className="text-[28px] md:text-[38px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            One Man, One Hut,
            <br />
            One Decision to Stay
          </h2>

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.8]">
            The mission started with a designer at the peak of his career. At
            nineteen, Martin was already working internationally — remote work
            for Kiwi.com, international clients, a promising future. Then a
            chance detour brought him to Klenovec, a village in central
            Slovakia struggling with unemployment, addiction, and broken
            families.
          </p>

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.8]">
            He bought a house with friends. He tried business. Then he walked
            into a Roma settlement — and everything changed. He didn&apos;t
            send help from a distance. He moved in. He found a wooden hut
            inside the community and made it his home, determined to understand
            poverty not as a concept, but as a neighbor.
          </p>

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.8]">
            Over years of presence — playing music with children, teaching,
            earning trust one relationship at a time — a community began to
            form around the faith he carried. He married Michaela, a
            psychologist he met in Brno. Together they formalized the work into
            what is now the Kresťanská rómska misia. Their home is still in
            the community.
          </p>

          {/* Quote */}
          <div className="border-l-2 border-[var(--gold)] pl-5 py-1 mt-2">
            <p className="text-[15px] md:text-[16px] font-georgia italic text-[var(--text-primary)] leading-[1.7]">
              &ldquo;Until that point, I had not faced poverty face-to-face.&rdquo;
            </p>
            <p className="text-[11px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase mt-2">
              — Martin, Founder
            </p>
          </div>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── What We Do ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-5 md:gap-6 max-w-[680px] mb-12 md:mb-16">
          <SectionLabel text="What We Do" />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.0]">
            Two Kinds of Work.
            <br />
            One Goal.
          </h2>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.7]">
            We plant new parishes from nothing — and we walk alongside existing
            parishes learning to integrate Roma. The goal is
            always the same: a living, self-sustaining church community with
            Roma fully inside it.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Card 1 — Planting */}
          <div className="flex flex-col gap-5 p-7 md:p-9 bg-[var(--bg-primary)] border border-[var(--border-default)]">
            <span className="font-georgia text-[32px] text-[var(--gold)]">✦</span>
            <h3 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)]">
              Church Planting
            </h3>
            <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.8]">
              We enter communities where there is no parish and no priest — and
              we stay until there is. Two churches planted from scratch are
              active today. One existing parish has gone through full
              transformation. One attempt was buried by rejection — the
              community turned away. We grieve that, and we keep going. Two
              more churches are being planted now.
            </p>
            <div className="flex gap-6 pt-2 border-t border-[var(--border-default)]">
              <div className="flex flex-col gap-1">
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--gold)]">
                  3
                </span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  Planted
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--gold)]">
                  1
                </span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  Temporary lost
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--text-secondary)]">
                  +2
                </span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  In progress
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 — Parish support */}
          <div className="flex flex-col gap-5 p-7 md:p-9 bg-[var(--bg-primary)] border border-[var(--border-default)]">
            <span className="font-georgia text-[32px] text-[var(--gold)]">☦</span>
            <h3 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)]">
              Parish Transformation Support
            </h3>
            <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.8]">
              Many traditional parishes are experiencing rapid demographic
              change — Roma families moving in, attending services, seeking
              community. We help those parishes understand who their new
              neighbors are, how to communicate across cultural and educational
              differences, and how to practice genuine integration without
              erasing anyone&apos;s identity. This is slow, necessary work.
            </p>
            <div className="flex gap-6 pt-2 border-t border-[var(--border-default)]">
              <div className="flex flex-col gap-1">
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--gold)]">
                  8
                </span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  Parishes supported
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--gold)]">
                  1
                </span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  Transformed
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--gold)]">
                  50+
                </span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  Fathers started working
                </span>
              </div>
            </div>
          </div>

          {/* Card 3 — Education */}
          <div className="flex flex-col gap-5 p-7 md:p-9 bg-[var(--bg-primary)] border border-[var(--border-default)]">
            <span className="font-georgia text-[32px] text-[var(--gold)]">✦</span>
            <h3 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)]">
              Children &amp; Youth Formation
            </h3>
            <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.8]">
              Illiteracy is common among Roma children. We run catechism
              programs, literacy support, and structured youth activities
              anchored in the Church calendar. Children who learn to read
              through the Church grow up with their faith and their dignity
              intact. Parents who see their children learning come to trust the
              community that taught them.
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[var(--border-default)]">
              {[
                { value: "1,000+", label: "Children reached with the Gospel" },
                { value: "200", label: "Children learned to read & write" },
                { value: "15", label: "Joined the Church regularly" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col gap-1">
                  <span className="text-[22px] md:text-[26px] font-bold text-[var(--gold)]">
                    {s.value}
                  </span>
                  <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase leading-[1.4]">
                    {s.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4 — Mission Centers */}
          <div className="flex flex-col gap-5 p-7 md:p-9 bg-[var(--bg-primary)] border border-[var(--border-default)]">
            <span className="font-georgia text-[32px] text-[var(--gold)]">✦</span>
            <h3 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)]">
              Mission Centers
            </h3>
            <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.8]">
              We build physical infrastructure where none exists — community
              centers, meeting spaces, and places of worship that give the
              mission a permanent home. One mission center is built. A second
              is currently under construction. These spaces serve as anchors
              for everything else we do. Each center includes accommodation
              for mission trip groups, making it easy for teams to come,
              stay, and serve alongside local workers.
            </p>
            <div className="flex gap-6 pt-2 border-t border-[var(--border-default)]">
              <div>
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--gold)]">1</span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  Built
                </span>
              </div>
              <div>
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--text-secondary)]">1</span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  In Progress
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Vision + Stats ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-5 md:gap-6 max-w-[680px] mb-12 md:mb-16">
          <SectionLabel text="Our Vision" />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.0]">
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

        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-[var(--border-default)]">
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
              <span className="text-[11px] md:text-[12px] text-[var(--text-secondary)] tracking-[1px] uppercase leading-[1.4]">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)]" />

      {/* ── Countries ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-5 md:gap-6 max-w-[680px] mb-10 md:mb-14">
          <SectionLabel text="The Mission Field" />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.0]">
            Our region
          </h2>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.7]">
            The Roma population across Southeast and Central Europe — official
            census numbers, estimated real numbers, our presence, and the
            current state of Scripture and liturgical translations.
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-8 md:mb-10">
          <span className="text-[10px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase mr-2 self-center">
            Presence:
          </span>
          {[
            { label: "We're Here", cls: "bg-[#22c55e20] text-[#22c55e] border border-[#22c55e]/40" },
            { label: "Orthodox Active", cls: "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/40" },
            { label: "Next Steps", cls: "bg-[#f9731620] text-[#f97316] border border-[#f97316]/40" },
            { label: "Opportunity", cls: "text-[var(--text-muted)] border border-[var(--border-default)]" },
          ].map((b) => (
            <span
              key={b.label}
              className={`text-[9px] font-bold tracking-[1px] px-3 py-1.5 uppercase ${b.cls}`}
            >
              {b.label}
            </span>
          ))}
        </div>

        {/* Country grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-5">
          {countryData.map((country) => (
            <CountryCard key={country.country} data={country} />
          ))}
        </div>

        {/* Footnote */}
        <p className="text-[11px] text-[var(--text-muted)] leading-[1.6] mt-8 max-w-[680px]">
          Population figures are approximate. Official census numbers
          systematically undercount Roma due to self-identification
          inconsistencies and historical mistrust of authorities. Estimated
          figures reflect academic and NGO research. Translation status is
          based on publicly available information as of 2024.
        </p>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Guiding Principles ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-16">
          <SectionLabel text="What We Believe" />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.0]">
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

      {/* ── Share nudge ── */}
      <section className="px-5 md:px-[120px] py-12 md:py-16 bg-[var(--bg-primary)] flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[var(--border-default)]">
        <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.6] max-w-[520px]">
          If this mission matters to you, share it. One conversation can bring a new supporter, volunteer, or partner.
        </p>
        <ShareButton
          title={SHARE_TITLE}
          text={SHARE_TEXT}
          url={SHARE_URL}
          label="SHARE THE MISSION"
          className="flex-shrink-0 px-8 py-4 border border-[var(--gold)] text-[var(--gold)] text-[12px] font-bold tracking-[1px] hover:bg-[var(--gold)] hover:text-[#111111] transition-colors"
        />
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
