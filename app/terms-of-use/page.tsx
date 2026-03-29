import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for the Christian Roma Mission website.",
  robots: { index: false },
};

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsOfUsePage() {
  return (
    <main className="min-h-full bg-[var(--bg-primary)]">
      <Navbar />

      <section className="px-5 md:px-[120px] py-16 md:py-[100px] max-w-[860px]">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-[3px] h-[14px] bg-[var(--gold)]" />
          <span className="text-[11px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
            Legal
          </span>
        </div>
        <h1 className="text-[32px] md:text-[44px] font-bold tracking-[-1px] text-[var(--text-primary)] mb-4 leading-[1.05]">
          Terms of Use
        </h1>
        <p className="text-[13px] text-[var(--text-muted)] mb-12">
          Last updated: January 2026
        </p>

        <div className="flex flex-col gap-10 text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.8]">
          <Section title="1. Acceptance of Terms">
            By accessing and using the Christian Roma Mission website
            (romamission.eu), you accept and agree to be bound by these Terms of
            Use. If you do not agree to these terms, please do not use our
            website.
          </Section>

          <Section title="2. Use of the Website">
            You may use this website for lawful purposes only. You agree not to:
            <ul className="mt-4 flex flex-col gap-2 list-none">
              {[
                "Use the site in any way that violates applicable laws or regulations",
                "Reproduce, duplicate, or copy content without permission",
                "Transmit any unsolicited or unauthorized advertising or promotional material",
                "Attempt to gain unauthorized access to any part of the website",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[var(--gold)] mt-1 flex-shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="3. Intellectual Property">
            All content on this website — including text, photographs, video,
            and graphics — is the property of Christian Roma Mission or its
            content suppliers and is protected by applicable intellectual
            property laws. You may share content for non-commercial, educational
            purposes with attribution.
          </Section>

          <Section title="4. Donations">
            Donations made through this website are voluntary contributions to
            Christian Roma Mission. All donations are non-refundable unless
            otherwise stated. We are committed to using donations in accordance
            with our stated mission and financial transparency reports.
          </Section>

          <Section title="5. Third-Party Links">
            Our website may contain links to third-party websites. These links
            are provided for convenience only. We have no control over the
            content of those sites and accept no responsibility for them.
          </Section>

          <Section title="6. Disclaimer of Warranties">
            This website is provided &ldquo;as is&rdquo; without any warranties,
            express or implied. We do not warrant that the website will be
            uninterrupted, error-free, or free of viruses or other harmful
            components.
          </Section>

          <Section title="7. Limitation of Liability">
            To the fullest extent permitted by law, Christian Roma Mission shall
            not be liable for any indirect, incidental, special, or
            consequential damages arising from your use of this website or our
            services.
          </Section>

          <Section title="8. Governing Law">
            These Terms of Use shall be governed by and construed in accordance
            with the laws of the Slovak Republic, without regard to its conflict
            of law provisions.
          </Section>

          <Section title="9. Changes to Terms">
            We reserve the right to modify these Terms of Use at any time.
            Changes will be posted on this page with an updated date. Continued
            use of the website after changes constitutes acceptance of the new
            terms.
          </Section>

          <Section title="10. Contact">
            For questions about these Terms of Use, please contact us at{" "}
            <a
              href="mailto:misia@krm.sk"
              className="text-[var(--gold)] hover:opacity-80 transition-opacity"
            >
              misia@krm.sk
            </a>
            .
          </Section>
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-[17px] md:text-[18px] font-semibold text-[var(--text-primary)]">
        {title}
      </h2>
      <div className="text-[var(--text-secondary)]">{children}</div>
    </div>
  );
}
