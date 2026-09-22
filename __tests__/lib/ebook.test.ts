import { describe, it, expect } from "vitest";
import {
  BOOK_LOCALES,
  defaultBookLocale,
  formatFileSize,
  getBookFiles,
  isValidEmail,
  normalizePhone,
} from "../../lib/ebook";

describe("normalizePhone", () => {
  it.each([
    ["+421 900 123 456", "+421900123456"],
    ["00421-900-123-456", "+421900123456"],
    ["(+49) 151 2345678", "+491512345678"],
    ["+7 900 123-45-67", "+79001234567"],
  ])("normalizes %s", (input, expected) => {
    expect(normalizePhone(input)).toBe(expected);
  });

  it.each(["0900 123 456", "+0 123 456 789", "+421 12", "phone", ""])("rejects %s", (input) => {
    expect(normalizePhone(input)).toBeNull();
  });
});

describe("isValidEmail", () => {
  it("accepts ordinary addresses", () => {
    expect(isValidEmail("martin@krm.sk")).toBe(true);
    expect(isValidEmail(" reader.name+books@example.co.uk ")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isValidEmail("martin@krm")).toBe(false);
    expect(isValidEmail("martin krm.sk")).toBe(false);
    expect(isValidEmail("@krm.sk")).toBe(false);
  });
});

describe("book editions", () => {
  it("ships the Slovak original", () => {
    expect(BOOK_LOCALES).toContain("sk");
  });

  it("has an EPUB, PDF and cover for every listed language", () => {
    for (const locale of BOOK_LOCALES) {
      const files = getBookFiles(locale);
      expect(files?.epub.file).toMatch(new RegExp(`^/ebook/.+-${locale}\\.epub$`));
      expect(files?.pdf.file).toMatch(new RegExp(`^/ebook/.+-${locale}\\.pdf$`));
      expect(files?.cover).toBe(`/ebook/cover-${locale}.png`);
      expect(files?.epub.bytes).toBeGreaterThan(0);
    }
  });

  it("defaults to the site language when that edition exists", () => {
    expect(defaultBookLocale("sk")).toBe("sk");
  });

  it("formats file sizes in the reader's locale", () => {
    expect(formatFileSize(1536 * 1024, "en")).toBe("1.5 MB");
    expect(formatFileSize(1536 * 1024, "sk")).toBe("1,5 MB");
    expect(formatFileSize(150 * 1024, "en")).toBe("150 KB");
  });
});
