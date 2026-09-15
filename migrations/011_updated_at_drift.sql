-- 011_updated_at_drift.sql
-- Two columns that shared/schema.ts declares and production has, but that no
-- migration ever created: providers.updated_at and requests.updated_at.
--
-- Found 2026-09-15 by building the investor demo project from migrations/ and
-- diffing its columns against production: 110 columns in production, and the
-- seed failed on "Could not find the 'updated_at' column of 'requests'". Like the
-- RLS policies in 010, these had only ever existed because someone added them by
-- hand to the live database.
--
-- Idempotent. Against production every statement is a no-op.

ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
ALTER TABLE public.requests  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Known remaining differences between a repo-built database and production, all
-- checked 2026-09-15 and all harmless, recorded so the next person does not
-- re-investigate them:
--
--   providers.bank_name, providers.iban  — created by 001_sprint1.sql; production
--     no longer has them. Unused by the application.
--   sessions.id  — declared by 002; production keys sessions on `token` alone.
--   varchar vs text on users/properties columns, and timestamp vs timestamptz on
--     providers.created_at / requests.created_at — Drizzle push produced one
--     spelling in production and the SQL baseline another. Behaviourally identical
--     for every query the application makes.
