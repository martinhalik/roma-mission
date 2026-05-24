"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/components/LanguageProvider";

export default function PrivacyPolicyPage() {
  const { t } = useTranslation();

  const collectedItems = [
    t("privacyPolicy.dataCollected.item1"),
    t("privacyPolicy.dataCollected.item2"),
    t("privacyPolicy.dataCollected.item3"),
    t("privacyPolicy.dataCollected.item4"),
  ];

  const useItems = [
    t("privacyPolicy.dataUse.item1"),
    t("privacyPolicy.dataUse.item2"),
    t("privacyPolicy.dataUse.item3"),
    t("privacyPolicy.dataUse.item4"),
    t("privacyPolicy.dataUse.item5"),
  ];

  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar />

      <section className="px-5 md:px-[120px] pt-24 md:pt-32 pb-16 md:pb-[100px] max-w-[860px]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-[3px] h-[14px] bg-[var(--gold)]" />
          <span className="text-[11px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
            {t("privacyPolicy.eyebrow")}
          </span>
        </div>
        <h1 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] mb-4 leading-[1.05]">
          {t("privacyPolicy.title")}
        </h1>
        <p className="text-[13px] text-[var(--text-muted)] mb-12">
          {t("privacyPolicy.lastUpdated")}
        </p>

        <div className="flex flex-col gap-10 text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.8]">
          <Section title={t("privacyPolicy.intro.heading")}>
            {t("privacyPolicy.intro.body")}
          </Section>

          <Section title={t("privacyPolicy.dataCollected.heading")}>
            {t("privacyPolicy.dataCollected.lead")}
            <ul className="mt-4 flex flex-col gap-2 list-none">
              {collectedItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[var(--gold)] mt-1 flex-shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={t("privacyPolicy.dataUse.heading")}>
            {t("privacyPolicy.dataUse.lead")}
            <ul className="mt-4 flex flex-col gap-2 list-none">
              {useItems.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[var(--gold)] mt-1 flex-shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title={t("privacyPolicy.sharing.heading")}>
            {t("privacyPolicy.sharing.body")}
          </Section>

          <Section title={t("privacyPolicy.retention.heading")}>
            {t("privacyPolicy.retention.body")}
          </Section>

          <Section title={t("privacyPolicy.rights.heading")}>
            {t("privacyPolicy.rights.bodyBefore")}
            <a
              href="mailto:privacy@romamission.eu"
              className="text-[var(--gold)] hover:opacity-80 transition-opacity"
            >
              privacy@romamission.eu
            </a>
            {t("privacyPolicy.rights.bodyAfter")}
          </Section>

          <Section title={t("privacyPolicy.cookies.heading")}>
            {t("privacyPolicy.cookies.body")}
          </Section>

          <Section title={t("privacyPolicy.security.heading")}>
            {t("privacyPolicy.security.body")}
          </Section>

          <Section title={t("privacyPolicy.changes.heading")}>
            {t("privacyPolicy.changes.body")}
          </Section>

          <Section title={t("privacyPolicy.contact.heading")}>
            {t("privacyPolicy.contact.bodyBefore")}
            <a
              href="mailto:privacy@romamission.eu"
              className="text-[var(--gold)] hover:opacity-80 transition-opacity"
            >
              privacy@romamission.eu
            </a>
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
