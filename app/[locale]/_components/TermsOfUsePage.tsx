"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/components/LanguageProvider";

export default function TermsOfUsePage() {
  const { t } = useTranslation();

  const useItems = [
    t("termsOfUse.use.item1"),
    t("termsOfUse.use.item2"),
    t("termsOfUse.use.item3"),
    t("termsOfUse.use.item4"),
  ];

  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar />

      <section className="px-5 md:px-[120px] py-16 md:py-[100px] max-w-[860px]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-[3px] h-[14px] bg-[var(--gold)]" />
          <span className="text-[11px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
            {t("termsOfUse.eyebrow")}
          </span>
        </div>
        <h1 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] mb-4 leading-[1.05]">
          {t("termsOfUse.title")}
        </h1>
        <p className="text-[13px] text-[var(--text-muted)] mb-12">
          {t("termsOfUse.lastUpdated")}
        </p>

        <div className="flex flex-col gap-10 text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.8]">
          <Section title={t("termsOfUse.acceptance.heading")}>
            {t("termsOfUse.acceptance.body")}
          </Section>

          <Section title={t("termsOfUse.use.heading")}>
            {t("termsOfUse.use.lead")}
            <ul className="mt-4 flex flex-col gap-2 list-none">
              {useItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[var(--gold)] mt-1 flex-shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={t("termsOfUse.intellectualProperty.heading")}>
            {t("termsOfUse.intellectualProperty.body")}
          </Section>

          <Section title={t("termsOfUse.donations.heading")}>
            {t("termsOfUse.donations.body")}
          </Section>

          <Section title={t("termsOfUse.thirdParty.heading")}>
            {t("termsOfUse.thirdParty.body")}
          </Section>

          <Section title={t("termsOfUse.disclaimer.heading")}>
            {t("termsOfUse.disclaimer.body")}
          </Section>

          <Section title={t("termsOfUse.liability.heading")}>
            {t("termsOfUse.liability.body")}
          </Section>

          <Section title={t("termsOfUse.governingLaw.heading")}>
            {t("termsOfUse.governingLaw.body")}
          </Section>

          <Section title={t("termsOfUse.changes.heading")}>
            {t("termsOfUse.changes.body")}
          </Section>

          <Section title={t("termsOfUse.contact.heading")}>
            {t("termsOfUse.contact.bodyBefore")}
            <a
              href="mailto:misia@krm.sk"
              className="text-[var(--gold)] hover:opacity-80 transition-opacity"
            >
              misia@krm.sk
            </a>
            {t("termsOfUse.contact.bodyAfter")}
          </Section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[17px] md:text-[18px] font-semibold text-[var(--text-primary)]">
        {title}
      </h2>
      <div className="text-[var(--text-secondary)]">{children}</div>
    </div>
  );
}
