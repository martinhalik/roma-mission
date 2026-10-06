// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";

const mockCreate = vi.hoisted(() => vi.fn());
const mockPricesList = vi.hoisted(() => vi.fn());

const MONTHLY_PRODUCT_ID = "prod_monthly_test";
const PRESET_PRICES = [
  { id: "price_m10", unit_amount: 1000, product: MONTHLY_PRODUCT_ID },
  { id: "price_m25", unit_amount: 2500, product: MONTHLY_PRODUCT_ID },
  { id: "price_m50", unit_amount: 5000, product: MONTHLY_PRODUCT_ID },
  { id: "price_m100", unit_amount: 10000, product: MONTHLY_PRODUCT_ID },
];

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

// Import after mocks are in place
const { POST } = await import(
  "../../../app/api/stripe/checkout/route"
);

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

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

  it("converts dollar amount to cents", async () => {
    mockCreate.mockResolvedValueOnce({ client_secret: "cs_test" });

    await POST(makeRequest({ amount: 25.5, isMonthly: false }));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({ unit_amount: 2550 }),
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
              recurring: { interval: "month" },
            }),
          }),
        ],
      })
    );
  });

  it("one-time line item has no recurring field", async () => {
    mockCreate.mockResolvedValueOnce({ client_secret: "cs_test" });

    await POST(makeRequest({ amount: 30, isMonthly: false }));

    const callArgs = mockCreate.mock.calls[0][0];
    expect(callArgs.line_items[0].price_data.recurring).toBeUndefined();
  });

  it("uses USD currency", async () => {
    mockCreate.mockResolvedValueOnce({ client_secret: "cs_test" });

    await POST(makeRequest({ amount: 100, isMonthly: false }));

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        line_items: [
          expect.objectContaining({
            price_data: expect.objectContaining({ currency: "usd" }),
          }),
        ],
      })
    );
  });

  describe("monthly preset prices", () => {
    beforeEach(() => {
      mockPricesList.mockResolvedValue({ data: PRESET_PRICES });
      mockCreate.mockResolvedValue({ client_secret: "cs_test" });
    });

    it("looks up the preset prices by lookup key", async () => {
      await POST(makeRequest({ amount: 100, isMonthly: true }));

      expect(mockPricesList).toHaveBeenCalledWith({
        lookup_keys: [
          "monthly_donation_10",
          "monthly_donation_25",
          "monthly_donation_50",
          "monthly_donation_100",
        ],
        active: true,
      });
    });

    it("uses the fixed price for a preset amount", async () => {
      await POST(makeRequest({ amount: 100, isMonthly: true }));

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.line_items).toEqual([
        { price: "price_m100", quantity: 1 },
      ]);
    });

    it("puts a custom amount on the same product as the presets", async () => {
      await POST(makeRequest({ amount: 30, isMonthly: true }));

      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.line_items[0].price_data).toEqual({
        currency: "usd",
        product: MONTHLY_PRODUCT_ID,
        unit_amount: 3000,
        recurring: { interval: "month" },
      });
    });

    it("does not look up monthly prices for one-time donations", async () => {
      await POST(makeRequest({ amount: 100, isMonthly: false }));

      expect(mockPricesList).not.toHaveBeenCalled();
      const callArgs = mockCreate.mock.calls[0][0];
      expect(callArgs.line_items[0].price_data.product_data).toBeDefined();
    });
  });
});
