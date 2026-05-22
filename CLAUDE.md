# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Emaraa** (عِمارة) — Saudi B2B facility management marketplace. Property owners post service requests; service providers submit PDF proposals; admin approves providers and manages the platform.

- Live: https://emaraa.vercel.app
- Supabase project: https://txzbzpnrclkdodosbndy.supabase.co

## Commands

```bash
npm run dev       # Start dev server (Express + Vite HMR on same port)
npm run build     # Production build (esbuild server + Vite client)
npm run start     # Run production build
npm run check     # TypeScript type check
npm run db:push   # Push schema changes to PostgreSQL via Drizzle Kit
```

## Architecture

### Monorepo Structure

```
client/src/    # React frontend (Vite)
server/        # Express backend (tsx)
shared/        # schema.ts — Drizzle schema + Zod types shared by both
```

**Path aliases**: `@/` → `client/src/`, `@shared/` → `shared/`

### Data Flow — Two Separate Patterns

The Express server (`server/`) uses an `IStorage` interface backed by in-memory `MemStorage`. This handles only a small subset of local CRUD (properties, requests). **Most real data operations happen client-side via the Supabase JS client** (`client/src/lib/supabase.ts`) — pages call `supabase.from(...)` directly for users, providers, offers, and admin operations.

Admin auth specifically goes through the Express server → Supabase RPC (`check_admin_login`, `verify_admin_session` functions in the DB).

### Auth & Roles

Three roles: `owner`, `provider`, `admin`.

- **Owner/Provider**: Phone-based auth via Supabase Auth. After login, `userPhone` and `userRole` are stored in `localStorage`. `RequireAuth` component (`components/RequireAuth.tsx`) does a live DB lookup to verify the session — not just a localStorage check.
- **Admin**: Username/password through `POST /api/admin/login` → Supabase RPC. Token stored in `localStorage` as `adminToken`; `AdminAuth` component verifies via `verify_admin_session` RPC on each protected admin route.

### Routing

Wouter (`wouter`) handles client-side routing. Route groups in `App.tsx`:
- Public: `/`, `/auth`, `/contact`
- Admin: `/admin`, `/admin/dashboard`
- Owner: `/dashboard/owner/**` — wrapped in `DashboardLayout role="owner"`
- Provider: `/dashboard/provider/**` — wrapped in `DashboardLayout role="provider"`

`DashboardLayout` wraps all authenticated routes: applies `RequireAuth`, renders `Navbar` + `BottomNav`, and sets `dir="rtl"` when language is Arabic.

### Bilingual / RTL

Language state is managed by `client/src/hooks/use-lang.ts` using a module-level global + listener pattern (no React Context). Default language is Arabic (`ar`). RTL is applied at the `DashboardLayout` level. All UI text should have both Arabic and English strings; Arabic is the primary.

### DB Schema (`shared/schema.ts`)

| Table | Key fields |
|---|---|
| `users` | id (uuid), phone, name, role (owner\|provider) |
| `properties` | id, name, building_type, address, city, units_count, map_url, owner_id |
| `requests` | id, owner_id, property_id, service_category, description, status |
| `providers` | id, user_id, company_name, email, city, commercial_register_url, company_profile_url, approved |
| `provider_offers` | id, request_id, provider_id, offer_file_url, notes, status |
| `admins` | id, username, password_hash, session_token, session_expires_at |

Drizzle-zod generates `insertXSchema` and types from each table definition.

### File Storage

PDF proposals and company documents are stored in Supabase Storage. `client/src/lib/storage.ts` has `openSignedPdf()` which creates a 1-hour signed URL for private buckets.

## Key Conventions

- All pages in `client/src/pages/` have a `.page-enter` CSS animation (defined in `index.css`).
- shadcn/ui components live in `client/src/components/ui/` — don't edit these directly; extend them from page/feature components.
- `env.ts` at the root exports `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `AUTHENTICA_API_KEY` — imported by both server and client.
- The `server/storage.ts` `MemStorage` is used for local dev scaffolding only; it does not persist. Real data is in Supabase.
- `console.error` is guarded by `import.meta.env.DEV` throughout client code.

## Server Configuration — Fixed Bugs (2026-05-02)

Three bugs that caused crash loops on deployment. **Never reintroduce these.**

### 1. `reusePort: true` — BANNED
`server/index.ts` had `httpServer.listen({ port, host, reusePort: true })`.
`SO_REUSEPORT` is not supported in Node deployment containers → `ENOTSUP` crash.
**Fix:** `httpServer.listen(port, host, callback)` — flat args, no options object.

### 2. Wildcard `"*"` string routes — BANNED in Express v5
`server/static.ts` and `server/vite.ts` both used `app.use("*", ...)` / `app.get("*", ...)`.
Express v5 uses path-to-regexp v8 which rejects bare `*` → `Missing parameter name at index 1: *`.
**Fix:** Always use a regex: `app.get(/.*/, ...)` and `app.use(/.*/, ...)` for catch-alls.

### 3. HOST env var for local dev
`server/index.ts` now reads `process.env.HOST || "0.0.0.0"`.
Run locally with: `HOST=127.0.0.1 PORT=3000 npm run dev`
Replit deployment leaves HOST unset → falls back to `0.0.0.0` (correct for production).

## Prompt Style Guide

Before executing any task, if the request is longer than 2 lines or contains mixed languages, reformat it into a clean structured prompt with:
- Clear objective on the first line
- Numbered steps if multiple actions needed
- Technical terms in English, descriptions in Arabic
- End with "Do not ask, just implement" if it's a UI or code change

Then confirm the reformatted prompt before executing.

## OTP System (Production-ready as of 2026-05-07)

SMS OTP is live via **Authentica** (portal.authentica.sa), a Saudi-native SMS provider.

- **Send:** `POST /api/otp/send` — calls `https://api.authentica.sa/api/v2/send-otp`
- **Verify:** `POST /api/otp/verify` — calls `https://api.authentica.sa/api/v2/verify-otp`
- OTPs are **4 digits**, 5-min expiry. Auth UI: `maxLength=4`, `disabled` until 4 chars entered.
- **Twilio is fully removed** — no Twilio imports, env vars, or SDK calls anywhere.
- OTP rate-limiting state persists in the `otp_rate_limits` Supabase table (no in-memory Map).

## Vercel Deployment (Live as of 2026-05-13)

- Live URL: https://emaraa.vercel.app
- GitHub repo: `git@github.com:alpha2xyz/emaraa.git` — Vercel auto-deploys on push to `main`
- Env vars set in Vercel: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `AUTHENTICA_API_KEY`, `SUPABASE_JWT_SECRET`, `FRONTEND_URL`

## Pre-Work Archive Rule

**Before starting any new feature or large code change, create a dated ZIP backup of the project.**

Run this from inside the Emaraa project folder:
```bash
cd "/Users/abdallahalfaraidi/Documents/Emaraa with claude" && zip -r "backups/Emaraa_$(date +%Y-%m-%d).zip" Emaraa --exclude "Emaraa/node_modules/*" --exclude "Emaraa/.git/*" --exclude "Emaraa/dist/*" --exclude "Emaraa/.next/*"
```

Archives are saved to `~/Documents/Emaraa with claude/backups/` with the format `Emaraa_YYYY-MM-DD.zip`.
Do this once per session before the first code edit — not before every single file change.

## SQL Files Rule

**Ad-hoc Supabase SQL scripts go in `_work/sql/` — never in the project root.**

- `_work/sql/` is for one-off scripts run manually in the Supabase Dashboard SQL Editor (RLS policies, security fixes, schema patches).
- `migrations/` inside this project is only for versioned Drizzle-tracked schema changes (e.g. `001_sprint1.sql`).
- When writing any new `.sql` file for Supabase, always save it to `~/Documents/Emaraa with claude/_work/sql/`.

## Slash Commands

### `/competitive-analysis`

Map competitors in the KSA/GCC facility management and PropTech space. Deliver a structured report saved to `Reports/competitive-analysis-[date].html`.

**Methodology:**

1. **Frame** — Ask user: what specifically they want to analyze (full landscape, one competitor, fundraising prep). Treat any competitor name they give as confirmed — don't try to verify before researching.

2. **Search strategy — KSA-first:**
   - Always search in Arabic: `منصات إدارة المرافق`, `سوق خدمات الصيانة`, `تطبيق خدمات العقارات السعودية`
   - English searches: `facility management marketplace Saudi Arabia`, `property services app KSA`
   - Check: Google Play Arabic region, Apple App Store KSA (`apps.apple.com/sa/`), Maroof platform (`maroof.sa`), Zid, Jahez ecosystem
   - Check international FM players with KSA presence: JLL, CBRE, Emrill, Ejadah
   - Check PropTech: Bayut, Property Finder, Aqarmap — do any overlap with services?

3. **Per-competitor dossier (limit 5–7):**
   - Positioning one-liner (their homepage H1 or App Store description)
   - Pricing model (free/subscription/commission)
   - Top 3 strengths (from reviews or their own copy)
   - Top 3 weaknesses (from 1–3 star reviews, or gaps inferred from what they don't mention)
   - Funding/team size (Crunchbase, LinkedIn, MAGNiTT for MENA)
   - Platform: app-only, web-only, or both
   - Whether they're approved/registered on Maroof (معروف) — signals legitimacy in KSA

4. **For SPA/JS-rendered competitor sites:** use `curl` to extract meta tags and bundle strings — don't rely on `webFetch` alone.

5. **Positioning synthesis (April Dunford format):**
   - For [target customer] who [need], Emaraa is a [category] that [key benefit]. Unlike [primary alternative], we [key differentiator].

6. **Feature matrix:** rows = capabilities (provider vetting, proposal PDF, offer acceptance, payment, contract signing, ratings), columns = competitors + Emaraa, cells = ✓/✗/partial.

7. **White space:** gaps no competitor serves well. Frame around Vision 2030 + REGA context.

8. **Recommendations:** 3 specific actions. If for Cityscape Global, frame around investor narrative.

**Output:**
- Save report to `Reports/competitive-analysis-[YYYY-MM-DD].html` — dark-themed, RTL-aware, professional
- Save monitoring brief to `Reports/competitor-monitoring.md` — Google Alert URLs per competitor, monthly ritual checklist
- Always offer to set up Google Alerts at the end

**Regional blind spots to acknowledge:** G2/Capterra/Product Hunt have near-zero MENA coverage. An app can have 50,000 KSA users and zero English web presence. Empty search results ≠ no competition.

---

### `/seo-audit`

Audit Emaraa's public pages for SEO issues and deliver a prioritized fix list saved to `Reports/seo-audit-[date].html`.

**Default target:** `https://emaraa.vercel.app` (switch to custom domain once live).

**Step 1: SPA vs SSR reality check (critical for Emaraa)**

Emaraa is a hybrid: React SPA for authenticated dashboard routes, Express SSR for public pages. Googlebot only indexes the SSR pages.

Public/indexable pages: `/` (landing), `/about`, `/contact`, `/terms`, `/privacy`, `/auth`
Dashboard routes (`/dashboard/**`): SPA — invisible to search engines, expected, leave them.

Verify with: `curl -s https://emaraa.vercel.app/[page] | grep "<h1"` — if no H1 returned, page is SPA-rendered.

**Step 2: Crawlability**
- `curl -s https://emaraa.vercel.app/robots.txt` — confirm it returns `User-agent:` text, not `<!DOCTYPE html>`
- `curl -s https://emaraa.vercel.app/sitemap.xml` — confirm it returns `<?xml`, not HTML fallback
- Check: sitemap lists all public SSR pages, no dashboard routes included

**Step 3: Arabic SEO specifics (Emaraa is Arabic-first)**
- `<html lang="ar" dir="rtl">` on all public pages
- `og:locale` must be `ar_SA` (not `en_US`)
- Arabic title tags and meta descriptions — primary keyword in Arabic first
- `hreflang` tags if any page has both Arabic and English versions
- Google Search Console: ensure Arabic is the primary language signal

**Step 4: On-page (per public page)**
- Title: unique, 50–65 chars, Arabic primary keyword near start, brand name at end
- Meta description: 150–160 chars, Arabic, clear CTA
- H1: one per page, contains primary keyword in Arabic
- Schema: `Organization` + `WebSite` on homepage; `LocalBusiness` (Saudi address) once CR is registered

**Step 5: Technical**
- Core Web Vitals: LCP < 2.5s, INP < 200ms, CLS < 0.1
- Font loading: check `client/index.html` for render-blocking Google Fonts — apply async load pattern
- Vercel handles: HTTPS, CDN, HSTS — no action needed
- Image alt text in Arabic

**Step 6: Shared shell optimization**
Emaraa uses an Express SSR shell function — fixing it once applies to all public pages:
- Add missing: `og:locale`, `og:site_name`, Twitter Card tags, `theme-color`
- Add `WebSite` + `Organization` JSON-LD to homepage
- Confirm canonical tags use correct per-page URLs

**Output format:**
```
# SEO Audit — emaraa.vercel.app — [date]
## Critical (blocking indexation)
## High-impact (fix in shell function — applies to all pages)
## Quick wins
## Per-page analysis (/, /about, /contact, /terms, /privacy)
## Arabic SEO checklist
## Recommended action plan
```
Save to `Reports/seo-audit-[YYYY-MM-DD].html`.

---

### `/provider-acquisition`

Research and build a shortlist of facility management companies in KSA to onboard as providers on Emaraa. Output a contact list + outreach templates saved to `Reports/provider-acquisition-[date].md`.

**Context:** Emaraa needs vetted service providers (FM companies, maintenance, cleaning, AC, security, landscaping) in KSA. Target: 20–50 onboarded providers before Cityscape Global launch (Nov 16, 2026).

**Step 1: Define target profile**
Ask user (or default to):
- Service categories needed: maintenance, cleaning, AC, electrical, plumbing, security, landscaping
- Cities: Riyadh first, then Jeddah, Dammam
- Company size: 5–200 employees (SME focus — enterprise FM won't need Emaraa)
- Required: active CR (Commercial Registration), operational in KSA, willing to use digital platform

**Step 2: Discovery channels (KSA-specific)**

| Source | How to use |
|---|---|
| **Maroof (معروف)** | `webFetch("https://maroof.sa/businesses?category=facility-management")` — government-verified businesses, CR-confirmed |
| **Google Maps** | Search `شركات صيانة الرياض`, `شركات نظافة جدة` — extract name, phone, rating, review count |
| **Yellow Pages Saudi** | `webSearch("site:yellowpages.com.sa facility management")` |
| **LinkedIn** | `webSearch("site:linkedin.com/company facility management Saudi Arabia")` |
| **Wathiq (وثيق)** | Government business registry — verify CR numbers |
| **App Store / Play Store** | Search for FM apps to find tech-forward providers already using digital tools |

Target: 30–50 candidates, narrow to 20 for outreach.

**Step 3: Evaluate each provider**

| Criteria | Weight | How to check |
|---|---|---|
| CR registered + active | Must-have | Maroof badge or Wathiq lookup |
| Google rating ≥ 3.5 | High | Google Maps reviews |
| Years in business ≥ 2 | High | LinkedIn founding year, Google listing |
| Has a phone/WhatsApp | Must-have | Google Maps, website |
| Service category match | Must-have | Website or Maroof listing |
| City coverage | High | Listing address |

**Step 4: Shortlist table**

| Company | City | Services | CR/Maroof | Phone | Rating | Notes |
|---|---|---|---|---|---|---|

**Step 5: Outreach templates**

Generate two versions — WhatsApp (short, informal Arabic) and email (formal Arabic):

**WhatsApp template:**
```
السلام عليكم، أنا [الاسم] من منصة عِمارة — منصة سعودية تربط ملاك العقارات بشركات الصيانة والإدارة.
نودّ إضافة شركتكم كمزوّد معتمد على المنصة لتلقّي طلبات من ملاك عقارات في [المدينة].
التسجيل مجاني، وتستلمون طلبات مباشرة مع تفاصيل العقار.
هل يمكن نحدد وقت قصير للتعريف؟
```

**Email template:**
```
الموضوع: دعوة للانضمام إلى منصة عِمارة كمزوّد خدمات معتمد

تحية طيبة،
نودّ دعوة شركتكم للانضمام إلى منصة عِمارة، وهي منصة رقمية سعودية تتيح لملاك العقارات التجارية والسكنية الوصول إلى مزوّدي خدمات الصيانة والإدارة الموثوقين.
مزايا الانضمام:
- استقبال طلبات خدمة مباشرة من ملاك العقارات
- التسجيل مجاني تمامًا
- ظهور موثّق على المنصة برقم السجل التجاري
يسعدنا ترتيب مكالمة تعريفية في الوقت الذي يناسبكم.
مع خالص التحية،
فريق عِمارة | emaraa.vercel.app
```

**Output:**
Save to `Reports/provider-acquisition-[YYYY-MM-DD].md` with:
- Full shortlist table (20+ companies)
- Evaluation scores
- Ready-to-send WhatsApp + email templates
- Priority tier: Tier 1 (contact immediately) / Tier 2 (follow up) / Tier 3 (monitor)

---

## Feature Backlog

**Pre-launch (remaining):**
- Provider notified via SMS when admin approves their account (`routes.ts:318` — SMS fires on offer/request events only, not on approval)
- `map_url` URL validation — currently stores raw strings; validate `https://maps.google.com` prefix before save
- Admin password minimum complexity (currently no length/complexity check at `routes.ts:558`)

**Already shipped (pre-launch):**
- Second admin account — `POST /api/admin/create` (`routes.ts:549`) + full UI in `admin-dashboard.tsx:226`
- OTP storage moved to Supabase `otp_rate_limits` table (no in-memory Map)
- Phone-sharing consent checkbox at provider offer submission (`provider-offer-form.tsx:35`)
- 1 property per owner — server-side check exists (`routes.ts:127`) ⚠️ bypassed by direct Supabase writes; needs RLS enforcement
- Lock new requests once an offer is accepted — server-side check exists (`routes.ts:192`) ⚠️ bypassed by direct Supabase writes; needs RLS enforcement
- SLA/Terms acceptance checkbox at registration (`auth-page.tsx:331`)
- File MIME validation — magic bytes checked client-side before upload (`provider-offer-form.tsx:236`, `provider-profile.tsx:175`)
- Owner offers empty state — SVG illustration + CTA to requests page (`owner-offers-page.tsx:146`)
- Admin impersonation — `POST /api/admin/impersonate` + UI in `admin-dashboard.tsx:197`
- Provider IBAN + bank name storage (`provider-profile.tsx`, `migrations/001_sprint1.sql`)
- FAL license document upload (3rd required doc for providers — `provider-profile.tsx:195`)
- `price_total` field on provider offers (`provider-offer-form.tsx:37`)
- Approval status banner on provider profile (`provider-profile.tsx:323`)
- Settings page (`settings.tsx`) + About page (`about-page.tsx`)

**Stage 1:**
- Owner email OTP via Resend

**Stage 3 (requires CR):**
- Contract signing via **Signit API** (signit.sa) — Saudi-native, SDGA-licensed
- Subscription payments via **Moyasar**

## Security Issues (Audit 2026-05-20)

### CRITICAL
- **Open RLS policies** (`security_fixes.sql:72–90`) — All tables have `USING (true)` for the anon role, meaning any browser with the public anon key can read/write any row. Must rewrite policies to use `auth.uid() = owner_id` / `auth.uid() = user_id` patterns.
- **Business rules bypassed** (`property-form.tsx:151`, `request-form.tsx:148`) — 1-property limit and offer-lock are enforced on the Express server, but both pages write directly to Supabase, bypassing the server entirely. Enforcement must move to RLS or DB triggers.

### HIGH
- **CORS wildcard fallback** (`server/index.ts:11`) — `origin: true` when `FRONTEND_URL` is unset reflects any origin with credentials. Fix: explicit fallback to `["http://localhost:5000"]`.
- **No role enforcement on API endpoints** (`server/routes.ts:46`) — `requireSession` validates the session but never checks `role`. Providers can call owner-only endpoints.
- **Admin impersonation has no audit log** (`routes.ts:523`) — No DB record of who impersonated whom. Add an `audit_log` table entry on every impersonation.
- **Fake `refresh_token`** (`client/src/lib/supabase.ts:10`) — `setSession` is called with the JWT as both `access_token` and `refresh_token`. This will silently break if Supabase SDK attempts a real token refresh.
- **No security headers / no Helmet** (`server/index.ts`) — No CSP, X-Frame-Options, or HSTS. Add `helmet()` as first middleware.

### MEDIUM
- **No global rate limiting** — Only OTP and admin login are rate-limited. SMS trigger endpoints (`/api/sms/*`) are unprotected.
- **IBAN stored and served in plaintext** — `providers` table RLS allows any authenticated user to SELECT all IBANs. Restrict column access to provider + admin only.
- **Session/admin/rate-limit table DDL missing from repo** — `sessions`, `admin_login_attempts`, `otp_rate_limits`, `admins` exist in production but have no `CREATE TABLE` in any migration file.
- **`MemStorage` is dead code in production** (`server/storage.ts`) — All Express property/request routes use in-memory storage that is empty on every cold start (Vercel = serverless). These routes return empty data in production.
- **`.env.example` missing vars** — `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `FRONTEND_URL` are required but absent from `.env.example`.
