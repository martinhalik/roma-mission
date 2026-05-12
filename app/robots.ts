import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_URL ?? "https://romamission.eu";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/*/thank-you", "/*/dakujeme", "/*/dekujeme", "/*/multumesc", "/*/danke", "/*/hvala", "/*/spasibo", "/*/blagodaram", "/*/efcharistoume"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
