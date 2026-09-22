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
| `public/ebook/` | Generated EPUB / PDF / cover files (committed) |
| `lib/data/book-files.json` | Generated manifest (file sizes); only languages listed here appear on the page |

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

Needs `zip` and Chromium/Chrome (auto-detected; override with `CHROME_PATH`).
PDFs use Liberation Serif/Sans (Latin, Cyrillic and Greek). Rebuilds are
byte-stable for EPUBs when the text has not changed.

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
