import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import LanguageProvider from "@/components/LanguageProvider";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_URL ?? "https://romamission.eu"
  ),
  title: {
    default: "Christian Roma Mission",
    template: "%s — Roma Mission",
  },
  description:
    "10 million Roma across Europe. We live among them, plant churches that last, and disciple the next generation.",
  openGraph: {
    title: "Christian Roma Mission",
    description:
      "10 million Roma across Europe. We live among them, plant churches that last, and disciple the next generation.",
    url: process.env.NEXT_PUBLIC_URL ?? "https://romamission.eu",
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
      "10 million Roma across Europe — without scripture in their language or an Orthodox parish in their community. We live among them, plant churches that last, and disciple the next generation.",
    images: ["/images/mission-about-us.jpg"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme + sync <html lang> with saved locale — runs before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.add(t);var supported=['en','sk','cs','ro','de','sr','ru','mk','el'];var l=localStorage.getItem('locale');if(!l){var b=(navigator.language||'').slice(0,2).toLowerCase();if(supported.indexOf(b)!==-1)l=b;}if(l&&supported.indexOf(l)!==-1)document.documentElement.lang=l;})();`,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} font-primary h-full bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
      </body>
    </html>
  );
}
