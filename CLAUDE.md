# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Emaraa** (إعمار) — Saudi B2B facility management marketplace. Property owners post service requests; service providers submit PDF proposals; admin approves providers and manages the platform.

- **Live (Vercel):** https://emaraa.vercel.app *(update this when the custom domain is set)*
- **Supabase:** https://txzbzpnrclkdodosbndy.supabase.co
- **Replit URL is retired** — a redirect page will be added there pointing to the Vercel URL

## Deployment

**Vercel** is the production host. All code changes are made locally and deployed via Vercel (git push or Vercel CLI). Do not reference or optimize for Replit.

Env vars required in Vercel:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_JWT_SECRET`
- `AUTHENTICA_API_KEY`

## Commands

```bash
npm run dev       # Start dev server (Express + Vite HMR on same port)
npm run build     # Production build (esbuild server + Vite client)
npm run start     # Run production build
npm run check     # TypeScript type check
npm run db:push   # Push schema changes to PostgreSQL via Drizzle Kit
```

Local dev: `HOST=127.0.0.1 PORT=3000 npm run dev`

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

Admin auth goes through the Express server → Supabase RPC (`check_admin_login`, `verify_admin_session`).

### Auth & Roles

Three roles: `owner`, `provider`, `admin`.

- **Owner/Provider**: Phone OTP via Authentica SMS. After verify, server returns `{ token, userId, phone, role, name, supabaseToken }`. All six values are stored in `localStorage`. `RequireAuth` validates `sessionToken` against the `sessions` table on every protected route.
- **Admin**: Username/password via `POST /api/admin/login` → Supabase RPC. Token stored as `adminSessionToken`; `AdminAuth` verifies via `verify_admin_session` RPC.
- **Supabase JWT**: Server signs a Supabase-compatible JWT (`supabaseToken`) using `SUPABASE_JWT_SECRET` + native `crypto.createHmac`. Client calls `supabase.auth.setSession()` so `auth.uid()` works in RLS policies.

### Session Flow

1. User enters phone → `POST /api/otp/send` → Authentica sends 4-digit SMS
2. User enters OTP → `POST /api/otp/verify` → server verifies with Authentica, upserts user, creates row in `sessions` table, signs Supabase JWT, returns all tokens
3. `localStorage` stores: `sessionToken`, `userId`, `userPhone`, `userRole`, `userName`, `supabaseToken`
4. On page load, `supabase.ts` restores the Supabase session via `setSession()` so RLS works

### Routing

Wouter (`wouter`) handles client-side routing. Route groups in `App.tsx`:
- Public: `/`, `/auth`, `/contact`
- Admin: `/admin`, `/admin/dashboard`
- Owner: `/dashboard/owner/**` — wrapped in `DashboardLayout role="owner"`
- Provider: `/dashboard/provider/**` — wrapped in `DashboardLayout role="provider"`

`DashboardLayout` wraps all authenticated routes: applies `RequireAuth`, renders `Navbar` + `BottomNav`, sets `dir="rtl"` when language is Arabic.

### Bilingual / RTL

Language state managed by `client/src/hooks/use-lang.ts` — module-level global + listener (no React Context). Default language is Arabic (`ar`). All UI text must have both `ar` and `en` strings.

### DB Schema (`shared/schema.ts`)

| Table | Key fields |
|---|---|
| `users` | id (uuid), phone, name, role (owner\|provider) |
| `properties` | id, name, building_type, address, city, units_count, map_url, owner_id |
| `requests` | id, owner_id, property_id, service_category, description, status |
| `providers` | id, user_id, company_name, email, city, commercial_register_url, company_profile_url, approved |
| `provider_offers` | id, request_id, provider_id, offer_file_url, notes, status |
| `admins` | id, username, password_hash, session_token, session_expires_at |
| `sessions` | token (uuid PK), user_id, expires_at — custom session table, 30-day expiry |
| `otp_rate_limits` | id, phone, created_at — max 3 OTPs per phone per 10 minutes |

### File Storage

Supabase Storage. `client/src/lib/storage.ts` has `openSignedPdf(bucket, path)` — creates a 1-hour signed URL for private buckets. Always call this; never store or open raw storage URLs.

## Key Conventions

- All pages in `client/src/pages/` have a `.page-enter` CSS animation (defined in `index.css`).
- shadcn/ui components live in `client/src/components/ui/` — don't edit these directly.
- `console.error` is guarded by `import.meta.env.DEV` throughout client code.
- `server/storage.ts` `MemStorage` is local dev scaffolding only — does not persist. Real data is in Supabase.
- Express catch-all routes must use regex `/.*\/` not string `"*"` (Express v5 breaks on bare `*`).

## OTP System

SMS OTP via **Authentica** (portal.authentica.sa):
- **Send:** `POST /api/otp/send` → `https://api.authentica.sa/api/v2/send-otp`
- **Verify:** `POST /api/otp/verify` → `https://api.authentica.sa/api/v2/verify-otp`
- OTPs are **4 digits**, `maxLength=4` in UI, button disabled until 4 chars entered.
- Rate limit: max 3 OTPs per phone per 10 minutes (enforced server-side via `otp_rate_limits` table).

## RLS (Row Level Security)

Supabase RLS is enabled on `properties`, `requests`, `providers`, `provider_offers`. Policies use `auth.uid()` which works because the server signs a Supabase-compatible JWT on every login. The `supabaseToken` is stored in `localStorage` and restored via `supabase.auth.setSession()` on page load.

## UI System

Global components:
- `button.tsx` — `rounded-full` (pill buttons)
- `badge.tsx` — `rounded-full` (pill badges)
- `card.tsx` — border removed, `rounded-2xl`, shadow-only
- `StatusBadge` component — colored pill + icon for `pending/accepted/rejected/in_progress`
- `BottomNav` — animated blob indicator behind active nav item (framer-motion `layoutId`)

## Feature Backlog

- Redirect page on Replit URL → Vercel URL (simple HTML page, no framework needed)
- Custom domain (emaraa.sa or emaraa.com.sa)
- Business email (Google Workspace or Zoho)
- Owner email OTP via Resend (Stage 1)
- Provider notified on admin approval (Stage 2)
- Contract signing via Signit API — signit.sa, SDGA-licensed (Stage 3, requires CR)
- Subscription payments via Moyasar (Stage 3, requires CR)
