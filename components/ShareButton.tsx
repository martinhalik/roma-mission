"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text: string;
  url: string;
  label?: string;
  className?: string;
}

export default function ShareButton({
  title,
  text,
  url,
  label = "SHARE",
  className,
}: ShareButtonProps) {
  const [state, setState] = useState<"idle" | "copied">("idle");

  const handleShare = async () => {
    if (typeof navigator === "undefined") return;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return; // native share succeeded
      } catch (err) {
        // AbortError = user dismissed the share sheet — don't fall through
        if (err instanceof Error && err.name === "AbortError") return;
        // Any other error (NotAllowedError, etc.) — fall through to clipboard
      }
    }

    // Clipboard API fallback
    try {
      await navigator.clipboard.writeText(url);
      setState("copied");
      setTimeout(() => setState("idle"), 2200);
      return;
    } catch {
      // Clipboard blocked — use execCommand as last resort
    }

    // execCommand fallback (old browsers, insecure contexts)
    const ta = document.createElement("textarea");
    ta.value = url;
    ta.style.cssText = "position:fixed;opacity:0;pointer-events:none";
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    try {
      document.execCommand("copy");
      setState("copied");
      setTimeout(() => setState("idle"), 2200);
    } catch {
      // nothing more we can do
    }
    document.body.removeChild(ta);
  };

  return (
    <button onClick={handleShare} className={`flex items-center gap-2 cursor-pointer ${className ?? ""}`}>
      {state === "copied" ? <Check size={14} /> : <Share2 size={14} />}
      {state === "copied" ? "COPIED!" : label}
    </button>
  );
}
