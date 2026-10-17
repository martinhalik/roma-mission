"use client";

import { useCallback, useEffect, useRef, useState, type KeyboardEvent as ReactKeyboardEvent } from "react";
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
  CURRENCIES,
  CURRENCY_CHOICE_KEY,
  PAYMENT_REQUEST_COUNTRY,
  defaultCurrency,
  equivalentPreset,
  monthlyPresets,
  onetimePresets,
  toMinorUnits,
  type DonationCurrency,
} from "@/lib/donations";
import { GEO_COUNTRY_COOKIE } from "@/lib/geo";
import { MAX_DONATION_MINOR, parseDonationAmount } from "@/lib/donation-amount";
import { currencyAffix, formatCurrency, formatCurrencyFromMinor, sentenceAfterAmount } from "@/lib/i18n/format";
import type { Locale } from "@/lib/i18n/locales";
import { buildPath } from "@/lib/i18n/routes";

const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey
  ? loadStripe(stripePublishableKey)
  : null;

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

function readGeoCountry(): string | null {
  if (typeof document === "undefined") return null;
  let found: string | null = null;
  for (const part of document.cookie.split(";")) {
    const [name, ...rest] = part.trim().split("=");
    if (name !== GEO_COUNTRY_COOKIE) continue;
    const value = decodeURIComponent(rest.join("=")).trim().toUpperCase();
    found = /^[A-Z]{2}$/.test(value) ? value : null;
  }
  return found;
}

function readSavedCurrency(): DonationCurrency | null {
  try {
    const saved = localStorage.getItem(CURRENCY_CHOICE_KEY);
    return saved === "usd" || saved === "eur" ? saved : null;
  } catch {
    return null;
  }
}

interface PaymentRequestButtonProps {
  amount: number | string;
  minor: number;
  currency: DonationCurrency;
  locale: Locale;
}

function PaymentRequestButton({ amount, minor, currency, locale }: PaymentRequestButtonProps) {
  const { t } = useTranslation();
  const stripe = useStripe();
  const [paymentRequest, setPaymentRequest] = useState<PaymentRequest | null>(null);
  const amountRef = useRef(amount);
  amountRef.current = amount;
  const minorRef = useRef(minor);
  minorRef.current = minor;
  const currencyRef = useRef(currency);
  currencyRef.current = currency;
  const localeRef = useRef(locale);
  localeRef.current = locale;
  const requestRef = useRef<PaymentRequest | null>(null);
  const paymentLabel = t("donation.paymentLabel");
  const minimumMinor = toMinorUnits(CURRENCIES[currency].minimum, currency);

  const syncTotal = (pr: PaymentRequest, minor: number) => {
    if (minor < minimumMinor) return;
    pr.update({
      total: { label: paymentLabel, amount: minor },
    });
  };

  useEffect(() => {
    if (!stripe) return;

    const pr = stripe.paymentRequest({
      country: PAYMENT_REQUEST_COUNTRY,
      currency,
      total: {
        label: paymentLabel,
        amount: minorRef.current,
      },
      requestPayerEmail: true,
    });
    requestRef.current = pr;

    let active = true;
    pr.canMakePayment().then((result) => {
      if (!active || !result) return;
      syncTotal(pr, minorRef.current);
      setPaymentRequest(pr);
    });

    pr.on("paymentmethod", async (ev) => {
      const thankYou = buildPath(localeRef.current, "thankYou");
      try {
        const res = await fetch("/api/stripe/payment-intent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: amountRef.current,
            locale: localeRef.current,
            currency: currencyRef.current,
          }),
        });
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
          if (!actionError) window.location.href = thankYou;
        } else {
          window.location.href = thankYou;
        }
      } catch {
        ev.complete("fail");
      }
    });

    return () => {
      active = false;
      if (requestRef.current === pr) requestRef.current = null;
    };
  }, [stripe, paymentLabel, currency]);

  useEffect(() => {
    const pr = requestRef.current;
    if (!pr || minor <= 0) return;
    syncTotal(pr, minor);
  }, [minor, currency, paymentLabel]);

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
  const [currency, setCurrency] = useState<DonationCurrency>(() => defaultCurrency(locale));
  const [visitorCountry, setVisitorCountry] = useState<string | null>(null);
  const [switcherReady, setSwitcherReady] = useState(false);
  const [isMonthly, setIsMonthly] = useState(true);
  const [selectedAmount, setSelectedAmount] = useState(
    () => monthlyPresets(defaultCurrency(locale))[3],
  );
  const [customAmount, setCustomAmount] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [bankOpen, setBankOpen] = useState(false);
  const [bankTab, setBankTab] = useState<"us" | "intl">("us");
  const currencyRef = useRef(currency);
  const isMonthlyRef = useRef(isMonthly);
  const isCustomRef = useRef(isCustom);
  const selectedAmountRef = useRef(selectedAmount);
  isMonthlyRef.current = isMonthly;
  isCustomRef.current = isCustom;
  selectedAmountRef.current = selectedAmount;

  const monthlyAmounts = monthlyPresets(currency);
  const onetimeAmounts = onetimePresets(currency);

  const parsedCustom = parseDonationAmount(customAmount, locale);
  const selectedMinor = Math.round(selectedAmount * 100);
  const activeAmount = isCustom ? parsedCustom : { ok: true as const, minor: selectedMinor };
  const finalMinor = activeAmount.ok ? activeAmount.minor : 0;
  const finalAmount = finalMinor / 100;
  const shownMinor = activeAmount.ok
    ? activeAmount.minor
    : activeAmount.reason === "aboveMaximum"
      ? activeAmount.minor
      : null;

  const showSwitcher = locale === "en" && switcherReady && visitorCountry !== "US";

  useEffect(() => {
    const country = readGeoCountry();
    setVisitorCountry(country);
    if (locale === "en" && country === "US") {
      setCurrency("usd");
    } else if (locale === "en") {
      const saved = readSavedCurrency();
      if (saved) setCurrency(saved);
    }
    setSwitcherReady(true);
  }, [locale]);

  useEffect(() => {
    if (currencyRef.current === currency) return;
    const previous = currencyRef.current;
    currencyRef.current = currency;
    if (isCustomRef.current) return;
    setSelectedAmount(
      equivalentPreset(
        selectedAmountRef.current,
        previous,
        currency,
        isMonthlyRef.current ? "monthly" : "onetime",
      ),
    );
  }, [currency]);

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
    setLoading(false);
    onClose();
  };

  const fetchClientSecret = useCallback(async () => {
    const parsed = isCustom ? parseDonationAmount(customAmount, locale) : null;
    const minor = isCustom
      ? parsed && parsed.ok
        ? parsed.minor
        : 0
      : Math.round(selectedAmount * 100);
    if (minor < Math.round(CURRENCIES[currency].minimum * 100)) return;

    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: isCustom ? customAmount : selectedAmount,
          isMonthly,
          locale,
          currency,
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
  }, [customAmount, isCustom, selectedAmount, isMonthly, locale, currency, t]);

  if (!isOpen) return null;

  const affix = currencyAffix(locale, currency);
  const minimum = CURRENCIES[currency].minimum;
  const minimumMinor = Math.round(minimum * 100);
  const amountInvalid = isCustom && !parsedCustom.ok && parsedCustom.reason === "invalid";
  const amountAboveMax = isCustom && !parsedCustom.ok && parsedCustom.reason === "aboveMaximum";
  const belowMinimum = activeAmount.ok && finalMinor > 0 && finalMinor < minimumMinor;
  const amountAccepted = activeAmount.ok && finalMinor >= minimumMinor;
  const canCharge = !loading && amountAccepted;
  const describedBy = amountInvalid
    ? "donation-amount-invalid"
    : amountAboveMax
      ? "donation-amount-max"
      : belowMinimum
        ? "donation-amount-min"
        : undefined;

  const giveLabel = (() => {
    if (shownMinor == null || shownMinor <= 0) return t("donation.giveInvalid");
    const amount = formatCurrencyFromMinor(shownMinor, locale, currency);
    if (isMonthly) return t("donation.giveMonthly", { amount });
    return t("donation.giveOnce", { amount });
  })();

  const impactCopy = (() => {
    if (finalAmount >= monthlyAmounts[3]) return t("donation.impactHigh");
    if (finalAmount >= monthlyAmounts[2]) return t("donation.impactMid");
    if (finalAmount >= monthlyAmounts[1]) return t("donation.impactLow");
    if (locale === "en" && currency === "eur") return t("donation.impactBaseEur");
    return t("donation.impactBase");
  })();

  const handleCurrencyChange = (next: DonationCurrency) => {
    setCurrency(next);
    try {
      localStorage.setItem(CURRENCY_CHOICE_KEY, next);
    } catch {
      // Storage can throw in private mode. The choice still applies this visit.
    }
  };

  const handleCurrencyKey = (event: ReactKeyboardEvent<HTMLButtonElement>) => {
    if (
      event.key !== "ArrowRight" &&
      event.key !== "ArrowLeft" &&
      event.key !== "ArrowDown" &&
      event.key !== "ArrowUp"
    ) {
      return;
    }
    event.preventDefault();
    handleCurrencyChange(
      event.key === "ArrowRight" || event.key === "ArrowDown" ? "eur" : "usd",
    );
  };

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
            {showSwitcher && (
              <div
                role="radiogroup"
                aria-label={t("donation.currencyLabel")}
                className="flex bg-[var(--bg-primary)] border border-[var(--border-default)] p-1"
              >
                {(["usd", "eur"] as const).map((code) => (
                  <button
                    key={code}
                    type="button"
                    role="radio"
                    aria-checked={currency === code}
                    tabIndex={currency === code ? 0 : -1}
                    onClick={() => handleCurrencyChange(code)}
                    onKeyDown={handleCurrencyKey}
                    className={`flex-1 py-2.5 text-[12px] font-semibold tracking-[0.5px] transition-colors ${
                      currency === code
                        ? "bg-[var(--gold)] text-[var(--on-accent)]"
                        : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
            )}

            {/* Frequency toggle */}
            <div className="flex bg-[var(--bg-primary)] border border-[var(--border-default)] p-1">
              <button
                onClick={() => { setIsMonthly(true); setSelectedAmount(monthlyAmounts[1]); setIsCustom(false); setCustomAmount(""); }}
                className={`flex-1 py-2.5 text-[12px] font-semibold tracking-[0.5px] transition-colors ${
                  isMonthly
                    ? "bg-[var(--gold)] text-[var(--on-accent)]"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                }`}
              >
                {t("donation.monthly")}
              </button>
              <button
                onClick={() => { setIsMonthly(false); setSelectedAmount(onetimeAmounts[1]); setIsCustom(false); setCustomAmount(""); }}
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
              {(isMonthly ? monthlyAmounts : onetimeAmounts).map((amt) => (
                <button
                  key={amt}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setIsCustom(false);
                    setCustomAmount("");
                  }}
                  className={`min-w-0 px-1 py-3 text-[12px] leading-tight font-semibold border transition-colors ${
                    !isCustom && selectedAmount === amt
                      ? "bg-[var(--gold)] border-[var(--gold)] text-[var(--on-accent)]"
                      : "border-[var(--border-default)] text-[var(--text-secondary)] hover:border-[var(--gold)] hover:text-[var(--gold)]"
                  }`}
                >
                  {formatCurrency(amt, locale, currency)}
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
              {/*
                Every charge currency has two decimal places, so this stays a
                decimal field (step 0.01) rather than a whole-unit numeric one.
                type="text" plus inputMode="decimal" drops the native number
                spinner and lets comma-decimal locales type either separator.
              */}
              <input
                id="donation-custom-amount"
                type="text"
                inputMode="decimal"
                min={minimum}
                step="0.01"
                placeholder={t("donation.customPlaceholder")}
                value={customAmount}
                aria-invalid={describedBy ? true : undefined}
                aria-describedby={describedBy}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setIsCustom(true);
                }}
                onFocus={() => setIsCustom(true)}
                className={`flex-1 bg-transparent py-3 text-[16px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] outline-none ${
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
            {amountInvalid && (
              <p id="donation-amount-invalid" role="alert" className="text-[12px] text-red-400">
                {t("donation.amountInvalid")}
              </p>
            )}

            {amountAboveMax && (
              <p id="donation-amount-max" role="alert" className="text-[12px] text-red-400">
                {sentenceAfterAmount(
                  t("donation.amountTooHigh"),
                  formatCurrencyFromMinor(MAX_DONATION_MINOR, locale, currency),
                )}
              </p>
            )}

            {belowMinimum && (
              <p id="donation-amount-min" role="alert" className="text-[12px] text-red-400">
                {sentenceAfterAmount(
                  t("donation.amountTooLow"),
                  formatCurrency(minimum, locale, currency),
                )}
              </p>
            )}

            {isMonthly && (
              <p className="text-[12px] text-[var(--text-muted)] leading-[1.5]">
                {impactCopy}
              </p>
            )}

            {error && (
              <p className="text-[12px] text-red-400">{error}</p>
            )}

            {!isMonthly && amountAccepted && (
              <PaymentRequestButton
                amount={isCustom ? customAmount : selectedAmount}
                minor={finalMinor}
                currency={currency}
                locale={locale}
              />
            )}

            <button
              type="button"
              onClick={fetchClientSecret}
              disabled={!canCharge}
              aria-disabled={!canCharge}
              className="w-full py-4 border border-transparent bg-[var(--gold)] text-[var(--on-accent)] text-[12px] font-bold tracking-[1px] hover:opacity-90 disabled:border-[var(--border-strong)] disabled:bg-[var(--bg-elevated)] disabled:text-[var(--text-muted)] disabled:opacity-100 disabled:cursor-not-allowed"
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
