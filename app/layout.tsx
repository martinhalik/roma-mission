import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Christian Roma Mission",
  description:
    "Planting Orthodox parishes among the Roma people of Central and Eastern Europe.",
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
