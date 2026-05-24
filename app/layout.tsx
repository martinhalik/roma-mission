import type { Metadata } from "next";
import { headers } from "next/headers";
import { Space_Grotesk } from "next/font/google";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import LanguageProvider from "@/components/LanguageProvider";
import { DEFAULT_LOCALE, isLocale } from "@/lib/i18n";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const CLARITY_PROJECT_ID =
  process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID ?? "wv1xd8wkj4";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_URL ?? "https://romamission.eu"
  ),
  title: {
    default: "Christian Roma Mission",
    template: "%s",
  },
  description:
    "10 million Roma across Europe. We live among them, plant churches that last, and disciple the next generation.",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const h = await headers();
  const headerLocale = h.get("x-roma-locale");
  const lang = isLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;

  return (
    <html lang={lang} className="h-full" suppressHydrationWarning>
      <head>
        {/* Prevent flash of wrong theme — runs before paint */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: light)').matches?'light':'dark';}document.documentElement.classList.add(t);})();`,
          }}
        />
      </head>
      <body
        className={`${spaceGrotesk.variable} font-primary h-full bg-[var(--bg-primary)] text-[var(--text-primary)] antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
        <Analytics />
        <Script id="ms-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","${CLARITY_PROJECT_ID}");`}
        </Script>
      </body>
    </html>
  );
}
