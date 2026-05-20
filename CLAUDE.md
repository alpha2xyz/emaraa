# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Emaraa** (إعمار) — Saudi B2B facility management marketplace. Property owners post service requests; service providers submit PDF proposals; admin approves providers and manages the platform.

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
