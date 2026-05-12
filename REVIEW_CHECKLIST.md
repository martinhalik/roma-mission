# Native-Speaker Review Checklist

All non-English dictionaries in this repository are **AI-generated initial drafts**. Before they ship to production they need a pass from a native speaker who understands the mission's tone.

## What to review

This is what a native reviewer should be checking, in priority order:

1. **Grammar & naturalness** — does the copy sound like how a real person in this language would write it, or like translated English? Reorder words, fix case endings, replace literal calques.
2. **Tone match — Orthodox Christian mission register.** The English source is reverent, sincere, dignified, never casual or marketing-y. Greetings, scripture references, words like *parish*, *liturgy*, *catechism*, *Eucharistic* should use the standard ecclesiastical terms in your language, not generic religious vocabulary.
3. **Community-preferred terminology.** Several locales have terminology debates around how to refer to Roma people. Examples:
   - **Russian:** the AI draft uses *«цыганская» / «цыгане»* (the historical Russian term). If your community prefers *«ромская» / «ромы»*, flag it.
   - **Serbian / Macedonian:** similar trade-off between Slavic *Цигани* family and the international *Роми* / *Ромски*.
   - **German:** *„Roma"* vs *„Sinti und Roma"* (Sinti is the established term for the German/Austrian Romani community).
   - **Czech / Slovak:** *Rómovia / Rómové* are the standard modern terms.
   Whatever the community prefers, please flag and we will update consistently across the file.
4. **Proper nouns intentionally NOT translated:**
   - Town/village names (Klenovec, Markovce, Kačanov, Mútnik, Rimavská Pila, Zemplínske Jastrabie, Hnúšťa, Hačava, Varadka, Cejkov, Kurov, Lukov, Petrová, Zbudská Belá) stay in original Slovak orthography across every locale.
   - The founder's name (Fr. Martin Halík / Martin Halík).
   - The mission name ("Roma Mission" / "Christian Roma Mission") — translate only if your language has a customary form.
   - First-person testimony quotes (`quoteSource` fields under `stories.testimonies.*`) are intentionally preserved verbatim in the original speaker's language. The translated paraphrase lives in the adjacent `quoteTranslation` field.
5. **Layout issues** — if a translated string is meaningfully longer than the English source (German is often +25–35%; Greek and Cyrillic scripts can crowd dense UI), please flag the file + key. Common culprits: button labels (`SUPPORT THE MISSION`, `PREVENT THIS → GIVE NOW`), navbar items (`MISSION`, `LOCATIONS`), stat-pill labels.

## Dictionary file inventory per locale

Each non-English locale has one dictionary file under `lib/i18n/dictionaries/<code>.ts`. The English source-of-truth is `lib/i18n/dictionaries/en.ts`.

The reviewer for each locale should diff their locale's file against `en.ts` and confirm every value is a faithful, naturally-phrased translation of the corresponding English entry — section by section.

### Sections to review (same shape in every locale)

| Namespace | What it covers |
|---|---|
| `nav` | Navbar items, mobile drawer labels, "SUPPORT THE MISSION" CTA, WhatsApp + menu aria-labels |
| `footer` | Column headings, link labels, tagline (multi-line), copyright, theme toggle |
| `share` | Share modal title/subtitle, copy/copied states, "Share via", network aria-labels |
| `home` | Hero, urgency, results, 5 pillars, Laco testimony quote (preserved + translated), mission-field intro, featured-media grid |
| `mission` | Hero, why-Roma reasons, founder narrative, what-we-do (planting/parish/children/centers), vision stats, country grid + legend, guiding principles, share nudge |
| `ourStory` | Year-by-year timeline (Before 2016 → Today), Czech pull-quote originals preserved as direct citation in non-Czech locales, Bible quote, documentary tease, CTAs |
| `stories` | Featured Laco testimony, stats, founder card, 5 testimonies (each with `quoteSource` preserved + `quoteTranslation`), anonymous vignette, closing CTAs |
| `locations` | Hero, stat pills, map intro, mission centers, planted parishes (per-id), active plants, ended-plant Hačava narrative, supported parishes intro/footnote |
| `media` | Page hero, items keyed by id (`documentary`, `int-1`, `int-2`, `testimony-laco`) with title/shortDesc/fullDesc/source/guest/badgeLabel; subtitle-availability badges |
| `getInvolved` | Hero, 4 way-to-help cards (`financial` / `volunteer` / `share` / `trip`), 4 FAQs |
| `thankYou` | Donation thank-you eyebrow, headline, intro, tax notice, 2 Corinthians 9:7 scripture, share section, share/X/WhatsApp/Facebook buttons, CTAs |
| `privacyPolicy` | **⚠️ LEGAL — also needs counsel review per jurisdiction.** GDPR rights wording, supervisory authority, governing law |
| `termsOfUse` | **⚠️ LEGAL — also needs counsel review.** Slovak Republic governing-law clause, "as is" disclaimer, limitation-of-liability |
| `cta` | Shared CTA section (donate / mission-trip / volunteer buttons) |
| `donation` | Donation modal (frequency toggle, presets, custom amount, impact lines, errors, CTA, bank-transfer copy, tax notice) |
| `application` | Volunteer / mission-trip booking modal (titles, descriptions, 3 steps, CTA, success state) |
| `video` | Video modal close affordance |
| `map` | MissionMap chrome (legend, density gradient label, marker labels, loading/unavailable states, popup CTAs, hover-tooltip interpolation) |
| `countries` | ISO-2-keyed country exonyms used by the country hover tooltip in MissionMap |

## Per-locale reviewer checklist

Reviewer for each locale, please tick through:

### 🇸🇰 Slovenčina — `sk.ts`

- [ ] Grammar and case endings (genitív / lokál) read naturally throughout
- [ ] Ecclesiastical terms match Slovak Greek-Catholic / Orthodox usage (farnosť, liturgia, katechéza, eucharistický)
- [ ] Preferred Roma terminology: *Rómovia / rómsky* — confirm
- [ ] Czech pull-quote originals (in `ourStory.pullQuoteOriginal`) are intentionally preserved in Czech; OK?
- [ ] No layout issues observed in browser at any breakpoint
- [ ] **Legal:** `privacyPolicy.*` + `termsOfUse.*` reviewed by Slovak counsel

### 🇨🇿 Čeština — `cs.ts`

- [ ] Grammar and case endings read naturally throughout
- [ ] Ecclesiastical terms match Czech Catholic / Orthodox usage (farnost, liturgie, katecheze)
- [ ] Preferred Roma terminology: *Romové / romský* — confirm
- [ ] In `ourStory.timeline.*.pullQuoteOriginal` the Czech is the source; the field is intentionally empty in `cs.ts` so the original isn't shown twice
- [ ] No layout issues observed
- [ ] **Legal:** `privacyPolicy.*` + `termsOfUse.*` reviewed by Czech counsel

### 🇷🇴 Română — `ro.ts`

- [ ] Diacritics (ș/ț/ă/â/î) present and correct throughout
- [ ] Ecclesiastical terms match Romanian Orthodox usage (parohie, liturghie, cateheză)
- [ ] Preferred Roma terminology: *romi / romă / rom* — confirm
- [ ] No layout issues observed
- [ ] **Legal:** `privacyPolicy.*` + `termsOfUse.*` reviewed by Romanian counsel

### 🇩🇪 Deutsch — `de.ts`

- [ ] Capitalization of nouns is consistent (German rule)
- [ ] Sie/du register is consistently formal (Sie) throughout — confirm donor-facing copy uses the formal address
- [ ] Ecclesiastical terms (Pfarrei, Liturgie, Katechese, Eucharistie) — confirm Roman Catholic / Orthodox usage is right for the audience
- [ ] Preferred Roma terminology: *Roma* vs *Sinti und Roma* — flag preference
- [ ] German strings often run +25–35% longer than English — check button labels and stat pills for overflow
- [ ] **Legal:** `privacyPolicy.*` + `termsOfUse.*` reviewed by German/Austrian counsel for DSGVO compliance

### 🇷🇸 Srpski (ćirilica) — `sr.ts`

- [ ] Cyrillic orthography correct throughout
- [ ] Ecclesiastical terms match Serbian Orthodox usage (парохија, литургија, катихеза, евхаристијски)
- [ ] Preferred Roma terminology: *Роми / ромски* (current) vs *Цигани* (older form) — confirm
- [ ] If a Latin (`sr-Latn`) variant is desired, please flag and we will duplicate the file
- [ ] No layout issues observed
- [ ] **Legal:** `privacyPolicy.*` + `termsOfUse.*` reviewed (Serbia is non-EU; national data-protection law applies)

### 🇷🇺 Русский — `ru.ts`

- [ ] Grammar (падежи / aspect) read naturally
- [ ] Ecclesiastical terms match Russian Orthodox usage (приход, литургия, катехизация, евхаристический)
- [ ] **Roma terminology decision — important:** the AI draft uses *«цыганская» / «цыгане»* (historical). If the community prefers *«ромская» / «ромы»*, flag and we'll update consistently across the file (~20 sites)
- [ ] No layout issues observed
- [ ] **Legal:** `privacyPolicy.*` + `termsOfUse.*` reviewed (Russia is non-EU; national data-protection law applies)

### 🇲🇰 Македонски — `mk.ts`

- [ ] Cyrillic orthography correct throughout
- [ ] Ecclesiastical terms match Macedonian Orthodox usage (парохија, литургија, катихеза)
- [ ] Preferred Roma terminology: *Роми / ромски* — confirm
- [ ] No layout issues observed
- [ ] **Legal:** `privacyPolicy.*` + `termsOfUse.*` reviewed (North Macedonia non-EU; national data-protection law applies)

### 🇬🇷 Ελληνικά — `el.ts`

- [ ] Accents (τόνοι) correct throughout
- [ ] Ecclesiastical terms match Greek Orthodox usage (ενορία, λειτουργία, κατήχηση, ευχαριστιακός)
- [ ] Preferred Roma terminology: *Ρομά* (mainstream) vs *Τσιγγάνοι* — confirm
- [ ] No layout issues observed
- [ ] **Legal:** `privacyPolicy.*` + `termsOfUse.*` reviewed by Greek counsel for GDPR compliance

## Audit findings (open items, recorded during the audit pass)

These are leftover untranslated strings found while auditing this branch. None blocks shipping today — flagging for triage:

### Trivial — fix in a follow-up dictionary PR

| File | Line(s) | What | Why deferred |
|---|---|---|---|
| `components/Navbar.tsx` | 72, 112 | `aria-label="Contact us on WhatsApp"` (desktop + mobile) | Adding to `nav.*` would touch the shared navbar barrel; deferred to keep this audit PR scoped to docs |
| `app/page.tsx` | 145, 146, 147 | 3 × `alt="Future"` decorative image alt | Should be added to `home.imageAlt.*` (the `mission.imageAlt` namespace is the precedent) |
| `app/page.tsx` | 195, 196, 197 | `alt="Roma population growing"`, `alt="Roma children transformed via education"`, `alt="Dignity returns"` | Same |
| `app/page.tsx` | 247 | `alt="Our approach"` | Same |
| `app/mission/page.tsx` | 117 | `{data.country}` renders English country name in the country-grid card header | Fix is `t(\`countries.${data.iso}\`)` once the `countries.*` namespace from PR #20 lands; the namespace + ISO data already exist |
| `components/DonationModal.tsx` | 275, 288, 331 | `${amt}`, `$` input prefix, `` `GIVE $${finalAmount}` `` | Swap to `formatCurrency(amt, locale)` once both PR #17 (DonationModal translation) and PR #21 (formatting helper) merge |
| `app/api/stripe/payment-intent/route.ts` | 10 | `"Invalid amount"` JSON error | Server-side error string, never rendered as user copy — low priority |

### Non-trivial — could justify a separate issue if/when revisited

- **SEO metadata (`<title>`, OpenGraph, Twitter card across `app/layout.tsx` and per-route `<route>/layout.tsx`):** intentionally English per the Path B decision in PR #22 / TRANSLATION_STATUS.md. Migrating to localized metadata requires the `app/[locale]/…` routing refactor.

### Dictionary completeness — TS-enforced ✅

- `Dictionary` is a strict interface; TypeScript will refuse to build if any locale omits a key, so no missing keys are possible at the type level.
- Spot-grep across all 8 non-English dictionaries for English fragments (` the `, ` and `, ` of `) returned only one match per file, and each hit was the intentionally-preserved English `quoteSource` from a first-person testimony (`stories.testimonies.*.quoteSource`). No accidental English leaks.

### Render check — not performed in this run

The original audit plan called for a manual browser pass through all 9 locales on every page. The audit agent ran headlessly and could not produce screenshots. The native reviewers above are the right point to capture any layout/overflow issues — `(German is often +25–35% longer; Greek and Cyrillic scripts can crowd dense UI)`.

## How to submit a review

1. Open the relevant `lib/i18n/dictionaries/<code>.ts` next to `en.ts`.
2. Make changes directly in the file — keys must stay the same; only edit the right-hand string values.
3. If terminology preference (e.g. *«цыганская»* → *«ромская»*) requires a global change, just flag it in your review and we'll apply it consistently across the file.
4. Open a PR titled `Native review: <locale name>` with the diff. We will not change the English source as part of a translation review — if you spot an issue with the English original, please raise it separately.
