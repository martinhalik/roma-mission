"use client";

import { useEffect, useState, type FormEvent } from "react";
import {
  BookOpen,
  Download,
  FileText,
  Monitor,
  Smartphone,
  Tablet,
  type LucideIcon,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import LocaleLink from "@/components/LocaleLink";
import SectionLabel from "@/components/SectionLabel";
import { useTranslation } from "@/components/LanguageProvider";
import { LOCALES, type Locale } from "@/lib/i18n";
import {
  BOOK_UNLOCK_STORAGE_KEY,
  SEND_TO_KINDLE_URL,
  defaultBookLocale,
  formatFileSize,
  getBookFiles,
  getBookTitle,
  isBookLocale,
  isValidEmail,
  normalizePhone,
  type BookFormat,
  type SubscribeChannel,
} from "@/lib/ebook";

type FormStatus = "idle" | "submitting";

interface Unlock {
  channel: SubscribeChannel;
  contact: string;
  delivered: boolean;
}

interface DeviceGuide {
  Icon: LucideIcon;
  key: "iphone" | "kindle" | "android" | "ereader" | "computer";
  link?: string;
}

const INSIDE_KEYS = ["item1", "item2", "item3", "item4"] as const;

const DEVICE_GUIDES: DeviceGuide[] = [
  { Icon: Smartphone, key: "iphone" },
  { Icon: BookOpen, key: "kindle", link: SEND_TO_KINDLE_URL },
  { Icon: Tablet, key: "android" },
  { Icon: BookOpen, key: "ereader" },
  { Icon: Monitor, key: "computer" },
];

const FORMATS: { format: BookFormat; Icon: LucideIcon }[] = [
  { format: "epub", Icon: BookOpen },
  { format: "pdf", Icon: FileText },
];

const API_ERROR_KEYS: Record<string, string> = {
  invalid_email: "book.form.errorInvalidEmail",
  invalid_phone: "book.form.errorInvalidPhone",
  consent: "book.form.errorConsent",
};

const BOOK_LANGUAGE_OPTIONS = LOCALES.filter((l) => isBookLocale(l.code));

function readUnlock(): Unlock | null {
  try {
    const raw = localStorage.getItem(BOOK_UNLOCK_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Unlock) : null;
  } catch {
    return null;
  }
}

function saveUnlock(unlock: Unlock) {
  try {
    localStorage.setItem(BOOK_UNLOCK_STORAGE_KEY, JSON.stringify(unlock));
  } catch {
    // Storage unavailable (private mode) — the unlock lasts for this visit only.
  }
}

interface LanguageSelectProps {
  id: string;
  label: string;
  value: Locale;
  onChange: (locale: Locale) => void;
}

function LanguageSelect({ id, label, value, onChange }: LanguageSelectProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-[11px] font-semibold tracking-[1.5px] text-[var(--text-secondary)] uppercase">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value as Locale)}
        className="h-12 px-4 bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[15px] text-[var(--text-primary)] focus:outline-none focus:border-[var(--gold)] cursor-pointer"
      >
        {BOOK_LANGUAGE_OPTIONS.map((l) => (
          <option key={l.code} value={l.code}>
            {l.flag} {l.label}
          </option>
        ))}
      </select>
    </div>
  );
}

interface DownloadCardProps {
  format: BookFormat;
  Icon: LucideIcon;
  bookLocale: Locale;
}

function DownloadCard({ format, Icon, bookLocale }: DownloadCardProps) {
  const { t, locale } = useTranslation();
  const files = getBookFiles(bookLocale);
  if (!files) return null;
  const file = files[format];
  const fileName = file.file.split("/").pop();

  return (
    <a
      href={file.file}
      download={fileName}
      className="group flex items-center gap-4 p-5 bg-[var(--bg-elevated)] border border-[var(--border-strong)] hover:border-[var(--gold)] transition-colors"
    >
      <div className="w-11 h-11 flex-shrink-0 border border-[var(--gold)] flex items-center justify-center">
        <Icon className="w-5 h-5 text-[var(--gold)]" aria-hidden="true" />
      </div>
      <div className="flex-1 min-w-0 flex flex-col gap-1">
        <p className="text-[16px] font-bold text-[var(--text-primary)]">
          {t(`book.success.${format}Title`)}
          <span className="ml-2 text-[12px] font-normal text-[var(--text-muted)]">
            {formatFileSize(file.bytes, locale)}
          </span>
        </p>
        <p className="text-[12px] text-[var(--text-secondary)] leading-[1.5]">
          {t(`book.success.${format}Devices`)}
        </p>
      </div>
      <span className="hidden sm:flex items-center gap-2 text-[11px] font-semibold tracking-[1.5px] text-[var(--gold)]">
        <Download className="w-4 h-4" aria-hidden="true" />
        {t("book.success.download")}
      </span>
      <Download className="sm:hidden w-5 h-5 text-[var(--gold)]" aria-hidden="true" />
    </a>
  );
}

export default function BookPage() {
  const { t, locale } = useTranslation();
  const [bookLocale, setBookLocale] = useState<Locale>(() => defaultBookLocale(locale));
  const [channel, setChannel] = useState<SubscribeChannel>("email");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");
  const [error, setError] = useState<string | null>(null);
  const [unlock, setUnlock] = useState<Unlock | null>(null);

  useEffect(() => {
    setUnlock(readUnlock());
  }, []);

  const { title, subtitle } = getBookTitle(bookLocale);
  const cover = getBookFiles(bookLocale)?.cover;

  const handleChannelChange = (next: SubscribeChannel) => {
    setChannel(next);
    setError(null);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const contact = channel === "email" ? email.trim() : normalizePhone(phone);
    if (channel === "email" && !isValidEmail(email)) return setError(t("book.form.errorInvalidEmail"));
    if (channel === "sms" && !contact) return setError(t("book.form.errorInvalidPhone"));
    if (!consent) return setError(t("book.form.errorConsent"));

    setStatus("submitting");
    try {
      const res = await fetch("/api/ebook/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel,
          email: channel === "email" ? email : undefined,
          phone: channel === "sms" ? phone : undefined,
          locale,
          bookLocale,
          consent,
          website: honeypot,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; delivered?: boolean };
      if (!res.ok) {
        setError(t(API_ERROR_KEYS[data.error ?? ""] ?? "book.form.errorGeneric"));
        return;
      }
      const next: Unlock = { channel, contact: contact as string, delivered: data.delivered === true };
      saveUnlock(next);
      setUnlock(next);
    } catch {
      setError(t("book.form.errorGeneric"));
    } finally {
      setStatus("idle");
    }
  };

  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar />

      {/* ── Hero ── */}
      <section className="px-5 md:px-[120px] pt-16 md:pt-24 pb-16 md:pb-20 bg-[var(--bg-primary)]">
        <div className="flex flex-col-reverse lg:flex-row gap-12 lg:gap-20 items-center">
          <div className="flex-1 flex flex-col gap-6 max-w-[640px]">
            <SectionLabel text={t("book.hero.label")} />
            <div className="flex flex-col gap-3">
              <h1 className="text-[34px] md:text-[52px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
                {title}
              </h1>
              <p className="font-georgia italic text-[20px] md:text-[26px] text-[var(--cream)] leading-[1.3]">
                {subtitle}
              </p>
              <p className="text-[13px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
                {t("book.hero.byline")}
              </p>
            </div>
            <p className="text-[15px] md:text-[17px] text-[var(--text-secondary)] leading-[1.7]">
              {t("book.hero.intro")}
            </p>
            <div className="grid grid-cols-3 border border-[var(--border-default)]">
              {(["Languages", "Formats", "Price"] as const).map((fact, i) => (
                <div
                  key={fact}
                  className={`flex flex-col gap-1 px-3 md:px-5 py-4 ${i > 0 ? "border-l border-[var(--border-default)]" : ""}`}
                >
                  <span className="text-[16px] md:text-[22px] font-bold text-[var(--text-primary)] leading-[1.1]">
                    {t(`book.hero.fact${fact}Value`)}
                  </span>
                  <span className="text-[10px] md:text-[11px] tracking-[1px] text-[var(--text-muted)] uppercase">
                    {t(`book.hero.fact${fact}Label`)}
                  </span>
                </div>
              ))}
            </div>
            <a
              href="#get-the-book"
              className="self-start px-8 py-4 bg-[var(--gold)] text-[var(--on-accent)] text-[12px] font-bold tracking-[2px] hover:opacity-90 transition-opacity"
            >
              {t("book.hero.cta")}
            </a>
          </div>

          {cover && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cover}
              alt={`${title} ${subtitle}`}
              width={1600}
              height={2560}
              className="w-[220px] md:w-[300px] lg:w-[340px] h-auto shadow-[0_30px_80px_rgba(0,0,0,0.6)] border border-[var(--border-strong)]"
            />
          )}
        </div>
      </section>

      {/* ── What's inside ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-20 bg-[var(--bg-card)] border-y border-[var(--border-default)]">
        <div className="flex flex-col gap-8 max-w-[900px]">
          <div className="flex flex-col gap-4">
            <SectionLabel text={t("book.inside.label")} />
            <h2 className="text-[26px] md:text-[36px] font-bold tracking-[-0.5px] text-[var(--text-primary)] leading-[1.15]">
              {t("book.inside.title")}
            </h2>
          </div>
          <ul className="grid md:grid-cols-2 gap-4">
            {INSIDE_KEYS.map((key) => (
              <li key={key} className="flex gap-4 p-5 bg-[var(--bg-primary)] border border-[var(--border-default)]">
                <span className="font-georgia text-[18px] text-[var(--gold)] leading-[1.4]" aria-hidden="true">✦</span>
                <span className="text-[15px] text-[var(--text-secondary)] leading-[1.6]">{t(`book.inside.${key}`)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Subscribe / download ── */}
      <section id="get-the-book" className="scroll-mt-20 px-5 md:px-[120px] py-16 md:py-24 bg-[var(--bg-primary)]">
        <div className="max-w-[640px] mx-auto bg-[var(--bg-card)] border border-[var(--border-default)] p-6 md:p-10 flex flex-col gap-8">
          {unlock ? (
            <>
              <div className="flex flex-col gap-3">
                <SectionLabel text={t("book.success.label")} />
                <h2 className="text-[26px] md:text-[32px] font-bold tracking-[-0.5px] text-[var(--text-primary)]">
                  {t("book.success.title")}
                </h2>
                {unlock.delivered && (
                  <p className="text-[14px] text-[var(--text-secondary)] leading-[1.6]" role="status">
                    {t(unlock.channel === "email" ? "book.success.sentEmail" : "book.success.sentSms", {
                      contact: unlock.contact,
                    })}
                  </p>
                )}
              </div>
              <LanguageSelect
                id="book-language-download"
                label={t("book.success.languageLabel")}
                value={bookLocale}
                onChange={setBookLocale}
              />
              <div className="flex flex-col gap-3">
                {FORMATS.map(({ format, Icon }) => (
                  <DownloadCard key={format} format={format} Icon={Icon} bookLocale={bookLocale} />
                ))}
              </div>
            </>
          ) : (
            <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <SectionLabel text={t("book.form.label")} />
                <h2 className="text-[26px] md:text-[32px] font-bold tracking-[-0.5px] text-[var(--text-primary)]">
                  {t("book.form.title")}
                </h2>
                <p className="text-[14px] text-[var(--text-secondary)] leading-[1.6]">{t("book.form.subtitle")}</p>
              </div>

              <div role="tablist" aria-label={t("book.form.label")} className="grid grid-cols-2 border border-[var(--border-strong)]">
                {(["email", "sms"] as const).map((c) => (
                  <button
                    key={c}
                    type="button"
                    role="tab"
                    aria-selected={channel === c}
                    onClick={() => handleChannelChange(c)}
                    className={`h-11 text-[12px] font-bold tracking-[1.5px] uppercase transition-colors cursor-pointer ${
                      channel === c
                        ? "bg-[var(--gold)] text-[var(--on-accent)]"
                        : "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    {t(c === "email" ? "book.form.tabEmail" : "book.form.tabSms")}
                  </button>
                ))}
              </div>

              {channel === "email" ? (
                <div className="flex flex-col gap-2">
                  <label htmlFor="book-email" className="text-[11px] font-semibold tracking-[1.5px] text-[var(--text-secondary)] uppercase">
                    {t("book.form.emailLabel")}
                  </label>
                  <input
                    id="book-email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("book.form.emailPlaceholder")}
                    className="h-12 px-4 bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)]"
                  />
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <label htmlFor="book-phone" className="text-[11px] font-semibold tracking-[1.5px] text-[var(--text-secondary)] uppercase">
                    {t("book.form.phoneLabel")}
                  </label>
                  <input
                    id="book-phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={t("book.form.phonePlaceholder")}
                    aria-describedby="book-phone-hint"
                    className="h-12 px-4 bg-[var(--bg-elevated)] border border-[var(--border-strong)] text-[15px] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-[var(--gold)]"
                  />
                  <p id="book-phone-hint" className="text-[12px] text-[var(--text-muted)]">
                    {t("book.form.phoneHint")}
                  </p>
                </div>
              )}

              <LanguageSelect
                id="book-language"
                label={t("book.form.languageLabel")}
                value={bookLocale}
                onChange={setBookLocale}
              />

              {/* Honeypot — hidden from people and assistive tech, bots fill it in. */}
              <div className="absolute -left-[9999px] w-px h-px overflow-hidden" aria-hidden="true">
                <label htmlFor="book-website">Website</label>
                <input
                  id="book-website"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  value={honeypot}
                  onChange={(e) => setHoneypot(e.target.value)}
                />
              </div>

              <label className="flex gap-3 items-start cursor-pointer">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1 w-4 h-4 flex-shrink-0 accent-[var(--gold)] cursor-pointer"
                />
                <span className="text-[13px] text-[var(--text-secondary)] leading-[1.6]">
                  {t(channel === "email" ? "book.form.consentEmail" : "book.form.consentSms")}{" "}
                  <LocaleLink routeKey="privacy" className="underline hover:text-[var(--text-primary)]">
                    {t("book.form.privacyLink")}
                  </LocaleLink>
                </span>
              </label>

              {error && (
                <p role="alert" className="text-[13px] text-[#E57373] border border-[#E57373]/40 bg-[#E57373]/10 px-4 py-3">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="h-14 bg-[var(--gold)] text-[var(--on-accent)] text-[13px] font-bold tracking-[2px] hover:opacity-90 transition-opacity disabled:opacity-60 cursor-pointer disabled:cursor-wait"
              >
                {status === "submitting" ? t("book.form.submitting") : t("book.form.submit")}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* ── Device guide ── */}
      <section className="px-5 md:px-[120px] py-16 md:py-20 bg-[var(--bg-card)] border-t border-[var(--border-default)]">
        <div className="flex flex-col gap-10">
          <div className="flex flex-col gap-4">
            <SectionLabel text={t("book.devices.label")} />
            <h2 className="text-[26px] md:text-[36px] font-bold tracking-[-0.5px] text-[var(--text-primary)]">
              {t("book.devices.title")}
            </h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {DEVICE_GUIDES.map(({ Icon, key, link }) => (
              <div key={key} className="flex flex-col gap-3 p-6 bg-[var(--bg-primary)] border border-[var(--border-default)]">
                <Icon className="w-6 h-6 text-[var(--gold)]" aria-hidden="true" />
                <h3 className="text-[15px] font-bold text-[var(--text-primary)]">{t(`book.devices.${key}Title`)}</h3>
                <p className="text-[13px] text-[var(--text-secondary)] leading-[1.6]">{t(`book.devices.${key}Body`)}</p>
                {link && (
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-auto text-[11px] font-semibold tracking-[1.5px] text-[var(--gold)] uppercase hover:underline"
                  >
                    {t("book.devices.kindleLink")} →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}

