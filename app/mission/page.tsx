"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import Link from "next/link";
import SectionLabel from "@/components/SectionLabel";
import ShareButton from "@/components/ShareButton";
import { ROMA_COUNTRIES, isMissionCountry, type MissionCountry, type Presence, type TranslationStatus } from "@/lib/data/roma-countries";
import { useTranslation } from "@/components/LanguageProvider";

const SHARE_URL = "https://romamission.eu/mission";
const SHARE_TITLE = "Roma Mission — Europe's Most Neglected People";
const SHARE_TEXT =
  "Five million Roma in Europe. Most unreached. One Orthodox mission committed to staying until there's a parish. Worth knowing about:";

// ── Data ───────────────────────────────────────────────────────────────────────

const countryData: MissionCountry[] = ROMA_COUNTRIES.filter(isMissionCountry);

const beliefKeys = [
  { icon: "☦", titleKey: "mission.beliefs.sacramentalTitle", descKey: "mission.beliefs.sacramentalDesc" },
  { icon: "✦", titleKey: "mission.beliefs.longTermTitle", descKey: "mission.beliefs.longTermDesc" },
  { icon: "✦", titleKey: "mission.beliefs.communityTitle", descKey: "mission.beliefs.communityDesc" },
];

const visionStatKeys: { value: string; labelKey: string }[] = [
  { value: "8", labelKey: "mission.vision.statParishesSupported" },
  { value: "2", labelKey: "mission.vision.statChurchesActive" },
  { value: "1", labelKey: "mission.vision.statCenterBuilt" },
  { value: "1", labelKey: "mission.vision.statCenterInProgress" },
];

const reasonKeys = [
  { titleKey: "mission.whyRoma.reason1Title", bodyKey: "mission.whyRoma.reason1Body" },
  { titleKey: "mission.whyRoma.reason2Title", bodyKey: "mission.whyRoma.reason2Body" },
  { titleKey: "mission.whyRoma.reason3Title", bodyKey: "mission.whyRoma.reason3Body" },
];

const presenceLabelKey: Record<Presence, string> = {
  active: "mission.countries.legendActive",
  orthodox: "mission.countries.legendOrthodox",
  opportunity: "mission.countries.legendOpportunity",
  "next-steps": "mission.countries.legendNextSteps",
};

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
  const { t } = useTranslation();
  const config: Record<TranslationStatus, { labelKey: string; cls: string }> = {
    available: {
      labelKey: "mission.countries.badgeAvailable",
      cls: "text-[var(--gold)] bg-[var(--gold)]/[0.07] border border-[var(--gold)]/30",
    },
    partial: {
      labelKey: "mission.countries.badgePartial",
      cls: "text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border-default)]",
    },
    progress: {
      labelKey: "mission.countries.badgeProgress",
      cls: "text-[var(--text-secondary)] bg-[var(--bg-elevated)] border border-[var(--border-strong)]",
    },
    needed: {
      labelKey: "mission.countries.badgeNeeded",
      cls: "text-[var(--text-muted)] bg-transparent border border-[var(--border-default)]",
    },
  };
  const { labelKey, cls } = config[status];
  return (
    <div className="flex flex-col gap-1.5">
      <span className={`text-[9px] font-bold tracking-[1px] px-2 py-[3px] w-fit ${cls}`}>
        {t(labelKey)}
      </span>
      <span className="text-[11px] text-[var(--text-muted)] leading-[1.6]">
        {note}
      </span>
    </div>
  );
}

function CountryCard({ data }: { data: MissionCountry }) {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 p-5 md:p-6 border-b border-[var(--border-default)]">
        <div className="flex items-center gap-3">
          <span className="text-[22px] leading-none">{data.flag}</span>
          <h3 className="text-[16px] md:text-[18px] font-bold text-[var(--text-primary)]">
            {t(`countries.${data.iso}`)}
          </h3>
        </div>
        <PresenceBadge presence={data.presence} label={t(presenceLabelKey[data.presence])} />
      </div>

      {/* Population stats */}
      <div className="grid grid-cols-3 divide-x divide-[var(--border-default)] border-b border-[var(--border-default)]">
        <div className="flex flex-col gap-1 p-4 md:p-5">
          <span className="text-[13px] md:text-[15px] font-bold text-[var(--text-primary)]">
            {data.officialPop}
          </span>
          <span className="text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase">
            {t("mission.countries.cardOfficial")}
          </span>
        </div>
        <div className="flex flex-col gap-1 p-4 md:p-5">
          <span className="text-[13px] md:text-[15px] font-bold text-[var(--text-secondary)]">
            {data.unofficialPop}
          </span>
          <span className="text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase">
            {t("mission.countries.cardEstimated")}
          </span>
        </div>
        <div className="flex flex-col gap-1 p-4 md:p-5">
          <span className="text-[13px] md:text-[15px] font-bold text-[var(--gold)]">
            {data.sharePercent}
          </span>
          <span className="text-[9px] tracking-[1px] text-[var(--text-muted)] uppercase">
            {t("mission.countries.cardOfPopulation")}
          </span>
        </div>
      </div>

      {/* Translation info */}
      <div className="grid grid-cols-2 gap-5 p-5 md:p-6 border-b border-[var(--border-default)]">
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
            {t("mission.countries.cardScripture")}
          </span>
          <TranslationBadge status={data.scripture} note={data.scriptureNote} />
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-[9px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
            {t("mission.countries.cardLiturgy")}
          </span>
          <TranslationBadge status={data.liturgy} note={data.liturgyNote} />
        </div>
      </div>

      {/* Known workers */}
      <div className="p-5 md:p-6 border-b border-[var(--border-default)]">
        <span className="text-[9px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase block mb-2">
          {t("mission.countries.cardKnownWorkers")}
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
          {t("mission.countries.cardSource")}
        </a>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function MissionPage() {
  const { t } = useTranslation();

  const legendItems: { labelKey: string; cls: string }[] = [
    { labelKey: "mission.countries.legendActive", cls: "bg-[#22c55e20] text-[#22c55e] border border-[#22c55e]/40" },
    { labelKey: "mission.countries.legendOrthodox", cls: "bg-[var(--gold)]/10 text-[var(--gold)] border border-[var(--gold)]/40" },
    { labelKey: "mission.countries.legendNextSteps", cls: "bg-[#f9731620] text-[#f97316] border border-[#f97316]/40" },
    { labelKey: "mission.countries.legendOpportunity", cls: "text-[var(--text-muted)] border border-[var(--border-default)]" },
  ];

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
            <SectionLabel text={t("mission.hero.label")} />
            <h1 className="text-[34px] md:text-[52px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              {t("mission.hero.titleLine1")}
              <br />
              {t("mission.hero.titleLine2")}
            </h1>
            <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[620px]">
              {t("mission.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* ── Why: Start with Why ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col md:flex-row gap-12 md:gap-24 items-start">
          {/* Left — headline + pull stat */}
          <div className="flex flex-col gap-6 md:gap-8 md:w-[380px] flex-shrink-0">
            <SectionLabel text={t("mission.whyRoma.label")} />
            <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.0]">
              {t("mission.whyRoma.titleLine1")}
              <br />
              {t("mission.whyRoma.titleLine2")}
            </h2>

            {/* Pull stat */}
            <div className="border-l-2 border-[var(--gold)] pl-6 py-2">
              <span className="text-[48px] md:text-[64px] font-bold text-[var(--gold)] leading-none block">
                {t("mission.whyRoma.pullStatValue")}
              </span>
              <span className="text-[13px] text-[var(--text-secondary)] tracking-[1px] uppercase">
                {t("mission.whyRoma.pullStatLabel")}
              </span>
            </div>

            <p className="text-[14px] text-[var(--text-muted)] leading-[1.7]">
              {t("mission.whyRoma.aside")}
            </p>
          </div>

          {/* Right — reasons */}
          <div className="flex flex-col gap-5 flex-1">
            {reasonKeys.map((item, i) => (
              <div
                key={item.titleKey}
                className="flex gap-5 p-6 md:p-7 bg-[var(--bg-card)] border border-[var(--border-default)]"
              >
                <span className="text-[var(--gold)] font-bold text-[13px] flex-shrink-0 pt-0.5">
                  0{i + 1}
                </span>
                <div className="flex flex-col gap-2">
                  <h3 className="text-[14px] md:text-[15px] font-bold text-[var(--text-primary)]">
                    {t(item.titleKey)}
                  </h3>
                  <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                    {t(item.bodyKey)}
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
          <SectionLabel text={t("mission.ourStory.label")} />
          <h2 className="text-[28px] md:text-[38px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            {t("mission.ourStory.titleLine1")}
            <br />
            {t("mission.ourStory.titleLine2")}
          </h2>

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.8]">
            {t("mission.ourStory.paragraph1")}
          </p>

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.8]">
            {t("mission.ourStory.paragraph2")}
          </p>

          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.8]">
            {t("mission.ourStory.paragraph3")}
          </p>

          {/* Quote */}
          <div className="border-l-2 border-[var(--gold)] pl-5 py-1 mt-2">
            <p className="text-[15px] md:text-[16px] font-georgia italic text-[var(--text-primary)] leading-[1.7]">
              &ldquo;{t("mission.ourStory.quote")}&rdquo;
            </p>
            <p className="text-[11px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase mt-2">
              {t("mission.ourStory.attribution")}
            </p>
          </div>

          <Link
            href="/our-story"
            className="group self-start flex items-center gap-2 text-[12px] font-semibold tracking-[1px] text-[var(--gold)] hover:opacity-80 transition-opacity mt-6"
          >
            {t("mission.ourStory.cta")}
            <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
          </Link>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── What We Do ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-5 md:gap-6 max-w-[680px] mb-12 md:mb-16">
          <SectionLabel text={t("mission.whatWeDo.label")} />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.0]">
            {t("mission.whatWeDo.titleLine1")}
            <br />
            {t("mission.whatWeDo.titleLine2")}
          </h2>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.7]">
            {t("mission.whatWeDo.intro")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {/* Card 1 — Planting */}
          <div className="flex flex-col gap-5 p-7 md:p-9 bg-[var(--bg-primary)] border border-[var(--border-default)]">
            <span className="font-georgia text-[32px] text-[var(--gold)]">✦</span>
            <h3 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)]">
              {t("mission.whatWeDo.plantingTitle")}
            </h3>
            <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.8]">
              {t("mission.whatWeDo.plantingBody")}
            </p>
            <div className="flex gap-6 pt-2 border-t border-[var(--border-default)]">
              <div className="flex flex-col gap-1">
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--gold)]">
                  3
                </span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  {t("mission.whatWeDo.plantingStatPlanted")}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--gold)]">
                  1
                </span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  {t("mission.whatWeDo.plantingStatLost")}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--text-secondary)]">
                  +2
                </span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  {t("mission.whatWeDo.plantingStatProgress")}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2 — Parish support */}
          <div className="flex flex-col gap-5 p-7 md:p-9 bg-[var(--bg-primary)] border border-[var(--border-default)]">
            <span className="font-georgia text-[32px] text-[var(--gold)]">☦</span>
            <h3 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)]">
              {t("mission.whatWeDo.parishTitle")}
            </h3>
            <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.8]">
              {t("mission.whatWeDo.parishBody")}
            </p>
            <div className="flex gap-6 pt-2 border-t border-[var(--border-default)]">
              <div className="flex flex-col gap-1">
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--gold)]">
                  8
                </span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  {t("mission.whatWeDo.parishStatSupported")}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--gold)]">
                  1
                </span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  {t("mission.whatWeDo.parishStatTransformed")}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--gold)]">
                  50+
                </span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  {t("mission.whatWeDo.parishStatFathers")}
                </span>
              </div>
            </div>
          </div>

          {/* Card 3 — Education */}
          <div className="flex flex-col gap-5 p-7 md:p-9 bg-[var(--bg-primary)] border border-[var(--border-default)]">
            <span className="font-georgia text-[32px] text-[var(--gold)]">✦</span>
            <h3 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)]">
              {t("mission.whatWeDo.childrenTitle")}
            </h3>
            <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.8]">
              {t("mission.whatWeDo.childrenBody")}
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-[var(--border-default)]">
              {[
                { value: "1,000+", labelKey: "mission.whatWeDo.childrenStatReached" },
                { value: "200", labelKey: "mission.whatWeDo.childrenStatLearned" },
                { value: "15", labelKey: "mission.whatWeDo.childrenStatJoined" },
              ].map((s) => (
                <div key={s.labelKey} className="flex flex-col gap-1">
                  <span className="text-[22px] md:text-[26px] font-bold text-[var(--gold)]">
                    {s.value}
                  </span>
                  <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase leading-[1.4]">
                    {t(s.labelKey)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4 — Mission Centers */}
          <div className="flex flex-col gap-5 p-7 md:p-9 bg-[var(--bg-primary)] border border-[var(--border-default)]">
            <span className="font-georgia text-[32px] text-[var(--gold)]">✦</span>
            <h3 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)]">
              {t("mission.whatWeDo.centersTitle")}
            </h3>
            <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.8]">
              {t("mission.whatWeDo.centersBody")}
            </p>
            <div className="flex gap-6 pt-2 border-t border-[var(--border-default)]">
              <div>
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--gold)]">1</span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  {t("mission.whatWeDo.centersStatBuilt")}
                </span>
              </div>
              <div>
                <span className="text-[28px] md:text-[34px] font-bold text-[var(--text-secondary)]">1</span>
                <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase block">
                  {t("mission.whatWeDo.centersStatProgress")}
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
          <SectionLabel text={t("mission.vision.label")} />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.0]">
            {t("mission.vision.titleLine1")}
            <br />
            {t("mission.vision.titleLine2")}
          </h2>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.7]">
            {t("mission.vision.body")}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-[var(--border-default)]">
          {visionStatKeys.map((s, i) => (
            <div
              key={s.labelKey}
              className={`flex flex-col gap-2 py-8 px-5 md:px-8 border-[var(--border-default)] ${
                i % 2 === 0 ? "border-r" : "md:border-r"
              } ${i < 2 ? "border-b md:border-b-0" : ""} ${
                i === visionStatKeys.length - 1 ? "md:border-r-0" : ""
              }`}
            >
              <span className="text-[36px] md:text-[48px] font-bold text-[var(--gold)]">
                {s.value}
              </span>
              <span className="text-[11px] md:text-[12px] text-[var(--text-secondary)] tracking-[1px] uppercase leading-[1.4]">
                {t(s.labelKey)}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)]" />

      {/* ── Countries ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col gap-5 md:gap-6 max-w-[680px] mb-10 md:mb-14">
          <SectionLabel text={t("mission.countries.label")} />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.0]">
            {t("mission.countries.title")}
          </h2>
          <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.7]">
            {t("mission.countries.intro")}
          </p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-8 md:mb-10">
          <span className="text-[10px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase mr-2 self-center">
            {t("mission.countries.legendPrefix")}
          </span>
          {legendItems.map((b) => (
            <span
              key={b.labelKey}
              className={`text-[9px] font-bold tracking-[1px] px-3 py-1.5 uppercase ${b.cls}`}
            >
              {t(b.labelKey)}
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
          {t("mission.countries.footnote")}
        </p>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── Guiding Principles ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-16">
          <SectionLabel text={t("mission.beliefs.label")} />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.0]">
            {t("mission.beliefs.title")}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          {beliefKeys.map((b) => (
            <div
              key={b.titleKey}
              className="flex flex-col gap-5 p-7 md:p-9 bg-[var(--bg-card)] border border-[var(--border-default)]"
            >
              <span className="font-georgia text-[28px] text-[var(--gold)]">
                {b.icon}
              </span>
              <h3 className="text-[16px] md:text-[17px] font-bold text-[var(--text-primary)]">
                {t(b.titleKey)}
              </h3>
              <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.7]">
                {t(b.descKey)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Share nudge ── */}
      <section className="px-5 md:px-[120px] py-12 md:py-16 bg-[var(--bg-primary)] flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-[var(--border-default)]">
        <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.6] max-w-[520px]">
          {t("mission.shareNudge.text")}
        </p>
        <ShareButton
          title={SHARE_TITLE}
          text={SHARE_TEXT}
          url={SHARE_URL}
          label={t("mission.shareNudge.shareLabel")}
          className="flex-shrink-0 px-8 py-4 border border-[var(--gold)] text-[var(--gold)] text-[12px] font-bold tracking-[1px] hover:bg-[var(--gold)] hover:text-[var(--on-accent)] transition-colors"
        />
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
