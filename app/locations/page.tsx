import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import MissionMap from "@/components/MissionMap";
import SectionLabel from "@/components/SectionLabel";
import { Users, MapPin, Church, Sprout, Heart, AlertTriangle, Building2 } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const MISSION_CENTERS = [
  {
    id: "klenovec",
    name: "Klenovec",
    subtitle: "Parish Planted · Mission Center Built",
    region: "Banská Bystrica Region, SK",
    established: 2012,
    capacity: 35,
    weeklyAttendance: 55,
    image: "klenovec outside.jpeg",
    description:
      "Klenovec is where the mission took root. A Roma family opened their home for prayer, a parish was planted, and over the years a full mission center was built on that foundation. Today it serves as our primary operational base — chapel, community space, and the daily work of being present among the people.",
    programs: ["Sunday Liturgy", "Children's Bible club", "Leadership training", "Home visits", "Baptism prep"],
    badge: "PLANTED PARISH · MISSION CENTER",
  },
  {
    id: "markovce",
    name: "Markovce",
    subtitle: "Parish in Transition → Mission Center",
    region: "Prešov Region, SK",
    established: null,
    capacity: 100,
    weeklyAttendance: 30,
    image: "markovce-with-our-bishop.jpg",
    description:
      "Markovce began as a supported parish — one of many places where our team showed up, ran programs, and helped a local congregation reach its Roma neighbors. The roots have gone deep enough that we are now building this location into a full mission center. The transition is underway.",
    programs: ["Roma outreach", "Sunday ministry support", "Community formation"],
    badge: "DEVELOPING CENTER",
    isDeveloping: true,
  },
];

const PLANTED_CHURCHES = [
  {
    name: "Klenovec Roma Sub-parish",
    village: "Klenovec",
    yearStart: 2012,
    yearEnd: null,
    congregation: 55,
    note: "Planted as a parish, a physical mission center was later built on the same foundation. Now our primary base.",
    status: "MISSION CENTER",
    isActive: true,
    image: "klenovec-chapel-day.jpeg",
  },
  {
    name: "Kačanov Roma Community",
    village: "Kačanov",
    yearStart: 2025,
    yearEnd: null,
    congregation: 20,
    note: "The community is strong and gathering regularly. We are now building a church — the people came first, the building follows.",
    status: "FIRST CHAPEL",
    isActive: true,
    image: "kacanov-learning.jpeg",
  },
  {
    name: "Mútnik Roma Community",
    village: "Mútnik (Hnúšťa)",
    yearStart: 2017,
    yearEnd: 2026,
    congregation: 20,
    note: "Nine years of faithful presence. A community formed, believers were baptized, and local leaders emerged. This chapter concluded in 2026.",
    status: "CONCLUDED 2026",
    isActive: false,
    image: "mutnik-closed.jpeg",
  },
];

const ACTIVE_PLANTS = [
  {
    name: "Rimavská Pila",
    village: "Rimavská Pila",
    since: 2023,
    description:
      "Two years in. Regular gatherings established, a core group forming. The most mature of our current planting efforts.",
  },
  {
    name: "Zemplínske Jastrabie",
    village: "Zemplínske Jastrabie",
    since: 2025,
    description:
      "A settlement we've prayed over for years. We finally have a door open. Early outreach underway.",
  },
];

const ENDED_PLANT = {
  name: "Hačava",
  village: "Hačava",
  years: "2017 — not continued",
  image: "hacava.jpeg",
  description:
    "We entered Hačava with a genuine open door and early fruit. But we could not sustain a consistent missionary presence — our team in Klenovec simply did not have enough volunteers to keep covering this village on top of everything else. Without someone going week after week, the community could not hold together. We had to stop.",
  learned:
    "If you are considering joining our volunteer team in Klenovec, Hačava is why it matters. Every person we add to our base expands how far we can reach. A village like this is waiting for someone with enough time to go.",
};

const SUPPORTED_PARISHES = [
  "Varadka",
  "Závadka",
  "Cejkov",
  "Kurov",
  "Lukov",
  "Petrová",
  "Strážske",
  "Zbudská Belá",
];

// ─── Sub-components ──────────────────────────────────────────────────────────

function StatPill({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="text-[var(--gold)]">{icon}</div>
      <div>
        <div className="text-[17px] font-bold text-[var(--text-primary)]">{value}</div>
        <div className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">{label}</div>
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default function LocationsPage() {
  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="locations" />

      {/* ── Hero ── */}
      <section className="relative w-full h-[420px] md:h-[520px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/location-markovce.jpg')" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(0deg, #111111F0 0%, #11111199 55%, #11111155 100%)",
          }}
        />
        <div className="relative z-10 flex flex-col justify-end h-full px-5 md:px-[120px] pb-12 md:pb-16">
          <div className="flex flex-col gap-5 max-w-[680px]">
            <SectionLabel text="Our Field of Work" />
            <h1 className="text-[34px] md:text-[50px] font-bold tracking-[-1.5px] text-[var(--text-primary)] leading-[1.05]">
              Every village on this map<br className="hidden md:block" /> is a name we pray.
            </h1>
            <p className="text-[15px] md:text-[17px] text-[var(--text-secondary)] leading-[1.65] max-w-[560px]">
              Two mission centers. Planted churches. Active church plants. Parishes across
              eastern and southern Slovakia where Roma families have heard the Gospel —
              many for the first time in their family line.
            </p>
          </div>
        </div>
      </section>

      {/* ── Quick Stats Bar ── */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-default)]">
        <div className="px-5 md:px-[120px] py-6 flex flex-wrap gap-8 md:gap-12">
          <StatPill icon={<Church size={18} />} value={MISSION_CENTERS.length} label="Mission Centers" />
          <StatPill icon={<Heart size={18} />} value={PLANTED_CHURCHES.length} label="Planted Churches" />
          <StatPill icon={<Sprout size={18} />} value={ACTIVE_PLANTS.length} label="Active Church Plants" />
          <StatPill icon={<Users size={18} />} value={`${SUPPORTED_PARISHES.length}+`} label="Parishes Supported" />
          <StatPill icon={<MapPin size={18} />} value="Slovakia" label="Primary Field" />
        </div>
      </div>

      {/* ── Mission Map ── */}
      <section className="bg-[var(--bg-card)]">
        <div className="px-5 md:px-[120px] pt-16 md:pt-[80px] pb-8">
          <SectionLabel text="Mission Field" />
          <h2 className="text-[26px] md:text-[34px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05] mt-4 mb-3">
            Slovakia — Where We Work
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] leading-[1.6] max-w-[540px]">
            Southern and eastern Slovakia holds the highest concentration of Roma settlements
            in the country. We go where established churches do not.
          </p>
        </div>
        <MissionMap />
        <div className="px-5 md:px-[120px] pb-16 md:pb-[80px]" />
      </section>

      <div className="h-px bg-[var(--border-default)]" />

      {/* ── Mission Centers ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-3 mb-12">
          <SectionLabel text="Mission Centers" />
          <h2 className="text-[26px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)]">
            Two operational bases
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65] max-w-[540px]">
            A mission center is a permanent, full-time presence — not just a program we run,
            but a place where our people live, work, and worship among the Roma community.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MISSION_CENTERS.map((center) => (
            <MissionCenterCard key={center.id} center={center} />
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)]" />

      {/* ── Planted Churches ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-3 mb-3">
          <SectionLabel text="Planted Churches" />
          <h2 className="text-[26px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)]">
            Communities we planted
          </h2>
        </div>
        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65] max-w-[560px] mb-12">
          A planted church is a congregation that did not exist before we arrived.
          We enter, we disciple, we raise leadership, we step back. Some become
          mission centers. Some run for years and conclude. Both outcomes matter.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANTED_CHURCHES.map((church) => (
            <PlantedChurchCard key={church.name} church={church} />
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)]" />

      {/* ── Active Church Plants ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-3 mb-3">
          <SectionLabel text="Currently Planting" />
          <h2 className="text-[26px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)]">
            Where we are right now
          </h2>
        </div>
        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65] max-w-[560px] mb-12">
          These are not programs. These are our missionaries showing up week after week in villages
          where Roma families have no church, no pastor, and often no one who comes just for them.
          Your support keeps them going.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ACTIVE_PLANTS.map((plant) => (
            <ActivePlantCard key={plant.name} plant={plant} />
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)]" />

      {/* ── One We Couldn't Continue ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[80px] bg-[var(--warm-bg)]">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-start max-w-[1080px]">
          <div>
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle size={15} className="text-[var(--text-muted)]" />
              <span className="text-[11px] font-semibold tracking-[2px] text-[var(--text-muted)] uppercase">
                Honest Accounting
              </span>
            </div>
            <h2 className="text-[22px] md:text-[30px] font-bold tracking-[-0.5px] text-[var(--text-primary)] mb-2">
              {ENDED_PLANT.name} — {ENDED_PLANT.years}
            </h2>
            <p className="text-[11px] tracking-[1px] text-[var(--text-muted)] uppercase mb-6 flex items-center gap-1">
              <MapPin size={10} className="inline" />
              {ENDED_PLANT.village}, Slovakia
            </p>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.75] mb-5">
              {ENDED_PLANT.description}
            </p>
            <div className="border-l-2 border-[var(--border-strong)] pl-5">
              <p className="text-[13px] text-[var(--text-muted)] leading-[1.7] italic">
                <strong className="text-[var(--text-secondary)] not-italic">What we carry forward: </strong>
                {ENDED_PLANT.learned}
              </p>
            </div>
          </div>
          <div
            className="w-full h-[280px] md:h-[380px] bg-cover bg-center"
            style={{ backgroundImage: `url('/images/${ENDED_PLANT.image}')` }}
          />
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)]" />

      {/* ── Parishes Supported ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-3 mb-3">
          <SectionLabel text="Parishes We Have Supported" />
          <h2 className="text-[26px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)]">
            Serving alongside local priests
          </h2>
        </div>
        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65] max-w-[580px] mb-12">
          Not every Roma community needs a new church. Sometimes a local parish already exists
          but lacks the people and tools to reach the Roma settlement next door.
          We go in, do the ministry, and support the priest who is already there.
          Below are the parishes where we have served — some briefly, some for years.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {SUPPORTED_PARISHES.map((name) => (
            <ParishPill key={name} name={name} />
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="h-px flex-1 bg-[var(--border-default)] max-w-[40px]" />
          <p className="text-[12px] text-[var(--text-muted)] italic">
            and more — the list grows as new doors open.
          </p>
        </div>

        
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}

// ─── Card Components ──────────────────────────────────────────────────────────

function MissionCenterCard({
  center,
}: {
  center: (typeof MISSION_CENTERS)[number];
}) {
  return (
    <div className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden">
      <div
        className="w-full h-[220px] md:h-[280px] bg-[var(--bg-elevated)] bg-cover bg-center relative"
        style={{ backgroundImage: `url('/images/${center.image}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000BB] to-transparent" />
        <div className="absolute bottom-4 left-5">
          <span
            className={`text-[9px] font-semibold tracking-[1.5px] px-3 py-1 ${
              center.isDeveloping
                ? "bg-[var(--bg-elevated)] text-[var(--text-secondary)] border border-[var(--border-strong)]"
                : "bg-[#D4AF3720] text-[var(--gold)] border border-[#D4AF3740]"
            }`}
          >
            {center.badge}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-6 md:p-8">
        <div>
          <h3 className="text-[20px] md:text-[24px] font-bold text-[var(--text-primary)] tracking-[-0.5px]">
            {center.name}
          </h3>
          <p className="text-[12px] text-[var(--gold)] tracking-[0.5px] mt-0.5">
            {center.subtitle}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
            <MapPin size={10} /> {center.region}
          </p>
        </div>

        <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.75]">
          {center.description}
        </p>

        {!center.isDeveloping && (
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-[var(--border-default)]">
            <div className="flex flex-col gap-1">
              <span className="text-[20px] font-bold text-[var(--gold)]">{center.capacity}</span>
              <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">Capacity</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[20px] font-bold text-[var(--text-primary)]">
                {center.weeklyAttendance}
              </span>
              <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">Weekly Avg</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[20px] font-bold text-[var(--text-primary)]">
                {center.established}
              </span>
              <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">Est.</span>
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] tracking-[1.5px] text-[var(--text-muted)] uppercase mb-3">
            Programs Running
          </p>
          <div className="flex flex-wrap gap-2">
            {center.programs.map((prog) => (
              <span
                key={prog}
                className="text-[11px] text-[var(--text-secondary)] bg-[var(--bg-elevated)] px-3 py-1"
              >
                {prog}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlantedChurchCard({
  church,
}: {
  church: (typeof PLANTED_CHURCHES)[number];
}) {
  const statusStyle =
    church.status === "MISSION CENTER"
      ? "bg-[#D4AF3720] text-[var(--gold)] border border-[#D4AF3740]"
      : church.status === "FIRST CHAPEL"
        ? "bg-[#14532D88] text-[#4ADE80] border border-[#166534]"
        : "bg-[var(--bg-elevated)] text-[var(--text-muted)] border border-[var(--border-strong)]";

  return (
    <div
      className={`flex flex-col bg-[var(--bg-elevated)] border border-[var(--border-default)] overflow-hidden ${
        !church.isActive ? "opacity-70" : ""
      }`}
    >
      {/* Image */}
      <div
        className="w-full h-[220px] bg-cover bg-center relative"
        style={{ backgroundImage: `url('/images/${church.image}')` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-[#000000CC] via-[#00000044] to-[#00000022]" />
        <div className="absolute top-4 left-4">
          <span className={`text-[9px] font-semibold tracking-[1.5px] px-2.5 py-1 uppercase ${statusStyle}`}>
            {church.status}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-[19px] font-bold text-white tracking-[-0.5px] leading-[1.15]">
            {church.name}
          </h3>
          <p className="text-[11px] text-white/55 flex items-center gap-1 mt-1">
            <MapPin size={9} /> {church.village}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 p-5 flex-1">
        <p className="text-[13px] text-[var(--text-secondary)] leading-[1.75] flex-1">
          {church.note}
        </p>

        {/* Footer */}
        <div className="flex items-end justify-between pt-4 border-t border-[var(--border-default)]">
          <div>
            <span className="text-[16px] font-bold text-[var(--text-muted)]">
              {church.yearStart}
              {church.yearEnd ? ` – ${church.yearEnd}` : " —"}
            </span>
            <span className="block text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase mt-0.5">
              {church.yearEnd ? "years active" : "ongoing"}
            </span>
          </div>
          {church.congregation && (
            <div className="text-right">
              <span className="text-[16px] font-bold text-[var(--gold)]">{church.congregation}</span>
              <span className="block text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase mt-0.5">
                weekly avg
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivePlantCard({ plant }: { plant: (typeof ACTIVE_PLANTS)[number] }) {
  const yearsIn = 2026 - plant.since;
  return (
    <div className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden">
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[9px] font-semibold tracking-[2px] text-[#4ADE80] bg-[#14532D88] border border-[#166534] px-2 py-1 uppercase inline-block mb-2">
              Active
            </span>
            <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{plant.name}</h3>
            <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
              <MapPin size={9} /> {plant.village}
            </p>
          </div>
        </div>
        <p className="text-[12px] text-[var(--text-secondary)] leading-[1.7]">{plant.description}</p>
        <div className="flex gap-4 pt-3 border-t border-[var(--border-default)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[16px] font-bold text-[var(--gold)]">{plant.since}</span>
            <span className="text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase">Started</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[16px] font-bold text-[var(--text-primary)]">
              {yearsIn < 1 ? "<1" : yearsIn}yr{yearsIn !== 1 ? "s" : ""}
            </span>
            <span className="text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase">In field</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function ParishPill({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] px-4 py-3">
      <MapPin size={10} className="text-[var(--text-muted)] shrink-0" />
      <span className="text-[13px] text-[var(--text-secondary)] font-medium">{name}</span>
    </div>
  );
}
