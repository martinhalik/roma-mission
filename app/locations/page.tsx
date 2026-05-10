"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import MissionMap from "@/components/MissionMap";
import SectionLabel from "@/components/SectionLabel";
import { useTranslation } from "@/components/LanguageProvider";
import {
  Users,
  MapPin,
  Church,
  Sprout,
  Heart,
  AlertTriangle,
} from "lucide-react";

// ─── Static, non-localizable data (proper names, ids, numbers, images) ───────

const MISSION_CENTERS = [
  {
    id: "klenovec" as const,
    name: "Klenovec",
    established: 2012 as number | null,
    capacity: 35,
    weeklyAttendance: 55,
    image: "klenovec outside.jpeg",
    isDeveloping: false,
  },
  {
    id: "markovce" as const,
    name: "Markovce",
    established: null as number | null,
    capacity: 100,
    weeklyAttendance: 30,
    image: "markovce-with-our-bishop.jpg",
    isDeveloping: true,
  },
];

const PLANTED_CHURCHES = [
  {
    id: "klenovec" as const,
    village: "Klenovec",
    yearStart: 2012,
    yearEnd: null as number | null,
    congregation: 55,
    statusKey: "missionCenter" as const,
    isActive: true,
    image: "klenovec-chapel-day.jpeg",
  },
  {
    id: "kacanov" as const,
    village: "Kačanov",
    yearStart: 2025,
    yearEnd: null as number | null,
    congregation: 20,
    statusKey: "firstChapel" as const,
    isActive: true,
    image: "kacanov-learning.jpeg",
  },
  {
    id: "mutnik" as const,
    village: "Mútnik (Hnúšťa)",
    yearStart: 2017,
    yearEnd: 2026 as number | null,
    congregation: 20,
    statusKey: "concluded2026" as const,
    isActive: false,
    image: "mutnik-closed.jpeg",
  },
];

const ACTIVE_PLANTS = [
  {
    id: "rimavskaPila" as const,
    name: "Rimavská Pila",
    village: "Rimavská Pila",
    since: 2023,
  },
  {
    id: "zemjastrabie" as const,
    name: "Zemplínske Jastrabie",
    village: "Zemplínske Jastrabie",
    since: 2025,
  },
];

const ENDED_PLANT_IMAGE = "hacava.jpeg";

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
  const { t, dict } = useTranslation();
  const L = dict.locations;

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
              {t("locations.hero.titleLine1")}
              <br className="hidden md:block" /> {t("locations.hero.titleLine2")}
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
          <StatPill
            icon={<Church size={18} />}
            value={MISSION_CENTERS.length}
            label={t("locations.stats.missionCenters")}
          />
          <StatPill
            icon={<Heart size={18} />}
            value={PLANTED_CHURCHES.length}
            label={t("locations.stats.plantedChurches")}
          />
          <StatPill
            icon={<Sprout size={18} />}
            value={ACTIVE_PLANTS.length}
            label={t("locations.stats.activePlants")}
          />
          <StatPill
            icon={<Users size={18} />}
            value={`${SUPPORTED_PARISHES.length}+`}
            label={t("locations.stats.parishesSupported")}
          />
          <StatPill
            icon={<MapPin size={18} />}
            value={t("locations.stats.primaryFieldValue")}
            label={t("locations.stats.primaryField")}
          />
        </div>
      </div>

      {/* ── Mission Map ── */}
      <section className="bg-[var(--bg-card)]">
        <div className="px-5 md:px-[120px] pt-16 md:pt-[80px] pb-8">
          <SectionLabel text={t("locations.map.label")} />
          <h2 className="text-[26px] md:text-[34px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05] mt-4 mb-3">
            {t("locations.map.sectionTitle")}
          </h2>
          <p className="text-[14px] text-[var(--text-secondary)] leading-[1.6] max-w-[540px]">
            {t("locations.map.sectionSubtitle")}
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
            {t("locations.centersSection.subtitle")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {MISSION_CENTERS.map((center) => {
            const data = L.centers[center.id];
            return (
              <MissionCenterCard
                key={center.id}
                center={center}
                name={center.name}
                subtitle={data.subtitle}
                region={data.region}
                description={data.description}
                badge={data.badge}
                programs={data.programs}
                capacityLabel={t("locations.cards.capacity")}
                weeklyAvgLabel={t("locations.cards.weeklyAvg")}
                establishedLabel={t("locations.cards.established")}
                programsRunningLabel={t("locations.cards.programsRunning")}
              />
            );
          })}
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
          {t("locations.plantedSection.subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANTED_CHURCHES.map((church) => {
            const data = L.planted[church.id];
            return (
              <PlantedChurchCard
                key={church.id}
                church={church}
                name={data.name}
                note={data.note}
                statusLabel={t(`locations.statuses.${church.statusKey}`)}
                yearsActiveLabel={t("locations.cards.yearsActive")}
                ongoingLabel={t("locations.cards.ongoing")}
                weeklyAvgLabel={t("locations.cards.weeklyAvg")}
              />
            );
          })}
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
          {t("locations.activeSection.subtitle")}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {ACTIVE_PLANTS.map((plant) => (
            <ActivePlantCard
              key={plant.id}
              plant={plant}
              description={L.active[plant.id].description}
              activeBadge={t("locations.cards.badgeActive")}
              startedLabel={t("locations.cards.started")}
              inFieldLabel={t("locations.cards.inField")}
            />
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
              {L.ended.name} — {L.ended.years}
            </h2>
            <p className="text-[11px] tracking-[1px] text-[var(--text-muted)] uppercase mb-6 flex items-center gap-1">
              <MapPin size={10} className="inline" />
              {L.ended.village}, {t("locations.endedSection.locationCountry")}
            </p>
            <p className="text-[15px] text-[var(--text-secondary)] leading-[1.75] mb-5">
              {L.ended.description}
            </p>
            <div className="border-l-2 border-[var(--border-strong)] pl-5">
              <p className="text-[13px] text-[var(--text-muted)] leading-[1.7] italic">
                <strong className="text-[var(--text-secondary)] not-italic">
                  {t("locations.endedSection.carryForward")}{" "}
                </strong>
                {L.ended.learned}
              </p>
            </div>
          </div>
          <div
            className="w-full h-[280px] md:h-[380px] bg-cover bg-center"
            style={{ backgroundImage: `url('/images/${ENDED_PLANT_IMAGE}')` }}
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
          {t("locations.supportedSection.subtitle")}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {SUPPORTED_PARISHES.map((name) => (
            <ParishPill key={name} name={name} />
          ))}
        </div>

        <div className="flex items-center gap-3 mt-4">
          <div className="h-px flex-1 bg-[var(--border-default)] max-w-[40px]" />
          <p className="text-[12px] text-[var(--text-muted)] italic">
            {t("locations.supportedSection.more")}
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
  name,
  subtitle,
  region,
  description,
  badge,
  programs,
  capacityLabel,
  weeklyAvgLabel,
  establishedLabel,
  programsRunningLabel,
}: {
  center: (typeof MISSION_CENTERS)[number];
  name: string;
  subtitle: string;
  region: string;
  description: string;
  badge: string;
  programs: readonly string[];
  capacityLabel: string;
  weeklyAvgLabel: string;
  establishedLabel: string;
  programsRunningLabel: string;
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
                ? "bg-black/70 text-white/65 border border-white/20"
                : "bg-black/70 text-[#D4AF37] border border-[#D4AF37]/40"
            }`}
          >
            {badge}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-5 p-6 md:p-8">
        <div>
          <h3 className="text-[20px] md:text-[24px] font-bold text-[var(--text-primary)] tracking-[-0.5px]">
            {name}
          </h3>
          <p className="text-[12px] text-[var(--gold)] tracking-[0.5px] mt-0.5">
            {subtitle}
          </p>
          <p className="text-[11px] text-[var(--text-muted)] mt-1 flex items-center gap-1">
            <MapPin size={10} /> {region}
          </p>
        </div>

        <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.75]">
          {description}
        </p>

        {!center.isDeveloping && (
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-[var(--border-default)]">
            <div className="flex flex-col gap-1">
              <span className="text-[20px] font-bold text-[var(--gold)]">{center.capacity}</span>
              <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">
                {capacityLabel}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[20px] font-bold text-[var(--text-primary)]">
                {center.weeklyAttendance}
              </span>
              <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">
                {weeklyAvgLabel}
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[20px] font-bold text-[var(--text-primary)]">
                {center.established}
              </span>
              <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">
                {establishedLabel}
              </span>
            </div>
          </div>
        )}

        <div>
          <p className="text-[10px] tracking-[1.5px] text-[var(--text-muted)] uppercase mb-3">
            {programsRunningLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {programs.map((prog) => (
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
  name,
  note,
  statusLabel,
  yearsActiveLabel,
  ongoingLabel,
  weeklyAvgLabel,
}: {
  church: (typeof PLANTED_CHURCHES)[number];
  name: string;
  note: string;
  statusLabel: string;
  yearsActiveLabel: string;
  ongoingLabel: string;
  weeklyAvgLabel: string;
}) {
  const statusStyle =
    church.statusKey === "missionCenter"
      ? "bg-black/70 text-[#D4AF37] border border-[#D4AF37]/40"
      : church.statusKey === "firstChapel"
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
            {statusLabel}
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-[19px] font-bold text-white tracking-[-0.5px] leading-[1.15]">
            {name}
          </h3>
          <p className="text-[11px] text-white/55 flex items-center gap-1 mt-1">
            <MapPin size={9} /> {church.village}
          </p>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-col gap-4 p-5 flex-1">
        <p className="text-[13px] text-[var(--text-secondary)] leading-[1.75] flex-1">
          {note}
        </p>

        {/* Footer */}
        <div className="flex items-end justify-between pt-4 border-t border-[var(--border-default)]">
          <div>
            <span className="text-[16px] font-bold text-[var(--text-muted)]">
              {church.yearStart}
              {church.yearEnd ? ` – ${church.yearEnd}` : " —"}
            </span>
            <span className="block text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase mt-0.5">
              {church.yearEnd ? yearsActiveLabel : ongoingLabel}
            </span>
          </div>
          {church.congregation && (
            <div className="text-right">
              <span className="text-[16px] font-bold text-[var(--gold)]">{church.congregation}</span>
              <span className="block text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase mt-0.5">
                {weeklyAvgLabel}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function ActivePlantCard({
  plant,
  description,
  activeBadge,
  startedLabel,
  inFieldLabel,
}: {
  plant: (typeof ACTIVE_PLANTS)[number];
  description: string;
  activeBadge: string;
  startedLabel: string;
  inFieldLabel: string;
}) {
  const yearsIn = 2026 - plant.since;
  return (
    <div className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden">
      <div className="flex flex-col gap-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[9px] font-semibold tracking-[2px] text-[var(--gold)] bg-[var(--gold)]/10 border border-[var(--gold)]/30 px-2 py-1 uppercase inline-block mb-2">
              {activeBadge}
            </span>
            <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{plant.name}</h3>
            <p className="text-[11px] text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
              <MapPin size={9} /> {plant.village}
            </p>
          </div>
        </div>
        <p className="text-[12px] text-[var(--text-secondary)] leading-[1.7]">{description}</p>
        <div className="flex gap-4 pt-3 border-t border-[var(--border-default)]">
          <div className="flex flex-col gap-0.5">
            <span className="text-[16px] font-bold text-[var(--gold)]">{plant.since}</span>
            <span className="text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase">
              {startedLabel}
            </span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[16px] font-bold text-[var(--text-primary)]">
              {yearsIn < 1 ? "<1" : yearsIn}yr{yearsIn !== 1 ? "s" : ""}
            </span>
            <span className="text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase">
              {inFieldLabel}
            </span>
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
