import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank God for Your Support",
  description:
    "Your gift supports Orthodox missionaries living and working among the Roma. Thank you for investing in this work.",
  openGraph: {
    title: "Thank God for Your Support — Roma Mission",
    description:
      "Your gift supports Orthodox missionaries living and working among the Roma. Thank you for investing in this work.",
    url: "https://romamission.eu/thank-you",
    images: [{ url: "/images/mission-about-us.jpg", width: 1200, height: 630, alt: "Christian Roma Mission" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
