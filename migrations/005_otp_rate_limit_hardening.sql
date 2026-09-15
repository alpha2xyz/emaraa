-- 005_otp_rate_limit_hardening.sql
-- Adds per-IP and send/verify separation to otp_rate_limits (2026-09-13).
-- All statements use IF NOT EXISTS — safe to run against the live DB.
-- Run in: Supabase Dashboard → SQL Editor
--
-- Why: /api/otp/send was capped per-phone only, so phone-number enumeration could
-- burn Authentica credit without limit. Worse, /api/otp/verify counted rows that
-- only /api/otp/send ever wrote, so its 5-attempt ceiling was unreachable and a
-- 4-digit OTP could be brute-forced. `kind` separates the two counters; `ip` backs
-- the new per-IP send cap.

ALTER TABLE public.otp_rate_limits ADD COLUMN IF NOT EXISTS ip text;
ALTER TABLE public.otp_rate_limits ADD COLUMN IF NOT EXISTS kind text DEFAULT 'send';

-- Every pre-existing row was written by /api/otp/send.
UPDATE public.otp_rate_limits SET kind = 'send' WHERE kind IS NULL;

-- Supports the three send counters and the verify counter.
CREATE INDEX IF NOT EXISTS otp_rate_limits_kind_created_idx
  ON public.otp_rate_limits(kind, created_at);
CREATE INDEX IF NOT EXISTS otp_rate_limits_ip_kind_created_idx
  ON public.otp_rate_limits(ip, kind, created_at);
CREATE INDEX IF NOT EXISTS otp_rate_limits_phone_kind_created_idx
  ON public.otp_rate_limits(phone, kind, created_at);
