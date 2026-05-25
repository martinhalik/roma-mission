"use client";

import { useState } from "react";
import { Home, Menu, X } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LocaleLink from "@/components/LocaleLink";
import { useTranslation } from "@/components/LanguageProvider";
import type { RouteKey } from "@/lib/i18n/routes";

type Page =
  | "home"
  | "mission"
  | "locations"
  | "media"
  | "stories"
  | "heritage"
  | "activity"
  | "get-involved"
  | "our-story";

interface NavbarProps {
  activePage?: Page;
}

const middleLinks: {
  key: "home" | "mission" | "locations" | "media" | "stories" | "heritage";
  routeKey: RouteKey;
  page: Page;
}[] = [
  { key: "home", routeKey: "home", page: "home" },
  { key: "mission", routeKey: "mission", page: "mission" },
  { key: "locations", routeKey: "locations", page: "locations" },
  { key: "heritage", routeKey: "heritage", page: "heritage" },
  { key: "media", routeKey: "media", page: "media" },
  { key: "stories", routeKey: "stories", page: "stories" },
];

const liveLink = {
  key: "activity" as const,
  routeKey: "activity" as RouteKey,
  page: "activity" as Page,
};

export default function Navbar({ activePage = "home" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center justify-between px-5 xl:px-10 2xl:px-20 py-5 bg-[var(--nav-bg)] backdrop-blur-xl w-full border-b border-[var(--border-default)]">
        {/* Logo */}
        <LocaleLink routeKey="home" className="flex items-center gap-2 opacity-100 hover:opacity-75 transition-opacity shrink-0">
          <span className="font-georgia text-[28px] text-[var(--gold)]">☦</span>
          <span className="hidden 2xl:inline text-[14px] font-bold tracking-[2px] text-[var(--text-primary)] uppercase">
            {t("footer.brand")}
          </span>
        </LocaleLink>

        {/* Middle links — may overflow under tight constraints; LIVE pinned in the right group */}
        <div className="flex items-center gap-4 xl:gap-6 2xl:gap-10 min-w-0 overflow-hidden">
          {middleLinks.map((link) => {
            const isActive = activePage === link.page;
            const linkClass = `inline-flex items-center gap-1.5 text-[11px] tracking-[1.5px] whitespace-nowrap transition-colors ${
              isActive
                ? "text-[var(--gold)] font-semibold"
                : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]"
            }`;
            if (link.key === "home") {
              return (
                <LocaleLink
                  key={link.page}
                  routeKey={link.routeKey}
                  aria-label={t("nav.home")}
                  className={linkClass}
                >
                  <Home size={16} aria-hidden="true" />
                </LocaleLink>
              );
            }
            return (
              <LocaleLink
                key={link.page}
                routeKey={link.routeKey}
                className={linkClass}
              >
                {t(`nav.${link.key}`)}
              </LocaleLink>
            );
          })}
        </div>

        {/* Right group — LIVE pinned here so it stays visible if middle overflows */}
        <div className="flex items-center gap-3 xl:gap-4 2xl:gap-6 shrink-0">
          <LocaleLink
            routeKey={liveLink.routeKey}
            className={`inline-flex items-center gap-1.5 text-[11px] tracking-[1.5px] whitespace-nowrap transition-colors ${
              activePage === liveLink.page
                ? "text-[var(--gold)] font-semibold"
                : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--gold)]" />
            </span>
            {t(`nav.${liveLink.key}`)}
          </LocaleLink>
          <LanguageSwitcher variant="header" compact />
          <LocaleLink
            routeKey="getInvolved"
            className="px-4 xl:px-6 py-3 bg-[var(--gold)] text-[var(--on-accent)] text-[11px] font-bold tracking-[1px] hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            <span className="hidden xl:inline">{t("nav.supportMission")}</span>
            <span className="xl:hidden">{t("nav.donate")}</span>
          </LocaleLink>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="flex lg:hidden items-center justify-between px-5 py-4 bg-[var(--nav-bg)] backdrop-blur-xl w-full border-b border-[var(--border-default)]">
        <LocaleLink routeKey="home" className="flex items-center gap-2 opacity-100 hover:opacity-75 transition-opacity">
          <span className="font-georgia text-[24px] text-[var(--gold)]">☦</span>
          <span className="text-[9px] font-bold tracking-[1.5px] text-[var(--text-primary)] leading-[1.3] uppercase max-w-[120px]">
            {t("footer.brand")}
          </span>
        </LocaleLink>
        <div className="flex items-center gap-2">
          <LocaleLink
            routeKey="getInvolved"
            className="px-3 py-2.5 bg-[var(--gold)] text-[var(--on-accent)] text-[10px] font-bold tracking-[1px] hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {t("nav.donate")}
          </LocaleLink>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-[var(--text-primary)]"
            aria-label={t("nav.toggleMenu")}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {menuOpen && (
        <div className="flex lg:hidden flex-col bg-[var(--nav-bg)] backdrop-blur-xl border-t border-[var(--border-default)]">
          {middleLinks.map((link) => (
            <LocaleLink
              key={link.page}
              routeKey={link.routeKey}
              onClick={() => setMenuOpen(false)}
              className={`flex items-center gap-2 px-5 py-4 text-[13px] tracking-[1.5px] border-b border-[var(--border-default)] ${
                activePage === link.page
                  ? "text-[var(--gold)] font-semibold"
                  : "text-[var(--text-secondary)] font-medium"
              }`}
            >
              {link.key === "home" && <Home size={14} aria-hidden="true" />}
              {t(`nav.${link.key}`)}
            </LocaleLink>
          ))}
          <LocaleLink
            routeKey={liveLink.routeKey}
            onClick={() => setMenuOpen(false)}
            className={`flex items-center gap-2 px-5 py-4 text-[13px] tracking-[1.5px] border-b border-[var(--border-default)] ${
              activePage === liveLink.page
                ? "text-[var(--gold)] font-semibold"
                : "text-[var(--text-secondary)] font-medium"
            }`}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-70" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--gold)]" />
            </span>
            {t(`nav.${liveLink.key}`)}
          </LocaleLink>

          <div className="flex items-center justify-between px-5 py-3 border-b border-[var(--border-default)]">
            <span className="text-[10px] tracking-[2px] text-[var(--text-muted)] uppercase font-semibold">
              {t("nav.selectLanguage")}
            </span>
            <LanguageSwitcher variant="header" />
          </div>

          <LocaleLink
            routeKey="getInvolved"
            onClick={() => setMenuOpen(false)}
            className="mx-5 my-4 py-4 bg-[var(--gold)] text-[var(--on-accent)] text-[11px] font-bold tracking-[1px] text-center"
          >
            {t("nav.supportMission")}
          </LocaleLink>
        </div>
      )}
    </div>
  );
}
