-- 003_fix_schema_drift.sql
-- Adds DDL for ghost tables discovered in production audit (2026-05-31).
-- All statements use IF NOT EXISTS / conditional logic — safe to run against the live DB.
-- Run in: Supabase Dashboard → SQL Editor

-- sms_rate_limits (per-user, per-endpoint rate limiting)
CREATE TABLE IF NOT EXISTS sms_rate_limits (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID        NOT NULL,
  endpoint   TEXT        NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS sms_rate_limits_user_endpoint_idx ON sms_rate_limits(user_id, endpoint, created_at);

-- admin_impersonation_log (audit trail for admin impersonation actions)
CREATE TABLE IF NOT EXISTS admin_impersonation_log (
  id             UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id       UUID,
  admin_username TEXT,
  target_user_id UUID        NOT NULL,
  target_role    TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS admin_impersonation_log_created_at_idx ON admin_impersonation_log(created_at);

-- Fix provider_offers: add NOT NULL constraints to request_id and provider_id.
-- Safe: table had 0 rows at time of audit (2026-05-31). Check first before running:
-- SELECT COUNT(*) FROM provider_offers WHERE request_id IS NULL OR provider_id IS NULL;
ALTER TABLE provider_offers ALTER COLUMN request_id SET NOT NULL;
ALTER TABLE provider_offers ALTER COLUMN provider_id SET NOT NULL;
