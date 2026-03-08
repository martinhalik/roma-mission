import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_URL ?? "https://romamission.org"
  ),
  title: "Christian Roma Mission",
  description:
    "Planting Orthodox parishes among the Roma people of Central and Eastern Europe.",
  openGraph: {
    title: "Christian Roma Mission",
    description:
      "Planting Orthodox parishes among the Roma people of Central and Eastern Europe.",
    url: process.env.NEXT_PUBLIC_URL ?? "https://romamission.org",
    siteName: "Christian Roma Mission",
    type: "website",
    images: [
      {
        url: "/images/mission-about-us.jpg",
        width: 1200,
        height: 630,
        alt: "Christian Roma Mission — serving Roma communities in Eastern Europe",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Christian Roma Mission",
    description:
      "Planting Orthodox parishes among the Roma people of Central and Eastern Europe.",
    images: ["/images/mission-about-us.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${spaceGrotesk.variable} font-primary h-full bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
