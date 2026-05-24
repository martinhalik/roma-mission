import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import DonationModal from "../../components/DonationModal";
import LanguageProvider from "../../components/LanguageProvider";

function renderWithI18n(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

vi.mock("@stripe/stripe-js", () => ({
  loadStripe: vi.fn().mockResolvedValue({}),
}));

vi.mock("@stripe/react-stripe-js", () => ({
  EmbeddedCheckout: () => <div data-testid="embedded-checkout" />,
  EmbeddedCheckoutProvider: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
  Elements: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  PaymentRequestButtonElement: () => <div data-testid="payment-request-button" />,
  useStripe: () => null,
}));

describe("DonationModal", () => {
  const onClose = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
  });

  it("renders nothing when closed", () => {
    renderWithI18n(<DonationModal isOpen={false} onClose={onClose} />);
    expect(screen.queryByText("Give to Roma Mission")).not.toBeInTheDocument();
  });

  it("renders when open", () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    expect(screen.getByText("Give to Roma Mission")).toBeInTheDocument();
  });

  it("shows all preset amounts", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    // Monthly amounts shown by default
    expect(screen.getByText("$10")).toBeInTheDocument();
    expect(screen.getByText("$25")).toBeInTheDocument();
    expect(screen.getByText("$50")).toBeInTheDocument();
    expect(screen.getByText("$100")).toBeInTheDocument();
    // Switch to one-time to see those amounts
    await user.click(screen.getByRole("button", { name: "ONE-TIME" }));
    expect(screen.getByText("$30")).toBeInTheDocument();
    expect(screen.getByText("$250")).toBeInTheDocument();
    expect(screen.getByText("$500")).toBeInTheDocument();
  });

  it("defaults to monthly mode with $100 selected", () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    expect(
      screen.getByRole("button", { name: "GIVE $100/MO" })
    ).toBeInTheDocument();
  });

  it("toggles to one-time mode", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "ONE-TIME" }));
    expect(
      screen.getByRole("button", { name: "GIVE $100" })
    ).toBeInTheDocument();
  });

  it("selects a different preset amount", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "$50" }));
    expect(
      screen.getByRole("button", { name: "GIVE $50/MO" })
    ).toBeInTheDocument();
  });

  it("accepts a custom amount", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    const input = screen.getByPlaceholderText("Custom amount");
    await user.type(input, "75");
    expect(
      screen.getByRole("button", { name: "GIVE $75/MO" })
    ).toBeInTheDocument();
  });

  it("disables submit button when custom amount is 0", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    const input = screen.getByPlaceholderText("Custom amount");
    await user.type(input, "0");
    expect(screen.getByRole("button", { name: /^GIVE/ })).toBeDisabled();
  });

  it("shows monthly impact message", () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    expect(
      screen.getByText("Covers weekly parish materials and programs.")
    ).toBeInTheDocument();
  });

  it("hides impact message in one-time mode", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "ONE-TIME" }));
    expect(
      screen.queryByText("Covers weekly parish materials and programs.")
    ).not.toBeInTheDocument();
  });

  it("calls the checkout API with correct payload and advances to checkout step", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: "cs_test_secret" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "GIVE $100/MO" }));

    expect(mockFetch).toHaveBeenCalledWith("/api/stripe/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 100, isMonthly: true }),
    });

    await waitFor(() => {
      expect(screen.getByTestId("embedded-checkout")).toBeInTheDocument();
    });
  });

  it("sends one-time flag when one-time mode is selected", async () => {
    const mockFetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: async () => ({ clientSecret: "cs_test" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "ONE-TIME" }));
    await user.click(screen.getByRole("button", { name: "GIVE $100" }));

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/stripe/checkout",
      expect.objectContaining({
        body: JSON.stringify({ amount: 100, isMonthly: false }),
      })
    );
  });

  it("shows error message when API call fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValueOnce({ ok: false }));

    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "GIVE $100/MO" }));

    await waitFor(() => {
      expect(
        screen.getByText("Something went wrong. Please try again.")
      ).toBeInTheDocument();
    });
  });

  it("shows loading state while API is in flight", async () => {
    let resolvePromise!: (v: unknown) => void;
    const pending = new Promise((res) => {
      resolvePromise = res;
    });
    vi.stubGlobal("fetch", vi.fn().mockReturnValueOnce(pending));

    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "GIVE $100/MO" }));

    expect(screen.getByRole("button", { name: "PREPARING..." })).toBeDisabled();

    resolvePromise({ ok: false });
  });

  it("closes when the X button is clicked", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when the backdrop is clicked", () => {
    const { container } = renderWithI18n(
      <DonationModal isOpen={true} onClose={onClose} />
    );
    fireEvent.click(container.firstChild!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when modal content is clicked", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await user.click(screen.getByText("Give to Roma Mission"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on Escape key press", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
