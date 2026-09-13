-- 006_structured_offers_and_declines.sql
-- Structured offer fields + provider decline capture (2026-09-13).
-- Master plan v1006 item #26. All statements use IF NOT EXISTS — safe to re-run.
-- Run in: Supabase Dashboard → SQL Editor
--
-- Why: an offer used to be a PDF plus one number. The owner in the 2026-09-07
-- feedback contracted outside the platform specifically because he could not see
-- what he was buying before committing. line_items carries the breakdown.
--
-- price_total is NOT derived from line_items: terms.tsx pins the 1% commission to
-- the total as the provider entered it, so that figure stays authoritative and
-- explicitly entered.
--
-- offer_file_url becomes optional. It is already nullable in the DB, so this is a
-- server-side validation change only, recorded here for the reader.

ALTER TABLE public.provider_offers ADD COLUMN IF NOT EXISTS line_items jsonb;
ALTER TABLE public.provider_offers ADD COLUMN IF NOT EXISTS duration_months integer;

-- Why three of four approved providers have never submitted an offer is currently
-- unknown. A dismissal with a reason is the cheapest way to find out.
CREATE TABLE IF NOT EXISTS public.offer_declines (
  id          UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id  UUID        NOT NULL,
  provider_id UUID        NOT NULL,
  reason      TEXT        NOT NULL,
  note        TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- One standing decline per (request, provider); re-declining updates the reason.
CREATE UNIQUE INDEX IF NOT EXISTS offer_declines_request_provider_idx
  ON public.offer_declines(request_id, provider_id);
CREATE INDEX IF NOT EXISTS offer_declines_reason_created_idx
  ON public.offer_declines(reason, created_at);

-- Reads and writes go through the server with the service-role key (see
-- Emaraa/CLAUDE.md), so no anon access is granted here.
ALTER TABLE public.offer_declines ENABLE ROW LEVEL SECURITY;
