"use client";

import { useState, useEffect } from "react";
import { Copy, Check, X, Mail } from "lucide-react";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHARE_URL = "https://romamission.org";
const SHARE_TEXT = "Orthodox Roma Mission — serving Roma communities in Slovakia through education, church planting, and discipleship.";

function IconX() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622 5.911-5.622Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function IconFacebook() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
      <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047v-2.66c0-3.025 1.791-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.887v2.264h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073z" />
    </svg>
  );
}

function IconWhatsApp() {
  return (
    <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function withUtm(url: string, source: string) {
  const u = new URL(url);
  u.searchParams.set("utm_source", source);
  u.searchParams.set("utm_medium", "socialshare");
  u.searchParams.set("utm_campaign", "share_button");
  return u.toString();
}

const socials = [
  {
    label: "X / Twitter",
    Icon: IconX,
    href: (url: string) =>
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(withUtm(url, "twitter"))}&text=${encodeURIComponent(SHARE_TEXT)}`,
  },
  {
    label: "Facebook",
    Icon: IconFacebook,
    href: (url: string) =>
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(withUtm(url, "facebook"))}`,
  },
  {
    label: "WhatsApp",
    Icon: IconWhatsApp,
    href: (url: string) =>
      `https://wa.me/?text=${encodeURIComponent(SHARE_TEXT + " " + withUtm(url, "whatsapp"))}`,
  },
  {
    label: "Email",
    Icon: Mail,
    href: (url: string) =>
      `mailto:?subject=${encodeURIComponent("Orthodox Roma Mission")}&body=${encodeURIComponent(SHARE_TEXT + "\n\n" + withUtm(url, "email"))}`,
  },
];

export default function ShareModal({ isOpen, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState(SHARE_URL);

  useEffect(() => {
    if (isOpen) setShareUrl(window.location.origin);
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback: select text
    }
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Share the mission"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-[440px] bg-[var(--bg-card)] border border-[var(--border-strong)] p-8 flex flex-col gap-7">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-[20px] font-bold text-[var(--text-primary)] tracking-[-0.5px]">
              Share the Mission
            </h2>
            <p className="text-[13px] text-[var(--text-secondary)] leading-[1.5]">
              Help others discover what God is doing among the Roma.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors flex-shrink-0 mt-0.5"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Copy link */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
            Copy Link
          </p>
          <div className="flex items-center gap-0 border border-[var(--border-strong)]">
            <span className="flex-1 px-4 py-3 text-[13px] text-[var(--text-muted)] truncate select-all">
              {shareUrl}
            </span>
            <button
              onClick={handleCopy}
              className={`flex items-center gap-2 px-4 py-3 text-[11px] font-bold tracking-[1px] border-l border-[var(--border-strong)] transition-colors flex-shrink-0 ${
                copied
                  ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                  : "text-[var(--text-secondary)] hover:text-[var(--gold)] hover:bg-[var(--gold)]/5"
              }`}
              aria-label="Copy link"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  COPIED
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  COPY
                </>
              )}
            </button>
          </div>
        </div>

        {/* Social sharing */}
        <div className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">
            Share via
          </p>
          <div className="grid grid-cols-2 gap-2">
            {socials.map(({ label, Icon, href }) => (
              <a
                key={label}
                href={href(shareUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3 border border-[var(--border-default)] text-[var(--text-secondary)] hover:text-[var(--gold)] hover:border-[var(--gold)]/40 transition-colors"
              >
                <Icon />
                <span className="text-[12px] font-semibold">{label}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
