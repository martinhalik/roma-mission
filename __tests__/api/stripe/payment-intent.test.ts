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

function makeRequest(body: unknown): NextRequest {
  return new NextRequest("http://localhost:3000/api/stripe/payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
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
    });
  });
});
