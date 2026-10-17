import { afterEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import { middleware } from "../middleware";

function page(url: string, headers?: Record<string, string>) {
  return middleware(new NextRequest(url, { headers }));
}

describe("geo cookie middleware", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("stores the platform country without changing the page", () => {
    const res = page("http://localhost:3000/en/get-involved", {
      "x-vercel-ip-country": "US",
    });
    expect(res.headers.get("location")).toBeNull();
    expect(res.cookies.get("geo_country")?.value).toBe("US");
  });

  it("stores ?country= outside production", () => {
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("VERCEL_ENV", "");
    const res = page("http://localhost:3000/en/get-involved?country=US");
    expect(res.cookies.get("geo_country")?.value).toBe("US");
  });

  it("lets the platform header win over ?country=", () => {
    const res = page("http://localhost:3000/de/mitmachen?country=US", {
      "x-vercel-ip-country": "DE",
    });
    expect(res.cookies.get("geo_country")?.value).toBe("DE");
  });

  it("clears the cookie when there is no geo, so local dev stays non-US", () => {
    const res = page("http://localhost:3000/en/get-involved");
    const cookie = res.cookies.get("geo_country");
    expect(cookie?.value ?? "").toBe("");
  });

  it("ignores ?country= in production", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("VERCEL_ENV", "production");
    const res = page("http://localhost:3000/en/get-involved?country=US");
    expect(res.cookies.get("geo_country")?.value ?? "").toBe("");
  });

  it("still stores the platform header in production", () => {
    vi.stubEnv("VERCEL_ENV", "production");
    const res = page("http://localhost:3000/en/get-involved?country=DE", {
      "x-vercel-ip-country": "US",
    });
    expect(res.cookies.get("geo_country")?.value).toBe("US");
  });
});
