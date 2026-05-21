"use client";

import { useState } from "react";
import { Menu, X, Share2 } from "lucide-react";
import ShareModal from "@/components/ShareModal";
import LanguageSwitcher from "@/components/LanguageSwitcher";
import LocaleLink from "@/components/LocaleLink";
import { useTranslation } from "@/components/LanguageProvider";
import type { RouteKey } from "@/lib/i18n/routes";

type Page = "home" | "mission" | "locations" | "media" | "stories" | "get-involved" | "our-story";

interface NavbarProps {
  activePage?: Page;
}

const navLinks: { key: "mission" | "locations" | "media" | "stories"; routeKey: RouteKey; page: Page }[] = [
  { key: "mission", routeKey: "mission", page: "mission" },
  { key: "locations", routeKey: "locations", page: "locations" },
  { key: "media", routeKey: "media", page: "media" },
  { key: "stories", routeKey: "stories", page: "stories" },
];

// Defined as a module-level type because Clarity is loaded via tag/script
// outside React; this lets us fire a custom event without throwing if it's
// not yet on the page.
type ClarityWindow = Window & {
  clarity?: (...args: unknown[]) => void;
};

function trackShareClick(source: "desktop" | "mobile") {
  if (typeof window === "undefined") return;
  (window as ClarityWindow).clarity?.("event", "header_share_click", source);
}

export default function Navbar({ activePage = "home" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const { t } = useTranslation();

  function handleDesktopShare() {
    trackShareClick("desktop");
    setShareOpen(true);
  }

  function handleMobileShare() {
    trackShareClick("mobile");
    setShareOpen(true);
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center justify-between px-8 xl:px-20 py-5 bg-[var(--nav-bg)] backdrop-blur-xl w-full border-b border-[var(--border-default)]">
        {/* Logo */}
        <LocaleLink routeKey="home" className="flex items-center gap-2 opacity-100 hover:opacity-75 transition-opacity shrink-0">
          <span className="font-georgia text-[28px] text-[var(--gold)]">☦</span>
          <span className="text-[14px] font-bold tracking-[2px] text-[var(--text-primary)] uppercase">
            Christian Roma Mission
          </span>
        </LocaleLink>

        {/* Links */}
        <div className="flex items-center gap-6 xl:gap-10">
          {navLinks.map((link) => (
            <LocaleLink
              key={link.page}
              routeKey={link.routeKey}
              className={`text-[11px] tracking-[1.5px] whitespace-nowrap transition-colors ${
                activePage === link.page
                  ? "text-[var(--gold)] font-semibold"
                  : "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]"
              }`}
            >
              {t(`nav.${link.key}`)}
            </LocaleLink>
          ))}
        </div>

        {/* CTA */}
        <div className="flex items-center gap-1 xl:gap-2 shrink-0">
          <LanguageSwitcher variant="header" compact />
          <button
            onClick={handleDesktopShare}
            aria-label={t("nav.share")}
            className="flex items-center justify-center p-3 text-[var(--gold)] hover:opacity-75 transition-opacity"
          >
            <Share2 size={18} strokeWidth={1.75} />
          </button>
          <LocaleLink
            routeKey="getInvolved"
            className="ml-1 px-4 xl:px-6 py-3 bg-[var(--gold)] text-[var(--on-accent)] text-[11px] font-bold tracking-[1px] hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            {t("nav.supportMission")}
          </LocaleLink>
        </div>
      </nav>

      {/* Mobile Nav */}
      <nav className="flex lg:hidden items-center justify-between px-5 py-4 bg-[var(--nav-bg)] backdrop-blur-xl w-full border-b border-[var(--border-default)]">
        <LocaleLink routeKey="home" className="flex items-center gap-2 opacity-100 hover:opacity-75 transition-opacity">
          <span className="font-georgia text-[24px] text-[var(--gold)]">☦</span>
          <span className="text-[9px] font-bold tracking-[1.5px] text-[var(--text-primary)] leading-[1.3] uppercase">
            Christian Roma
            <br />
            Mission
          </span>
        </LocaleLink>
        <div className="flex items-center gap-1">
          <button
            onClick={handleMobileShare}
            aria-label={t("nav.share")}
            className="p-3 text-[var(--gold)] hover:opacity-75 transition-opacity"
          >
            <Share2 size={20} />
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-3 text-[var(--text-primary)]"
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
              className={`px-5 py-4 text-[13px] tracking-[1.5px] border-b border-[var(--border-default)] ${
                activePage === link.page
                  ? "text-[var(--gold)] font-semibold"
                  : "text-[var(--text-secondary)] font-medium"
              }`}
            >
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

      <ShareModal isOpen={shareOpen} onClose={() => setShareOpen(false)} />
    </div>
  );
}
