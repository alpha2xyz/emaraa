-- 008_activation_nudge.sql
-- Post-verification activation nudge (2026-09-13). Master plan v1006 item #28.
-- Idempotent. Run in: Supabase Dashboard → SQL Editor
--
-- Why: 10 of 16 registered owners verified their phone and then never added a
-- property. The funnel breaks after the verification code, not at acquisition.
-- The daily cron finds them and reaches out once.
--
-- This column is what makes it "once": without it the same stalled owner would be
-- emailed every morning indefinitely.
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS activation_nudged_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_users_role_created
  ON public.users(role, created_at);
