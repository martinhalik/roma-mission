import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thank You",
  description:
    "Your gift supports Orthodox missionaries living and working among the Roma. Thank you for investing in this work.",
  openGraph: {
    title: "Thank You — Roma Mission",
    description:
      "Your gift supports Orthodox missionaries living and working among the Roma. Thank you for investing in this work.",
    url: "https://romamission.eu/thank-you",
    images: [{ url: "/images/mission-about-us.jpg", width: 1200, height: 630, alt: "Christian Roma Mission" }],
  },
};

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ShareButton from "@/components/ShareButton";

const SHARE_URL = "https://romamission.eu";
const SHARE_TITLE = "Roma Mission";
const SHARE_TEXT =
  "I just gave to Roma Mission — Orthodox missionaries bringing the Church to Europe's most overlooked communities. Five million Roma, mostly unreached. Worth learning about:";

export default function ThankYouPage() {
  return (
    <main className="min-h-full bg-[var(--bg-primary)] flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-5 py-24">
        <div className="flex flex-col items-center text-center gap-8 max-w-[540px]">
          {/* Icon */}
          <div className="w-16 h-16 border border-[var(--gold)] flex items-center justify-center">
            <span className="font-georgia text-[28px] text-[var(--gold)]">✦</span>
          </div>

          {/* Headline */}
          <div className="flex flex-col gap-4">
            <p className="text-[10px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
              Donation Received
            </p>
            <h1 className="text-[36px] md:text-[48px] font-bold tracking-[-1px] text-[var(--text-primary)] leading-[1.05]">
              Thank You for<br />Your Gift
            </h1>
            <p className="text-[15px] md:text-[16px] text-[var(--text-secondary)] leading-[1.7]">
              Your generosity directly supports Orthodox mission work among Roma communities in Eastern Europe —
              funding parish life, children&apos;s programs, and the people doing this work on the ground.
            </p>
          </div>

          {/* Divider */}
          <div className="w-12 h-px bg-[var(--gold)] opacity-40" />

          {/* Scripture */}
          <p className="text-[14px] font-georgia italic text-[var(--text-muted)] leading-[1.8] max-w-[400px]">
            &ldquo;Each of you should give what you have decided in your heart to give,
            not reluctantly or under compulsion, for God loves a cheerful giver.&rdquo;
            <span className="block mt-2 not-italic text-[12px] tracking-[1px]">— 2 Corinthians 9:7</span>
          </p>

          {/* Divider */}
          <div className="w-12 h-px bg-[var(--gold)] opacity-40" />

          {/* Share section */}
          <div className="w-full flex flex-col gap-5 bg-[var(--bg-card)] border border-[var(--border-default)] p-6 md:p-8 text-left">
            <div className="flex flex-col gap-2">
              <p className="text-[10px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
                One More Thing
              </p>
              <h2 className="text-[18px] md:text-[20px] font-bold text-[var(--text-primary)]">
                Help Spread the Word
              </h2>
              <p className="text-[13px] text-[var(--text-secondary)] leading-[1.7]">
                Sharing this mission takes one tap and could reach someone whose support changes everything.
              </p>
            </div>

            {/* Share message preview */}
            <div className="bg-[var(--bg-elevated)] border border-[var(--border-default)] px-4 py-3 text-[12px] text-[var(--text-muted)] leading-[1.7] italic">
              &ldquo;{SHARE_TEXT}&rdquo;
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              <ShareButton
                title={SHARE_TITLE}
                text={SHARE_TEXT}
                url={SHARE_URL}
                label="SHARE THIS MISSION"
                className="flex-1 py-4 bg-[var(--gold)] text-[#111111] text-[12px] font-bold tracking-[1px] hover:opacity-90 transition-opacity text-center"
              />
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(SHARE_TEXT + " " + SHARE_URL)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-4 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-bold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors text-center"
              >
                POST ON X
              </a>
            </div>
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link
              href="/"
              className="px-8 py-4 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-bold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors text-center"
            >
              BACK TO HOME
            </Link>
            <Link
              href="/mission"
              className="px-8 py-4 border border-[var(--border-strong)] text-[var(--text-secondary)] text-[12px] font-bold tracking-[1px] hover:border-[var(--gold)] hover:text-[var(--gold)] transition-colors text-center"
            >
              LEARN ABOUT THE MISSION
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
