import {
  BookOpen,
  Download,
  ExternalLink,
  Languages,
  PencilLine,
  Printer,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import CTASection from "@/components/CTASection";
import { DICTIONARIES, type Locale } from "@/lib/i18n";
import ChildrensBibleDownloads from "./ChildrensBibleDownloads";

/**
 * /children-bible: the printable Children's Bible, its worksheets and the
 * animated lessons. A server component; only the downloads list, which reads
 * the live manifest, runs in the browser.
 */

const LESSONS_URL = "https://detska-biblia-hodiny.vercel.app/";
const CONTACT_EMAIL = "martin.halik@krm.sk";

interface ChildrensBiblePageProps {
  locale: Locale;
}

/** The site-wide section label as a real <h2>, as on the liturgy page. */
function SectionLabel({ children }: { children: string }) {
  return (
    <h2 className="mb-5 flex items-center gap-3">
      <span className="h-[14px] w-[3px] shrink-0 bg-[var(--gold)]" />
      <span className="text-[11px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
        {children}
      </span>
    </h2>
  );
}

function SectionTitle({ children }: { children: string }) {
  return (
    <h3 className="font-georgia mb-6 text-[26px] leading-tight text-[var(--text-primary)] sm:text-[32px]">
      {children}
    </h3>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-georgia text-[34px] leading-none text-[var(--gold)]">
        {value}
      </p>
      <p className="mt-2 text-[14px] leading-snug text-[var(--text-secondary)]">
        {label}
      </p>
    </div>
  );
}

/** Puts the contact address, as a mail link, where `{email}` stands in the copy. */
function WithEmail({ text }: { text: string }) {
  const [before, after = ""] = text.split("{email}");
  return (
    <>
      {before}
      <a
        href={`mailto:${CONTACT_EMAIL}`}
        className="text-[var(--gold)] underline-offset-2 hover:underline"
      >
        {CONTACT_EMAIL}
      </a>
      {after}
    </>
  );
}

const primaryButton =
  "inline-flex min-h-[44px] items-center gap-2 rounded-full bg-[var(--gold)] px-6 py-3 text-[14px] font-semibold tracking-[1px] text-[var(--on-accent)] uppercase transition-opacity hover:opacity-90";
const secondaryButton =
  "inline-flex min-h-[44px] items-center gap-2 rounded-full border border-[var(--border-strong)] px-6 py-3 text-[14px] font-semibold tracking-[1px] text-[var(--text-secondary)] uppercase transition-colors hover:border-[var(--gold)] hover:text-[var(--gold)]";

export default function ChildrensBiblePage({ locale }: ChildrensBiblePageProps) {
  const copy = DICTIONARIES[locale].childrensBible;
  const stats = [
    { value: "55", label: copy.inside.statStories },
    { value: "220", label: copy.inside.statBiblePages },
    { value: "110", label: copy.inside.statSheetPages },
    { value: "9", label: copy.inside.statLanguages },
  ];
  const contents = [
    { icon: BookOpen, title: copy.inside.storyTitle, body: copy.inside.storyBody },
    { icon: PencilLine, title: copy.inside.sheetTitle, body: copy.inside.sheetBody },
  ];
  const printing = [
    { title: copy.print.sheetsTitle, body: copy.print.sheetsBody },
    { title: copy.print.bookletsTitle, body: copy.print.bookletsBody },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar activePage="childrens-bible" />

      <main>
        {/* Hero */}
        <section className="border-b border-[var(--border-default)] px-5 pt-32 pb-16 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <h1 className="font-georgia text-[40px] leading-[1.1] text-[var(--text-primary)] sm:text-[56px]">
              {copy.hero.title}
            </h1>
            <p className="font-georgia mt-4 text-[21px] leading-snug text-[var(--gold)] sm:text-[26px]">
              {copy.hero.subtitle}
            </p>
            <p className="mt-6 text-[17px] leading-relaxed text-[var(--text-secondary)] sm:text-[19px]">
              {copy.hero.lead}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <a href="#print" className={primaryButton}>
                <Download className="size-4" aria-hidden="true" />
                {copy.hero.ctaPrint}
              </a>
              <a href={LESSONS_URL} className={secondaryButton}>
                <ExternalLink className="size-4" aria-hidden="true" />
                {copy.hero.ctaLessons}
              </a>
            </div>
          </div>
        </section>

        {/* What is inside */}
        <section className="px-5 py-16 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <SectionLabel>{copy.inside.label}</SectionLabel>
            <SectionTitle>{copy.inside.title}</SectionTitle>
            <dl className="grid gap-8 sm:grid-cols-2">
              {contents.map((item) => (
                <div key={item.title}>
                  <dt className="mb-2 flex items-center gap-2 text-[17px] font-medium text-[var(--text-primary)]">
                    <item.icon className="size-5 shrink-0 text-[var(--gold)]" aria-hidden="true" />
                    {item.title}
                  </dt>
                  <dd className="text-[16px] leading-relaxed text-[var(--text-secondary)]">
                    {item.body}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-8 flex gap-3 text-[16px] leading-relaxed text-[var(--text-secondary)]">
              <Printer className="mt-1 size-5 shrink-0 text-[var(--gold)]" aria-hidden="true" />
              <span>{copy.inside.printNote}</span>
            </p>

            <div className="mt-10 grid grid-cols-2 gap-8 border-t border-[var(--border-default)] pt-8 sm:grid-cols-4">
              {stats.map((stat) => (
                <Stat key={stat.value} value={stat.value} label={stat.label} />
              ))}
            </div>
          </div>
        </section>

        {/* Animated lessons */}
        <section className="border-t border-[var(--border-default)] px-5 py-16 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <SectionLabel>{copy.lessons.label}</SectionLabel>
            <SectionTitle>{copy.lessons.title}</SectionTitle>
            <p className="text-[16px] leading-relaxed text-[var(--text-secondary)]">
              {copy.lessons.body}
            </p>
            <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--border-strong)] px-4 py-2 text-[14px] text-[var(--text-secondary)]">
              <Languages className="size-4 shrink-0 text-[var(--gold)]" aria-hidden="true" />
              {copy.lessons.slovakOnly}
            </p>
            <img
              src="/images/childrens-bible.jpg"
              alt={copy.lessons.imageAlt}
              width={1280}
              height={720}
              loading="lazy"
              className="mt-8 h-auto w-full rounded-lg border border-[var(--border-default)]"
            />
            <div className="mt-8">
              <a href={LESSONS_URL} className={primaryButton}>
                <ExternalLink className="size-4" aria-hidden="true" />
                {copy.lessons.cta}
              </a>
            </div>
          </div>
        </section>

        {/* Downloads */}
        <section
          id="print"
          className="scroll-mt-24 border-t border-[var(--border-default)] px-5 py-16 sm:px-6"
        >
          <div className="mx-auto max-w-3xl">
            <SectionLabel>{copy.downloads.label}</SectionLabel>
            <SectionTitle>{copy.downloads.title}</SectionTitle>
            <ChildrensBibleDownloads />
          </div>
        </section>

        {/* How to print */}
        <section className="border-t border-[var(--border-default)] px-5 py-16 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <SectionLabel>{copy.print.label}</SectionLabel>
            <SectionTitle>{copy.print.title}</SectionTitle>
            <dl className="divide-y divide-[var(--border-default)]">
              {printing.map((item) => (
                <div key={item.title} className="py-5 first:pt-0">
                  <dt className="mb-2 text-[17px] font-medium text-[var(--text-primary)]">
                    {item.title}
                  </dt>
                  <dd className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
                    {item.body}
                  </dd>
                </div>
              ))}
              <div className="py-5">
                <dt className="mb-2 text-[17px] font-medium text-[var(--text-primary)]">
                  {copy.print.freeTitle}
                </dt>
                <dd className="text-[15px] leading-relaxed text-[var(--text-secondary)]">
                  <WithEmail text={copy.print.freeBody} />
                </dd>
              </div>
            </dl>
          </div>
        </section>
      </main>

      <CTASection />
      <Footer />
    </div>
  );
}
