// @vitest-environment node
import { vi, describe, it, expect, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { MONTHLY_PRESET_AMOUNTS } from "../../../lib/donations";

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

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/stripe/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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

    it("covers every monthly preset amount", () => {
      expect(MONTHLY_PRESET_AMOUNTS).toEqual([10, 25, 50, 100]);
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
});
