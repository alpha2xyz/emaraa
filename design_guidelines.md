# Design Guidelines: Emaraa

Emaraa (عِمارة) — Saudi B2B facility management marketplace. Property owners post service requests; service providers submit PDF proposals; admin manages the platform.

> **Single source of truth for colors, fonts, and radius is `client/src/index.css` (`:root`).**
> This document explains the *intent* behind those tokens. If the two ever disagree, `index.css` wins — update this file to match.
> **Never hardcode hex values in components — always use the CSS variables / Tailwind tokens.**

## Design Approach

Dark, modern, trustworthy. System-based, inspired by Linear/Notion productivity tools, adapted for an Arabic-first (RTL) facility management audience. Utility-focused: clarity, efficiency, task completion.

## Core Design Elements

### Theme — "Arctic Depths" (DARK)

The entire app is a **dark theme**. Colors are centralized in `client/src/index.css` `:root` (shadcn HSL tokens flipped to dark + a brand block). To re-theme the whole app, edit that one block.

| Element | CSS variable | Value |
|---|---|---|
| Page background | `--navy-2` | `#0F2733` |
| Cards / surfaces | `--navy` | `#193546` |
| Deepest surface | `--navy-3` | `#0A1C25` |
| Primary text | `text-foreground` | `#EAF6FB` |
| Muted text | `text-muted-foreground` | `#9FC2D3` |
| Owner role accent | `--owner` / `--owner-soft` | Cyan `#0DB8D3` |
| Provider role accent | `--provider` / `--provider-soft` | Blue `#1B7FDC` |
| Secondary / deep | `--deep` (also `--primary`) | `#065B98` |
| Residential property type | `--residential` / `--residential-soft` | Burgundy `#C75B72` (text `#E58AA0`) |
| Commercial property type | `--commercial` / `--commercial-soft` | Terracotta `#E08A5B` (text `#F0A87F`) |
| Success | `--ok` / `--ok-soft` | `#34D399` |
| Warning | `--warn` / `--warn-soft` | `#FBBF24` |
| Error | `--err` / `--err-soft` | `#F87171` |

**Color rules:**
- **Owner = Cyan, Provider = Blue.** The active role accent is exposed as `--role`, set per-layout in `App.tsx` (`DashboardLayout`).
- **Solid OWNER buttons:** cyan background + **dark text** `#04222c` (white-on-cyan fails contrast).
- **Solid PROVIDER buttons:** blue background + white text.
- Building types keep their warm accents (burgundy/terracotta) so they stand out against the all-blue roles.
- **Retired palette — do not reintroduce:** Navy `#2E4A6B`, Emerald `#0E7C66`, Sage `#6B7C5E`.

### Typography

- **Font:** **Cairo** (`--font-sans` / `--font-arabic`), with `Inter` as Latin fallback. Embed Cairo locally — never rely on a Google Fonts link for headless/render assets.
- **Wordmark "Emaraa / عِمارة":** Cairo weight **800**.
- **Headings:** weights 600–700; sizes from `text-3xl` (page titles) down to `text-lg` (section headers).
- **Body:** weight 400; `text-base` for content, `text-sm` for secondary info.
- **Labels & meta:** weight 500, `text-sm`.

### Bilingual / RTL

- **Arabic is primary**, default language is `ar`. English is the secondary string on every user-facing element.
- RTL (`dir="rtl"`) is applied at `DashboardLayout` level when language is Arabic.
- Language state: `client/src/hooks/use-lang.ts` (module-level global + listener, no React Context).
- **Numbers:** always Western digits `1234567890` — never Arabic-Indic `٠١٢٣`. Avoid the `ar-SA` locale (it emits Indian digits).

### Layout System

**Spacing primitives:** Tailwind units of 2, 4, 6, 8, 12, 16, 20, 24.
- Component padding: `p-4` to `p-8`
- Section spacing: `py-12` to `py-20`
- Card gaps: `gap-4` to `gap-6`
- Container max-width: `max-w-7xl` main content, `max-w-2xl` forms
- Corner radius: `--radius: .5rem` (`rounded-lg`)

## Component Library

shadcn/ui components live in `client/src/components/ui/`. **Don't edit those directly** — extend them from page/feature components.

### Navigation
- **Navbar** (`components/Navbar.tsx`): top bar with logo, links, gear/settings icon. Used by **all roles** (owner, provider, admin).
- **No BottomNav** — it was removed (2026-05-31); the file is dead code. Owners have `pb-4`; everything else uses the standard Navbar layout.

### Forms
- Grouped field sets with clear visual separation.
- Required-field indicators; inline validation with helpful messages below the field.
- Large textareas for descriptions; file upload areas with drag-and-drop affordance.
- Building-type selection uses clickable cards (residential/commercial) with the warm accent colors above.

### Cards
- Surfaces use `--navy` on the `--navy-2` page background.
- Rounded corners (`rounded-lg`), subtle elevation, gentle hover transition.
- Status uses pill badges via `components/StatusBadge.tsx` with the semantic `--ok` / `--warn` / `--err` tokens.

### Buttons & Actions
- **Primary CTA:** solid, `px-6 py-3 rounded-lg font-medium` — colored by the active role (see color rules above).
- **Secondary:** outlined variant.
- **Icon buttons:** compact, with ARIA labels.

### Overlays
- Modal forms centered (`max-w-2xl`).
- Right-side slideout (`components/ui/sheet.tsx`) for detail/edit panels.
- Toast notifications for success/error feedback.

## Icons

**Library: Lucide** (`lucide-react`). Use Lucide consistently across the app — do not mix in other icon sets.

## Animations

Minimal and purposeful only:
- Every page in `client/src/pages/` uses the `.page-enter` animation (defined in `index.css`).
- Smooth card-hover and status transitions; modal fade-in; slideout transitions.
- No decorative scroll-triggered animations in the app UI.

> Note: premium *report/diagram* assets (flowcharts, mind maps, decks) have their own richer animated style — see `Reports/STYLE.md`. That standard is separate from this app UI standard.

## Accessibility

- Consistent focus indicators (`ring-2 ring-offset-2`) on interactive elements.
- ARIA labels on icon-only buttons.
- Semantic HTML (`main`, `section`, `article`, `aside`).
- Form labels properly associated with inputs.
- Contrast-safe role buttons (the dark-text-on-cyan rule exists for this reason).

---

**Overall aesthetic:** clean, dark, professional, and trustworthy — Arabic-first, role-color-coded (owner cyan / provider blue), built for Saudi property owners and FM providers to handle service requests efficiently.
