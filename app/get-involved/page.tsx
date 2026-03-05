"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import DonationModal from "@/components/DonationModal";
import ApplicationModal from "@/components/ApplicationModal";
import SectionLabel from "@/components/SectionLabel";

const ways = [
  {
    icon: "✦",
    title: "Financial Support",
    subtitle: "Give Monthly or One-Time",
    desc: "Your giving directly funds priest salaries, parish buildings, children's programs, and mission team travel. Every amount makes a difference.",
    points: [
      "$30/mo — Funds one child's catechism for a year",
      "$100/mo — Covers weekly parish materials",
      "$500/mo — Helps support a local deacon",
    ],
    cta: "GIVE NOW",
    primary: true,
    action: "donate" as const,
  },
  {
    icon: "✦",
    title: "Volunteer",
    subtitle: "Use Your Skills",
    desc: "We need people with skills in translation, education, construction, administration, and more. Remote and on-site opportunities available.",
    points: [
      "Translation and language support",
      "Teaching and tutoring",
      "Administrative and communications",
    ],
    cta: "APPLY TO VOLUNTEER",
    primary: false,
    action: "volunteer" as const,
  },
  {
    icon: "✦",
    title: "Mission Trips",
    subtitle: "Come See the Work",
    desc: "Join a team for 1–2 weeks to work alongside local priests and community leaders. No experience necessary — just willingness.",
    points: [
      "Spring and Summer trips available",
      "Teams of 6–12 people",
      "Romania, Slovakia, Hungary locations",
    ],
    cta: "JOIN A TRIP",
    primary: false,
    action: "trip" as const,
  },
];

const faqs = [
  {
    q: "Where does my donation go?",
    a: "Donations directly fund priest salaries, parish facilities, children's programs, mission team travel, and materials translation.",
  },
  {
    q: "What qualifications do I need to volunteer?",
    a: "None specific — we match volunteers with roles that fit their skills. Language teachers, builders, administrators, and people willing to help with children's programs are all needed.",
  },
  {
    q: "Can I sponsor a specific parish?",
    a: "Yes. We offer parish sponsorship packages that provide direct, named support to a single location. Contact us at misia@krm.sk to learn more.",
  },
];

type ModalState = "closed" | "donate" | "volunteer" | "trip";

export default function GetInvolvedPage() {
  const [modal, setModal] = useState<ModalState>("closed");

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

      {/* ── Hero ── */}
      <section className="relative w-full h-[400px] md:h-[480px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: "url('/images/get-involved-hero.jpg')" }}
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
            <SectionLabel text="Get Involved" />
            <h1 className="text-[34px] md:text-[48px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              Join the Work of
              <br />
              the Church
            </h1>
            <p className="text-[15px] md:text-[18px] text-[var(--text-secondary)] leading-[1.6] max-w-[600px]">
              Every parish planted needs people who give, pray, and serve.
              Here&apos;s how you can be part of this mission.
            </p>
          </div>
        </div>
      </section>

      {/* ── Ways to Help ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-primary)]">
        <div className="flex flex-col gap-4 mb-10 md:mb-16">
          <SectionLabel text="Ways to Help" />
          <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[0.95]">
            Choose How to Help
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
          {ways.map((w) => (
            <div
              key={w.title}
              className="flex flex-col gap-5 md:gap-6 bg-[var(--bg-card)] border border-[var(--border-default)] p-6 md:p-8"
            >
              <span className="font-georgia text-[28px] text-[var(--gold)]">
                {w.icon}
              </span>
              <div className="flex flex-col gap-1">
                <h3 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)]">
                  {w.title}
                </h3>
                <p className="text-[12px] font-semibold tracking-[1px] text-[var(--gold)] uppercase">
                  {w.subtitle}
                </p>
              </div>
              <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.7]">
                {w.desc}
              </p>
              <ul className="flex flex-col gap-2 mt-auto">
                {w.points.map((p) => (
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
                    ? "bg-[var(--gold)] text-[#111111] hover:opacity-90"
                    : "border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-[#111111]"
                }`}
              >
                {w.cta}
              </button>
            </div>
          ))}
        </div>
      </section>

      <div className="h-px bg-[var(--border-default)] mx-5 md:mx-[120px]" />

      {/* ── FAQ ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-[100px] bg-[var(--bg-card)]">
        <div className="flex flex-col md:flex-row gap-10 md:gap-20">
          {/* Left */}
          <div className="flex flex-col gap-5 md:w-[400px] flex-shrink-0">
            <SectionLabel text="FAQ" />
            <h2 className="text-[28px] md:text-[42px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[0.95]">
              Common
              <br />
              Questions
            </h2>
            <p className="text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.6]">
              Can&apos;t find your answer? Reach out directly at{" "}
              <a
                href="mailto:misia@krm.sk"
                className="text-[var(--gold)] hover:opacity-80 transition-opacity"
              >
                misia@krm.sk
              </a>
            </p>
          </div>
          {/* Right */}
          <div className="flex flex-col flex-1">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="flex flex-col gap-3 py-6 border-b border-[var(--border-default)] last:border-b-0"
              >
                <h3 className="text-[15px] md:text-[16px] font-semibold text-[var(--text-primary)]">
                  {faq.q}
                </h3>
                <p className="text-[13px] md:text-[14px] text-[var(--text-secondary)] leading-[1.7]">
                  {faq.a}
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
