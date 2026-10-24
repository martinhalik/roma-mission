import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import LanguageProvider from "@/components/LanguageProvider";
import ChildrensBibleDownloads from "@/app/[locale]/_components/ChildrensBibleDownloads";
import type { Locale } from "@/lib/i18n";

const BLOB = "https://kp65dxq6zoqzaiwk.public.blob.vercel-storage.com";

/** Same shape as the live manifest.json, cut down to two stories. */
const MANIFEST = {
  lessons: "https://detska-biblia-hodiny.vercel.app",
  languages: {
    sk: {
      jezis: {
        bible: { url: `${BLOB}/sk/jezis/detska-biblia.pdf`, mb: 127.1 },
        worksheets: { url: `${BLOB}/sk/jezis/pracovne-listy.pdf`, mb: 85.8 },
        stories: {
          "2": {
            title: "Zvestovanie narodenia dieťaťa",
            story: { url: `${BLOB}/sk/jezis/pribehy/02.pdf`, mb: 3.5 },
            sheet: { url: `${BLOB}/sk/jezis/listy/02.pdf`, mb: 5 },
          },
          "1": {
            title: "Dúfať a modliť sa",
            story: { url: `${BLOB}/sk/jezis/pribehy/01.pdf`, mb: 4.6 },
            sheet: { url: "javascript:alert(1)", mb: 6 },
          },
        },
        booklets: {},
      },
      isus: {
        bible: { url: `${BLOB}/sk/isus/detska-biblia.pdf`, mb: 127.2 },
        worksheets: { url: `${BLOB}/sk/isus/pracovne-listy.pdf`, mb: 85.7 },
        stories: {
          "1": {
            title: "Dúfať a modliť sa",
            story: { url: `${BLOB}/sk/isus/pribehy/01.pdf`, mb: 4.6 },
          },
        },
        booklets: {
          "01-10": {
            booklet: { url: `${BLOB}/sk/isus/brozury/01-10-pribehy.pdf`, mb: 28.2 },
            cover: { url: `${BLOB}/sk/isus/brozury/01-10-obalka.pdf`, mb: 6.8 },
          },
        },
      },
    },
  },
};

const WITH_CZECH = {
  ...MANIFEST,
  languages: {
    ...MANIFEST.languages,
    cs: {
      one: {
        bible: { url: `${BLOB}/cs/one/detska-bible.pdf`, mb: 120 },
        stories: {
          "1": { title: "", story: { url: `${BLOB}/cs/one/pribehy/01.pdf`, mb: 4.4 } },
        },
        booklets: {},
      },
    },
  },
};

function serve(body: unknown) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({ ok: true, json: async () => body }),
  );
}

function renderAt(locale: Locale) {
  return render(
    <LanguageProvider locale={locale}>
      <ChildrensBibleDownloads />
    </LanguageProvider>,
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("ChildrensBibleDownloads", () => {
  it("offers the Slovak editions on a page whose language is not translated yet", async () => {
    serve(MANIFEST);
    renderAt("en");

    expect(
      await screen.findByText(/The English translation is being prepared/),
    ).toBeInTheDocument();

    const bible = screen.getByRole("link", { name: /The whole Children's Bible/ });
    expect(bible).toHaveAttribute("href", `${BLOB}/sk/jezis/detska-biblia.pdf`);
    expect(bible).toHaveAttribute("download");
    expect(bible).toHaveTextContent("PDF · A4 · 220 pages · 127.1 MB");
    expect(
      screen.getByRole("link", { name: /All the worksheets/ }),
    ).toHaveTextContent("85.8 MB");
    expect(
      screen.getByText("There are no A5 booklets in this edition yet."),
    ).toBeInTheDocument();
  });

  it("switches edition, and with it every link and the booklets", async () => {
    serve(MANIFEST);
    renderAt("en");
    const user = userEvent.setup();

    const isus = await screen.findByRole("button", { name: "Isus Christos edition" });
    expect(isus).toHaveAttribute("aria-pressed", "false");
    await user.click(isus);

    expect(isus).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("link", { name: /The whole Children's Bible/ }),
    ).toHaveAttribute("href", `${BLOB}/sk/isus/detska-biblia.pdf`);
    expect(screen.getByRole("link", { name: /^Stories 1–10/ })).toHaveAttribute(
      "href",
      `${BLOB}/sk/isus/brozury/01-10-pribehy.pdf`,
    );
    expect(
      screen.getByRole("link", { name: /^Cover for stories 1–10/ }),
    ).toHaveAttribute("href", `${BLOB}/sk/isus/brozury/01-10-obalka.pdf`);
  });

  it("lists every story in order with its story and worksheet links", async () => {
    serve(MANIFEST);
    renderAt("en");

    const summary = await screen.findByText("Each story and worksheet on its own (2)");
    const list = within(summary.closest("details") as HTMLElement).getByRole("list");
    const rows = within(list).getAllByRole("listitem");

    expect(rows[0]).toHaveTextContent("1.");
    expect(rows[0]).toHaveTextContent("Dúfať a modliť sa");
    expect(within(rows[0]).getByRole("link", { name: /Story · 4.6 MB/ })).toHaveAttribute(
      "href",
      `${BLOB}/sk/jezis/pribehy/01.pdf`,
    );
    // A link that is not https never reaches the page.
    expect(within(rows[0]).queryByRole("link", { name: /Worksheet/ })).toBeNull();

    expect(rows[1]).toHaveTextContent("Zvestovanie narodenia dieťaťa");
    expect(
      within(rows[1]).getByRole("link", { name: /Worksheet · 5.0 MB/ }),
    ).toHaveAttribute("href", `${BLOB}/sk/jezis/listy/02.pdf`);
  });

  it("shows the page's own language first and falls back to the Slovak title", async () => {
    serve(WITH_CZECH);
    renderAt("cs");

    const czech = await screen.findByRole("button", { name: "Čeština" });
    expect(czech).toHaveAttribute("aria-pressed", "true");
    expect(screen.queryByText(/Česká verze se překládá/)).toBeNull();
    expect(
      screen.getByRole("link", { name: /Celá Dětská Bible/ }),
    ).toHaveAttribute("href", `${BLOB}/cs/one/detska-bible.pdf`);
    expect(screen.getByRole("link", { name: /Celá Dětská Bible/ })).toHaveTextContent(
      "120,0 MB",
    );

    const summary = screen.getByText("Příběhy a listy jednotlivě (1)");
    const row = within(summary.closest("details") as HTMLElement).getByRole("listitem");
    expect(row).toHaveTextContent("Dúfať a modliť sa");

    await userEvent.setup().click(screen.getByRole("button", { name: "Slovenčina" }));
    expect(
      screen.getByRole("link", { name: /Celá Dětská Bible/ }),
    ).toHaveAttribute("href", `${BLOB}/sk/jezis/detska-biblia.pdf`);
  });

  it("says so in the page's language when the list cannot be loaded", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    renderAt("sr");

    expect(
      await screen.findByText(
        "Списак датотека није могао да се учита. Покушајте поново за тренутак.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByRole("link")).toBeNull();
  });
});
