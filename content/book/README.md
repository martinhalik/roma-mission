# Ebook: *Pravoslávna misia medzi Rómami na strednom Slovensku*

Fr. Martin Halík's book (Prešov 2023, ISBN 978-80-555-3079-6), published on the
site as a free ebook in every site language in exchange for an email or SMS
subscription. Page: `/<locale>/book` (localized slugs: `/sk/kniha`,
`/de/buch`, `/ro/carte`, …).

## Files

| Path | What |
|---|---|
| `content/book/sk.md` | Slovak original — the master text |
| `content/book/<locale>.md` | Translations (same structure as `sk.md`) |
| `content/book/FORMAT.md` | Markdown subset the build understands |
| `content/book/book.json` | Titles, subtitles and front-matter labels per language |
| `scripts/build-ebooks.mjs` | Builds EPUB 3 + PDF + cover for each language |
| `scripts/check-book-translation.mjs` | Checks a translation has the same headings, footnotes, quotes, lists and tables as `sk.md` |
| `content/book/images/` | Photos from the print edition (`images/<locale>/` overrides a file for one language) |
| `content/book/cover/` | Cover photo and cross from the print cover |
| `content/book/fonts/` | P052 (Palatino clone, PDF only), Literata and Playfair Display (OFL, embedded in EPUBs) with licences |
| `scripts/build-audiobook.py` | English audiobook (Kokoro TTS) → chaptered M4B + MP3 |
| `public/ebook/` | Generated EPUB / PDF / cover files and `audio/` (committed) |
| `lib/data/book-files.json` | Generated manifest (file sizes); only languages listed here appear on the page |
| `lib/data/audiobook-en.json` | Generated audiobook chapter list and sizes (`null` hides the audiobook) |

## Formats

- **EPUB 3** (validated with EPUBCheck 5): Apple Books (iPhone, iPad, Mac),
  Kindle via *Send to Kindle* (Amazon converts EPUB automatically; MOBI is no
  longer accepted), Google Play Books, Kobo, Tolino, PocketBook. Footnotes are
  pop-up notes; includes an EPUB 2 `toc.ncx` for older readers.
- **PDF** (A5, bookmarks, page numbers, clickable contents): computers,
  printing, anything else.

## Rebuilding

```bash
node scripts/check-book-translation.mjs      # all translations vs sk.md
node scripts/build-ebooks.mjs                # every language (or: … sk en)
```

Needs `zip`, Chromium/Chrome (auto-detected; override with `CHROME_PATH`) and
the dev dependencies (`npm install`): the PDF is laid out by Paged.js
(footnotes at the foot of the page, running footers, paged contents) and
printed by puppeteer-core. `KEEP_BUILD_TMP=1` keeps the intermediate HTML.

The styling follows the 2023 print edition: Palatino body (P052 in the PDF;
the reader's Palatino in EPUBs — Apple devices and Kindle have it), coral
`#F1614D` quotations and part openers, full-page Playfair Display pull quotes
on cream, grey subheads and captions, and the original cover photo with the
title set per language (`coverLines` in `book.json`). Le Monde Livre and
Palatino are commercial fonts and are not redistributed.

## Audiobook (English)

```bash
python3 scripts/build-audiobook.py          # setup instructions in the file header
```

Local neural TTS (Kokoro, voice `am_michael`), about 2 h 15 min, 32 chapters:
M4B with chapters and cover (Apple Books, audiobook apps) and MP3 with ID3
chapters (any player). Footnote markers, tables, URLs and the bibliography
list are not read; Slovak names are respelled for pronunciation
(`PRONUNCIATION` in the script). The opening credits state that the narration
is computer-generated. Rebuild it whenever `en.md` changes.

## Editing the text

Edit `sk.md`, then apply the same change to every translation and rebuild.
The checker catches structural drift (a missing paragraph, footnote, heading…).

## Subscription (Brevo)

`POST /api/ebook/subscribe` stores the contact in Brevo and sends the links:

| Env var | Required | Purpose |
|---|---|---|
| `BREVO_API_KEY` | yes | API key (Brevo → SMTP & API → API keys) |
| `BREVO_LIST_ID` | recommended | Numeric id of the contact list subscribers are added to |
| `BREVO_SENDER_EMAIL` | for email | Verified sender address, e.g. `kniha@romamission.eu` |
| `BREVO_SMS_SENDER` | no | SMS sender name, ≤ 11 letters/digits (default `RomaMission`) |

Without `BREVO_API_KEY` the form shows a generic error and nothing is stored.
SMS needs SMS credits in the Brevo account. The download files themselves are
public URLs (a "soft gate"): the page reveals them after subscribing and
remembers the visitor in `localStorage`.
