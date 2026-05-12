import "@testing-library/jest-dom";
import { vi } from "vitest";

// Provide minimal next/navigation stubs so components that call useRouter /
// usePathname inside the LanguageProvider (used by LocaleLink and the
// language switcher) can render in isolation under jsdom.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/en",
  useParams: () => ({ locale: "en" }),
  useSearchParams: () => new URLSearchParams(),
  notFound: () => {
    throw new Error("notFound");
  },
  redirect: (url: string) => {
    throw new Error(`redirect: ${url}`);
  },
}));
