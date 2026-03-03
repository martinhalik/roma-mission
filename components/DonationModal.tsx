"use client";

import { useCallback, useEffect, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const PRESET_AMOUNTS = [30, 100, 250, 500];

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "select" | "checkout";

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const [step, setStep] = useState<Step>("select");
  const [isMonthly, setIsMonthly] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const finalAmount = isCustom
    ? parseFloat(customAmount) || 0
    : selectedAmount;

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
    setStep("select");
    setClientSecret(null);
    setError(null);
    setLoading(false);
    onClose();
  };

  const fetchClientSecret = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount, isMonthly }),
      });
      if (!res.ok) throw new Error("Failed to initiate checkout");
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setStep("checkout");
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [finalAmount, isMonthly]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-[#1a1a1a] border border-[var(--border-default)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-[var(--border-default)]">
          <div>
            <p className="text-[10px] font-semibold tracking-[2px] text-[var(--gold)] uppercase mb-1">
              Support the Mission
            </p>
            <h2 className="text-[20px] font-bold text-[var(--text-primary)] tracking-[-0.5px]">
              Give to Roma Mission
            </h2>
          </div>
          <button
            onClick={handleClose}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-[20px] leading-none"
          >
            ✕
          </button>
        </div>

        {step === "select" && (
          <div className="px-8 py-7 flex flex-col gap-6">
            {/* Frequency toggle */}
            <div className="flex bg-[var(--bg-primary)] border border-[var(--border-default)] p-1">
              <button
                onClick={() => setIsMonthly(true)}
                className={`flex-1 py-2.5 text-[12px] font-semibold tracking-[0.5px] transition-colors ${
                  isMonthly
                    ? "bg-[var(--gold)] text-[#111111]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                MONTHLY
              </button>
              <button
                onClick={() => setIsMonthly(false)}
                className={`flex-1 py-2.5 text-[12px] font-semibold tracking-[0.5px] transition-colors ${
                  !isMonthly
                    ? "bg-[var(--gold)] text-[#111111]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                ONE-TIME
              </button>
            </div>

            {/* Preset amounts */}
            <div className="grid grid-cols-4 gap-2">
              {PRESET_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setIsCustom(false);
                    setCustomAmount("");
                  }}
                  className={`py-3 text-[13px] font-semibold border transition-colors ${
                    !isCustom && selectedAmount === amt
                      ? "bg-[var(--gold)] border-[var(--gold)] text-[#111111]"
                      : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  }`}
                >
                  ${amt}
                </button>
              ))}
            </div>

            {/* Custom amount */}
            <div
              className={`flex items-center border transition-colors ${
                isCustom
                  ? "border-[var(--gold)]"
                  : "border-[var(--border-default)]"
              }`}
            >
              <span className="pl-4 text-[var(--text-muted)] text-[14px]">$</span>
              <input
                type="number"
                min="1"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setIsCustom(true);
                }}
                onFocus={() => setIsCustom(true)}
                className="flex-1 bg-transparent px-3 py-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none"
              />
            </div>

            {/* Impact line */}
            {isMonthly && (
              <p className="text-[12px] text-[var(--text-muted)] leading-[1.5]">
                {finalAmount >= 500
                  ? "Helps support a local deacon full-time."
                  : finalAmount >= 100
                  ? "Covers weekly parish materials and programs."
                  : finalAmount >= 30
                  ? "Funds one child's catechism for a full year."
                  : "Every dollar goes directly to the field."}
              </p>
            )}

            {error && (
              <p className="text-[12px] text-red-400">{error}</p>
            )}

            <button
              onClick={fetchClientSecret}
              disabled={loading || finalAmount < 1}
              className="w-full py-4 bg-[var(--gold)] text-[#111111] text-[12px] font-bold tracking-[1px] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading
                ? "PREPARING..."
                : `GIVE $${finalAmount > 0 ? finalAmount : "—"}${isMonthly ? "/MO" : ""}`}
            </button>

            <p className="text-[11px] text-[var(--text-muted)] text-center leading-[1.5]">
              Secure payment via Stripe. Roma Mission is a registered non-profit.
            </p>
          </div>
        )}

        {step === "checkout" && clientSecret && (
          <div className="max-h-[70vh] overflow-y-auto">
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{ clientSecret }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </div>
  );
}
