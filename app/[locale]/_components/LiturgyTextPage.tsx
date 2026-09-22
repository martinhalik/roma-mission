import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import type { Locale } from "@/lib/i18n";
import { buildPath } from "@/lib/i18n/routes";
import { LITURGY, chantPhrases, tokenizeLine } from "@/lib/liturgy/content";
import {
  jsonLdScriptProps,
  liturgyTextJsonLd,
} from "@/lib/liturgy/seo";
import type { LiturgyLine, Utterance } from "@/lib/liturgy/types";

/**
 * The full text of the Liturgy.
 *
 * Deliberately a server component with no hooks: the text is the point of the
 * page, so it must render and read with JavaScript disabled. The language
 * toggle is three radio inputs driven entirely by CSS (see `globals.css`),
 * and footnotes are native `<details>` — neither needs a client bundle.
 *
 * UI copy is English throughout; the liturgy itself is Romani and Slovak, each
 * line carrying its own `lang` attribute.
 */

const VIEWS = [
  { id: "liturgy-view-both", label: "Both", hint: "Romani with Slovak beneath" },
  { id: "liturgy-view-rom", label: "Romani", hint: "Romani only" },
  { id: "liturgy-view-sk", label: "Slovak", hint: "Slovak only" },
] as const;

/** Speaker label styling — the priest's part and the people's part must be
 *  distinguishable at a glance, as in a printed service book. */
const ROLE_LABEL: Record<Utterance["role"], string> = {
  priest: "text-[var(--gold)]",
  people: "text-[var(--text-primary)]",
  reader: "text-[var(--text-secondary)]",
};

function ChantText({ text }: { text: string }) {
  const phrases = chantPhrases(text);
  if (phrases.length <= 1) return <>{text.replace(/\*/g, "")}</>;
  return (
    <>
      {phrases.map((phrase, i) => (
        <span key={i}>
          {phrase}
          {i < phrases.length - 1 && (
            <span
              aria-hidden="true"
              className="mx-1.5 text-[var(--text-muted)] select-none"
            >
              *
            </span>
          )}
        </span>
      ))}
    </>
  );
}

function Note({ n, text }: { n: number; text: string }) {
  return (
    <details className="liturgy-note inline align-baseline">
      <summary
        className="inline cursor-pointer align-super text-[10px] font-medium text-[var(--gold)] hover:underline"
        aria-label={`Translator's note ${n}`}
      >
        {n}
      </summary>
      <span className="mt-1 mb-2 rounded border-l-2 border-[var(--gold)] bg-[var(--bg-elevated)] px-3 py-2 text-[13px] leading-relaxed text-[var(--text-secondary)]">
        <span className="mr-1.5 font-medium text-[var(--gold)]">{n}.</span>
        <span lang="sk">{text}</span>
      </span>
    </details>
  );
}

function Line({
  line,
  lang,
  className,
  labelClassName,
}: {
  line: LiturgyLine;
  lang: "rom" | "sk";
  className: string;
  labelClassName: string;
}) {
  const tokens = tokenizeLine(line);
  return (
    // `rom` is the macrolanguage code, as specified. `rmc` (Carpathian Romani)
    // would name this dialect exactly — change it here if you prefer it.
    <div className={className} lang={lang === "rom" ? "rom" : "sk"}>
      {line.label && (
        <span
          className={`mr-2 text-[11px] font-semibold tracking-[1.5px] uppercase ${labelClassName}`}
        >
          {line.label}
        </span>
      )}
      {tokens.map((token, i) =>
        token.type === "text" ? (
          <ChantText key={i} text={token.value} />
        ) : (
          <Note
            key={i}
            n={token.n}
            text={LITURGY.footnotes.find((f) => f.n === token.n)?.text ?? ""}
          />
        )
      )}
    </div>
  );
}

function UtteranceBlock({ utterance }: { utterance: Utterance }) {
  const isPeople = utterance.role === "people";
  const label = ROLE_LABEL[utterance.role];

  return (
    <div
      className={`liturgy-utterance py-2.5 ${
        utterance.quiet ? "opacity-70" : ""
      }`}
    >
      {utterance.variable && (
        <p className="mb-1 text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">
          Varies by parish
        </p>
      )}
      {utterance.quiet && (
        <p className="mb-1 text-[10px] tracking-[1px] text-[var(--text-muted)] uppercase">
          Said quietly
        </p>
      )}

      {/* Romani leads — it is the point of the book. Slovak follows as a cue
          line, indented and recessed so the eye can skip it when singing. */}
      {utterance.rom && (
        <Line
          line={utterance.rom}
          lang="rom"
          labelClassName={label}
          className={`liturgy-rom text-[17px] leading-[1.65] sm:text-[18px] ${
            isPeople
              ? "font-semibold text-[var(--text-primary)]"
              : "font-normal text-[var(--text-primary)]"
          }`}
        />
      )}
      {utterance.sk && (
        <Line
          line={utterance.sk}
          lang="sk"
          labelClassName="text-[var(--text-muted)]"
          className={`liturgy-sk mt-1 ml-3 border-l border-[var(--border-default)] pl-3 text-[14px] leading-[1.6] text-[var(--text-secondary)] ${
            isPeople ? "font-medium" : "font-normal"
          }`}
        />
      )}
    </div>
  );
}

export default function LiturgyTextPage({ locale }: { locale: Locale }) {
  const { meta, sections, footnotes } = LITURGY;

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <script
        {...jsonLdScriptProps(
          liturgyTextJsonLd(
            locale,
            `The full text of the Divine Liturgy of St John Chrysostom in Romani and Slovak, version ${meta.version}.`
          )
        )}
      />
      <Navbar activePage="liturgy" />

      <main className="mx-auto max-w-3xl px-5 pt-28 pb-24 sm:px-6">
        <header className="mb-8 border-b border-[var(--border-default)] pb-8">
          <Link
            href={buildPath(locale, "liturgy")}
            className="liturgy-noprint mb-4 inline-flex items-center gap-1.5 py-1 text-[13px] text-[var(--text-secondary)] transition-colors hover:text-[var(--gold)]"
          >
            <ArrowLeft className="size-3.5" aria-hidden="true" />
            About this translation
          </Link>
          <p className="mb-3 text-[11px] font-semibold tracking-[2px] text-[var(--gold)] uppercase">
            The Divine Liturgy in Romani
          </p>
          <h1
            className="font-georgia text-[28px] leading-tight text-[var(--text-primary)] sm:text-[36px]"
            lang="sk"
          >
            {meta.title.sk}
          </h1>
          <p className="mt-3 text-[14px] leading-relaxed text-[var(--text-secondary)]">
            Central-Slovak dialect of Romani, with the Slovak beneath each line.
            Version {meta.version} · {meta.counts.footnotes} translator&rsquo;s
            notes.
          </p>
        </header>

        {/* Contents. <details> keeps it out of the way on a phone and needs no JS. */}
        <details className="liturgy-noprint mb-8 rounded-lg border border-[var(--border-default)] bg-[var(--bg-card)]">
          <summary className="px-4 py-3 text-[13px] font-medium tracking-[1px] text-[var(--text-secondary)] uppercase">
            Contents
          </summary>
          <nav aria-label="Sections of the Liturgy" className="px-4 pb-4">
            <ul className="space-y-1.5">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.slug}`}
                    className={`block py-1.5 text-[15px] text-[var(--text-secondary)] hover:text-[var(--gold)] ${
                      section.level === 1 ? "font-semibold" : "ml-4"
                    }`}
                    lang="sk"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </details>

        {/*
          The radio inputs must precede `.liturgy-body` for the CSS sibling
          selectors to reach it, and "Both" is checked in the markup so the
          default view is correct before any stylesheet or script runs.
        */}
        <div className="liturgy-view">
          {/*
            The inputs are direct children of `.liturgy-view` so the CSS can
            reach `.liturgy-body` with a sibling combinator — nesting them in
            the toolbar would put them on a different branch of the tree, and
            `display: contents` does not change what a selector can match.
            Their labels live in the toolbar below and are wired up by `for`.
          */}
          {VIEWS.map((view) => (
            <input
              key={view.id}
              type="radio"
              name="liturgy-view"
              id={view.id}
              defaultChecked={view.id === "liturgy-view-both"}
            />
          ))}

          <div
            className="liturgy-noprint sticky top-16 z-10 -mx-5 mb-6 border-y border-[var(--border-default)] bg-[var(--bg-primary)]/95 px-5 py-3 backdrop-blur sm:-mx-6 sm:px-6"
            role="radiogroup"
            aria-label="Choose which languages to show"
          >
            <div className="flex items-center gap-2">
              <span className="mr-1 text-[11px] tracking-[1px] text-[var(--text-muted)] uppercase">
                Show
              </span>
              {VIEWS.map((view) => (
                <label
                  key={view.id}
                  htmlFor={view.id}
                  title={view.hint}
                  className="rounded-full border border-[var(--border-strong)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--gold)] hover:text-[var(--text-primary)]"
                >
                  {view.label}
                </label>
              ))}
            </div>
          </div>

          <div className="liturgy-body">
            {sections.map((section) => (
              <section
                key={section.id}
                id={section.slug}
                aria-labelledby={`${section.slug}-title`}
                className="scroll-mt-32"
              >
                {section.level === 1 ? (
                  <h2
                    id={`${section.slug}-title`}
                    lang="sk"
                    className="liturgy-section-title font-georgia mt-12 mb-5 border-b-2 border-[var(--gold)] pb-2 text-[24px] text-[var(--text-primary)] first:mt-0 sm:text-[28px]"
                  >
                    {section.title}
                  </h2>
                ) : (
                  <h3
                    id={`${section.slug}-title`}
                    lang="sk"
                    className="liturgy-section-title mt-10 mb-4 text-[13px] font-semibold tracking-[2px] text-[var(--gold)] uppercase"
                  >
                    {section.title}
                  </h3>
                )}

                <div className="divide-y divide-[var(--border-default)]/60">
                  {section.blocks.map((block) =>
                    block.kind === "rubric" ? (
                      <p
                        key={block.id}
                        lang="sk"
                        className={`py-3 text-center text-[13px] italic ${
                          block.tone === "direction"
                            ? "text-[var(--text-secondary)]"
                            : "text-[var(--text-muted)]"
                        }`}
                      >
                        {block.text}
                      </p>
                    ) : (
                      <UtteranceBlock key={block.id} utterance={block} />
                    )
                  )}
                </div>
              </section>
            ))}
          </div>
        </div>

        {/* Every note again at the end — the reference copy, and what prints. */}
        <section
          id="notes"
          aria-labelledby="notes-title"
          className="mt-16 border-t border-[var(--border-default)] pt-8"
        >
          <h2
            id="notes-title"
            className="mb-5 text-[13px] font-semibold tracking-[2px] text-[var(--gold)] uppercase"
          >
            Translator&rsquo;s notes
          </h2>
          <ol className="space-y-3">
            {footnotes.map((note) => (
              <li
                key={note.n}
                id={`fn-${note.n}`}
                className="flex gap-3 text-[13px] leading-relaxed text-[var(--text-secondary)]"
              >
                <span className="shrink-0 font-medium text-[var(--gold)]">
                  {note.n}.
                </span>
                <span lang="sk">{note.text}</span>
              </li>
            ))}
          </ol>
        </section>
      </main>

      <Footer />
    </div>
  );
}
