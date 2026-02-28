import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPolicyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-[13px] text-[var(--text-muted)] mb-12">
          Last updated: January 2026
        </p>

        <div className="flex flex-col gap-10 text-[14px] md:text-[15px] text-[var(--text-secondary)] leading-[1.8]">
          <Section title="1. Introduction">
            Christian Roma Mission (&ldquo;we,&rdquo; &ldquo;our,&rdquo; or
            &ldquo;us&rdquo;) is committed to protecting your privacy. This
            Privacy Policy explains how we collect, use, disclose, and safeguard
            your information when you visit our website or make a donation.
          </Section>

          <Section title="2. Information We Collect">
            We may collect the following types of information:
            <ul className="mt-4 flex flex-col gap-2 list-none">
              {[
                "Personal identification information (name, email address, mailing address)",
                "Payment information processed securely through our payment providers",
                "Voluntary information you provide through contact forms or volunteer applications",
                "Technical data such as IP address, browser type, and pages visited",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[var(--gold)] mt-1 flex-shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="3. How We Use Your Information">
            We use the information we collect to:
            <ul className="mt-4 flex flex-col gap-2 list-none">
              {[
                "Process donations and send donation receipts",
                "Communicate with you about mission updates and reports",
                "Respond to your inquiries and volunteer applications",
                "Improve our website and services",
                "Comply with legal obligations",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="text-[var(--gold)] mt-1 flex-shrink-0">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </Section>

          <Section title="4. Data Sharing">
            We do not sell, trade, or rent your personal information to third
            parties. We may share your information with trusted service providers
            who assist us in operating our website and conducting our work,
            provided that those parties agree to keep this information
            confidential.
          </Section>

          <Section title="5. Data Retention">
            We retain your personal information for as long as necessary to
            fulfill the purposes for which it was collected, including legal,
            accounting, or reporting requirements.
          </Section>

          <Section title="6. Your Rights">
            Depending on your location, you may have the right to access,
            correct, or delete your personal data. To exercise these rights,
            contact us at{" "}
            <a
              href="mailto:privacy@romamission.eu"
              className="text-[var(--gold)] hover:opacity-80 transition-opacity"
            >
              privacy@romamission.eu
            </a>
            .
          </Section>

          <Section title="7. Cookies">
            Our website uses essential cookies to function properly. We do not
            use tracking or advertising cookies. You may disable cookies through
            your browser settings, though this may affect website functionality.
          </Section>

          <Section title="8. Security">
            We implement appropriate technical and organizational measures to
            protect your personal information against unauthorized access,
            alteration, disclosure, or destruction.
          </Section>

          <Section title="9. Changes to This Policy">
            We may update this Privacy Policy from time to time. We will notify
            you of significant changes by posting the new policy on this page
            with an updated date.
          </Section>

          <Section title="10. Contact Us">
            If you have questions about this Privacy Policy, please contact us
            at:{" "}
            <a
              href="mailto:privacy@romamission.eu"
              className="text-[var(--gold)] hover:opacity-80 transition-opacity"
            >
              privacy@romamission.eu
            </a>
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
