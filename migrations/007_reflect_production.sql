-- 007_reflect_production.sql
-- Bring migrations/ back in line with the live database (2026-09-13).
-- Every statement is idempotent — safe to run against production as-is.
-- Run in: Supabase Dashboard → SQL Editor
--
-- Why: migrations/ stopped at 004 (June 2026). The deals and email_log tables,
-- users.last_login_at, and both admin RPCs exist ONLY in production, so a fresh
-- environment could not be rebuilt from this repo. That is the first thing a
-- technical reviewer in a funding round checks.
--
-- Correction to master plan v1006, which listed "6 missing indexes": five of the
-- six already exist in the live DB (idx_provider_offers_provider_id,
-- idx_requests_owner_id, idx_requests_status, idx_requests_property_id,
-- idx_properties_owner_id — verified 2026-09-13 against pg_indexes). Only
-- deals.request_id is genuinely absent. They are all declared below so the repo
-- states them; the IF NOT EXISTS clauses make the existing five no-ops.

-- ── deals: the revenue / GMV table ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.deals (
  id                          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id                  UUID        NOT NULL,
  offer_id                    UUID        NOT NULL UNIQUE,
  provider_id                 UUID        NOT NULL,
  owner_id                    UUID        NOT NULL,
  contract_value              NUMERIC,
  status                      TEXT        NOT NULL DEFAULT 'pending', -- pending | closed | cancelled
  signed_at                   TIMESTAMPTZ,
  notes                       TEXT,
  commission_email_sent_at    TIMESTAMPTZ,
  commission_reminder_sent_at TIMESTAMPTZ,
  created_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── email_log: one row per outbound email attempt ───────────────────────────
CREATE TABLE IF NOT EXISTS public.email_log (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email   TEXT        NOT NULL,
  subject    TEXT,
  kind       TEXT,
  status     TEXT        NOT NULL, -- sent | failed | suppressed_test
  error      TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── users.last_login_at: powers the owner-inactivity request expiry cron ─────
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- ── Admin auth RPCs (both SECURITY DEFINER; dumped from production) ──────────
CREATE OR REPLACE FUNCTION public.check_admin_login(p_username text, p_password text)
 RETURNS TABLE(id uuid, username text)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
  BEGIN
    RETURN QUERY
    SELECT a.id, a.username
    FROM admins a
    WHERE a.username = p_username
      AND a.password = crypt(p_password, a.password);
  END;
  $function$;

CREATE OR REPLACE FUNCTION public.verify_admin_session(p_token text)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE session_token = p_token
      AND session_expires_at > NOW()
  );
END;
$function$;

-- ── Indexes ─────────────────────────────────────────────────────────────────
-- The only one genuinely missing in production as of 2026-09-13:
CREATE INDEX IF NOT EXISTS idx_deals_request_id ON public.deals(request_id);
-- Already present; declared so the repo reflects the database:
CREATE INDEX IF NOT EXISTS idx_provider_offers_provider_id ON public.provider_offers(provider_id);
CREATE INDEX IF NOT EXISTS idx_provider_offers_request_id  ON public.provider_offers(request_id);
CREATE INDEX IF NOT EXISTS idx_requests_owner_id           ON public.requests(owner_id);
CREATE INDEX IF NOT EXISTS idx_requests_status             ON public.requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_property_id        ON public.requests(property_id);
CREATE INDEX IF NOT EXISTS idx_properties_owner_id         ON public.properties(owner_id);

-- ── sms_rate_limits: dropped in production 2026-09-06 ───────────────────────
-- 003_fix_schema_drift.sql creates this table. That file is left untouched as
-- history (an applied migration should not be rewritten); the drop is expressed
-- forward here instead, so replaying 001..007 on a fresh database ends in the
-- same state production is actually in.
DROP TABLE IF EXISTS public.sms_rate_limits;

-- Note: RLS policies are not captured here. All authenticated data access goes
-- through the server with the service-role key, which bypasses RLS, so policies
-- are a defence-in-depth layer rather than the access model. Capturing them is a
-- separate pass and is logged in TODO.md.

-- ── email_outbox: durable queue for outbound email (added 2026-09-13) ────────
-- See server/outbox.ts. The provider broadcast previously ran as sequential
-- awaits on the request path with no timeout ceiling; past roughly eight
-- providers the request would time out, showing the owner a failure for a
-- request that had in fact been created while the remaining providers were
-- never notified.
CREATE TABLE IF NOT EXISTS public.email_outbox (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  to_email   TEXT        NOT NULL,
  subject    TEXT        NOT NULL,
  html       TEXT        NOT NULL,
  kind       TEXT,
  status     TEXT        NOT NULL DEFAULT 'pending', -- pending | sent | failed
  attempts   INTEGER     NOT NULL DEFAULT 0,
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  sent_at    TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_email_outbox_status_created
  ON public.email_outbox(status, created_at);

ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
