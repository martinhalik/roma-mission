"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
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

type MiddleKey =
  | "home"
  | "mission"
  | "activity"
  | "stories"
  | "media"
  | "locations"
  | "heritage";

interface MiddleLink {
  key: MiddleKey;
  routeKey: RouteKey;
  page: Page;
  pinned?: boolean;
  liveDot?: boolean;
}

// DOM/visual order. `pinned` items are never collapsed into the More menu.
const middleLinks: MiddleLink[] = [
  { key: "home", routeKey: "home", page: "home", pinned: true },
  { key: "mission", routeKey: "mission", page: "mission", pinned: true },
  { key: "activity", routeKey: "activity", page: "activity", pinned: true, liveDot: true },
  { key: "stories", routeKey: "stories", page: "stories", pinned: true },
  { key: "media", routeKey: "media", page: "media" },
  { key: "locations", routeKey: "locations", page: "locations" },
  { key: "heritage", routeKey: "heritage", page: "heritage" },
];

// Visible (left-to-right) order of collapsible items. The last item drops first.
const COLLAPSE_ORDER: MiddleKey[] = ["media", "locations", "heritage"];

const GAP_PX = 16; // matches gap-4 on the link container
const PINNED_KEYS: MiddleKey[] = middleLinks
  .filter((l) => l.pinned)
  .map((l) => l.key);

// Width of `keys` laid out in a row with GAP_PX between them.
function rowWidth(keys: MiddleKey[], widths: Record<string, number>): number {
  if (keys.length === 0) return 0;
  return (
    keys.reduce((sum, k) => sum + (widths[k] || 0), 0) +
    (keys.length - 1) * GAP_PX
  );
}

function computeHidden(
  available: number,
  widths: Record<string, number>,
): MiddleKey[] {
  if (available <= 0) return [];

  const pinnedW = rowWidth(PINNED_KEYS, widths);
  // Everything visible (pinned + all collapsibles): one continuous row.
  const allVisibleW = rowWidth(
    [...PINNED_KEYS, ...COLLAPSE_ORDER],
    widths,
  );
  if (allVisibleW <= available) return [];

  // Need the More button. Reserve pinned group + gap + More button up front;
  // each collapsible that survives costs `width + GAP_PX` (its own width plus
  // the gap that joins it to the row).
  const moreWidth = widths.__more__ || 80;
  let budget = available - pinnedW - GAP_PX - moreWidth;
  const hidden: MiddleKey[] = [];
  for (let i = 0; i < COLLAPSE_ORDER.length; i++) {
    const k = COLLAPSE_ORDER[i];
    const cost = (widths[k] || 0) + GAP_PX;
    if (cost <= budget) {
      budget -= cost;
    } else {
      for (let j = i; j < COLLAPSE_ORDER.length; j++) {
        hidden.push(COLLAPSE_ORDER[j]);
      }
      break;
    }
  }
  return hidden;
}

export default function Navbar({ activePage = "home" }: NavbarProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const [hiddenKeys, setHiddenKeys] = useState<MiddleKey[]>([]);
  const { t, locale } = useTranslation();

  const containerRef = useRef<HTMLDivElement>(null);
  const measureRefs = useRef<Record<string, HTMLSpanElement | null>>({});
  const moreWrapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    function recompute() {
      const container = containerRef.current;
      if (!container) return;
      const widths: Record<string, number> = {};
      for (const [key, el] of Object.entries(measureRefs.current)) {
        if (el) widths[key] = el.offsetWidth;
      }
      // clientWidth includes horizontal padding; subtract it so the budget
      // matches the actual space items can occupy.
      const cs = window.getComputedStyle(container);
      const padding =
        (parseFloat(cs.paddingLeft) || 0) + (parseFloat(cs.paddingRight) || 0);
      const next = computeHidden(container.clientWidth - padding, widths);
      setHiddenKeys((prev) => {
        if (
          prev.length === next.length &&
          prev.every((k, i) => k === next[i])
        ) {
          return prev;
        }
        return next;
      });
    }
    recompute();
    const obs = new ResizeObserver(recompute);
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, [locale]);

  // Close the More dropdown if the button itself disappears (e.g. viewport
  // resizes wide enough that nothing needs collapsing).
  useEffect(() => {
    if (hiddenKeys.length === 0 && moreOpen) setMoreOpen(false);
  }, [hiddenKeys.length, moreOpen]);

  useEffect(() => {
    if (!moreOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        moreWrapRef.current &&
        !moreWrapRef.current.contains(e.target as Node)
      ) {
        setMoreOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMoreOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [moreOpen]);

  const hiddenSet = new Set(hiddenKeys);
  const linkBase =
    "inline-flex items-center gap-1.5 text-[11px] tracking-[1.5px] whitespace-nowrap transition-colors";
  const linkActive = "text-[var(--gold)] font-semibold";
  const linkIdle =
    "text-[var(--text-secondary)] font-medium hover:text-[var(--text-primary)]";

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      {/* Off-screen measurement layer — labels styled like the real ones so widths are accurate. */}
      <div
        aria-hidden="true"
        className="fixed top-[-9999px] left-[-9999px] flex items-center gap-4 pointer-events-none"
      >
        {middleLinks.map((l) => (
          <span
            key={l.key}
            ref={(el) => {
              measureRefs.current[l.key] = el;
            }}
            className={`${linkBase} font-medium`}
          >
            {t(`nav.${l.key}`)}
          </span>
        ))}
        <span
          ref={(el) => {
            measureRefs.current.__more__ = el;
          }}
          className={`${linkBase} font-medium`}
        >
          {t("nav.more")}
          <ChevronDown size={12} aria-hidden="true" />
        </span>
      </div>

      {/* Desktop Nav */}
      <nav className="hidden lg:flex items-center justify-between px-5 xl:px-10 2xl:px-20 py-5 bg-[var(--nav-bg)] backdrop-blur-xl w-full border-b border-[var(--border-default)]">
        {/* Logo */}
        <LocaleLink
          routeKey="home"
          className="flex items-center gap-2 opacity-100 hover:opacity-75 transition-opacity shrink-0"
        >
          <span className="font-georgia text-[28px] text-[var(--gold)]">☦</span>
          <span className="text-[12px] xl:text-[14px] font-bold tracking-[1.5px] xl:tracking-[2px] text-[var(--text-primary)] uppercase">
            {t("footer.brand")}
          </span>
        </LocaleLink>

        {/* Middle links with Priority+ overflow.
            flex-1 so the container actually claims the remaining space, which
            is what computeHidden() measures against. */}
        <div
          ref={containerRef}
          className="flex flex-1 items-center justify-center gap-4 min-w-0 px-6"
        >
          {middleLinks.map((link) => {
            if (hiddenSet.has(link.key)) return null;
            const isActive = activePage === link.page;
            const cls = `${linkBase} ${isActive ? linkActive : linkIdle}`;
            return (
              <LocaleLink
                key={link.page}
                routeKey={link.routeKey}
                className={cls}
              >
                {link.liveDot && (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[var(--gold)] opacity-70" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[var(--gold)]" />
                  </span>
                )}
                {t(`nav.${link.key}`)}
              </LocaleLink>
            );
          })}
          {hiddenKeys.length > 0 && (
            <div ref={moreWrapRef} className="relative">
              <button
                type="button"
                onClick={() => setMoreOpen((v) => !v)}
                aria-haspopup="menu"
                aria-expanded={moreOpen}
                className={`${linkBase} ${linkIdle}`}
              >
                {t("nav.more")}
                <ChevronDown
                  size={12}
                  className={`transition-transform ${moreOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
              </button>
              {moreOpen && (
                <ul
                  role="menu"
                  className="absolute right-0 top-full mt-2 z-[60] min-w-[200px] bg-[var(--bg-card)] border border-[var(--border-default)] shadow-lg py-1"
                >
                  {hiddenKeys.map((k) => {
                    const item = middleLinks.find((m) => m.key === k);
                    if (!item) return null;
                    const isItemActive = activePage === item.page;
                    return (
                      <li key={k} role="none">
                        <LocaleLink
                          routeKey={item.routeKey}
                          role="menuitem"
                          onClick={() => setMoreOpen(false)}
                          className={`block px-4 py-2.5 text-[12px] tracking-[1.5px] font-medium ${
                            isItemActive
                              ? "text-[var(--gold)] bg-[var(--bg-elevated)]"
                              : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                          }`}
                        >
                          {t(`nav.${k}`)}
                        </LocaleLink>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}
        </div>

        {/* Right group — language switcher + donate CTA */}
        <div className="flex items-center gap-3 xl:gap-4 2xl:gap-6 shrink-0">
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
        <LocaleLink
          routeKey="home"
          className="flex items-center gap-2 opacity-100 hover:opacity-75 transition-opacity"
        >
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

      {/* Mobile Drawer — vertical, all items visible */}
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
