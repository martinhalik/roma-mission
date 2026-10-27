// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockCreate = vi.hoisted(() => vi.fn());

vi.mock("stripe", () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      paymentIntents: {
        create: mockCreate,
      },
    };
  }),
}));

const { POST } = await import("../../../app/api/stripe/payment-intent/route");

function makeRequest(
  body: unknown,
  extra?: { country?: string },
): NextRequest {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (extra?.country) headers["x-vercel-ip-country"] = extra.country;
  const payload =
    body && typeof body === "object" && !Array.isArray(body)
      ? { email: "donor@example.com", ...(body as Record<string, unknown>) }
      : body;
  return new NextRequest("http://localhost:3000/api/stripe/payment-intent", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

describe("POST /api/stripe/payment-intent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    mockCreate.mockResolvedValue({ client_secret: "pi_test_secret" });
  });

  it("returns 400 when amount is missing", async () => {
    const res = await POST(makeRequest({}));
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("creates an EUR payment intent for the wallet button", async () => {
    const res = await POST(makeRequest({ amount: 30 }));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.clientSecret).toBe("pi_test_secret");
    expect(mockCreate).toHaveBeenCalledWith({
      amount: 3000,
      currency: "eur",
      description: "One-Time Donation — Roma Mission",
      automatic_payment_methods: { enabled: true },
      receipt_email: "donor@example.com",
    });
  });

  it("charges the wallet in the locale currency", async () => {
    const cases = [
      ["en", "usd", 30],
      ["ru", "usd", 30],
      ["cs", "czk", 750],
      ["ro", "ron", 150],
      ["sr", "rsd", 3500],
      ["mk", "mkd", 1800],
      ["de", "eur", 30],
    ] as const;

    for (const [locale, currency, amount] of cases) {
      mockCreate.mockClear();
      const res = await POST(makeRequest({ amount, locale, currency }));
      expect(res.status).toBe(200);
      expect(mockCreate).toHaveBeenCalledWith({
        amount: amount * 100,
        currency,
        description: "One-Time Donation — Roma Mission",
        automatic_payment_methods: { enabled: true },
        receipt_email: "donor@example.com",
      });
    }
  });

  it("rejects a disallowed wallet currency", async () => {
    const res = await POST(
      makeRequest({ amount: 30, locale: "ru", currency: "eur" }, { country: "DE" }),
    );
    expect(res.status).toBe(400);
    expect(mockCreate).not.toHaveBeenCalled();

    const us = await POST(
      makeRequest({ amount: 30, locale: "en", currency: "eur" }, { country: "US" }),
    );
    expect(us.status).toBe(400);
  });

  it("parses the wallet amount with the same rules and rejects the maximum", async () => {
    const res = await POST(makeRequest({ amount: "25,5", locale: "en", currency: "usd" }));
    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({ amount: 2550, currency: "usd", receipt_email: "donor@example.com" }),
    );

    mockCreate.mockClear();
    const max = await POST(makeRequest({ amount: "99999999999", locale: "mk", currency: "mkd" }));
    expect(max.status).toBe(400);
    expect(await max.json()).toEqual({ error: "Amount above maximum" });
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
