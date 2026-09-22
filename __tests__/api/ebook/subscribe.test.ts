// @vitest-environment node
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import { POST } from "../../../app/api/ebook/subscribe/route";
import { AUDIOBOOK, BOOK_LOCALES } from "../../../lib/ebook";

const BOOK_LOCALE = BOOK_LOCALES[0];

const fetchMock = vi.fn();

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/ebook/subscribe", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

function jsonResponse(status: number, body: unknown = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function calls() {
  return fetchMock.mock.calls.map(([url, init]) => ({
    url: String(url),
    body: JSON.parse(String((init as RequestInit).body)),
    headers: (init as RequestInit).headers as Record<string, string>,
  }));
}

const validEmail = {
  channel: "email",
  email: "Reader@Example.com ",
  locale: "en",
  bookLocale: BOOK_LOCALE,
  consent: true,
};

const validSms = {
  channel: "sms",
  phone: "+421 900 123 456",
  locale: "sk",
  bookLocale: BOOK_LOCALE,
  consent: true,
};

describe("POST /api/ebook/subscribe", () => {
  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(console, "error").mockImplementation(() => {});
    process.env.BREVO_API_KEY = "xkeysib-test";
    process.env.BREVO_LIST_ID = "7";
    process.env.BREVO_SENDER_EMAIL = "books@romamission.eu";
    process.env.NEXT_PUBLIC_URL = "https://romamission.eu";
    delete process.env.BREVO_SMS_SENDER;
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it("rejects a request without consent", async () => {
    const res = await POST(makeRequest({ ...validEmail, consent: false }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "consent" });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("rejects an invalid email", async () => {
    const res = await POST(makeRequest({ ...validEmail, email: "not-an-email" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_email" });
  });

  it("rejects a phone number without a country code", async () => {
    const res = await POST(makeRequest({ ...validSms, phone: "0900 123 456" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "invalid_phone" });
  });

  it("rejects a book language that has no edition", async () => {
    const res = await POST(makeRequest({ ...validEmail, bookLocale: "xx" }));
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "language" });
  });

  it("rejects an unknown channel", async () => {
    const res = await POST(makeRequest({ ...validEmail, channel: "fax" }));
    expect(res.status).toBe(400);
  });

  it("silently accepts bots that fill the honeypot without calling Brevo", async () => {
    const res = await POST(makeRequest({ ...validEmail, website: "http://spam.example" }));
    expect(res.status).toBe(200);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("returns 503 when Brevo is not configured", async () => {
    delete process.env.BREVO_API_KEY;
    const res = await POST(makeRequest(validEmail));
    expect(res.status).toBe(503);
    expect(await res.json()).toEqual({ error: "not_configured" });
  });

  it("subscribes an email contact and emails the download links", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(201, { id: 1 }));
    fetchMock.mockResolvedValueOnce(jsonResponse(201, { messageId: "m1" }));

    const res = await POST(makeRequest(validEmail));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, delivered: true });

    const [contact, email] = calls();
    expect(contact.url).toBe("https://api.brevo.com/v3/contacts");
    expect(contact.headers["api-key"]).toBe("xkeysib-test");
    expect(contact.body).toEqual({ email: "reader@example.com", listIds: [7], updateEnabled: true });

    expect(email.url).toBe("https://api.brevo.com/v3/smtp/email");
    expect(email.body.to).toEqual([{ email: "reader@example.com" }]);
    expect(email.body.sender.email).toBe("books@romamission.eu");
    expect(email.body.htmlContent).toContain(`https://romamission.eu/ebook/orthodox-mission-roma-${BOOK_LOCALE}.epub`);
    expect(email.body.htmlContent).toContain(`https://romamission.eu/ebook/orthodox-mission-roma-${BOOK_LOCALE}.pdf`);
    expect(email.body.textContent).toContain(".epub");
    if (AUDIOBOOK) expect(email.body.htmlContent).toContain(`https://romamission.eu${AUDIOBOOK.m4b.file}`);
  });

  it("subscribes an SMS contact in E.164 and texts the EPUB link", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(201, { id: 2 }));
    fetchMock.mockResolvedValueOnce(jsonResponse(201, { messageId: 3 }));

    const res = await POST(makeRequest(validSms));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, delivered: true });

    const [contact, sms] = calls();
    expect(contact.body).toEqual({ attributes: { SMS: "+421900123456" }, listIds: [7], updateEnabled: true });
    expect(sms.url).toBe("https://api.brevo.com/v3/transactionalSMS/send");
    expect(sms.body.recipient).toBe("421900123456");
    expect(sms.body.sender).toBe("RomaMission");
    expect(sms.body.type).toBe("transactional");
    expect(sms.body.content).toContain(`https://romamission.eu/ebook/orthodox-mission-roma-${BOOK_LOCALE}.epub`);
  });

  it("treats an already-subscribed SMS contact as success", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(400, { code: "duplicate_parameter" }));
    fetchMock.mockResolvedValueOnce(jsonResponse(201, { messageId: 4 }));

    const res = await POST(makeRequest(validSms));
    expect(res.status).toBe(200);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("returns 502 when Brevo refuses the contact", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(401, { code: "unauthorized" }));

    const res = await POST(makeRequest(validEmail));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ error: "provider" });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("still unlocks the download when only the delivery message fails", async () => {
    fetchMock.mockResolvedValueOnce(jsonResponse(201, { id: 5 }));
    fetchMock.mockResolvedValueOnce(jsonResponse(500, { message: "down" }));

    const res = await POST(makeRequest(validEmail));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, delivered: false });
  });
});
