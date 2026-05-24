"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
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

const navLinks: {
  key: "mission" | "locations" | "media" | "stories" | "heritage" | "activity";
  routeKey: RouteKey;
  page: Page;
  liveDot?: boolean;
}[] = [
  { key: "mission", routeKey: "mission", page: "mission" },
  { key: "locations", routeKey: "locations", page: "locations" },
  { key: "heritage", routeKey: "heritage", page: "heritage" },
  { key: "media", routeKey: "media", page: "media" },
  { key: "stories", routeKey: "stories", page: "stories" },
  { key: "activity", routeKey: "activity", page: "activity", liveDot: true },
];

export default function Navbar({ activePage = "home" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { t } = useTranslation();

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center justify-between px-8 xl:px-20 py-5 bg-[var(--nav-bg)] backdrop-blur-xl w-full border-b border-[var(--border-default)]">
        {/* Logo */}
        <LocaleLink routeKey="home" className="flex items-center gap-2 opacity-100 hover:opacity-75 transition-opacity shrink-0">
          <span className="font-georgia text-[28px] text-[var(--gold)]">☦</span>
          <span className="text-[14px] font-bold tracking-[2px] text-[var(--text-primary)] uppercase">
            {t("footer.brand")}
          </span>
        </LocaleLink>

        {/* Links */}
        <div className="flex items-center gap-6 xl:gap-10">
          {navLinks.map((link) => (
            <LocaleLink
              key={link.page}
              routeKey={link.routeKey}
              className={`inline-flex items-center gap-1.5 text-[11px] tracking-[1.5px] whitespace-nowrap transition-colors ${
                activePage === link.page
                  ? "text-[var(--gold)] font-semibold"
                  : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]"
              }`}
            >
              {link.liveDot && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-70" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--gold)]" />
                </span>
              )}
              {t(`nav.${link.key}`)}
            </LocaleLink>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-2 xl:gap-3 shrink-0">
          <LanguageSwitcher variant="header" compact />
          <LocaleLink
            routeKey="getInvolved"
            className="px-4 xl:px-6 py-3 bg-[var(--gold)] text-[var(--on-accent)] text-[11px] font-bold tracking-[1px] hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {t("nav.supportMission")}
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
          {navLinks.map((link) => (
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
              {link.liveDot && (
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-70" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--gold)]" />
                </span>
              )}
              {t(`nav.${link.key}`)}
            </LocaleLink>
          ))}

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
