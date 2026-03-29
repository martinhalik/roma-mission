import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Get Involved",
  description:
    "Support the Roma Mission through financial giving, volunteering your skills, or prayer. Join the work of planting Orthodox parishes in Roma communities across Slovakia.",
  openGraph: {
    title: "Get Involved — Roma Mission",
    description:
      "Support the Roma Mission through financial giving, volunteering your skills, or prayer. Join the work of planting Orthodox parishes in Roma communities across Slovakia.",
    url: "https://romamission.eu/get-involved",
    images: [{ url: "/images/mission-about-us.jpg", width: 1200, height: 630, alt: "Get Involved — Roma Mission" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Get Involved — Roma Mission",
    description:
      "Support the Roma Mission through financial giving, volunteering your skills, or prayer. Join the work of planting Orthodox parishes in Roma communities across Slovakia.",
    images: ["/images/mission-about-us.jpg"],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
