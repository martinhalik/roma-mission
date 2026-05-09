"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import { useTranslation } from "@/components/LanguageProvider";

function useTheme() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = localStorage.getItem("theme") as "dark" | "light" | null;
    const initial =
      stored ??
      (window.matchMedia("(prefers-color-scheme: light)").matches
        ? "light"
        : "dark");
    setTheme(initial);
  }, []);

  function toggle() {
    const next = theme === "dark" ? "light" : "dark";
    document.documentElement.classList.remove("dark", "light");
    document.documentElement.classList.add(next);
    localStorage.setItem("theme", next);
    setTheme(next);
  }

  return { theme, toggle };
}

function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggle } = useTheme();
  const { t } = useTranslation();
  return (
    <button
      onClick={toggle}
      aria-label={theme === "dark" ? t("footer.switchToLight") : t("footer.switchToDark")}
      suppressHydrationWarning
      className={`flex items-center gap-1.5 text-[11px] font-semibold tracking-[1px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase ${className}`}
    >
      {theme === "dark" ? <Sun size={13} /> : <Moon size={13} />}
      {theme === "dark" ? t("footer.light") : t("footer.dark")}
    </button>
  );
}

export default function Footer() {
  const { t } = useTranslation();

  const missionLinks = [
    { label: t("footer.linkOurMission"), href: "/mission" },
    { label: t("footer.linkOurStory"), href: "/our-story" },
    { label: t("footer.linkStories"), href: "/stories" },
    { label: t("footer.linkMedia"), href: "/media" },
  ];
  const missionLinksMobile = [
    { label: t("footer.linkOurMission"), href: "/mission" },
    { label: t("footer.linkOurStory"), href: "/our-story" },
    { label: t("footer.linkStories"), href: "/stories" },
  ];
  const mediaLinks = [t("footer.linkDocumentary"), t("footer.linkNews")];
  const involvedLinks = [
    t("footer.linkSupport"),
    t("footer.linkVolunteer"),
    t("footer.linkMissionTrips"),
  ];
  const involvedLinksMobile = [
    t("footer.linkSupport"),
    t("footer.linkVolunteer"),
    t("footer.linkTrips"),
  ];

  return (
    <>
      <div className="h-px bg-[var(--border-default)] w-full" />
      <footer className="bg-[var(--bg-primary)] w-full">
        {/* Desktop Footer */}
        <div className="hidden md:block px-[120px] pt-16 pb-10">
          <div className="flex justify-between mb-12">
            {/* Brand */}
            <div className="w-[300px] flex flex-col gap-4">
              <Link href="/" className="flex items-center gap-2">
                <span className="font-georgia text-[28px] text-[var(--gold)]">☦</span>
                <span className="text-[14px] font-bold tracking-[2px] text-[var(--text-primary)] uppercase">
                  Christian Roma Mission
                </span>
              </Link>
              <p className="text-[var(--text-muted)] text-[13px] leading-[1.6] whitespace-pre-line">
                {t("footer.tagline")}
              </p>
            </div>

            {/* Mission */}
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                {t("footer.colMission")}
              </p>
              <div className="flex flex-col gap-3">
                {missionLinks.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Media */}
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                {t("footer.colMedia")}
              </p>
              <div className="flex flex-col gap-3">
                {mediaLinks.map((item) => (
                  <Link
                    key={item}
                    href="/media"
                    className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            {/* Get Involved */}
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                {t("footer.colInvolved")}
              </p>
              <div className="flex flex-col gap-3">
                {involvedLinks.map((item) => (
                  <Link
                    key={item}
                    href="/get-involved"
                    className="text-[13px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  >
                    {item}
                  </Link>
                ))}
              </div>
            </div>

            {/* Contact */}
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                {t("footer.colContact")}
              </p>
              <div className="flex flex-col gap-1.5">
                <p className="text-[13px] font-semibold text-[var(--text-secondary)]">Fr. Martin Halík</p>
                <p className="text-[12px] text-[var(--text-muted)] mb-1">{t("footer.director")}</p>
                <a
                  href="https://www.romamission.eu"
                  className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  www.romamission.eu
                </a>
                <a
                  href="mailto:martin@romamission.eu"
                  className="text-[12px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                >
                  martin@romamission.eu
                </a>
                <p className="text-[12px] text-[var(--text-secondary)]">+421 951 230 015 (WhatsApp)</p>
                <p className="text-[12px] text-[var(--text-secondary)]">+1 (773) 796-8109</p>
              </div>
            </div>
          </div>

          <div className="h-px bg-[var(--border-default)] mb-6" />

          <div className="flex items-center justify-between">
            <p className="text-[11px] text-[var(--text-muted)]">{t("footer.copyright")}</p>
            <div className="flex items-center gap-6">
              <Link
                href="/privacy-policy"
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {t("footer.privacyPolicy")}
              </Link>
              <Link
                href="/terms-of-use"
                className="text-[11px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
              >
                {t("footer.termsOfUse")}
              </Link>
              <div className="w-px h-3 bg-[var(--border-strong)]" />
              <ThemeToggle />
              <LanguageSwitcher variant="footer" />
            </div>
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="flex md:hidden flex-col gap-10 px-5 pt-12 pb-8">
          {/* Brand */}
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-georgia text-[24px] text-[var(--gold)]">☦</span>
              <span className="text-[9px] font-bold tracking-[1.5px] text-[var(--text-primary)] leading-[1.3] uppercase">
                Christian Roma
                <br />
                Mission
              </span>
            </Link>
            <p className="text-[12px] text-[var(--text-muted)] leading-[1.6] whitespace-pre-line">
              {t("footer.tagline")}
            </p>
          </div>

          {/* Nav columns */}
          <div className="flex justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                {t("footer.colMission")}
              </p>
              {missionLinksMobile.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[12px] text-[var(--text-secondary)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                {t("footer.colMedia")}
              </p>
              {mediaLinks.map((item) => (
                <Link key={item} href="/media" className="text-[12px] text-[var(--text-secondary)]">
                  {item}
                </Link>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <p className="text-[10px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
                {t("footer.colInvolvedShort")}
              </p>
              {involvedLinksMobile.map((item) => (
                <Link
                  key={item}
                  href="/get-involved"
                  className="text-[12px] text-[var(--text-secondary)]"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile Contact */}
          <div className="flex flex-col gap-2">
            <p className="text-[10px] font-bold tracking-[1.5px] text-[var(--text-primary)] uppercase">
              {t("footer.colContact")}
            </p>
            <p className="text-[12px] font-semibold text-[var(--text-secondary)]">Fr. Martin Halík</p>
            <p className="text-[11px] text-[var(--text-muted)]">{t("footer.director")}</p>
            <a href="https://www.romamission.eu" className="text-[12px] text-[var(--text-secondary)]">www.romamission.eu</a>
            <a href="mailto:martin@romamission.eu" className="text-[12px] text-[var(--text-secondary)]">martin@romamission.eu</a>
            <p className="text-[12px] text-[var(--text-secondary)]">+421 951 230 015 (WhatsApp)</p>
            <p className="text-[12px] text-[var(--text-secondary)]">+1 (773) 796-8109</p>
          </div>

          <div className="h-px bg-[var(--border-default)]" />

          <div className="flex flex-col gap-3 items-center">
            <p className="text-[10px] text-[var(--text-muted)] text-center">
              {t("footer.copyrightShort")}
            </p>
            <div className="flex items-center gap-5">
              <Link href="/privacy-policy" className="text-[10px] text-[var(--text-muted)]">
                {t("footer.privacyPolicy")}
              </Link>
              <Link href="/terms-of-use" className="text-[10px] text-[var(--text-muted)]">
                {t("footer.termsOfUse")}
              </Link>
            </div>
            <div className="flex items-center gap-4 pt-1">
              <ThemeToggle />
              <div className="w-px h-3 bg-[var(--border-strong)]" />
              <LanguageSwitcher variant="footer" />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
