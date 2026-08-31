# Emaraa — technical primer for Alfa

Last updated: 2026-08-31. Keep this short — a quick reference, not full documentation.

**Stack**: React 18 + Vite + Wouter + TanStack Query + Tailwind/shadcn (`client/`) ·
Express 5 (`server/`, entry `api/index.ts`) · Supabase Postgres, accessed almost entirely
server-side via `supabaseAdmin` (not from the browser) · Drizzle ORM (`shared/schema.ts`) ·
Vercel hosting + cron. Single package.json, not a monorepo.

**Core tables**: users (owner/provider) · properties · requests · providers (+approved) ·
provider_offers (PDF + price + status) · deals (auto-created on acceptance, 1% commission) ·
sms_log/email_log · admins.

**Product flow**: owner registers (phone OTP) → creates a service request → approved
providers are SMS'd → they submit PDF proposals → owner sees price only (PDF locked) →
owner accepts one → PDF unlocks, a `deals` row is created → admin confirms final contract
value → cron sends the 1% commission reminder (day 7) and request (day 21).

**Already shipped**: OTP auth, request/offer CRUD, admin dashboard, Slack business-event
webhook, two Vercel crons (weekly report, commission reminder), DB-backed rate limiting.

**AI in the codebase today: none.** No LLM calls, no AI keys, no AI dependencies — the
only match is dead boilerplate in `script/build.ts`. The product is AI-built but not
AI-powered. That gap is your entire job.

**Verify with**: `npm run check` (tsc) and `npx eslint .`. Playwright suites need live
credentials and a real Supabase — out of reach for you by design, don't try.

**CI/deploy**: GitHub Actions runs type check + lint on every PR; Vercel auto-deploys
from `main` after merge.

**Unverified — check before relying on a PR preview**: Vercel Preview environment
variables may point at production Supabase unless separated in the dashboard. Do not
assume branch previews are isolated.
