# Translation & Subtitle Status

Tracks progress of multilingual support added in branch `claude/add-language-translations-CBJDR`.

## Supported Locales

| Code | Flag | Language | Status (UI chrome) |
|------|------|----------|--------------------|
| `en` | 🇬🇧 | English (default) | ✅ complete (source language) |
| `sk` | 🇸🇰 | Slovak / Slovenčina | ✅ Navbar + Footer + ShareModal + Home + Our Story + Stories + Locations + Get Involved + Media + Thank-You + CTASection — needs native review |
| `cs` | 🇨🇿 | Czech / Čeština | ✅ Navbar + Footer + ShareModal + Home + Our Story + Stories + Locations + Get Involved + Media + Thank-You + CTASection — needs native review |
| `ro` | 🇷🇴 | Romanian / Română | ✅ Navbar + Footer + ShareModal + Home + Our Story + Stories + Locations + Get Involved + Media + Thank-You + CTASection — needs native review |
| `de` | 🇩🇪 | German / Deutsch | ✅ Navbar + Footer + ShareModal + Home + Our Story + Stories + Locations + Get Involved + Media + Thank-You + CTASection — needs native review |
| `sr` | 🇷🇸 | Serbian / Srpski (Cyrillic) | ✅ Navbar + Footer + ShareModal + Home + Our Story + Stories + Locations + Get Involved + Media + Thank-You + CTASection — needs native review |
| `ru` | 🇷🇺 | Russian / Русский | ✅ Navbar + Footer + ShareModal + Home + Our Story + Stories + Locations + Get Involved + Media + Thank-You + CTASection — needs native review |
| `mk` | 🇲🇰 | Macedonian / Македонски | ✅ Navbar + Footer + ShareModal + Home + Our Story + Stories + Locations + Get Involved + Media + Thank-You + CTASection — needs native review |
| `el` | 🇬🇷 | Greek / Ελληνικά | ✅ Navbar + Footer + ShareModal + Home + Our Story + Stories + Locations + Get Involved + Media + Thank-You + CTASection — needs native review |

> **Note:** Initial translations are AI-generated from English. Each locale should be reviewed by a native speaker before going to production. Russian uses the term "цыганская" historically; if a community-preferred term (e.g. "ромская") is desired, update `ru.ts`. Serbian is in Cyrillic — a Latin variant (`sr-Latn`) can be added by duplicating `sr.ts`.

> **⚠️ LEGAL CONTENT — TRANSLATIONS REQUIRE LEGAL REVIEW.** The `privacyPolicy.*` and `termsOfUse.*` namespaces are AI-generated and carry liability if relied upon. **Before publishing in any locale, the translation MUST be reviewed by counsel familiar with the relevant jurisdiction** (GDPR for EU member states — SK, CS, RO, DE, EL; national data-protection law for non-EU jurisdictions — SR, RU, MK; UK GDPR for English readers in the UK). Do not assume parity with the English source: certain rights wording (e.g., right to erasure, right to object, supervisory authority, limitation-of-liability formulations, governing-law clauses, consumer-protection carve-outs) varies by jurisdiction. The `termsOfUse.governingLaw` clause specifies Slovak law for all locales; counsel should confirm enforceability against consumers domiciled in other jurisdictions (in the EU, mandatory consumer-protection rules of the consumer's habitual residence typically override a choice-of-law clause). English remains the authoritative reference until legal review is complete.

## Architecture

- **Locale registry:** `lib/i18n/locales.ts`
- **Type-safe dictionary shape:** `lib/i18n/types.ts`
- **Per-locale dictionaries:** `lib/i18n/dictionaries/{en,sk,cs,ro,de,sr,ru,mk,el}.ts`
- **Aggregator:** `lib/i18n/index.ts`
- **Provider + hook:** `components/LanguageProvider.tsx` (exports `useTranslation`)
- **Flag dropdown UI:** `components/LanguageSwitcher.tsx`
- **Mounted in:** `app/layout.tsx` wraps all routes
- **Persistence:** `localStorage["locale"]`, falls back to `navigator.language`, then English
- **Fallback chain:** `t(key)` → current locale → English → key string

## What Is Translated ✅

These already pull strings via `t()` and render correctly in all 9 languages:

- `components/Navbar.tsx` — desktop + mobile nav + drawer (MISSION/LOCATIONS/MEDIA/STORIES, SHARE, CONTACT, SUPPORT THE MISSION, language switcher labels)
- `components/Footer.tsx` — column headings, link labels, tagline, copyright, privacy/terms, theme toggle, language switcher
- `components/ShareModal.tsx` — title, subtitle, copy/copied states, "Share via", aria-labels
- `components/LanguageSwitcher.tsx` — its own aria-labels
- `app/page.tsx` — Home: hero, urgency, results, 5 pillars, testimony, mission map intro, featured media (`home.*` namespace)
- `app/mission/page.tsx` — Mission: hero, why-roma reasons, founder story, what-we-do (planting/parish/children/centers), vision stats, country grid labels & legend, guiding principles, share nudge (`mission.*` namespace)
- `app/our-story/page.tsx` — Founder story: hero, year-by-year timeline (Before 2016 → Today), pull quotes, Bible quote, documentary tease, CTAs (`ourStory.*` namespace). Czech-language pull-quote originals are preserved verbatim across non-Czech locales as direct citation; in `cs.ts` the `pullQuoteOriginal` field is intentionally empty to avoid duplication.
- `app/stories/page.tsx` — Hero, featured Laco testimony, stats, founder card, 5 testimonies, anonymous vignette, closing CTAs (`stories.*` namespace). Direct first-person quotes use `quoteSource` (preserved in original language across all locales) + `quoteTranslation` (per-locale).
- `app/locations/page.tsx` — Locations: hero, stat pills, map intro, mission centers (subtitle/region/description/badge/programs), planted churches (name/note/status), active plants, ended plant (Hačava) narrative, supported parishes intro & footnote (`locations.*` namespace). `components/MissionMap.tsx` popup also reads `locations.map.<id>.{subtitle,description}` for the 9 ids that have unique copy.
- `app/thank-you/page.tsx` — Donation thank-you: eyebrow, headline, intro, tax notice (Slovakia non-profit / US not tax-deductible), 2 Corinthians 9:7 scripture, share section copy, share/X/WhatsApp/Facebook buttons, BACK TO HOME / LEARN ABOUT THE MISSION CTAs (`thankYou.*` namespace). Metadata moved to a new `app/thank-you/layout.tsx`; the page is now a `"use client"` component so it can read `useTranslation()`. SEO metadata kept in English (consistent with current static-locale approach).

## What Still Needs Translation ⚠️

The following pages and components still contain hardcoded English strings. **Each is a self-contained translation chunk**, suitable for a follow-up agent run.

### High-priority (long-form copy)

| File | LOC | Notes |
|------|-----|-------|
| `app/page.tsx` | 500 | ✅ Translated into all 9 locales (`home.*` namespace) |
| `app/mission/page.tsx` | 680 | ✅ Translated into all 9 locales (`mission.*` namespace) |
| `app/our-story/page.tsx` | 420 | ✅ Translated into all 9 locales (`ourStory.*` namespace) |
| `app/locations/page.tsx` | 572 | ✅ Translated into all 9 locales (`locations.*` namespace). Strategy (b): per-location text moved into the dictionary keyed by id (`locations.map.<id>`, `locations.centers.<id>`, `locations.planted.<id>`, `locations.activePlants.<id>`, `locations.endedPlant`). Town/village proper names (Klenovec, Markovce, Kačanov, Mútnik, Rimavská Pila, Zemplínske Jastrabie, Hnúšťa, Hačava, Varadka …) stay in original Slovak orthography across all languages. Translatable `subtitle`/`description`/`status` fields removed from `lib/data/mission-locations.ts`; `components/MissionMap.tsx` now resolves them via `t("locations.map.<id>.…")`. |
| `app/stories/page.tsx` | 428 | ✅ Translated into all 9 locales (`stories.*` namespace). First-person quotes preserved in source language (`quoteSource`) with optional per-locale translation (`quoteTranslation`). |
| `app/get-involved/page.tsx` | 246 | ✅ Translated into all 9 locales (`getInvolved.*` namespace) — hero, 4 way-to-help cards (financial / volunteer / share / trip), and 4 FAQs. Donation amounts (`$25/mo`, `$50/mo`, `$100/mo`) kept numeric in USD across all locales; localized only the surrounding copy. The `DonationModal`, `ApplicationModal`, and `CTASection` that this page mounts are still hardcoded English — separate translation chunks. |
| `app/media/page.tsx` | 309 | ✅ Translated into all 9 locales (`media.*` namespace). Strategy (b): per-item video metadata (`title`, `shortDesc`, `fullDesc`, `source`, `guest`, badge `label`) moved into the dictionary keyed by id (`media.items.documentary`, `media.items.int-1`, `media.items.int-2`, `media.items.testimony-laco`); structural fields (`videoId`, `tag`, `duration`, `badgeVariant`, `hasGuest`) remain on the data object in `lib/media-data.ts`. Subtitle/audio badge labels are translated to describe the video itself in each language (e.g. SK: "EN titulky" / "Slovenský zvuk" / "Anglický zvuk"). Home page (`app/page.tsx`) featured-media grid was updated to read titles/descs from the same dictionary keys. |
| `app/thank-you/page.tsx` | 151 | ✅ Translated into all 9 locales (`thankYou.*` namespace) |
| `app/privacy-policy/page.tsx` | 152 | ⚠️ **AI-translated into all 9 locales (`privacyPolicy.*` namespace) — TRANSLATIONS REQUIRE LEGAL REVIEW BY COUNSEL FAMILIAR WITH EACH JURISDICTION BEFORE RELYING ON THEM.** Metadata moved into `app/privacy-policy/layout.tsx`; the page is now a `"use client"` component reading `useTranslation()`. Email link (`privacy@romamission.eu`) preserved across all locales. GDPR terminology localized to official forms (DE: „Datenschutz-Grundverordnung (DSGVO)“; RO: „Regulamentul general privind protecția datelor (GDPR)“; SK/CS: „všeobecné nariadenie/obecné nařízení o ochraně osobných/osobních údajů (GDPR)“; SR/RU/MK/EL: GDPR retained as international acronym alongside localized name). |
| `app/terms-of-use/page.tsx` | 137 | ⚠️ **AI-translated into all 9 locales (`termsOfUse.*` namespace) — TRANSLATIONS REQUIRE LEGAL REVIEW BY COUNSEL FAMILIAR WITH EACH JURISDICTION BEFORE RELYING ON THEM.** Metadata moved into `app/terms-of-use/layout.tsx`; the page is now a `"use client"` component reading `useTranslation()`. Contact email (`misia@krm.sk`) preserved across all locales. Slovak Republic governing-law clause preserved verbatim across locales — counsel should confirm enforceability against consumers domiciled elsewhere. Curly quotes around “as is” / „tak, jak je“ / „so wie besehen“ rendered in each language's conventional quotation marks. |

### Components with hardcoded text

| File | Strings | Notes |
|------|---------|-------|
| `components/CTASection.tsx` | ✅ Translated into all 9 locales (`cta.*` namespace) — title, subtitle, support/mission-trip/volunteer buttons. Component is now `"use client"`. |
| `components/DonationModal.tsx` | ✅ Translated into all 9 locales (`donation.*` namespace) — modal eyebrow/title, monthly/one-time toggle, custom-amount placeholder, 4 impact lines, error + preparing states, "GIVE ${amount}/MO" / "GIVE ${amount}" / "GIVE $—" CTA, bank-transfer toggle + US/INTL tabs, 8 bank-field labels, tax notice. `$` and numeric amounts kept inline; locale-aware currency formatting deferred to PR 6. Bank field values (account names, numbers, addresses) are not translatable. |
| `components/ApplicationModal.tsx` | ✅ Translated into all 9 locales (`application.*` namespace). The modal is a calendar-booking flow (not a form) shared by volunteer + trip variants: eyebrow, close aria-label, per-variant title/subtitle/description, "WHAT HAPPENS NEXT" heading + 3 steps, "SCHEDULE A CALL" CTA, helper caption, success-state title/body/CLOSE. No form fields or validation errors exist in this component. `__tests__/components/ApplicationModal.test.tsx` wraps each render in `<LanguageProvider>` so the English-text assertions continue to pass. |
| `components/VideoModal.tsx` | ✅ Translated into all 9 locales (`video.close` key). Note: the component's CLOSE affordance is visible text (not an aria-label) — the dictionary value preserves the ✕ glyph. The YouTube iframe's own UI language (`?hl=en`) and the `title="Documentary"` attribute remain English; YouTube localizes its own player chrome based on the viewer's account language. |
| `components/MissionMap.tsx` | ✅ Translated into all 9 locales (`map.*` namespace) — legend heading, "Roma density" gradient label, 5 marker labels (Mission Center / Active Parish / Collaborating Parish / Planting Parish / Discontinued), loading + unavailable states, popup close aria-label, "Roma · {pop} of {total}" hover interpolation, "SUPPORT THIS PARISH →" / "PREVENT THIS → GIVE NOW" CTAs. Country names now use a separate `countries.*` namespace keyed by ISO-2 — 33 entries covering every country in `lib/data/roma-countries.ts`, translated to the localized exonym (e.g. SK → Slovensko / Slovakia / Slowakei / Словачка / Σλοβακία). Town/village proper names in MissionMap continue to render in original Slovak orthography. |
| `components/SectionLabel.tsx` | None — pure presentation |
| `components/LangBadge.tsx` | Labels come from `lib/media-data.ts` (see below) |

### Data files

| File | Notes |
|------|-------|
| `lib/media-data.ts` | ✅ Translatable fields (`title`, `shortDesc`, `fullDesc`, `source`, `guest`, badge `label`) moved to dictionary (`media.items.<id>`). Structural fields (`id`, `tag`, `videoId`, `duration`, `badgeVariant`, `hasGuest`) remain on the data object. |
| `lib/data/mission-locations.ts` | ✅ Translatable `subtitle`/`description`/`status` moved to dictionary (`locations.map.<id>`); proper-noun `name`/`village` remain on the data object |
| `lib/data/roma-countries.ts` | ✅ Country names now translated via the `countries.<ISO>` namespace consumed by `components/MissionMap.tsx`. The original English `country` field stays on the data object (used as fallback and for the unchanged mission-page country grid — see below). |

### Layout / metadata

- `app/layout.tsx` — `metadata.title`, `metadata.description`, OpenGraph, Twitter card. Localizing SEO metadata in App Router requires the `generateMetadata` async API + per-locale routing, which the current static-locale-toggle approach does not provide. **Recommendation:** keep English metadata for now; revisit if/when migrating to subpath routing (`/sk/...`).

## Videos / Subtitles Needed 🎥

YouTube IDs come from `lib/media-data.ts`. Subtitle work happens on YouTube directly (Studio → Subtitles → upload `.vtt`/`.srt`).

| Item | YouTube ID | Spoken Audio | Subtitles available today | Subtitles needed |
|------|------------|--------------|---------------------------|------------------|
| Documentary — *From IT to Priesthood* | `K-IDNefOa98` | Czech (Czech Television production) | English (per current `EN Subtitles` badge) | **sk, cs (verify), ro, de, sr, ru, mk, el** |
| Interview — *Why the Roma? Why Now?* | `A3-IfJL_vt4` | Slovak | None confirmed | **en, cs, ro, de, sr, ru, mk, el** |
| Interview — *Long-Term Presence Over Programs* | `7tdFd08wUis` | Slovak | None confirmed | **en, cs, ro, de, sr, ru, mk, el** |
| Testimony — *Laco's Story* | `PNhKEQtCrVo` | English (per `English Audio` badge) | None confirmed | **sk, cs, ro, de, sr, ru, mk, el** |
| Hero video (homepage) | local file `public/images/hero-home-optimized.mp4` | No spoken word (B-roll) | N/A — muted autoplay | None — no narration. Confirm there is no on-screen text that needs localized burn-in. |

### Subtitle deliverables checklist

- [ ] Provide source-language transcript (.txt) for each interview (Slovak) and testimony (English)
- [ ] Provide source-language transcript for documentary (Czech) — likely already exists with Czech TV
- [ ] Translate transcripts into all 8 target languages
- [ ] Time-code each translation as a `.vtt` file (use Aegisub, Subtitle Edit, or YouTube's auto-align)
- [ ] Upload to YouTube → set CC track per language → publish
- [ ] Update badges in `lib/media-data.ts` to advertise newly available subtitle languages
- [ ] Consider dubbed audio tracks via YouTube's multi-language audio feature (longer-term)

## Other Localization Gaps

- **WhatsApp number:** `+421 951 230 015` is hardcoded in Navbar + Footer. Slovak number works internationally; consider regional alternatives only if the donor base in a given country prefers a local channel.
- **Email:** `martin@romamission.eu` — no localization needed.
- **Director name:** "Fr. Martin Halík" — kept consistent across locales.
- **Date / number formats:** No date or numeric formatting code exists yet; if added (e.g. donation amounts, event dates), use `Intl.NumberFormat` / `Intl.DateTimeFormat` keyed off `useTranslation().locale`.
- **Currency:** Donations are in USD via Stripe. If localized currency is desired (EUR for SK/CZ/DE/RO/EL, RSD for SR, RUB for RU, MKD for MK), this requires Stripe price multi-currency setup and a pricing copy update.
- **RTL:** None of the supported locales are RTL. No bidi work needed.

## How to Add a New String

1. Add the key to `Dictionary` interface in `lib/i18n/types.ts`.
2. Add the English source value in `lib/i18n/dictionaries/en.ts`.
3. Add translations to all 8 other dictionaries (or rely on English fallback temporarily — TypeScript will fail the build until each dictionary is complete).
4. Use it in a client component: `const { t } = useTranslation(); ... {t("section.key")}`.

## How to Add a New Locale

1. Add an entry to `LOCALES` in `lib/i18n/locales.ts` (code, label, short, flag emoji).
2. Create `lib/i18n/dictionaries/<code>.ts` exporting a `Dictionary`.
3. Import + add to `DICTIONARIES` map in `lib/i18n/index.ts`.
