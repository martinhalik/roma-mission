"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import type { PaymentRequest } from "@stripe/stripe-js";
import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
  Elements,
  PaymentRequestButtonElement,
  useStripe,
} from "@stripe/react-stripe-js";
import { Copy, Check } from "lucide-react";
import { useTranslation } from "./LanguageProvider";
import {
  DONATION_CURRENCY,
  MONTHLY_PRESET_AMOUNTS,
  ONETIME_PRESET_AMOUNTS,
  PAYMENT_REQUEST_COUNTRY,
  normalizeDonorEmail,
} from "@/lib/donations";
import { currencyAffix, formatCurrency } from "@/lib/i18n/format";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

const MONTHLY_AMOUNTS = MONTHLY_PRESET_AMOUNTS;
const ONETIME_AMOUNTS = ONETIME_PRESET_AMOUNTS;

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type Step = "select" | "checkout";

function CopyField({ label, value }: { label: string; value: string }) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };
  return (
    <div className="flex items-center justify-between gap-3 py-2.5 border-b border-[var(--border-default)] last:border-b-0">
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[10px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase">{label}</span>
        <span className="text-[13px] text-[var(--text-primary)] font-medium break-all">{value}</span>
      </div>
      <button
        onClick={handleCopy}
        aria-label={t("donation.copyField", { field: label })}
        className="flex-shrink-0 p-1.5 text-[var(--text-muted)] hover:text-[var(--gold)] transition-colors"
      >
        {copied ? <Check size={14} className="text-[var(--gold)]" /> : <Copy size={14} />}
      </button>
    </div>
  );
}

function PaymentRequestButton({
  amount,
  email,
}: {
  amount: number;
  email: string;
}) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const amountRef = useRef(amount);
  amountRef.current = amount;
  const emailRef = useRef(email);
  emailRef.current = email;
  const requestRef = useRef<PaymentRequest | null>(null);
  const paymentLabel = t("donation.paymentLabel");

  const syncTotal = (pr: PaymentRequest, cents: number) => {
    if (cents < 100) return;
    pr.update({
      total: { label: paymentLabel, amount: cents },
    });
  };

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: PAYMENT_REQUEST_COUNTRY,
      currency: DONATION_CURRENCY,
      total: {
        label: paymentLabel,
        amount: Math.round(amountRef.current * 100),
      },
      requestPayerEmail: true,
    });
    requestRef.current = pr;

    let active = true;
    pr.canMakePayment().then((result) => {
      if (!active || !result) return;
      syncTotal(pr, Math.round(amountRef.current * 100));
      setPaymentRequest(pr);
    });

    pr.on("paymentmethod", async (ev) => {
      const receiptEmail =
        normalizeDonorEmail(emailRef.current) ??
        normalizeDonorEmail(ev.payerEmail);
      if (!receiptEmail) {
        ev.complete("fail");
        return;
      }
      try {
        const res = await fetch("/api/stripe/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: amountRef.current, email: receiptEmail }),
        });
        if (!res.ok) {
          ev.complete("fail");
          return;
        }
        const { clientSecret } = await res.json();
        const { error, paymentIntent } = await stripe.confirmCardPayment(
          clientSecret,
          { payment_method: ev.paymentMethod.id },
          { handleActions: false }
        );
        if (error) { ev.complete("fail"); return; }
        ev.complete("success");
        if (paymentIntent.status === "requires_action") {
          const { error: actionError } = await stripe.confirmCardPayment(clientSecret);
          if (!actionError) window.location.href = "/thank-you";
        } else {
          window.location.href = "/thank-you";
        }
      } catch {
        ev.complete("fail");
      }
    });

    return () => {
      active = false;
      if (requestRef.current === pr) requestRef.current = null;
    };
  }, [stripe, paymentLabel]);

  useEffect(() => {
    const pr = requestRef.current;
    if (!pr || amount < 1) return;
    syncTotal(pr, Math.round(amount * 100));
  }, [amount, paymentLabel]);

  if (!paymentRequest) return null;

  return (
    <>
      <PaymentRequestButtonElement
        options={{
          paymentRequest,
          style: {
            paymentRequestButton: { type: "donate", theme: "light", height: "48px" },
          },
        }}
      />
      <div className="flex items-center gap-3">
        <div className="flex-1 h-px bg-[var(--border-default)]" />
        <span className="text-[11px] text-[var(--text-muted)] tracking-[1px]">{t("donation.or")}</span>
        <div className="flex-1 h-px bg-[var(--border-default)]" />
      </div>
    </>
  );
}

export default function DonationModal({ isOpen, onClose }: DonationModalProps) {
  const { t, locale } = useTranslation();
  const [step, setStep] = useState<Step>("select");
  const [isMonthly, setIsMonthly] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(100);
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const [bankTab, setBankTab] = useState<"us" | "intl">("us");

  const finalAmount = isCustom
    ? parseFloat(customAmount) || 0
    : selectedAmount;

  const US_BANK = [
    { label: t("donation.bankFields.accountName"), value: "Martin Halík" },
    { label: t("donation.bankFields.accountType"), value: t("donation.bankFields.accountTypeValue") },
    { label: t("donation.bankFields.routingNumber"), value: "026073150" },
    { label: t("donation.bankFields.accountNumber"), value: "8310735508" },
    { label: t("donation.bankFields.bank"), value: "Community Federal Savings Bank" },
  ];

  const INTL_BANK = [
    { label: t("donation.bankFields.accountName"), value: "Martin Halík" },
    { label: t("donation.bankFields.swiftBic"), value: "CMFGUS33" },
    { label: t("donation.bankFields.accountNumber"), value: "8310735508" },
    { label: t("donation.bankFields.bankAddress"), value: "89-16 Jamaica Ave, Woodhaven, NY 11421, US" },
  ];

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
    setEmailError(null);
    setLoading(false);
    onClose();
  };

  const fetchClientSecret = useCallback(async () => {
    const donorEmail = normalizeDonorEmail(email);
    if (!donorEmail) {
      setEmailError(t("donation.emailInvalid"));
      emailInputRef.current?.focus();
      return;
    }
    setLoading(true);
    setError(null);
    setEmailError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          isMonthly,
          email: donorEmail,
          locale,
        }),
      });
      if (!res.ok) throw new Error("Failed to initiate checkout");
      const data = await res.json();
      setClientSecret(data.clientSecret);
      setStep("checkout");
    } catch {
      setError(t("donation.error"));
    } finally {
      setLoading(false);
    }
  }, [finalAmount, isMonthly, t, email, locale]);

  if (!isOpen) return null;

  const affix = currencyAffix(locale);

  const giveLabel = (() => {
    if (finalAmount <= 0) return t("donation.giveInvalid");
    const amount = formatCurrency(finalAmount, locale);
    if (isMonthly) return t("donation.giveMonthly", { amount });
    return t("donation.giveOnce", { amount });
  })();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 px-4"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border-default)] overflow-hidden max-h-[90dvh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-[var(--border-default)]">
          <div>
            <p className="text-[10px] font-semibold tracking-[2px] text-[var(--gold)] uppercase mb-1">
              {t("donation.eyebrow")}
            </p>
            <h2 className="text-[20px] font-bold text-[var(--text-primary)] tracking-[-0.5px]">
              {t("donation.title")}
            </h2>
          </div>
          <button
            onClick={handleClose}
            aria-label={t("donation.close")}
            className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors text-[20px] leading-none"
          >
            ✕
          </button>
        </div>

        {step === "select" && (
          <Elements stripe={stripePromise}>
          <div className="px-8 py-7 flex flex-col gap-6">
            {/* Frequency toggle */}
            <div className="flex bg-[var(--bg-primary)] border border-[var(--border-default)] p-1">
              <button
                onClick={() => { setIsMonthly(true); setSelectedAmount(MONTHLY_AMOUNTS[1]); setIsCustom(false); setCustomAmount(""); }}
                className={`flex-1 py-2.5 text-[12px] font-semibold tracking-[0.5px] transition-colors ${
                  isMonthly
                    ? "bg-[var(--gold)] text-[var(--on-accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {t("donation.monthly")}
              </button>
              <button
                onClick={() => { setIsMonthly(false); setSelectedAmount(ONETIME_AMOUNTS[1]); setIsCustom(false); setCustomAmount(""); }}
                className={`flex-1 py-2.5 text-[12px] font-semibold tracking-[0.5px] transition-colors ${
                  !isMonthly
                    ? "bg-[var(--gold)] text-[var(--on-accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {t("donation.oneTime")}
              </button>
            </div>

            {/* Preset amounts */}
            <div className="grid grid-cols-4 gap-2">
              {(isMonthly ? MONTHLY_AMOUNTS : ONETIME_AMOUNTS).map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setIsCustom(false);
                    setCustomAmount("");
                  }}
                  className={`py-3 text-[13px] font-semibold border transition-colors ${
                    !isCustom && selectedAmount === amt
                      ? "bg-[var(--gold)] border-[var(--gold)] text-[var(--on-accent)]"
                      : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  }`}
                >
                  {formatCurrency(amt, locale)}
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
              {affix.position === "prefix" && (
                <span
                  data-testid="currency-affix"
                  className="pl-4 text-[var(--text-muted)] text-[14px]"
                >
                  {affix.symbol}
                </span>
              )}
              <input
                type="number"
                min="1"
                placeholder={t("donation.customPlaceholder")}
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setIsCustom(true);
                }}
                onFocus={() => setIsCustom(true)}
                className={`flex-1 bg-transparent py-3 text-[13px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none ${
                  affix.position === "prefix" ? "px-3" : "pl-4 pr-3"
                }`}
              />
              {affix.position === "suffix" && (
                <span
                  data-testid="currency-affix"
                  className="pr-4 text-[var(--text-muted)] text-[14px]"
                >
                  {affix.symbol}
                </span>
              )}
            </div>

            {/* Impact line */}
            {isMonthly && (
              <p className="text-[12px] text-[var(--text-muted)] leading-[1.5]">
                {finalAmount >= 100
                  ? t("donation.impactHigh")
                  : finalAmount >= 50
                  ? t("donation.impactMid")
                  : finalAmount >= 25
                  ? t("donation.impactLow")
                  : t("donation.impactBase")}
              </p>
            )}

            <div className="flex flex-col gap-2">
              <label
                htmlFor="donation-email"
                className="text-[10px] font-semibold tracking-[1px] text-[var(--text-muted)] uppercase"
              >
                {t("donation.emailLabel")}
              </label>
              <input
                ref={emailInputRef}
                id="donation-email"
                name="email"
                type="email"
                inputMode="email"
                autoComplete="email"
                required
                aria-required="true"
                aria-invalid={emailError ? true : undefined}
                aria-describedby={emailError ? "donation-email-error" : undefined}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  if (emailError) setEmailError(null);
                }}
                className={`w-full bg-transparent border px-4 py-3 text-[13px] text-[var(--text-primary)] outline-none transition-colors ${
                  emailError
                    ? "border-red-400"
                    : "border-[var(--border-default)] focus:border-[var(--gold)]"
                }`}
              />
              {emailError && (
                <p id="donation-email-error" role="alert" className="text-[12px] text-red-400">
                  {emailError}
                </p>
              )}
            </div>

            {error && (
              <p className="text-[12px] text-red-400">{error}</p>
            )}

            {!isMonthly && finalAmount >= 1 && (
              <PaymentRequestButton amount={finalAmount} email={email} />
            )}

            <button
              onClick={fetchClientSecret}
              disabled={loading || finalAmount < 1}
              className="w-full py-4 bg-[var(--gold)] text-[var(--on-accent)] text-[12px] font-bold tracking-[1px] hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? t("donation.preparing") : giveLabel}
            </button>

            {/* Bank transfer */}
            <div>
              <button
                onClick={() => setBankOpen((v) => !v)}
                className="w-full flex items-center justify-center gap-1.5 py-3 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-bold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors"
              >
                <span>{t("donation.bankToggle")}</span>
                <span className={`transition-transform duration-200 text-[10px] ${bankOpen ? "rotate-180" : ""}`}>▾</span>
              </button>

              {bankOpen && (
                <div className="mt-3 border border-[var(--border-default)] bg-[var(--bg-primary)]">
                  {/* Tab toggle */}
                  <div className="flex border-b border-[var(--border-default)]">
                    <button
                      onClick={() => setBankTab("us")}
                      className={`flex-1 py-2.5 text-[11px] font-semibold tracking-[0.5px] transition-colors ${
                        bankTab === "us"
                          ? "text-[var(--gold)] border-b-2 border-[var(--gold)] -mb-px"
                          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      }`}
                    >
                      {t("donation.bankUs")}
                    </button>
                    <button
                      onClick={() => setBankTab("intl")}
                      className={`flex-1 py-2.5 text-[11px] font-semibold tracking-[0.5px] transition-colors ${
                        bankTab === "intl"
                          ? "text-[var(--gold)] border-b-2 border-[var(--gold)] -mb-px"
                          : "text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
                      }`}
                    >
                      {t("donation.bankIntl")}
                    </button>
                  </div>

                  {/* Fields */}
                  <div className="px-4 py-1">
                    {(bankTab === "us" ? US_BANK : INTL_BANK).map((f) => (
                      <CopyField key={f.label} label={f.label} value={f.value} />
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="border border-[var(--border-default)] bg-[var(--bg-primary)] px-4 py-3 flex gap-3 items-start">
              <span className="text-[var(--gold)] text-[12px] flex-shrink-0 mt-0.5">ℹ</span>
              <p className="text-[11px] text-[var(--text-secondary)] leading-[1.6]">
                {t("donation.taxNoticePrefix")}
                <strong className="text-[var(--text-primary)] font-semibold">{t("donation.taxNoticeCountry")}</strong>
                {t("donation.taxNoticeMid")}
                <strong className="text-[var(--text-primary)] font-semibold">{t("donation.taxNoticeBold")}</strong>
                {t("donation.taxNoticeTail")}
              </p>
            </div>
          </div>
          </Elements>
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
