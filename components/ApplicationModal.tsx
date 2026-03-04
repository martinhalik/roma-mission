"use client";

import { useEffect, useState } from "react";

const GOOGLE_CALENDAR_URL = "https://calendar.app.google/cTPpM8EAg5QiMKpz6";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "volunteer" | "trip";
}

export default function ApplicationModal({
  isOpen,
  onClose,
  type,
}: ApplicationModalProps) {
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const handleClose = () => {
    setSubmitted(false);
    onClose();
  };

  if (!isOpen) return null;

  const isVolunteer = type === "volunteer";

  const title = isVolunteer ? "Apply to Volunteer" : "Join a Mission Trip";
  const subtitle = isVolunteer
    ? "Use your skills to serve Roma communities"
    : "Come see the work first-hand";
  const description = isVolunteer
    ? "We match volunteers with roles that fit their background — translation, education, construction, admin, and more. Let's find a good fit together on a short call."
    : "Mission trips run in Spring and Summer. Teams of 6–12 people travel to Romania, Slovakia, and Hungary to work alongside local priests and community leaders.";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-md bg-[#1a1a1a] border border-[var(--border-default)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-[var(--border-default)]">
          <div>
            <p className="text-[10px] font-semibold tracking-[2px] text-[var(--gold)] uppercase mb-1">
              Get Involved
            </p>
            <h2 className="text-[20px] font-bold text-[var(--text-primary)] tracking-[-0.5px]">
              {title}
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-[20px] leading-none"
          >
            ✕
          </button>
        </div>

        <div className="px-8 py-7 flex flex-col gap-6">
          {!submitted ? (
            <>
              <div>
                <p className="text-[12px] font-semibold tracking-[1px] text-[var(--gold)] uppercase mb-2">
                  {subtitle}
                </p>
                <p className="text-[14px] text-[var(--text-secondary)] leading-[1.7]">
                  {description}
                </p>
              </div>

              {/* What to expect */}
              <div className="flex flex-col gap-3 border-l-2 border-[var(--gold)] pl-4">
                <p className="text-[12px] font-semibold text-[var(--text-primary)] tracking-[0.5px]">
                  WHAT HAPPENS NEXT
                </p>
                <ol className="flex flex-col gap-2">
                  {[
                    "Book a 20-minute intro call below",
                    "We learn about your background & availability",
                    "We match you with the right opportunity",
                  ].map((step, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-3 text-[13px] text-[var(--text-secondary)]"
                    >
                      <span className="text-[var(--gold)] font-bold flex-shrink-0">
                        {i + 1}.
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>

              <a
                href={GOOGLE_CALENDAR_URL}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setSubmitted(true)}
                className="w-full py-4 bg-[var(--gold)] text-[#111111] text-[12px] font-bold tracking-[1px] text-center hover:opacity-90 transition-opacity"
              >
                SCHEDULE A CALL
              </a>

              <p className="text-[11px] text-[var(--text-muted)] text-center">
                Takes less than 2 minutes. No commitment required.
              </p>
            </>
          ) : (
            <div className="flex flex-col gap-5 py-4 items-center text-center">
              <div className="w-12 h-12 rounded-full border-2 border-[var(--gold)] flex items-center justify-center">
                <span className="text-[var(--gold)] text-[20px]">✓</span>
              </div>
              <div>
                <h3 className="text-[18px] font-bold text-[var(--text-primary)] mb-2">
                  Booking link opened
                </h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-[1.6]">
                  Complete your booking in the new tab. We look forward to speaking with you.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="px-8 py-3 border border-[var(--border-default)] text-[var(--text-secondary)] text-[12px] font-semibold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                CLOSE
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
