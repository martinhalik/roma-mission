"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import SectionLabel from "@/components/SectionLabel";
import { useTranslation } from "@/components/LanguageProvider";
import { getLocaleMeta } from "@/lib/i18n";
import {
  RESOURCE_CATEGORY_ORDER,
  resourcesByCategory,
  downloadLocales,
  downloadsForLocale,
  type ResourceCategory,
  type ResourceItem,
} from "@/lib/resources-data";
import {
  ScrollText,
  BookOpen,
  BookMarked,
  GraduationCap,
  Download,
  ExternalLink,
  Printer,
  Share2,
  type LucideIcon,
} from "lucide-react";

const CATEGORY_ICON: Record<ResourceCategory, LucideIcon> = {
  liturgy: ScrollText,
  scripture: BookOpen,
  book: BookMarked,
  teaching: GraduationCap,
};

export default function ResourcesPage() {
  const { t } = useTranslation();

  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="resources" />

      {/* ── Hero ── */}
      <section className="relative w-full h-[400px] md:h-[480px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/klenovec-chapel.jpeg')" }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(0deg,color-mix(in_srgb,var(--bg-primary)_93%,transparent)_0%,color-mix(in_srgb,var(--bg-primary)_53%,transparent)_70%,color-mix(in_srgb,var(--bg-primary)_27%,transparent)_100%)]" />
        <div className="relative z-10 flex flex-col justify-end h-full px-5 md:px-[120px] pb-12 md:pb-16">
          <div className="flex flex-col gap-5 md:gap-6 max-w-[760px]">
            <SectionLabel text={t("resources.hero.label")} />
            <h1 className="text-[34px] md:text-[48px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              {t("resources.hero.titleLine1")}
              <br />
              {t("resources.hero.titleLine2")}
            </h1>
            <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[640px]">
              {t("resources.hero.subtitle")}
            </p>
          </div>
        </div>
      </section>

      {/* ── How to use these materials ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)] border-b border-[var(--border-default)]">
        <div className="flex flex-col gap-4 max-w-[640px] mb-10 md:mb-12">
          <SectionLabel text={t("resources.usage.label")} />
          <h2 className="text-[28px] md:text-[36px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
            {t("resources.usage.title")}
          </h2>
          <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.7]">
            {t("resources.usage.body")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <UsagePoint
            icon={Printer}
            title={t("resources.usage.point1Title")}
            body={t("resources.usage.point1Body")}
          />
          <UsagePoint
            icon={Share2}
            title={t("resources.usage.point2Title")}
            body={t("resources.usage.point2Body")}
          />
          <UsagePoint
            icon={BookMarked}
            title={t("resources.usage.point3Title")}
            body={t("resources.usage.point3Body")}
          />
        </div>
        <p className="text-[13px] md:text-[14px] text-[var(--text-muted)] leading-[1.7] mt-8 md:mt-10 max-w-[640px]">
          {t("resources.usage.contactPrefix")}
          <a
            href="mailto:martin@romamission.eu"
            className="text-[var(--gold)] hover:underline"
          >
            martin@romamission.eu
          </a>
          {t("resources.usage.contactSuffix")}
        </p>
      </section>

      {/* ── Category sections ── */}
      {RESOURCE_CATEGORY_ORDER.map((category, idx) => {
        const items = resourcesByCategory(category);
        if (items.length === 0) return null;
        return (
          <CategorySection
            key={category}
            category={category}
            items={items}
            onCard={idx % 2 === 1}
          />
        );
      })}

      {/* ── Closing scripture ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)] flex flex-col items-center text-center gap-6">
        <div className="w-12 h-[3px] bg-[var(--gold)]" />
        <blockquote className="font-georgia text-[22px] md:text-[30px] text-[var(--text-primary)] leading-[1.4] max-w-[760px]">
          {t("resources.closing.scripture")}
        </blockquote>
        <cite className="not-italic text-[12px] tracking-[2px] text-[var(--gold)] uppercase font-semibold">
          {t("resources.closing.scriptureRef")}
        </cite>
        <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.7] max-w-[600px] mt-2">
          {t("resources.closing.note")}
        </p>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}

function UsagePoint({
  icon: Icon,
  title,
  body,
}: {
  icon: LucideIcon;
  title: string;
  body: string;
}) {
  return (
    <div className="flex flex-col gap-3 p-6 bg-[var(--bg-primary)] border border-[var(--border-default)]">
      <Icon size={22} className="text-[var(--gold)]" aria-hidden="true" />
      <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{title}</h3>
      <p className="text-[13px] text-[var(--text-secondary)] leading-[1.6]">{body}</p>
    </div>
  );
}

function CategorySection({
  category,
  items,
  onCard,
}: {
  category: ResourceCategory;
  items: ResourceItem[];
  onCard: boolean;
}) {
  const { t } = useTranslation();
  const Icon = CATEGORY_ICON[category];
  const sectionBg = onCard ? "bg-[var(--bg-card)]" : "bg-[var(--bg-primary)]";
  return (
    <>
      <section className={`px-5 md:px-[120px] py-16 md:py-[100px] ${sectionBg}`}>
        <div className="flex flex-col gap-4 max-w-[640px] mb-10 md:mb-12">
          <SectionLabel text={t(`resources.categories.${category}.label`)} />
          <div className="flex items-center gap-3">
            <Icon
              size={26}
              className="text-[var(--gold)] shrink-0"
              aria-hidden="true"
            />
            <h2 className="text-[26px] md:text-[34px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              {t(`resources.categories.${category}.title`)}
            </h2>
          </div>
          <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.7]">
            {t(`resources.categories.${category}.intro`)}
          </p>
        </div>
        <div className="flex flex-col gap-4 md:gap-6">
          {items.map((item) => (
            <ResourceCard key={item.id} item={item} onCard={onCard} />
          ))}
        </div>
      </section>
      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />
    </>
  );
}

function ResourceCard({ item, onCard }: { item: ResourceItem; onCard: boolean }) {
  const { t } = useTranslation();
  const cardBg = onCard ? "bg-[var(--bg-primary)]" : "bg-[var(--bg-card)]";
  const title = t(`resources.items.${item.id}.title`);
  const desc = t(`resources.items.${item.id}.desc`);
  const locales = downloadLocales(item);

  return (
    <article
      className={`flex flex-col gap-5 p-6 md:p-8 border border-[var(--border-default)] ${cardBg}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {item.printable && (
            <MetaPill icon={Printer} label={t("resources.ui.printReady")} />
          )}
          {item.thirdParty ? (
            <span className="inline-flex items-center px-2.5 py-1 text-[10px] font-semibold tracking-[0.5px] uppercase text-[var(--text-muted)] border border-[var(--border-strong)]">
              {t("resources.ui.translatedByOthers")}
            </span>
          ) : (
            <MetaPill icon={Share2} label={t("resources.ui.freeToShare")} />
          )}
        </div>
        <h3 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)] leading-[1.3]">
          {title}
        </h3>
        <p className="text-[14px] text-[var(--text-secondary)] leading-[1.7] max-w-[720px]">
          {desc}
        </p>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {item.languageLabelKey ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-elevated)]">
              {t(item.languageLabelKey)}
            </span>
          ) : (
            locales.map((loc) => {
              const meta = getLocaleMeta(loc);
              return (
                <span
                  key={loc}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-semibold text-[var(--text-secondary)] bg-[var(--bg-elevated)]"
                >
                  <span aria-hidden="true">{meta.flag}</span>
                  {meta.label}
                </span>
              );
            })
          )}
        </div>
      </div>

      <div className="h-px bg-[var(--border-default)]" />

      {item.thirdParty ? (
        item.externalUrl && (
          <a
            href={item.externalUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex self-start items-center gap-2 px-5 py-3 border border-[var(--gold)] text-[var(--gold)] text-[12px] font-bold tracking-[0.5px] hover:bg-[var(--gold)] hover:text-[var(--on-accent)] transition-colors"
            aria-label={`${t("resources.ui.viewSource")} — ${t("resources.ui.opensExternal")}`}
          >
            {t("resources.ui.viewSource")}
            <ExternalLink size={14} aria-hidden="true" />
          </a>
        )
      ) : (
        <div className="flex flex-col gap-3">
          <span className="text-[10px] font-semibold tracking-[1.5px] text-[var(--text-muted)] uppercase">
            {t("resources.ui.availableIn")}
          </span>
          {locales.map((loc) => {
            const meta = getLocaleMeta(loc);
            const files = downloadsForLocale(item, loc);
            return (
              <div key={loc} className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 min-w-[120px] text-[12px] font-semibold text-[var(--text-primary)]">
                  <span aria-hidden="true">{meta.flag}</span>
                  {meta.label}
                </span>
                <div className="flex flex-wrap gap-2">
                  {files.map((file, i) =>
                    file.url ? (
                      <a
                        key={`${file.format}-${i}`}
                        href={file.url}
                        download
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--gold)] text-[var(--on-accent)] text-[11px] font-bold tracking-[0.5px] hover:opacity-90 transition-opacity"
                        aria-label={`${t("resources.ui.download")} — ${title} — ${meta.label} ${file.format}`}
                      >
                        <Download size={13} aria-hidden="true" />
                        {file.format}
                        {file.size ? (
                          <span className="font-medium opacity-80">
                            · {file.size}
                          </span>
                        ) : null}
                      </a>
                    ) : (
                      <span
                        key={`${file.format}-${i}`}
                        className="inline-flex items-center gap-2 px-4 py-2.5 border border-[var(--border-strong)] text-[var(--text-muted)] text-[11px] font-semibold tracking-[0.5px] cursor-default"
                      >
                        {file.format}
                        <span className="text-[9px] font-medium tracking-[0.5px] px-1.5 py-[2px] leading-none bg-[var(--border-default)] text-[var(--text-muted)] uppercase">
                          {t("resources.ui.comingSoon")}
                        </span>
                      </span>
                    ),
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </article>
  );
}

function MetaPill({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-semibold tracking-[0.5px] uppercase text-[var(--gold)] border border-[var(--gold)]/40">
      <Icon size={12} aria-hidden="true" />
      {label}
    </span>
  );
}
