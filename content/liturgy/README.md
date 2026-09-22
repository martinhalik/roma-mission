# Liturgy in Romani — content pipeline

The Divine Liturgy of St John Chrysostom in the Central-Slovak dialect of
Romani. One source document feeds the website, the print edition and the
e-book, so all three can never drift apart.

```
content/liturgy/source/spevnik-v1.1.docx      ← the only thing you edit
            │
            │  npm run liturgy:convert
            ▼
content/liturgy/liturgy.json                  ← generated, committed
content/liturgy/TODO-liturgy.md               ← generated, committed
            │
            ├─→ /liturgy and /liturgy/text            (lib/liturgy/content.ts)
            └─→ npm run book ─→ public/downloads/liturgy/
                                   spevnik-v1.1-a5.pdf
                                   spevnik-v1.1.epub
                                   spevnik-v1.1.docx
                               content/liturgy/downloads.json  ← what exists
```

## When a new version of the songbook arrives

1. Replace `content/liturgy/source/spevnik-v1.1.docx`. If the version number
   changes, update `VERSION`, `SOURCE_DATE` and the output filenames in
   `scripts/liturgy/convert-docx.ts` and `scripts/liturgy/build-book.ts`, and
   the hrefs in `app/[locale]/_components/LiturgyPage.tsx`.
2. `npm run book` — reconverts and rebuilds both editions.
3. Read `content/liturgy/TODO-liturgy.md`. It is rewritten on every run and
   lists everything the converter could not place with confidence: Slovak
   typos, section titles recovered from formatting, lines missing a
   counterpart, unreferenced footnotes.
4. Commit the regenerated JSON, TODO, `downloads.json` and the files themselves.

`downloads.json` is the manifest the website reads to decide which download
rows to render. It is written from whatever is actually in
`public/downloads/liturgy/` at the end of the build, so **dropping the thesis
PDF in there and re-running `npm run book` is all it takes** to turn the
citation on /liturgy into a real download. The site never checks the
filesystem at request time — Next.js traces imports rather than runtime reads,
so on a serverless deployment `public/` may not sit next to the running
function, and every download would quietly disappear.

## Commands

| Command | What it does |
|---|---|
| `npm run liturgy:convert` | docx → `liturgy.json` + `TODO-liturgy.md` |
| `npm run book` | convert, then build the A5 PDF and the EPUB |
| `npm run book -- --mono` | additionally write a single-colour PDF |
| `npm test` | includes checks that the manifest matches what is on disk, that no footnote reference dangles, that the cognates cited on /liturgy really occur in the text, and that `/liturgy/text` resolves under `/liturgy` in every locale |

`npm run book` needs headless Chromium. It looks in `/opt/pw-browsers/chromium`
(the dev container and CI) and otherwise falls back to whatever installation
`playwright-core` finds; set `CHROMIUM_PATH` to point it elsewhere.

## How the source document is read

The docx carries its structure in formatting rather than in Word styles, so the
converter's rules — all of them in `classify()` — are these:

| In the document | Means |
|---|---|
| `Heading1` | book title (goes to `meta.title`, not a section) |
| `Heading2` / `Heading3` | a part / a section |
| Small italics, short, no full stop | a section title never promoted to a heading |
| `Heading4` paragraph style | the line is **Romani** |
| no paragraph style | the line is **Slovak** |
| `Kňaz:` `Rašaj:` `Ľud:` `Roma:` `Čtec:` | speaker label |
| red italic (`cc0000`) | a rubric — an instruction about the service |
| grey (`999999`), opening with `*` | optional petitions may be added here |
| grey on a speaker line | a commemoration that varies by parish |
| small italics on a speaker line | said quietly by the priest |

`Čtec` is the one speaker whose label is identical in both languages, which is
why the paragraph style rather than the label decides the language.

Word comments are ignored, as agreed. Footnotes are kept, renumbered to their
display order, and stored as `[[fn:N]]` markers at the exact position they
occupy in the line.

## What the converter will not do

- **It does not change Romani.** Text is copied verbatim, including the `*`
  chant marks that divide sung phrases.
- **It does not fix Slovak typos.** They are reported in `TODO-liturgy.md` for
  correction in the source document.
- **It does not invent anything.** There is no Romani title in the source, so
  `meta.title.rom` is `null` and the cover falls back to Slovak rather than
  carrying invented liturgical Romani.

## Checking a conversion

The conversion is verifiable by round-trip: strip whitespace from the source
document's text and from the JSON, and the two should differ only by what the
converter deliberately moves or drops (the H1 title, zero-width spaces, the
leading `*` on optional rubrics, `(potichu)`, heading colons). For v1.1 that is
45 characters out of 39,703, each one accounted for.
