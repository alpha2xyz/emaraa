-- 009_contract_start_date.sql
-- Owner-selected contract start date (2026-09-13).
-- Idempotent, additive, nullable. Run in: Supabase Dashboard → SQL Editor
--
-- Why: a provider prices "starting next month" differently from "starting in six
-- months", and an offer's duration_months (migration 006) is counted from this
-- date, so the two together define the actual contract period. Nullable so it
-- never blocks the onboarding form, which is already where the funnel breaks.
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS contract_start_date date;
