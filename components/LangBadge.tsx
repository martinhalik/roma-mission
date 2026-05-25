import { BadgeVariant } from "@/lib/media-data";

export default function LangBadge({
  label,
  variant,
  flag,
}: {
  label: string;
  variant: BadgeVariant;
  flag?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 text-[9px] font-semibold tracking-[0.5px] px-2 py-[3px] leading-none ${
        variant === "audio"
          ? "bg-[var(--gold)]/15 text-[var(--gold)] border border-[var(--gold)]/40"
          : "text-[var(--text-muted)] border border-[var(--border-strong)]"
      }`}
    >
      {flag && (
        <span aria-hidden className="text-[11px] leading-none">
          {flag}
        </span>
      )}
      {label}
    </span>
  );
}
