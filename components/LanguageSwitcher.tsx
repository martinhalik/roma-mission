"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useTranslation } from "@/components/LanguageProvider";
import { LOCALES, getLocaleMeta, type Locale } from "@/lib/i18n";

interface LanguageSwitcherProps {
  variant?: "header" | "footer";
  compact?: boolean;
  className?: string;
}

export default function LanguageSwitcher({
  variant = "header",
  compact = false,
  className = "",
}: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslation();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  const current = getLocaleMeta(locale);

  function handleSelect(code: Locale) {
    setLocale(code);
    setOpen(false);
  }

  const triggerClass =
    variant === "header"
      ? compact
        ? "flex items-center gap-1.5 px-2 py-3 text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
        : "flex items-center gap-1.5 px-2 xl:px-3 py-3 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[11px] font-bold tracking-[1px] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)] transition-colors"
      : "flex items-center gap-1.5 text-[11px] font-semibold tracking-[1px] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors uppercase";

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={t("nav.selectLanguage")}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={triggerClass}
      >
        <span className="text-[18px] leading-none" aria-hidden="true">
          {current.flag}
        </span>
        {!compact && (
          <span className="text-[11px] font-bold tracking-[1px]">{current.short}</span>
        )}
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label={t("nav.selectLanguage")}
          className={`absolute z-[60] min-w-[180px] bg-[var(--bg-card)] border border-[var(--border-default)] shadow-lg py-1 ${
            variant === "header"
              ? "right-0 top-full mt-2"
              : "right-0 bottom-full mb-2"
          }`}
        >
          {LOCALES.map((opt) => {
            const isActive = opt.code === locale;
            return (
              <li key={opt.code} role="option" aria-selected={isActive}>
                <button
                  type="button"
                  onClick={() => handleSelect(opt.code)}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-left text-[12px] font-medium tracking-[0.5px] transition-colors ${
                    isActive
                      ? "text-[var(--gold)] bg-[var(--bg-elevated)]"
                      : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-elevated)]"
                  }`}
                >
                  <span className="text-[16px] leading-none" aria-hidden="true">
                    {opt.flag}
                  </span>
                  <span className="flex-1 normal-case">{opt.label}</span>
                  <span className="text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">
                    {opt.short}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
