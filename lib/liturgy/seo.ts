import type { Locale } from "@/lib/i18n";
import { buildPath } from "@/lib/i18n/routes";
import { LITURGY } from "./content";

/**
 * Structured data and FAQ content for the liturgy pages.
 *
 * The point of the markup here is attribution: this translation is a piece of
 * scholarship by a named person, and anything that quotes it — a search result,
 * an assistant answering a question about Romani liturgy — should be able to
 * say who made it, when, in which dialect, and under what terms. That means
 * naming the author, the consultant, the publisher and the thesis it rests on
 * in machine-readable form, not only in prose.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_URL ?? "https://romamission.eu";

export const TRANSLATOR = "Martin Halík";
export const CONSULTANT = "Ján Hero";
export const PUBLISHER_NAME = "Christian Roma Mission";
export const PUBLISHER_NAME_SK = "Kresťanská rómska misia";
export const CONTACT_EMAIL = "martin.halik@krm.sk";

export const THESIS = {
  title:
    "Liturgia sv. Jána Zlatoústeho a možnosti jej prekladu do stredoslovenského dialektu rómčiny",
  year: "2024",
  institution: "Pravoslávna bohoslovecká fakulta, Prešovská univerzita v Prešove",
  institutionShort: "PBF PU, Prešov",
  type: "Rigorózna práca",
} as const;

/** Citation forms offered on the page and copied into the structured data. */
export const CITATIONS = [
  {
    key: "apa",
    label: "APA",
    text: `Halík, M. (${THESIS.year}). ${THESIS.title}. ${THESIS.type}, ${THESIS.institutionShort}.`,
  },
  {
    key: "chicago",
    label: "Chicago",
    text: `Halík, Martin. \u201C${THESIS.title}.\u201D ${THESIS.type}, ${THESIS.institution}, ${THESIS.year}.`,
  },
  {
    key: "translation",
    label: "The translation itself",
    text: `Halík, M., trans. (${LITURGY.meta.sourceDate.slice(0, 4)}). Svätá liturgia sv. Jána Zlatoústeho — Romani (Central-Slovak dialect), v${LITURGY.meta.version}. ${PUBLISHER_NAME_SK}. ${SITE_URL}/en/liturgy`,
  },
  {
    key: "bibtex",
    label: "BibTeX",
    // `@mastersthesis` is the conventional container for a non-doctoral thesis;
    // `type` overrides the printed label, which is what carries "Rigorózna práca".
    text: `@mastersthesis{halik${THESIS.year}liturgia,
  author      = {Hal\\'ik, Martin},
  title       = {${THESIS.title}},
  school      = {${THESIS.institution}},
  type        = {${THESIS.type}},
  year        = {${THESIS.year}},
  langid      = {slovak}
}`,
  },
] as const;

export interface Faq {
  q: string;
  a: string;
}

/**
 * Written to be answerable in one paragraph each — these are the questions
 * supporters, parish clergy and researchers actually ask, and the form a
 * search engine or assistant can quote directly.
 */
export const FAQS: Faq[] = [
  {
    q: "What is this translation?",
    a: `The Divine Liturgy of St John Chrysostom — the principal Eucharistic service of the Orthodox Church — translated into the Central-Slovak dialect of Romani by ${TRANSLATOR}, with ${CONSULTANT} as linguistic consultant, and published by ${PUBLISHER_NAME_SK} (${PUBLISHER_NAME}). So far as we know it is the first translation of the full Divine Liturgy into this dialect. It is served with the blessing of the local Orthodox bishop in the Roma communities of Markovce and Klenovec in Slovakia.`,
  },
  {
    q: "Which dialect of Romani is it in?",
    a: "Carpathian Romani (ISO 639-3: rmc), specifically the Central-Slovak dialect spoken around Klenovec and the Gemer region. Romani is not one language but a family of dialects, conventionally grouped into five: Vlax, Balkan, Central, Northwestern and Northeastern. Carpathian Romani belongs to the Central group. This is deliberately not the eastern Slovak Romani of the 2014 New Testament, because eastern forms are not the everyday speech of these villages.",
  },
  {
    q: "How is it different from the Romani Bible translations that already exist?",
    a: "Those are Scripture; this is a service book. A New Testament in eastern Slovak Romani appeared in 2014 and a complete Bible in Carpathian Romani in 2021, both from The Word for the World. Neither contains the Divine Liturgy, and neither is Orthodox. This translation supplies the text a Roma congregation actually sings during the service, in the Byzantine rite, in their own dialect.",
  },
  {
    q: "Can our parish use it?",
    a: `Yes. The text is published free to read online, and as an A5 print-ready PDF and an EPUB, so a parish can print and bind copies. It is a working version and corrections are genuinely wanted — write to ${CONTACT_EMAIL}. If you serve in a Romani-speaking community and want to use it liturgically, please also speak with your own bishop, as this translation is served with the blessing of ours.`,
  },
  {
    q: "Is the translation finished?",
    a: `No, and that is the point. Version ${LITURGY.meta.version} carries ${LITURGY.meta.counts.footnotes} translator's notes recording choices still open — where Serbian or Romanian Romani says something different, where the older people of Klenovec use a word the young no longer know. It is corrected line by line by the people who sing it.`,
  },
  {
    q: "How should I cite it?",
    a: `For the scholarship behind the translation, cite the rigorózna práca: Halík, M. (${THESIS.year}). ${THESIS.title}. ${THESIS.type}, ${THESIS.institutionShort}. For the liturgical text itself, cite the translation and its version number.`,
  },
  {
    q: "How can I support this work?",
    a: `The mission needs three things for this text: money to print and bind service books for the parishes, Romani speakers willing to read the draft and correct it, and singers to record the responses so that people who do not read can still learn the parts. ${PUBLISHER_NAME} is a registered Slovak mission working in Roma communities; donations go to the parishes where this Liturgy is sung.`,
  },
];

/**
 * schema.org `@graph` for the liturgy index. Follows the shape already used by
 * the heritage page so both feed one consistent site graph.
 */
export function liturgyJsonLd(locale: Locale, title: string, description: string) {
  const url = `${SITE_URL}${buildPath(locale, "liturgy")}`;
  const textUrl = `${SITE_URL}${buildPath(locale, "liturgyText")}`;

  const publisher = {
    "@type": "Organization",
    "@id": `${SITE_URL}/#organization`,
    name: PUBLISHER_NAME,
    alternateName: PUBLISHER_NAME_SK,
    url: SITE_URL,
    logo: { "@type": "ImageObject", url: `${SITE_URL}/logo.png` },
  };

  const author = {
    "@type": "Person",
    "@id": `${SITE_URL}/#martin-halik`,
    name: TRANSLATOR,
    affiliation: { "@type": "Organization", name: PUBLISHER_NAME },
    email: CONTACT_EMAIL,
  };

  const thesis = {
    "@type": "Thesis",
    "@id": `${url}#thesis`,
    name: THESIS.title,
    inSupportOf: THESIS.type,
    author,
    datePublished: THESIS.year,
    inLanguage: "sk",
    publisher: { "@type": "CollegeOrUniversity", name: THESIS.institution },
    about: [
      { "@type": "Thing", name: "Romani language" },
      { "@type": "Thing", name: "Liturgical translation" },
      { "@type": "Thing", name: "Divine Liturgy of St John Chrysostom" },
    ],
  };

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["Book", "CreativeWork"],
        "@id": `${url}#translation`,
        name: LITURGY.meta.title.sk,
        alternateName: "The Divine Liturgy of St John Chrysostom in Romani",
        description,
        /*
         * `rmc` is the precise code for Carpathian Romani; `rom` is the
         * macrolanguage. Both are listed so a consumer matching on either
         * finds it, alongside the Slovak of the facing lines.
         */
        inLanguage: ["rmc", "rom", "sk"],
        author,
        contributor: { "@type": "Person", name: CONSULTANT },
        translator: author,
        publisher,
        datePublished: THESIS.year,
        dateModified: LITURGY.meta.generatedAt,
        version: LITURGY.meta.version,
        isBasedOn: { "@id": `${url}#thesis` },
        url,
        workExample: { "@type": "WebPage", "@id": textUrl, url: textUrl },
        genre: "Liturgy",
        learningResourceType: "Service book",
        about: [
          { "@type": "Thing", name: "Romani language" },
          { "@type": "Thing", name: "Carpathian Romani" },
          { "@type": "Thing", name: "Eastern Orthodox Church" },
          { "@type": "Thing", name: "Divine Liturgy of St John Chrysostom" },
          { "@type": "Thing", name: "Roma people" },
        ],
        keywords: [
          "Romani liturgy",
          "Divine Liturgy in Romani",
          "Carpathian Romani",
          "Central-Slovak Romani dialect",
          "rmc",
          "Orthodox Roma",
          "St John Chrysostom",
          "Romani translation",
          "Martin Halík",
          "Kresťanská rómska misia",
          "Roma mission Slovakia",
        ].join(", "),
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        isPartOf: { "@type": "WebSite", "@id": `${SITE_URL}/#website` },
      },
      thesis,
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        url: SITE_URL,
        name: PUBLISHER_NAME,
        inLanguage: locale,
        publisher,
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${url}#breadcrumbs`,
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Home",
            item: `${SITE_URL}/${locale}`,
          },
          { "@type": "ListItem", position: 2, name: title, item: url },
        ],
      },
    ],
  };
}

/** schema.org for /liturgy/text — the text itself, pointing back at the work. */
export function liturgyTextJsonLd(locale: Locale, description: string) {
  const url = `${SITE_URL}${buildPath(locale, "liturgyText")}`;
  const parent = `${SITE_URL}${buildPath(locale, "liturgy")}`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": ["CreativeWork", "WebPage"],
        "@id": `${url}#text`,
        name: LITURGY.meta.title.sk,
        description,
        inLanguage: ["rmc", "rom", "sk"],
        author: { "@id": `${SITE_URL}/#martin-halik` },
        translator: { "@type": "Person", name: TRANSLATOR },
        publisher: { "@id": `${SITE_URL}/#organization` },
        version: LITURGY.meta.version,
        dateModified: LITURGY.meta.generatedAt,
        isPartOf: { "@id": `${parent}#translation` },
        url,
      },
    ],
  };
}

/** Renders a `@graph` object as a JSON-LD script tag. */
export function jsonLdScriptProps(data: unknown) {
  return {
    type: "application/ld+json",
    dangerouslySetInnerHTML: { __html: JSON.stringify(data) },
  } as const;
}
