import { describe, expect, it } from "vitest";
import {
  countryOverrideAllowed,
  normalizeCountry,
  resolveVisitorCountry,
} from "../../lib/geo";

describe("visitor country", () => {
  it("normalizes a two-letter country and rejects anything else", () => {
    expect(normalizeCountry("us")).toBe("US");
    expect(normalizeCountry(" DE ")).toBe("DE");
    expect(normalizeCountry("USA")).toBeNull();
    expect(normalizeCountry("")).toBeNull();
    expect(normalizeCountry(null)).toBeNull();
  });

  it("prefers the platform header over the test override", () => {
    expect(
      resolveVisitorCountry({
        headerCountry: "DE",
        queryCountry: "US",
        cookieCountry: "US",
        allowOverride: true,
      }),
    ).toBe("DE");
  });

  it("uses the query, then the cookie, outside production", () => {
    expect(
      resolveVisitorCountry({
        headerCountry: null,
        queryCountry: "US",
        cookieCountry: "DE",
        allowOverride: true,
      }),
    ).toBe("US");
    expect(
      resolveVisitorCountry({
        headerCountry: null,
        queryCountry: null,
        cookieCountry: "us",
        allowOverride: true,
      }),
    ).toBe("US");
  });

  it("ignores the query and cookie in production and treats a missing header as non-US", () => {
    expect(
      resolveVisitorCountry({
        headerCountry: null,
        queryCountry: "US",
        cookieCountry: "US",
        allowOverride: false,
      }),
    ).toBeNull();
    expect(countryOverrideAllowed({ NODE_ENV: "production", VERCEL_ENV: undefined })).toBe(false);
    expect(countryOverrideAllowed({ NODE_ENV: "test", VERCEL_ENV: "production" })).toBe(false);
    expect(countryOverrideAllowed({ NODE_ENV: "test", VERCEL_ENV: undefined })).toBe(true);
    expect(countryOverrideAllowed({ NODE_ENV: "development", VERCEL_ENV: "preview" })).toBe(true);
  });
});
