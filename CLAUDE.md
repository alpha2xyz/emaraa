# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Emaraa** (عِمارة) — Saudi B2B facility management marketplace. Property owners post service requests; service providers submit PDF proposals; admin approves providers and manages the platform.

- Live: https://emaraa.app (also: https://emaraa.vercel.app)
- Supabase project: https://txzbzpnrclkdodosbndy.supabase.co

---

## Commands

```bash
npm run dev       # Start dev server (Express + Vite HMR on same port)
npm run build     # Production build (esbuild server + Vite client)
npm run start     # Run production build
npm run check     # TypeScript type check
npm run db:push   # Push schema changes to PostgreSQL via Drizzle Kit
```

---

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

---

## Key Conventions

- All pages in `client/src/pages/` have a `.page-enter` CSS animation (defined in `index.css`).
- shadcn/ui components live in `client/src/components/ui/` — don't edit these directly; extend them from page/feature components.
- `env.ts` at the root exports `SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `AUTHENTICA_API_KEY` — imported by both server and client.
- The `server/storage.ts` `MemStorage` is used for local dev scaffolding only; it does not persist. Real data is in Supabase.
- `console.error` is guarded by `import.meta.env.DEV` throughout client code.

---

## Fixed Bugs — Never Reintroduce (2026-05-02)

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
Vercel/production deployment leaves HOST unset → falls back to `0.0.0.0` (correct for production).

---

## OTP System (Production-ready as of 2026-05-07)

SMS OTP is live via **Authentica** (portal.authentica.sa), a Saudi-native SMS provider.

- **Send:** `POST /api/otp/send` — calls `https://api.authentica.sa/api/v2/send-otp`
- **Verify:** `POST /api/otp/verify` — calls `https://api.authentica.sa/api/v2/verify-otp`
- OTPs are **4 digits**, 5-min expiry. Auth UI: `maxLength=4`, `disabled` until 4 chars entered.
- **Twilio is fully removed** — no Twilio imports, env vars, or SDK calls anywhere.
- OTP rate-limiting state persists in the `otp_rate_limits` Supabase table (no in-memory Map).

---

## Vercel Deployment (Live as of 2026-05-13)

- Live URL: https://emaraa.app (also: https://emaraa.vercel.app)
- GitHub repo: `git@github.com:alpha2xyz/emaraa.git` — Vercel auto-deploys on push to `main`
- Env vars set in Vercel: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `AUTHENTICA_API_KEY`, `SUPABASE_JWT_SECRET`, `FRONTEND_URL`

---

## Domain & Contact Info (as of 2026-05-24)

- **Domain:** emaraa.app — registered via Vercel, expires May 2027
- **Support phone:** +966 501 315 725 (WhatsApp Business + call)
- **Business email:** info@emaraa.app — Zoho Mail (mail.zoho.com)
  - SMTP: smtppro.zoho.sa | Port 587 (TLS) or 465 (SSL) | Username: info@emaraa.app
  - IMAP: imappro.zoho.sa | Port 993 | SSL: yes
- **DNS managed by Vercel** — MX (zoho.sa), SPF, DKIM, DMARC all configured

---

## Rules

### Pre-Work Archive

**Before starting any new feature or large code change, create a dated ZIP backup of the project.**

```bash
cd "/Users/abdallahalfaraidi/Documents/Emaraa with claude" && zip -r "backups/Emaraa_$(date +%Y-%m-%d).zip" Emaraa --exclude "Emaraa/node_modules/*" --exclude "Emaraa/.git/*" --exclude "Emaraa/dist/*" --exclude "Emaraa/.next/*"
```

Archives go to `~/Documents/Emaraa with claude/backups/` — format `Emaraa_YYYY-MM-DD.zip`.
Do this **once per session** before the first code edit, not before every file change.

### Reports Folder

**Before generating any HTML report, read `~/Documents/Emaraa with claude/Reports/STYLE.md`.** It defines the color system, typography, templates, and subfolder routing for all reports.

**Always save reports inside the correct subfolder under `~/Documents/Emaraa with claude/Reports/`.**

| Subfolder | What goes in it |
|---|---|
| `business/` | Investor decks, market analysis, consultation docs, LinkedIn content, insurance/legal research |
| `claude study reports in HTML/` | AI-generated study reports: feasibility studies, competitive analysis, SEO audit, provider acquisition, pre-launch audit |
| `flowcharts/` | Page flow diagrams, architecture diagrams, system maps |
| `master-plan/` | Master plan and roadmap documents |
| `technical/` | Technical comparison reports, feature planning docs, structured offer plans |
| `archived/` | Old or superseded reports — never save new reports here |

Never save a report to the Reports root folder directly. If unsure, default to `claude study reports in HTML/`.

### Project Folder is Code-Only

**Never create files or folders inside `~/Documents/Emaraa with claude/Emaraa/` unless they are part of the website code.**

This folder is a git repo deployed to Vercel — it must stay clean. Everything else goes in the parent workspace:

| What | Where |
|---|---|
| Ad-hoc SQL scripts (RLS policies, schema patches, security fixes — run manually in Supabase Dashboard) | `~/Documents/Emaraa with claude/_work/archived/sql/` |
| Generated HTML reports — feasibility studies, competitive analysis, SEO audits, master plans, flowcharts, investor decks | `~/Documents/Emaraa with claude/Reports/` |
| Per-session work logs (dated `.md` files) | `~/Documents/Emaraa with claude/_work/sessions/` |
| Feature backlog and pending tasks | `~/Documents/Emaraa with claude/_work/TODO.md` |
| Product and technical decisions log | `~/Documents/Emaraa with claude/_work/decisions-log.md` |
| Old planning docs, completed phases, legacy files | `~/Documents/Emaraa with claude/_work/archived/` |
| ZIP snapshots of the project (taken once per session before major changes) | `~/Documents/Emaraa with claude/backups/` |
| Raw market data — REGA annual reports (PDF + MD), FAL Excel, provider datasets, REGA stats summaries | `~/Documents/Emaraa with claude/Resources/` |

If it's not `client/`, `server/`, `shared/`, `migrations/`, or a config file — it doesn't belong here.

### SQL Files

**Ad-hoc Supabase SQL scripts go in `~/Documents/Emaraa with claude/_work/archived/sql/` — never in the project root.**

- `_work/archived/sql/` is for one-off scripts run manually in the Supabase Dashboard SQL Editor (RLS policies, security fixes, schema patches).
- `migrations/` inside this project is only for versioned Drizzle-tracked schema changes (e.g. `001_sprint1.sql`).
- When writing any new `.sql` file for Supabase, always save it to `~/Documents/Emaraa with claude/_work/archived/sql/`.

---

## Feature Backlog

> Full backlog lives in `~/Documents/Emaraa with claude/_work/TODO.md`. This section is a quick reference for items with specific code locations.

**All pre-launch items shipped as of 2026-05-21.** Open items tracked in TODO.md by stage:
- **Launch Prep** — 15 UX/business-rule/admin items
- **Stage 2** — Rate limiting, audit log, IBAN RLS, DDL migrations, role enforcement, fake refresh_token fix, MemStorage cleanup
- **Stage 3** — Contract signing (Signit API), subscription payments (Moyasar)

---

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

---

## Slash Commands (Project)

Commands are namespaced `emaraa:` so they appear grouped in the `/` menu.

| Command | What it does |
|---|---|
| `/emaraa:competitive-analysis` | KSA/GCC FM & PropTech competitor research → HTML report |
| `/emaraa:seo-audit` | Public-page SEO audit for emaraa.app → HTML report |
| `/emaraa:provider-acquisition` | Parse REGA FAL Excel, tier 302 companies, generate outreach HTML |
| `/emaraa:html-report` | Build a complete RTL Arabic single-file HTML business doc in one shot |
| `/emaraa:master-plan` | Generate a new versioned Emaraa master plan (5-year roadmap, SWOT, financials, exit strategy) |
| `/emaraa:decision` | Log a product, architecture, or technical decision to `_work/decisions-log.md` |
| `/emaraa:session` | Manage daily session log — start with a goal, end with a summary |

Full command definitions live in `~/Documents/Emaraa with claude/.claude/commands/emaraa/`.
