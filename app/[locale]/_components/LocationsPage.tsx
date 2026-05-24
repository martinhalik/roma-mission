"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import MissionMap from "@/components/MissionMap";
import SectionLabel from "@/components/SectionLabel";
import { useTranslation } from "@/components/LanguageProvider";
import { Users, MapPin, Church, Sprout, Heart, AlertTriangle } from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────
//
// Translatable text (subtitle, region, description, badge, programs, status,
// notes) lives in the i18n dictionary under `locations.*`. Keep only data that
// is either a proper noun (village name) or non-textual (image, year, capacity).

type CenterId = "klenovec" | "markovce";
type PlantedId = "klenovec" | "kacanov" | "mutnik";
type ActiveId = "rimavska-pila" | "zemjastrabie";

interface MissionCenter {
  id: CenterId;
  name: string;
  image: string;
  established: number | null;
  capacity: number;
  weeklyAttendance: number;
  programCount: 5 | 3;
  isDeveloping: boolean;
}

const MISSION_CENTERS: MissionCenter[] = [
  {
    id: "klenovec",
    name: "Klenovec",
    image: "klenovec outside.jpeg",
    established: 2012,
    capacity: 35,
    weeklyAttendance: 55,
    programCount: 5,
    isDeveloping: false,
  },
  {
    id: "markovce",
    name: "Markovce",
    image: "markovce-with-our-bishop.jpg",
    established: null,
    capacity: 100,
    weeklyAttendance: 30,
    programCount: 3,
    isDeveloping: true,
  },
];

interface PlantedChurch {
  id: PlantedId;
  village: string;
  yearStart: number;
  yearEnd: number | null;
  congregation: number;
  isActive: boolean;
  image: string;
}

const PLANTED_CHURCHES: PlantedChurch[] = [
  {
    id: "klenovec",
    village: "Klenovec",
    yearStart: 2012,
    yearEnd: null,
    congregation: 55,
    isActive: true,
    image: "klenovec-chapel-day.jpeg",
  },
  {
    id: "kacanov",
    village: "Kačanov",
    yearStart: 2025,
    yearEnd: null,
    congregation: 20,
    isActive: true,
    image: "kacanov-learning.jpeg",
  },
  {
    id: "mutnik",
    village: "Mútnik (Hnúšťa)",
    yearStart: 2017,
    yearEnd: 2026,
    congregation: 20,
    isActive: false,
    image: "mutnik-closed.jpeg",
  },
];

interface ActivePlant {
  id: ActiveId;
  name: string;
  village: string;
  since: number;
}

const ACTIVE_PLANTS: ActivePlant[] = [
  { id: "rimavska-pila", name: "Rimavská Pila", village: "Rimavská Pila", since: 2023 },
  { id: "zemjastrabie", name: "Zemplínske Jastrabie", village: "Zemplínske Jastrabie", since: 2025 },
];

const ENDED_PLANT = {
  name: "Hačava",
  village: "Hačava",
  image: "hacava.jpeg",
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
  const { t } = useTranslation();

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
        {/* Force photo-appropriate colours regardless of light/dark theme */}
        <div
          className="relative z-10 flex flex-col justify-end h-full px-5 md:px-[120px] pb-12 md:pb-16"
          style={
            {
              "--text-primary": "#FFFFFF",
              "--text-secondary": "rgba(255,255,255,0.72)",
              "--gold": "#D4AF37",
            } as React.CSSProperties
          }
        >
          <div className="flex flex-col gap-5 max-w-[680px]">
            <SectionLabel text={t("locations.hero.label")} />
            <h1 className="text-[34px] md:text-[50px] font-bold tracking-[-1.5px] text-[var(--text-primary)] leading-[1.05]">
              {t("locations.hero.titleLine1")}<br className="hidden md:block" /> {t("locations.hero.titleLine2")}
            </h1>
            <p className="text-[15px] md:text-[17px] text-[var(--text-secondary)] leading-[1.65] max-w-[560px]">
              {t("locations.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Quick Stats Bar ── */}
      <div className="bg-[var(--bg-card)] border-b border-[var(--border-default)]">
        <div className="px-5 md:px-[120px] py-6 flex flex-wrap gap-8 md:gap-12">
          <StatPill icon={<Church size={18} />} value={MISSION_CENTERS.length} label={t("locations.stats.missionCenters")} />
          <StatPill icon={<Heart size={18} />} value={PLANTED_CHURCHES.length} label={t("locations.stats.plantedChurches")} />
          <StatPill icon={<Sprout size={18} />} value={ACTIVE_PLANTS.length} label={t("locations.stats.activePlants")} />
          <StatPill icon={<Users size={18} />} value={`${SUPPORTED_PARISHES.length}+`} label={t("locations.stats.parishesSupported")} />
          <StatPill icon={<MapPin size={18} />} value={t("locations.stats.primaryFieldValue")} label={t("locations.stats.primaryField")} />
        </div>
      </div>

      {/* ── Mission Map ── */}
      <section className="bg-[var(--bg-card)]">
        <div className="px-5 md:px-[120px] pt-16 md:pt-[80px] pb-8">
          <SectionLabel text={t("locations.mapSection.label")} />
          <h2 className="text-[26px] md:text-[34px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05] mt-4 mb-3">
            {t("locations.mapSection.title")}
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] leading-[1.6] max-w-[540px]">
            {t("locations.mapSection.intro")}
          </p>
        </div>
        <MissionMap />
        <div className="px-5 md:px-[120px] pb-16 md:pb-[80px]" />
      </section>

      <div className="h-px bg-[var(--border-default)]" />

      {/* ── Mission Centers ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-3 mb-12">
          <SectionLabel text={t("locations.centersSection.label")} />
          <h2 className="text-[26px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)]">
            {t("locations.centersSection.title")}
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65] max-w-[540px]">
            {t("locations.centersSection.intro")}
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
          <SectionLabel text={t("locations.plantedSection.label")} />
          <h2 className="text-[26px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)]">
            {t("locations.plantedSection.title")}
          </h2>
        </div>
        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65] max-w-[560px] mb-12">
          {t("locations.plantedSection.intro")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANTED_CHURCHES.map((church) => (
            <PlantedChurchCard key={church.id} church={church} />
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)]" />

      {/* ── Active Church Plants ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-3 mb-3">
          <SectionLabel text={t("locations.activeSection.label")} />
          <h2 className="text-[26px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)]">
            {t("locations.activeSection.title")}
          </h2>
        </div>
        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65] max-w-[560px] mb-12">
          {t("locations.activeSection.intro")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ACTIVE_PLANTS.map((plant) => (
            <ActivePlantCard key={plant.id} plant={plant} />
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
                {t("locations.endedSection.label")}
              </span>
            </div>
            <h2 className="text-[22px] md:text-[30px] font-bold tracking-[-0.5px] text-[var(--text-primary)] mb-2">
              {ENDED_PLANT.name} — {t("locations.endedPlant.years")}
            </h2>
            <p className="text-[11px] tracking-[1px] text-[var(--text-muted)] uppercase mb-6 flex items-center gap-1">
              <MapPin size={10} className="inline" />
              {ENDED_PLANT.village}, {t("locations.endedSection.countryLabel")}
            </p>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.75] mb-5">
              {t("locations.endedPlant.description")}
            </p>
            <div className="border-l-2 border-[var(--border-strong)] pl-5">
              <p className="text-[13px] text-[var(--text-muted)] leading-[1.7] italic">
                <strong className="text-[var(--text-secondary)] not-italic">{t("locations.endedSection.carryForward")} </strong>
                {t("locations.endedPlant.learned")}
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
          <SectionLabel text={t("locations.supportedSection.label")} />
          <h2 className="text-[26px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)]">
            {t("locations.supportedSection.title")}
          </h2>
        </div>
        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.65] max-w-[580px] mb-12">
          {t("locations.supportedSection.intro")}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {SUPPORTED_PARISHES.map((name) => (
            <ParishPill key={name} name={name} />
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="h-px flex-1 bg-[var(--border-default)] max-w-[40px]" />
          <p className="text-[12px] text-[var(--text-muted)] italic">
            {t("locations.supportedSection.footnote")}
          </p>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}

// ─── Card Components ──────────────────────────────────────────────────────────

function MissionCenterCard({ center }: { center: MissionCenter }) {
  const { t } = useTranslation();
  const programIndices = Array.from({ length: center.programCount }, (_, i) => i + 1);

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
                ? "bg-black/70 text-white/65 border border-white/20"
                : "bg-black/70 text-[#D4AF37] border border-[#D4AF37]/40"
            }`}
          >
            {t(`locations.centers.${center.id}.badge`)}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-6 md:p-8">
        <div>
          <h3 className="text-[20px] md:text-[24px] font-bold text-[var(--text-primary)] tracking-[-0.5px]">
            {center.name}
          </h3>
          <p className="text-[12px] text-[var(--gold)] tracking-[0.5px] mt-0.5">
            {t(`locations.centers.${center.id}.subtitle`)}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
            <MapPin size={10} /> {t(`locations.centers.${center.id}.region`)}
          </p>
        </div>

        <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.75]">
          {t(`locations.centers.${center.id}.description`)}
        </p>

        {!center.isDeveloping && (
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-[var(--border-default)]">
            <div className="flex flex-col gap-1">
              <span className="text-[20px] font-bold text-[var(--gold)]">{center.capacity}</span>
              <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">{t("locations.centersSection.capacity")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[20px] font-bold text-[var(--text-primary)]">
                {center.weeklyAttendance}
              </span>
              <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">{t("locations.centersSection.weeklyAvg")}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[20px] font-bold text-[var(--text-primary)]">
                {center.established}
              </span>
              <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">{t("locations.centersSection.established")}</span>
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] tracking-[1.5px] text-[var(--text-muted)] uppercase mb-3">
            {t("locations.centersSection.programsLabel")}
          </p>
          <div className="flex flex-wrap gap-2">
            {programIndices.map((n) => (
              <span
                key={n}
                className="text-[11px] text-[var(--text-secondary)] bg-[var(--bg-elevated)] px-3 py-1"
              >
                {t(`locations.centers.${center.id}.program${n}`)}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function PlantedChurchCard({ church }: { church: PlantedChurch }) {
  const { t } = useTranslation();
  const status = t(`locations.planted.${church.id}.status`);
  const statusStyle =
    church.id === "klenovec"
      ? "bg-black/70 text-[#D4AF37] border border-[#D4AF37]/40"
      : church.id === "kacanov"
        ? "bg-black/70 text-[#4ADE80] border border-[#4ADE80]/40"
        : "bg-black/70 text-white/60 border border-white/20";

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
            {status}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-[19px] font-bold text-white tracking-[-0.5px] leading-[1.15]">
            {t(`locations.planted.${church.id}.name`)}
          </h3>
          <p className="text-[11px] text-white/55 flex items-center gap-1 mt-1">
            <MapPin size={9} /> {church.village}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 p-5 flex-1">
        <p className="text-[13px] text-[var(--text-secondary)] leading-[1.75] flex-1">
          {t(`locations.planted.${church.id}.note`)}
        </p>

        {/* Footer */}
        <div className="flex items-end justify-between pt-4 border-t border-[var(--border-default)]">
          <div>
            <span className="text-[16px] font-bold text-[var(--text-muted)]">
              {church.yearStart}
              {church.yearEnd ? ` – ${church.yearEnd}` : " —"}
            </span>
            <span className="block text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase mt-0.5">
              {church.yearEnd ? t("locations.plantedSection.yearsActive") : t("locations.plantedSection.ongoing")}
            </span>
          </div>
          {church.congregation && (
            <div className="text-right">
              <span className="text-[16px] font-bold text-[var(--gold)]">{church.congregation}</span>
              <span className="block text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase mt-0.5">
                {t("locations.plantedSection.weeklyAvg")}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivePlantCard({ plant }: { plant: ActivePlant }) {
  const { t } = useTranslation();
  const yearsIn = 2026 - plant.since;
  const yearsLabel =
    yearsIn < 1
      ? `${t("locations.activeSection.yearLessThan")}${t("locations.activeSection.yearShort")}`
      : `${yearsIn}${yearsIn === 1 ? t("locations.activeSection.yearShort") : t("locations.activeSection.yearsShort")}`;

  return (
    <div className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden">
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[9px] font-semibold tracking-[2px] text-[var(--gold)] bg-[var(--gold)]/10 border border-[var(--gold)]/30 px-2 py-1 uppercase inline-block mb-2">
              {t("locations.activeSection.activeBadge")}
            </span>
            <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{plant.name}</h3>
            <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
              <MapPin size={9} /> {plant.village}
            </p>
          </div>
        </div>
        <p className="text-[12px] text-[var(--text-secondary)] leading-[1.7]">
          {t(`locations.activePlants.${plant.id}.description`)}
        </p>
        <div className="flex gap-4 pt-3 border-t border-[var(--border-default)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[16px] font-bold text-[var(--gold)]">{plant.since}</span>
            <span className="text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase">{t("locations.activeSection.started")}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[16px] font-bold text-[var(--text-primary)]">
              {yearsLabel}
            </span>
            <span className="text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase">{t("locations.activeSection.inField")}</span>
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
