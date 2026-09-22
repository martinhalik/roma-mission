import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import BookPage from "../../app/[locale]/_components/BookPage";
import LanguageProvider from "../../components/LanguageProvider";
import { BOOK_UNLOCK_STORAGE_KEY, getBookFiles } from "../../lib/ebook";

const fetchMock = vi.fn();

function renderPage() {
  return render(
    <LanguageProvider locale="sk">
      <BookPage />
    </LanguageProvider>
  );
}

function okResponse(delivered = true) {
  return new Response(JSON.stringify({ ok: true, delivered }), { status: 200 });
}

describe("BookPage", () => {
  const user = userEvent.setup();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal("fetch", fetchMock);
    localStorage.clear();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("shows the book title in the site language and hides downloads until subscribing", () => {
    renderPage();
    expect(screen.getByRole("heading", { level: 1, name: "Pravoslávna misia medzi Rómami" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /STIAHNUŤ/ })).not.toBeInTheDocument();
  });

  it("validates the email and consent before calling the API", async () => {
    renderPage();
    const submit = screen.getAllByRole("button", { name: "ZÍSKAŤ E-KNIHU" })[0];

    await user.type(screen.getByLabelText("E-mailová adresa"), "zle");
    await user.click(submit);
    expect(screen.getByRole("alert")).toHaveTextContent("Zadajte platnú e-mailovú adresu.");

    await user.clear(screen.getByLabelText("E-mailová adresa"));
    await user.type(screen.getByLabelText("E-mailová adresa"), "citatel@priklad.sk");
    await user.click(submit);
    expect(screen.getByRole("alert")).toHaveTextContent("Potvrďte, prosím, súhlas so zasielaním správ.");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("subscribes by email and unlocks EPUB and PDF downloads", async () => {
    fetchMock.mockResolvedValueOnce(okResponse());
    renderPage();

    await user.type(screen.getByLabelText("E-mailová adresa"), "citatel@priklad.sk");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getAllByRole("button", { name: "ZÍSKAŤ E-KNIHU" })[0]);

    await waitFor(() => expect(screen.getByText("Vaša kniha je pripravená")).toBeInTheDocument());
    const [, init] = fetchMock.mock.calls[0];
    expect(JSON.parse(init.body)).toMatchObject({
      channel: "email",
      email: "citatel@priklad.sk",
      locale: "sk",
      bookLocale: "sk",
      consent: true,
      website: "",
    });

    const files = getBookFiles("sk");
    const links = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(links).toContain(files?.epub.file);
    expect(links).toContain(files?.pdf.file);
    expect(screen.getByText("Odkazy na stiahnutie sme poslali aj na citatel@priklad.sk.")).toBeInTheDocument();
    expect(JSON.parse(localStorage.getItem(BOOK_UNLOCK_STORAGE_KEY) ?? "{}")).toMatchObject({ channel: "email" });
  });

  it("subscribes by SMS with a normalized phone number", async () => {
    fetchMock.mockResolvedValueOnce(okResponse());
    renderPage();

    await user.click(screen.getByRole("tab", { name: "SMS" }));
    await user.type(screen.getByLabelText("Mobilné číslo"), "+421 900 123 456");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getAllByRole("button", { name: "ZÍSKAŤ E-KNIHU" })[0]);

    await waitFor(() =>
      expect(screen.getByText("Odkaz na stiahnutie sme poslali aj SMS na +421900123456.")).toBeInTheDocument()
    );
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ channel: "sms", phone: "+421 900 123 456" });
  });

  it("shows the server's error and keeps the form when the subscription fails", async () => {
    fetchMock.mockResolvedValueOnce(new Response(JSON.stringify({ error: "provider" }), { status: 502 }));
    renderPage();

    await user.type(screen.getByLabelText("E-mailová adresa"), "citatel@priklad.sk");
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getAllByRole("button", { name: "ZÍSKAŤ E-KNIHU" })[0]);

    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("Niečo sa pokazilo. Skúste to, prosím, o chvíľu znova.")
    );
    expect(screen.getByLabelText("E-mailová adresa")).toBeInTheDocument();
  });

  it("remembers a returning subscriber", () => {
    localStorage.setItem(
      BOOK_UNLOCK_STORAGE_KEY,
      JSON.stringify({ channel: "email", contact: "citatel@priklad.sk", delivered: true })
    );
    renderPage();
    expect(screen.getByText("Vaša kniha je pripravená")).toBeInTheDocument();
  });
});
