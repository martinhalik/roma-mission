import { NextRequest, NextResponse } from "next/server";
import { DICTIONARIES, isLocale, type Locale } from "@/lib/i18n";
import {
  getBookFiles,
  getBookTitle,
  isBookLocale,
  isValidEmail,
  normalizePhone,
  type BookEditionFiles,
  type SubscribeChannel,
} from "@/lib/ebook";

// Subscribers are stored in Brevo (EU-based; one contact list for both email
// and SMS). Required env: BREVO_API_KEY, BREVO_LIST_ID, BREVO_SENDER_EMAIL.
// Optional: BREVO_SMS_SENDER (≤ 11 alphanumeric chars, default "RomaMission").
const BREVO_API = "https://api.brevo.com/v3";
const DEFAULT_SMS_SENDER = "RomaMission";

type ErrorCode =
  | "invalid_request"
  | "consent"
  | "language"
  | "invalid_email"
  | "invalid_phone"
  | "not_configured"
  | "provider";

interface SubscribeBody {
  channel?: unknown;
  email?: unknown;
  phone?: unknown;
  locale?: unknown;
  bookLocale?: unknown;
  consent?: unknown;
  website?: unknown;
}

interface Delivery {
  locale: Locale;
  bookLocale: Locale;
  files: BookEditionFiles;
  siteUrl: string;
}

function fail(error: ErrorCode, status: number) {
  return NextResponse.json({ error }, { status });
}

function fill(template: string, vars: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => vars[key] ?? `{${key}}`);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function brevo(path: string, apiKey: string, body: unknown) {
  return fetch(`${BREVO_API}${path}`, {
    method: "POST",
    headers: {
      "api-key": apiKey,
      accept: "application/json",
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

async function saveContact(apiKey: string, channel: SubscribeChannel, contact: string) {
  const listId = Number(process.env.BREVO_LIST_ID);
  const res = await brevo("/contacts", apiKey, {
    ...(channel === "email" ? { email: contact } : { attributes: { SMS: contact } }),
    ...(Number.isInteger(listId) && listId > 0 ? { listIds: [listId] } : {}),
    updateEnabled: true,
  });
  if (res.ok) return true;

  // An SMS-only contact that already exists is reported as a duplicate — the
  // person is already subscribed, which is what we want.
  const data = (await res.json().catch(() => ({}))) as { code?: string };
  if (data.code === "duplicate_parameter") return true;
  console.error("Brevo contact save failed", res.status, data);
  return false;
}

function emailContent({ locale, bookLocale, files, siteUrl }: Delivery) {
  const d = DICTIONARIES[locale].book.delivery;
  const { title, subtitle } = getBookTitle(bookLocale);
  const fullTitle = `${title} ${subtitle}`;
  const epubUrl = `${siteUrl}${files.epub.file}`;
  const pdfUrl = `${siteUrl}${files.pdf.file}`;
  const intro = fill(d.emailIntro, { title: fullTitle });

  const button = (href: string, label: string) =>
    `<p style="margin:0 0 12px"><a href="${escapeHtml(href)}" style="display:inline-block;background:#D4AF37;color:#111111;text-decoration:none;font-weight:bold;padding:12px 20px">${escapeHtml(label)}</a></p>`;

  const html = `<!DOCTYPE html><html lang="${locale}"><body style="margin:0;background:#F5F0E8;font-family:Georgia,serif;color:#111111">
<div style="max-width:560px;margin:0 auto;padding:32px 24px">
<p style="font-size:18px;margin:0 0 16px">${escapeHtml(d.emailGreeting)}</p>
<p style="font-size:16px;line-height:1.6;margin:0 0 24px">${escapeHtml(intro)}</p>
${button(epubUrl, d.emailEpub)}
${button(pdfUrl, d.emailPdf)}
<p style="font-size:16px;line-height:1.6;margin:24px 0 0">${escapeHtml(d.emailOutro)}<br/>${escapeHtml(d.emailSignature)}</p>
<p style="font-size:12px;color:#666666;margin:24px 0 0"><a href="${escapeHtml(siteUrl)}" style="color:#666666">${escapeHtml(siteUrl.replace(/^https?:\/\//, ""))}</a></p>
</div></body></html>`;

  const text = [
    d.emailGreeting,
    "",
    intro,
    "",
    `${d.emailEpub}: ${epubUrl}`,
    `${d.emailPdf}: ${pdfUrl}`,
    "",
    d.emailOutro,
    d.emailSignature,
  ].join("\n");

  return { subject: fill(d.emailSubject, { title: fullTitle }), html, text, senderName: d.emailSignature };
}

async function sendEmail(apiKey: string, email: string, delivery: Delivery) {
  const senderEmail = process.env.BREVO_SENDER_EMAIL;
  if (!senderEmail) {
    console.error("BREVO_SENDER_EMAIL is not set — ebook email not sent");
    return false;
  }
  const { subject, html, text, senderName } = emailContent(delivery);
  const res = await brevo("/smtp/email", apiKey, {
    sender: { email: senderEmail, name: senderName },
    to: [{ email }],
    subject,
    htmlContent: html,
    textContent: text,
    tags: ["ebook"],
  });
  if (!res.ok) console.error("Brevo email failed", res.status, await res.text().catch(() => ""));
  return res.ok;
}

async function sendSms(apiKey: string, phone: string, { locale, bookLocale, files, siteUrl }: Delivery) {
  const { title } = getBookTitle(bookLocale);
  // Phones get the EPUB: it opens directly in Apple Books / Play Books.
  const content = fill(DICTIONARIES[locale].book.delivery.sms, {
    title,
    url: `${siteUrl}${files.epub.file}`,
  });
  const res = await brevo("/transactionalSMS/send", apiKey, {
    sender: process.env.BREVO_SMS_SENDER || DEFAULT_SMS_SENDER,
    recipient: phone.replace(/^\+/, ""),
    content,
    type: "transactional",
    tag: "ebook",
    unicodeEnabled: /[^\x00-\x7F]/.test(content),
  });
  if (!res.ok) console.error("Brevo SMS failed", res.status, await res.text().catch(() => ""));
  return res.ok;
}

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => null)) as SubscribeBody | null;
  if (!body || typeof body !== "object") return fail("invalid_request", 400);

  // Honeypot: real visitors never see or fill the "website" field.
  if (typeof body.website === "string" && body.website.trim() !== "") {
    return NextResponse.json({ ok: true, delivered: false });
  }

  const channel = body.channel;
  if (channel !== "email" && channel !== "sms") return fail("invalid_request", 400);
  if (body.consent !== true) return fail("consent", 400);

  const locale: Locale = typeof body.locale === "string" && isLocale(body.locale) ? body.locale : "en";
  if (!isBookLocale(body.bookLocale)) return fail("language", 400);
  const bookLocale = body.bookLocale;

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const phone = typeof body.phone === "string" ? normalizePhone(body.phone) : null;
  if (channel === "email" && !isValidEmail(email)) return fail("invalid_email", 400);
  if (channel === "sms" && !phone) return fail("invalid_phone", 400);
  const contact = channel === "email" ? email : (phone as string);

  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.error("BREVO_API_KEY is not set — ebook subscription rejected");
    return fail("not_configured", 503);
  }

  const saved = await saveContact(apiKey, channel, contact);
  if (!saved) return fail("provider", 502);

  const files = getBookFiles(bookLocale);
  if (!files) return fail("language", 400);
  const delivery: Delivery = {
    locale,
    bookLocale,
    files,
    siteUrl: (process.env.NEXT_PUBLIC_URL ?? "https://romamission.eu").replace(/\/$/, ""),
  };

  // The subscription is already stored; a failed delivery message must not
  // block the download — the page unlocks the files either way.
  const delivered =
    channel === "email"
      ? await sendEmail(apiKey, email, delivery)
      : await sendSms(apiKey, contact, delivery);

  return NextResponse.json({ ok: true, delivered });
}
