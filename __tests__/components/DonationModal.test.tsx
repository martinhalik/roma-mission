import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import DonationModal from "../../components/DonationModal";
import LanguageProvider from "../../components/LanguageProvider";
import { DICTIONARIES } from "../../lib/i18n";
import { LOCALES, type Locale } from "../../lib/i18n/locales";
import { formatCurrency, sentenceAfterAmount } from "../../lib/i18n/format";
import {
  CURRENCIES,
  defaultCurrency,
  monthlyPresets,
  onetimePresets,
} from "../../lib/donations";

const stripeStub = vi.hoisted(() => {
  const paymentRequest = vi.fn(
    (options: { total: { label: string; amount: number } }) => ({
      canMakePayment: () => Promise.resolve(null),
      on: vi.fn(),
      update: vi.fn((next: { total: { label: string; amount: number } }) => {
        options.total = next.total;
      }),
      options,
    })
  );
  return {
    paymentRequest,
    stripe: {
      paymentRequest,
      confirmCardPayment: vi.fn(),
    },
  };
});

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
  useStripe: () => stripeStub.stripe,
}));

describe("DonationModal", () => {
  const onClose = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal("fetch", vi.fn());
    localStorage.clear();
    document.cookie = "geo_country=; Max-Age=0";
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
      body: JSON.stringify({ amount: 100, isMonthly: true, locale: "en", currency: "usd" }),
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
        body: JSON.stringify({
          amount: 100,
          isMonthly: false,
          locale: "en",
          currency: "usd",
        }),
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

  it("derives the custom-amount symbol from the locale", () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    expect(screen.getByTestId("currency-affix")).toHaveTextContent("$");
  });

  it("requests the wallet payment in USD for Slovakia", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "ONE-TIME" }));
    await waitFor(() => {
      expect(stripeStub.paymentRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          country: "SK",
          currency: "usd",
          total: expect.objectContaining({ amount: 10000 }),
        })
      );
    });
  });

  it("initializes the wallet with the selected amount and updates it on change", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "ONE-TIME" }));
    await user.click(screen.getByRole("button", { name: "$30" }));

    await waitFor(() => {
      const created = stripeStub.paymentRequest.mock.results.at(-1)?.value as {
        options: { total: { amount: number } };
        update: ReturnType<typeof vi.fn>;
      };
      expect(created.options.total.amount).toBe(3000);
      expect(created.update).toHaveBeenCalledWith(
        expect.objectContaining({
          total: expect.objectContaining({ amount: 3000 }),
        })
      );
    });
  });

  it.each(LOCALES.map((locale) => locale.code))(
    "renders the %s currency in the modal",
    async (locale: Locale) => {
      const dict = DICTIONARIES[locale];
      const currency = defaultCurrency(locale);
      const monthly = monthlyPresets(currency);
      const onetime = onetimePresets(currency);
      render(
        <LanguageProvider locale={locale}>
          <DonationModal isOpen={true} onClose={onClose} />
        </LanguageProvider>
      );

      for (const amount of monthly) {
        expect(
          screen.getByRole("button", {
            name: formatCurrency(amount, locale, currency),
          })
        ).toBeInTheDocument();
      }

      expect(
        screen.getByRole("button", {
          name: dict.donation.giveMonthly.replace(
            "{amount}",
            formatCurrency(monthly[3], locale, currency)
          ),
        })
      ).toBeInTheDocument();
      expect(screen.getByTestId("currency-affix")).toHaveTextContent(
        CURRENCIES[currency].symbol
      );
      if (locale !== "en") {
        expect(screen.queryByRole("radio", { name: "EUR" })).not.toBeInTheDocument();
      }

      await user.click(screen.getByRole("button", { name: dict.donation.oneTime }));
      for (const amount of onetime) {
        expect(
          screen.getByRole("button", {
            name: formatCurrency(amount, locale, currency),
          })
        ).toBeInTheDocument();
      }
      expect(
        screen.getByRole("button", {
          name: dict.donation.giveOnce.replace(
            "{amount}",
            formatCurrency(onetime[1], locale, currency)
          ),
        })
      ).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: dict.donation.monthly }));
      const input = screen.getByPlaceholderText(dict.donation.customPlaceholder);
      await user.type(input, "5");
      expect(screen.getByText(dict.donation.impactBase)).toBeInTheDocument();
    }
  );

  it("shows a USD/EUR switcher for English outside the US and remembers EUR", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    const euros = screen.getByRole("radio", { name: "EUR" });
    expect(screen.getByRole("radio", { name: "USD" })).toHaveAttribute("aria-checked", "true");
    await user.click(euros);
    expect(screen.getByText("€25")).toBeInTheDocument();
    expect(localStorage.getItem("donation-currency")).toBe("eur");

    const input = screen.getByPlaceholderText("Custom amount");
    await user.type(input, "5");
    expect(screen.getByText("Every euro goes directly to the field.")).toBeInTheDocument();
  });

  it("restores a saved English euro choice after mount", async () => {
    localStorage.setItem("donation-currency", "eur");
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "GIVE €100/MO" })).toBeInTheDocument();
    });
  });

  it("hides the switcher and forces USD for a US visitor", async () => {
    document.cookie = "geo_country=US";
    localStorage.setItem("donation-currency", "eur");
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await waitFor(() => {
      expect(screen.getByRole("button", { name: "GIVE $100/MO" })).toBeInTheDocument();
    });
    expect(screen.queryByRole("radio", { name: "EUR" })).not.toBeInTheDocument();
  });

  it("recreates the wallet request when the currency changes", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    await user.click(screen.getByRole("button", { name: "ONE-TIME" }));
    await user.click(screen.getByRole("radio", { name: "EUR" }));
    await waitFor(() => {
      expect(stripeStub.paymentRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          country: "SK",
          currency: "eur",
          total: expect.objectContaining({ amount: 10000 }),
        })
      );
    });
  });

  it("blocks a custom amount under the currency minimum", async () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    const input = screen.getByPlaceholderText("Custom amount");
    await user.type(input, "0.25");
    expect(screen.getByRole("alert")).toHaveTextContent("Minimum amount is $0.50.");
    expect(screen.getByRole("alert").textContent).not.toMatch(/\.\./);
    expect(screen.getByRole("button", { name: "GIVE $0.25/MO" })).toBeDisabled();
  });

  it("uses a decimal text field with the currency minimum and no number spinner", () => {
    renderWithI18n(<DonationModal isOpen={true} onClose={onClose} />);
    const input = screen.getByPlaceholderText("Custom amount");
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveAttribute("inputmode", "decimal");
    expect(input).toHaveAttribute("min", "0.5");
    expect(input).toHaveAttribute("step", "0.01");
  });

  it.each([
    ["sr", "10", "Минимални износ је 50 дин."],
    ["mk", "10", "Минималниот износ е 30 ден."],
  ] as const)(
    "minimum message in %s does not double the abbreviation period",
    async (locale, typed, expected) => {
      const dict = DICTIONARIES[locale];
      render(
        <LanguageProvider locale={locale}>
          <DonationModal isOpen={true} onClose={onClose} />
        </LanguageProvider>
      );
      await user.type(screen.getByPlaceholderText(dict.donation.customPlaceholder), typed);
      expect(screen.getByRole("alert").textContent).toBe(expected);
      expect(screen.getByRole("alert").textContent).not.toMatch(/\.\./);
    },
  );

  it.each(LOCALES.map((locale) => locale.code))(
    "shows a single-period minimum message in %s",
    async (locale: Locale) => {
      const dict = DICTIONARIES[locale];
      const currency = defaultCurrency(locale);
      const typed = currency === "czk" ? "10" : currency === "ron" ? "1" : currency === "rsd" || currency === "mkd" ? "10" : "0.25";
      const expected = sentenceAfterAmount(
        dict.donation.amountTooLow,
        formatCurrency(CURRENCIES[currency].minimum, locale, currency),
      );
      render(
        <LanguageProvider locale={locale}>
          <DonationModal isOpen={true} onClose={onClose} />
        </LanguageProvider>
      );
      const input = screen.getByPlaceholderText(dict.donation.customPlaceholder);
      expect(input).toHaveAttribute("min", String(CURRENCIES[currency].minimum));
      expect(input).toHaveAttribute("step", "0.01");
      await user.type(input, typed);
      expect(screen.getByRole("alert").textContent).toBe(expected);
      expect(expected).not.toMatch(/\.\./);
    },
  );

  it("accepts a comma or a dot as the decimal separator in Slovak", async () => {
    const dict = DICTIONARIES.sk;
    render(
      <LanguageProvider locale="sk">
        <DonationModal isOpen={true} onClose={onClose} />
      </LanguageProvider>
    );
    const input = screen.getByPlaceholderText(dict.donation.customPlaceholder);
    await user.type(input, "1,50");
    expect(
      screen.getByRole("button", {
        name: dict.donation.giveMonthly.replace("{amount}", "1,50 €"),
      })
    ).toBeEnabled();

    await user.clear(input);
    await user.type(input, "1.50");
    expect(
      screen.getByRole("button", {
        name: dict.donation.giveMonthly.replace("{amount}", "1,50 €"),
      })
    ).toBeEnabled();
  });
});
