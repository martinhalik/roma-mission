# Roma Mission - Coding Standards

## Tech Stack

- **Next.js 15.x** with **React 19.x**
- **TypeScript** throughout
- **TailwindCSS v4** for styling (no Ant Design — pure Tailwind)
- **Lucide React** for icons
- **Mapbox GL** for interactive maps
- **Stripe** for donation payments
- CSS custom properties defined in `app/globals.css` for the design system

## Development Principles

- Follow requirements carefully & to the letter
- Think step-by-step — describe your plan before coding when the task is non-trivial
- Write correct, DRY, bug-free, fully functional code
- Focus on readability over performance
- Fully implement all requested functionality — no TODOs, placeholders, or missing pieces
- Include all required imports
- Be concise, minimize unnecessary prose
- Say so if you don't know the answer instead of guessing

## Design System

All design tokens are CSS custom properties defined in `app/globals.css`. Always use them instead of hardcoded hex values:

| Variable | Purpose |
|---|---|
| `var(--bg-primary)` | `#111111` — page background |
| `var(--bg-card)` | `#1C1C1C` — card surfaces |
| `var(--bg-elevated)` | `#282828` — elevated surfaces |
| `var(--text-primary)` | `#FFFFFF` |
| `var(--text-secondary)` | `#A0A0A0` |
| `var(--text-muted)` | `#666666` |
| `var(--gold)` | `#D4AF37` — primary accent |
| `var(--border-default)` | `#2A2A2A` |
| `var(--border-strong)` | `#3A3A3A` |
| `var(--cream)` | `#F5F0E8` |
| `var(--warm-bg)` | `#1A1714` |

Typography:
- `.font-primary` — Space Grotesk (UI text, headings)
- `.font-georgia` — Georgia serif (decorative, pull quotes)

## Code Style

### Components

- Use `export default function ComponentName()` for page-level and shared components
- Use named `function SubComponent()` for small helpers defined within a file
- Add `"use client"` directive only when the component uses hooks or browser APIs
- Pages live in `app/<route>/page.tsx`; shared UI lives in `components/`

### TypeScript

- Define interfaces for all props: `interface ComponentNameProps { ... }`
- Use `type` for union types and simple aliases, `interface` for object shapes
- Prefer explicit typing over `any`

### Styling

- **Always use Tailwind classes** — avoid inline `style={{}}` and `<style>` tags
- Reference design tokens via `bg-[var(--bg-card)]`, `text-[var(--gold)]`, etc.
- Use Tailwind's arbitrary value syntax for pixel-perfect values: `text-[11px]`, `tracking-[2px]`
- Prefer `gap-`, `px-`, `py-` over manual margin stacking

### Naming

- Components and files: `PascalCase` (`VideoModal.tsx`)
- Event handlers: `handle` prefix (`handleClick`, `handleSubmit`)
- Constants: `SCREAMING_SNAKE_CASE` for module-level (`const LACO_VIDEO_ID = ...`)
- Variables and functions: `camelCase`

### Patterns

- Use **early returns** to reduce nesting
- Extract repeated JSX into small helper components within the same file before abstracting to `components/`
- Keep data arrays (nav links, stat lists, etc.) as typed constants at the top of the file, outside the component

## Project Structure

```
app/
  layout.tsx          # Root layout, fonts, metadata
  globals.css         # CSS variables + Tailwind base
  page.tsx            # Home page
  <route>/page.tsx    # Route pages
  api/                # API routes (Stripe webhooks, etc.)
components/
  Navbar.tsx
  Footer.tsx
  CTASection.tsx
  VideoModal.tsx
  DonationModal.tsx
  ApplicationModal.tsx
  MissionMap.tsx
```

## Accessibility

Interactive elements must have:
- Semantic HTML (`<button>`, `<nav>`, `<main>`, etc.)
- `aria-label` when the label is not visible text
- Keyboard support: `tabIndex={0}` + `onKeyDown` alongside `onClick` for non-button clickables
