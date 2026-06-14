# Mission materials (downloads)

Files placed in this folder are served at `/materials/<filename>` and linked
from the **Resources** page (`/<locale>/resources`).

## How to publish a file

1. Drop the file in this folder using one of the names below.
2. Open `lib/resources-data.ts` and set the matching download's `url`
   (e.g. `url: "/materials/divine-liturgy-sk.pdf"`). Optionally add a `size`.
3. The Resources page automatically swaps the "Coming soon" pill for a
   Download button.

Until a `url` is set, the item shows a tasteful "Coming soon" state — never a
broken link — so files can be added one at a time.

## Expected files

Divine Liturgy of St. John Chrysostom (print-ready PDF):

- `divine-liturgy-sk.pdf` — Slovak
- `divine-liturgy-ro.pdf` — Romanian
- `divine-liturgy-sr.pdf` — Serbian

Fr. Martin's book (e-book + print):

- `founder-book-sk.epub` / `founder-book-sk.pdf` — Slovak
- `founder-book-en.epub` / `founder-book-en.pdf` — English

Teaching & children (print-ready PDF):

- `catechesis-worksheets-sk.pdf`
- `childrens-bible-sk.pdf`

## Not hosted here

The Gospel of Mark in Romani is other translators' work — the Resources page
links out to it rather than hosting a file. Update `externalUrl` on that item
in `lib/resources-data.ts` if you have a more precise source than the current
Romani Bible translations overview.

To add a language or format, extend the `downloads` array for an item (or add a
new item) in `lib/resources-data.ts`.
