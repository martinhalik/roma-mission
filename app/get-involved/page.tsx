"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import DonationModal from "@/components/DonationModal";
import ApplicationModal from "@/components/ApplicationModal";
import ShareModal from "@/components/ShareModal";
import SectionLabel from "@/components/SectionLabel";
import { useTranslation } from "@/components/LanguageProvider";

type WayKey = "financial" | "volunteer" | "share" | "trip";
type FaqKey = "donation" | "volunteer" | "parish" | "contact";
type ModalState = "closed" | "donate" | "volunteer" | "share" | "trip";

interface Way {
  key: WayKey;
  primary: boolean;
  action: Exclude<ModalState, "closed">;
}

const WAYS: Way[] = [
  { key: "financial", primary: true, action: "donate" },
  { key: "volunteer", primary: false, action: "volunteer" },
  { key: "share", primary: false, action: "share" },
  { key: "trip", primary: false, action: "trip" },
];

const FAQ_KEYS: FaqKey[] = ["donation", "volunteer", "parish", "contact"];

export default function GetInvolvedPage() {
  const [modal, setModal] = useState<ModalState>("closed");
  const { t } = useTranslation();

  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar activePage="get-involved" />

      <DonationModal
        isOpen={modal === "donate"}
        onClose={() => setModal("closed")}
      />
      <ApplicationModal
        isOpen={modal === "volunteer"}
        onClose={() => setModal("closed")}
        type="volunteer"
      />
      <ApplicationModal
        isOpen={modal === "trip"}
        onClose={() => setModal("closed")}
        type="trip"
      />
      <ShareModal
        isOpen={modal === "share"}
        onClose={() => setModal("closed")}
      />

      {/* ── Hero + Ways to Help ── */}
      <section className="bg-[var(--bg-primary)]">
        {/* Hero image */}
        <div className="relative w-full h-[340px] md:h-[420px] overflow-hidden">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/get-involved-hero.jpg')" }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(0deg,var(--bg-primary)_0%,color-mix(in_srgb,var(--bg-primary)_60%,transparent)_50%,color-mix(in_srgb,var(--bg-primary)_27%,transparent)_100%)]" />
          <div className="relative z-10 flex flex-col justify-end h-full px-5 md:px-[120px] pb-10 md:pb-12">
            <div className="flex flex-col gap-4 md:gap-5 max-w-[700px]">
              <SectionLabel text={t("getInvolved.hero.label")} />
              <h1 className="text-[34px] md:text-[48px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
                {t("getInvolved.hero.titleLine1")}
                <br />
                {t("getInvolved.hero.titleLine2")}
              </h1>
            </div>
          </div>
        </div>

        {/* Choose how to help — flows directly from hero */}
        <div className="px-5 md:px-[120px] pt-10 md:pt-14 pb-16 md:pb-[100px]">
          <div className="flex flex-col gap-2 mb-8 md:mb-12">
            <p className="text-[13px] font-semibold tracking-[1.5px] text-[var(--text-muted)] uppercase">
              {t("getInvolved.waysSection.label")}
            </p>
            <h2 className="text-[28px] md:text-[38px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.0]">
              {t("getInvolved.waysSection.title")}
            </h2>
            <p className="text-[15px] md:text-[17px] text-[var(--text-secondary)] leading-[1.6] max-w-[560px] mt-1">
              {t("getInvolved.waysSection.intro")}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
            {WAYS.map((w) => {
              const points = [
                t(`getInvolved.ways.${w.key}.point1`),
                t(`getInvolved.ways.${w.key}.point2`),
                t(`getInvolved.ways.${w.key}.point3`),
              ];
              return (
                <div
                  key={w.key}
                  className="flex flex-col gap-5 md:gap-6 bg-[var(--bg-card)] border border-[var(--border-default)] p-6 md:p-8"
                >
                  <span className="font-georgia text-[28px] text-[var(--gold)]">
                    ✦
                  </span>
                  <div className="flex flex-col gap-1">
                    <h3 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)]">
                      {t(`getInvolved.ways.${w.key}.title`)}
                    </h3>
                    <p className="text-[12px] font-semibold tracking-[1px] text-[var(--gold)] uppercase">
                      {t(`getInvolved.ways.${w.key}.subtitle`)}
                    </p>
                  </div>
                  <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.7]">
                    {t(`getInvolved.ways.${w.key}.desc`)}
                  </p>
                  <ul className="flex flex-col gap-2 mt-auto">
                    {points.map((p) => (
                      <li
                        key={p}
                        className="flex items-start gap-2 text-[12px] md:text-[13px] text-[var(--text-secondary)]"
                      >
                        <span className="text-[var(--gold)] mt-0.5 flex-shrink-0">
                          ·
                        </span>
                        {p}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={() => setModal(w.action)}
                    className={`mt-4 py-4 text-[12px] font-bold tracking-[1px] transition-colors ${
                      w.primary
                        ? "bg-[var(--gold)] text-[var(--on-accent)] hover:opacity-90"
                        : "border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[var(--on-accent)]"
                    }`}
                  >
                    {t(`getInvolved.ways.${w.key}.cta`)}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── FAQ ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col md:flex-row gap-10 md:gap-20">
          {/* Left */}
          <div className="flex flex-col gap-5 md:w-[400px] flex-shrink-0">
            <SectionLabel text={t("getInvolved.faq.label")} />
            <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[0.95]">
              {t("getInvolved.faq.titleLine1")}
              <br />
              {t("getInvolved.faq.titleLine2")}
            </h2>
            <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              {t("getInvolved.faq.contactIntro")}{" "}
              <a
                href="mailto:martin@romamission.eu"
                className="text-[var(--gold)] hover:opacity-80 transition-opacity"
              >
                martin@romamission.eu
              </a>
            </p>
          </div>
          {/* Right */}
          <div className="flex flex-col flex-1">
            {FAQ_KEYS.map((key) => (
              <div
                key={key}
                className="flex flex-col gap-3 py-6 border-b border-[var(--border-default)] last:border-b-0"
              >
                <h3 className="text-[15px] md:text-[16px] font-semibold text-[var(--text-primary)]">
                  {t(`getInvolved.faq.items.${key}.q`)}
                </h3>
                <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.7]">
                  {t(`getInvolved.faq.items.${key}.a`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
      <Footer />
    </main>
  );
}
