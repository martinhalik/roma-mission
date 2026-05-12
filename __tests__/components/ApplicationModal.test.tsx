import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import ApplicationModal from "../../components/ApplicationModal";
import LanguageProvider from "../../components/LanguageProvider";

const GOOGLE_CALENDAR_URL = "https://calendar.app.google/cTPpM8EAg5QiMKpz6";

function renderWithI18n(ui: React.ReactElement) {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
}

describe("ApplicationModal", () => {
  const onClose = vi.fn();
  const user = userEvent.setup();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders nothing when closed", () => {
    renderWithI18n(
      <ApplicationModal isOpen={false} onClose={onClose} type="volunteer" />
    );
    expect(screen.queryByText("Apply to Volunteer")).not.toBeInTheDocument();
  });

  describe("volunteer type", () => {
    it("shows volunteer title and subtitle", () => {
      renderWithI18n(
        <ApplicationModal isOpen={true} onClose={onClose} type="volunteer" />
      );
      expect(screen.getByText("Apply to Volunteer")).toBeInTheDocument();
      expect(
        screen.getByText("Use your skills to serve Roma communities")
      ).toBeInTheDocument();
    });

    it("shows volunteer-specific description", () => {
      renderWithI18n(
        <ApplicationModal isOpen={true} onClose={onClose} type="volunteer" />
      );
      expect(
        screen.getByText(/match volunteers with roles/)
      ).toBeInTheDocument();
    });
  });

  describe("trip type", () => {
    it("shows trip title and subtitle", () => {
      renderWithI18n(
        <ApplicationModal isOpen={true} onClose={onClose} type="trip" />
      );
      expect(screen.getByText("Join a Mission Trip")).toBeInTheDocument();
      expect(screen.getByText("Come see the work first-hand")).toBeInTheDocument();
    });

    it("shows trip-specific description", () => {
      renderWithI18n(
        <ApplicationModal isOpen={true} onClose={onClose} type="trip" />
      );
      expect(screen.getByText(/Spring and Summer/)).toBeInTheDocument();
    });
  });

  it("schedule button links to Google Calendar and opens in a new tab", () => {
    renderWithI18n(
      <ApplicationModal isOpen={true} onClose={onClose} type="volunteer" />
    );
    const link = screen.getByRole("link", { name: "SCHEDULE A CALL" });
    expect(link).toHaveAttribute("href", GOOGLE_CALENDAR_URL);
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("shows success state after clicking schedule", async () => {
    renderWithI18n(
      <ApplicationModal isOpen={true} onClose={onClose} type="volunteer" />
    );
    await user.click(screen.getByRole("link", { name: "SCHEDULE A CALL" }));
    expect(screen.getByText("Booking link opened")).toBeInTheDocument();
    expect(
      screen.getByText(/Complete your booking in the new tab/)
    ).toBeInTheDocument();
  });

  it("hides schedule button after clicking", async () => {
    renderWithI18n(
      <ApplicationModal isOpen={true} onClose={onClose} type="volunteer" />
    );
    await user.click(screen.getByRole("link", { name: "SCHEDULE A CALL" }));
    expect(
      screen.queryByRole("link", { name: "SCHEDULE A CALL" })
    ).not.toBeInTheDocument();
  });

  it("closes via CLOSE button in success state", async () => {
    renderWithI18n(
      <ApplicationModal isOpen={true} onClose={onClose} type="volunteer" />
    );
    await user.click(screen.getByRole("link", { name: "SCHEDULE A CALL" }));
    await user.click(screen.getByRole("button", { name: "CLOSE" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when the X button is clicked", async () => {
    renderWithI18n(
      <ApplicationModal isOpen={true} onClose={onClose} type="volunteer" />
    );
    await user.click(screen.getByRole("button", { name: "Close" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("closes when the backdrop is clicked", () => {
    const { container } = renderWithI18n(
      <ApplicationModal isOpen={true} onClose={onClose} type="volunteer" />
    );
    fireEvent.click(container.firstChild!);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("does not close when modal content is clicked", async () => {
    renderWithI18n(
      <ApplicationModal isOpen={true} onClose={onClose} type="volunteer" />
    );
    await user.click(screen.getByText("Apply to Volunteer"));
    expect(onClose).not.toHaveBeenCalled();
  });

  it("closes on Escape key press", async () => {
    renderWithI18n(
      <ApplicationModal isOpen={true} onClose={onClose} type="volunteer" />
    );
    await user.keyboard("{Escape}");
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("resets to initial state after closing via the CLOSE button", async () => {
    renderWithI18n(
      <ApplicationModal isOpen={true} onClose={onClose} type="volunteer" />
    );
    await user.click(screen.getByRole("link", { name: "SCHEDULE A CALL" }));
    expect(screen.getByText("Booking link opened")).toBeInTheDocument();

    // CLOSE button resets state and calls onClose
    await user.click(screen.getByRole("button", { name: "CLOSE" }));
    expect(onClose).toHaveBeenCalledTimes(1);
    // After reset, schedule link is visible again
    expect(
      screen.getByRole("link", { name: "SCHEDULE A CALL" })
    ).toBeInTheDocument();
  });
});
