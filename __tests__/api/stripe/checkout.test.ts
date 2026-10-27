// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { monthlyPresets } from "../../../lib/donations";
import { buildPath } from "../../../lib/i18n/routes";
import type { Locale } from "../../../lib/i18n/locales";
import { toStripeCheckoutLocale } from "../../../lib/stripe-locale";

const mockCreate = vi.hoisted(() => vi.fn());
const mockPricesList = vi.hoisted(() => vi.fn());

vi.mock("stripe", () => ({
  default: vi.fn().mockImplementation(function () {
    return {
      checkout: {
        sessions: {
          create: mockCreate,
        },
      },
      prices: {
        list: mockPricesList,
      },
    };
  }),
}));

const { POST } = await import("../../../app/api/stripe/checkout/route");

function makeRequest(
  body: unknown,
  extra?: { country?: string; cookie?: string; query?: string },
): NextRequest {
  const query = extra?.query ? `?country=${extra.query}` : "";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (extra?.country) headers["x-vercel-ip-country"] = extra.country;
  if (extra?.cookie) headers.cookie = extra.cookie;
  const payload =
    body && typeof body === "object" && !Array.isArray(body)
      ? { email: "donor@example.com", ...(body as Record<string, unknown>) }
      : body;
  return new NextRequest(`http://localhost:3000/api/stripe/checkout${query}`, {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

const MONTHLY_PRODUCT_DATA = {
  name: "Monthly Donation — Roma Mission",
  description: "Supporting Orthodox mission to Roma communities in Eastern Europe",
};

describe("POST /api/stripe/checkout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPricesList.mockResolvedValue({ data: [] });
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.NEXT_PUBLIC_URL = "http://localhost:3000";
  });

  it("returns 400 when amount is missing", async () => {
    const res = await POST(makeRequest({ isMonthly: false }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid amount");
  });

  it("returns 400 when amount is 0", async () => {
    const res = await POST(makeRequest({ amount: 0, isMonthly: false }));
    expect(res.status).toBe(400);
    const data = await res.json();
    expect(data.error).toBe("Invalid amount");
  });

  it("returns 400 when amount is negative", async () => {
    const res = await POST(makeRequest({ amount: -5, isMonthly: false }));
    expect(res.status).toBe(400);
  });

  it("returns 400 when a valid charge has no donor email", async () => {
    const res = await POST(
      makeRequest({ amount: 25, isMonthly: false, locale: "de", currency: "eur", email: undefined }),
    );
    expect(res.status).toBe(400);
    expect(await res.json()).toEqual({ error: "Invalid email" });
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("puts the trimmed email and Checkout locale on a euro charge", async () => {
    mockCreate.mockResolvedValueOnce({ client_secret: "cs_test_email" });
    const res = await POST(
      makeRequest({
        amount: 30,
        isMonthly: false,
        locale: "de",
        currency: "eur",
        email: "  Donor@Example.com ",
      }),
    );
    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        customer_email: "Donor@Example.com",
        locale: "de",
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({ currency: "eur", unit_amount: 3000 }),
          }),
        ],
      }),
    );
  });

  it("creates a subscription session for a monthly donation", async () => {
    mockCreate.mockResolvedValueOnce({ client_secret: "cs_test_monthly" });

    const res = await POST(makeRequest({ amount: 100, isMonthly: true }));

    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.clientSecret).toBe("cs_test_monthly");

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "subscription",
        ui_mode: "embedded",
      })
    );
  });

  it("creates a payment session for a one-time donation", async () => {
    mockCreate.mockResolvedValueOnce({ client_secret: "cs_test_onetime" });

    const res = await POST(makeRequest({ amount: 50, isMonthly: false }));

    expect(res.status).toBe(200);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        ui_mode: "embedded",
      })
    );
  });

  it("converts the major-unit amount to cents", async () => {
    mockCreate.mockResolvedValueOnce({ client_secret: "cs_test" });

    await POST(makeRequest({ amount: 25.5, isMonthly: false }));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              currency: "eur",
              unit_amount: 2550,
            }),
          }),
        ],
      })
    );
  });

  it("monthly line item includes recurring interval", async () => {
    mockCreate.mockResolvedValueOnce({ client_secret: "cs_test" });

    await POST(makeRequest({ amount: 30, isMonthly: true }));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({
              currency: "eur",
              recurring: { interval: "month" },
            }),
          }),
        ],
      })
    );
  });

  it("one-time line item has no recurring field and uses EUR", async () => {
    mockCreate.mockResolvedValueOnce({ client_secret: "cs_test" });

    await POST(makeRequest({ amount: 30, isMonthly: false }));

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.line_items[0].price_data).toEqual({
      currency: "eur",
      product_data: {
        name: "One-Time Donation — Roma Mission",
        description: MONTHLY_PRODUCT_DATA.description,
      },
      unit_amount: 3000,
    });
    expect(callArgs.line_items[0].price_data.recurring).toBeUndefined();
    expect(callArgs.line_items[0].price).toBeUndefined();
  });

  describe("monthly preset prices", () => {
    beforeEach(() => {
      mockCreate.mockResolvedValue({ client_secret: "cs_test" });
    });

    it.each([
      [10, 1000],
      [25, 2500],
      [50, 5000],
      [100, 10000],
    ] as const)(
      "preset %i EUR uses inline price_data (unit_amount %i, interval month)",
      async (amount, unitAmount) => {
        await POST(makeRequest({ amount, isMonthly: true }));

        expect(mockPricesList).not.toHaveBeenCalled();
        const callArgs = mockCreate.mock.calls[0][0];
        expect(callArgs.mode).toBe("subscription");
        expect(callArgs.line_items).toEqual([
          {
            price_data: {
              currency: "eur",
              product_data: MONTHLY_PRODUCT_DATA,
              unit_amount: unitAmount,
              recurring: { interval: "month" },
            },
            quantity: 1,
          },
        ]);
      }
    );

    it("covers every euro monthly preset amount", () => {
      expect(monthlyPresets("eur")).toEqual([10, 25, 50, 100]);
    });

    it("puts a custom monthly amount on inline EUR price_data, not a stored Price", async () => {
      await POST(makeRequest({ amount: 30, isMonthly: true }));

      expect(mockPricesList).not.toHaveBeenCalled();
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.line_items[0].price).toBeUndefined();
      expect(callArgs.line_items[0].price_data).toEqual({
        currency: "eur",
        product_data: MONTHLY_PRODUCT_DATA,
        unit_amount: 3000,
        recurring: { interval: "month" },
      });
    });

    it("falls back to inline EUR price_data when no dashboard Prices exist", async () => {
      await POST(makeRequest({ amount: 25, isMonthly: true }));

      expect(mockPricesList).not.toHaveBeenCalled();
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.line_items[0].price).toBeUndefined();
      expect(callArgs.line_items[0].price_data.currency).toBe("eur");
      expect(callArgs.line_items[0].price_data.product_data).toEqual(
        MONTHLY_PRODUCT_DATA
      );
      expect(callArgs.line_items[0].price_data.unit_amount).toBe(2500);
    });

    it("does not look up monthly prices for one-time donations", async () => {
      await POST(makeRequest({ amount: 100, isMonthly: false }));

      expect(mockPricesList).not.toHaveBeenCalled();
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.line_items[0].price_data.currency).toBe("eur");
      expect(callArgs.line_items[0].price_data.product_data).toBeDefined();
    });
  });

  describe("locale allowlist", () => {
    const cases: {
      locale: Locale;
      currency: string;
      onetime: number;
      monthly: number;
      custom: number;
    }[] = [
      { locale: "en", currency: "usd", onetime: 30, monthly: 25, custom: 40 },
      { locale: "sk", currency: "eur", onetime: 30, monthly: 25, custom: 40 },
      { locale: "de", currency: "eur", onetime: 30, monthly: 25, custom: 40 },
      { locale: "el", currency: "eur", onetime: 30, monthly: 25, custom: 40 },
      { locale: "cs", currency: "czk", onetime: 750, monthly: 600, custom: 400 },
      { locale: "ro", currency: "ron", onetime: 150, monthly: 125, custom: 80 },
      { locale: "sr", currency: "rsd", onetime: 3500, monthly: 3000, custom: 2000 },
      { locale: "ru", currency: "usd", onetime: 30, monthly: 25, custom: 40 },
      { locale: "mk", currency: "mkd", onetime: 1800, monthly: 1500, custom: 900 },
    ];

    beforeEach(() => {
      mockCreate.mockResolvedValue({ client_secret: "cs_test" });
    });

    it.each(cases)(
      "charges $locale in $currency for one-time, monthly preset, monthly custom, and fallback",
      async ({ locale, currency, onetime, monthly, custom }) => {
        const thankYou = `http://localhost:3000${buildPath(locale, "thankYou")}`;

        await POST(makeRequest({ amount: onetime, isMonthly: false, locale, currency }));
        let args = mockCreate.mock.calls.at(-1)?.[0];
        expect(args).toBeDefined();
        expect(args.mode).toBe("payment");
        expect(args.return_url).toBe(thankYou);
        expect(args.line_items[0].price).toBeUndefined();
        expect(args.line_items[0].price_data).toMatchObject({
          currency,
          unit_amount: onetime * 100,
        });
        expect(args.customer_email).toBe("donor@example.com");
        expect(args.locale).toBe(toStripeCheckoutLocale(locale));
        expect(args.line_items[0].price_data.recurring).toBeUndefined();

        await POST(makeRequest({ amount: monthly, isMonthly: true, locale, currency }));
        args = mockCreate.mock.calls.at(-1)?.[0];
        expect(args.mode).toBe("subscription");
        expect(args.return_url).toBe(thankYou);
        expect(args.line_items[0].price_data).toMatchObject({
          currency,
          unit_amount: monthly * 100,
          recurring: { interval: "month" },
        });

        await POST(makeRequest({ amount: custom, isMonthly: true, locale, currency }));
        args = mockCreate.mock.calls.at(-1)?.[0];
        expect(mockPricesList).not.toHaveBeenCalled();
        expect(args.line_items[0].price).toBeUndefined();
        expect(args.line_items[0].price_data).toMatchObject({
          currency,
          unit_amount: custom * 100,
          recurring: { interval: "month" },
        });

        await POST(makeRequest({ amount: monthly, isMonthly: true, locale, currency }));
        args = mockCreate.mock.calls.at(-1)?.[0];
        expect(args.line_items[0].price_data.currency).toBe(currency);
        expect(args.line_items[0].price).toBeUndefined();
      },
    );

    it("charges English euros for a non-US visitor and keeps the English thank-you path", async () => {
      const res = await POST(
        makeRequest(
          { amount: 25.5, isMonthly: false, locale: "en", currency: "eur" },
          { country: "DE" },
        ),
      );
      expect(res.status).toBe(200);
      const args = mockCreate.mock.calls[0][0];
      expect(args.line_items[0].price_data).toMatchObject({
        currency: "eur",
        unit_amount: 2550,
      });
      expect(args.return_url).toBe("http://localhost:3000/en/thank-you");
    });

    it("rejects EUR for an English visitor in the US", async () => {
      const res = await POST(
        makeRequest(
          { amount: 25, isMonthly: true, locale: "en", currency: "eur" },
          { country: "US" },
        ),
      );
      expect(res.status).toBe(400);
      expect(await res.json()).toEqual({ error: "Currency not allowed" });
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("charges USD for an English visitor in the US", async () => {
      const res = await POST(
        makeRequest(
          { amount: 25, isMonthly: true, locale: "en", currency: "usd" },
          { country: "US" },
        ),
      );
      expect(res.status).toBe(200);
      expect(mockCreate.mock.calls[0][0].line_items[0].price_data.currency).toBe("usd");
    });

    it("rejects a client currency outside de, sk, and ru", async () => {
      for (const [locale, currency] of [
        ["de", "usd"],
        ["sk", "usd"],
        ["ru", "eur"],
        ["cs", "eur"],
      ] as const) {
        mockCreate.mockClear();
        const res = await POST(
          makeRequest({ amount: 25, isMonthly: false, locale, currency }),
        );
        expect(res.status).toBe(400);
        expect(mockCreate).not.toHaveBeenCalled();
      }
    });

    it("honors a non-production country cookie and query", async () => {
      const byCookie = await POST(
        makeRequest(
          { amount: 25, isMonthly: false, locale: "en", currency: "eur" },
          { cookie: "geo_country=US" },
        ),
      );
      expect(byCookie.status).toBe(400);

      const byQuery = await POST(
        makeRequest(
          { amount: 25, isMonthly: false, locale: "en", currency: "eur" },
          { query: "US" },
        ),
      );
      expect(byQuery.status).toBe(400);
      expect(mockCreate).not.toHaveBeenCalled();
    });

    it("ignores the country cookie and query in production", async () => {
      vi.stubEnv("NODE_ENV", "production");
      vi.stubEnv("VERCEL_ENV", "production");
      const res = await POST(
        makeRequest(
          { amount: 25, isMonthly: false, locale: "en", currency: "eur" },
          { cookie: "geo_country=US", query: "US" },
        ),
      );
      expect(res.status).toBe(200);
      expect(mockCreate.mock.calls[0][0].line_items[0].price_data.currency).toBe("eur");
      vi.unstubAllEnvs();
    });

    it("still rejects EUR from the platform header when the override is disabled", async () => {
      vi.stubEnv("VERCEL_ENV", "production");
      const res = await POST(
        makeRequest(
          { amount: 25, isMonthly: false, locale: "en", currency: "eur" },
          { country: "US", query: "DE" },
        ),
      );
      expect(res.status).toBe(400);
      expect(mockCreate).not.toHaveBeenCalled();
      vi.unstubAllEnvs();
    });

    it("falls back to EUR when the locale is missing or unknown", async () => {
      await POST(makeRequest({ amount: 30, isMonthly: false, currency: "usd" }));
      expect(mockCreate.mock.calls[0][0].line_items[0].price_data.currency).toBe("eur");
      expect(mockCreate.mock.calls[0][0].return_url).toBe("http://localhost:3000/en/thank-you");

      await POST(makeRequest({ amount: 30, isMonthly: true, locale: "xx", currency: "czk" }));
      expect(mockCreate.mock.calls[1][0].line_items[0].price_data).toMatchObject({
        currency: "eur",
        unit_amount: 3000,
        recurring: { interval: "month" },
      });
    });

    it("rejects amounts under the currency minimum", async () => {
      const low = await POST(
        makeRequest({ amount: 10, isMonthly: false, locale: "cs", currency: "czk" }),
      );
      expect(low.status).toBe(400);
      expect(await low.json()).toEqual({ error: "Amount below minimum" });

      const ok = await POST(
        makeRequest({ amount: 15, isMonthly: false, locale: "cs", currency: "czk" }),
      );
      expect(ok.status).toBe(200);
      expect(mockCreate.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(1500);

      const cents = await POST(
        makeRequest({ amount: 0.5, isMonthly: false, locale: "en", currency: "usd" }),
      );
      expect(cents.status).toBe(200);
      expect(mockCreate.mock.calls[1][0].line_items[0].price_data.unit_amount).toBe(50);
    });

    it("charges the parsed minor units and rejects an over-precise or huge amount", async () => {
      const comma = await POST(
        makeRequest({ amount: "25,5", isMonthly: false, locale: "en", currency: "usd" }),
      );
      expect(comma.status).toBe(200);
      expect(mockCreate.mock.calls[0][0].line_items[0].price_data.unit_amount).toBe(2550);

      const grouped = await POST(
        makeRequest({ amount: "1.250", isMonthly: false, locale: "de", currency: "eur" }),
      );
      expect(grouped.status).toBe(200);
      expect(mockCreate.mock.calls[1][0].line_items[0].price_data.unit_amount).toBe(125000);

      const extra = await POST(
        makeRequest({ amount: "25,555", isMonthly: false, locale: "de", currency: "eur" }),
      );
      expect(extra.status).toBe(400);
      expect(await extra.json()).toEqual({ error: "Invalid amount" });
      expect(mockCreate).toHaveBeenCalledTimes(2);

      const max = await POST(
        makeRequest({ amount: 99999999999, isMonthly: false, locale: "en", currency: "usd" }),
      );
      expect(max.status).toBe(400);
      expect(await max.json()).toEqual({ error: "Amount above maximum" });

      const rounded = await POST(
        makeRequest({ amount: 25.555, isMonthly: false, locale: "en", currency: "usd" }),
      );
      expect(rounded.status).toBe(400);
      expect(await rounded.json()).toEqual({ error: "Invalid amount" });
    });
  });
});
