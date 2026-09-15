-- 002_baseline_ghost_tables.sql
-- Baseline CREATE TABLE for all tables that exist in production but had no migration DDL.
-- All statements use IF NOT EXISTS — safe to run against the live DB at any time.
-- Run in: Supabase Dashboard → SQL Editor
--
-- Statements REORDERED into foreign-key dependency order on 2026-09-15. They were
-- previously written in an arbitrary order — sessions, which references users(id),
-- came first and users came seventh. That worked only because production already
-- had every core table when this file was first run, so every CREATE was a no-op
-- and no foreign key was ever resolved. Against an empty database it failed on the
-- first statement, which is how it was found: building the investor demo project
-- was the first time this repo was asked to create a database from nothing.
--
-- Reordering changes nothing for any database that already has these tables.
--
-- NOTE ON FILE ORDER: this file must run BEFORE 001_sprint1.sql. 001 is an ALTER
-- against tables that only exist once this file has run, so the migrations do not
-- apply in numeric order on a fresh database. Correct order is:
--   002, 001, 003, 004, 005, 006, 007, 008, 009, 010

-- ── Core tables, parents first ─────────────────────────────────────────────────

-- users (no dependencies)
CREATE TABLE IF NOT EXISTS users (
  id         UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  phone      TEXT  NOT NULL UNIQUE,
  name       TEXT,
  role       TEXT  NOT NULL DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- properties → users
CREATE TABLE IF NOT EXISTS properties (
  id               UUID    DEFAULT gen_random_uuid() PRIMARY KEY,
  name             TEXT    NOT NULL,
  building_type    TEXT    NOT NULL,
  address          TEXT    NOT NULL,
  city             TEXT    NOT NULL,
  units_count      INTEGER DEFAULT 0,
  map_url          TEXT,
  national_address TEXT,
  owner_id         UUID    NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- requests → users, properties
CREATE TABLE IF NOT EXISTS requests (
  id               UUID  DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id         UUID  NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  property_id      UUID  NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  service_category TEXT  NOT NULL DEFAULT 'standard',
  description      TEXT,
  status           TEXT  NOT NULL DEFAULT 'pending',
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- providers → users
CREATE TABLE IF NOT EXISTS providers (
  id                       UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id                  UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  company_name             TEXT        NOT NULL,
  email                    TEXT,
  city                     TEXT,
  description              TEXT,
  commercial_register_url  TEXT,
  company_profile_url      TEXT,
  fal_license_url          TEXT,
  approved                 BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

-- provider_offers → requests, providers
CREATE TABLE IF NOT EXISTS provider_offers (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id   UUID        NOT NULL REFERENCES requests(id) ON DELETE CASCADE,
  provider_id  UUID        NOT NULL REFERENCES providers(id) ON DELETE CASCADE,
  offer_file_url TEXT,
  notes        TEXT,
  price_total  NUMERIC,
  status       TEXT        NOT NULL DEFAULT 'pending'
                           CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, provider_id)
);

-- sessions → users
CREATE TABLE IF NOT EXISTS sessions (
  id           UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  token        UUID        DEFAULT gen_random_uuid() NOT NULL UNIQUE,
  user_id      UUID        NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  role         TEXT        NOT NULL DEFAULT 'owner',
  expires_at   TIMESTAMPTZ NOT NULL,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── Standalone tables (no foreign keys) ────────────────────────────────────────

-- otp_rate_limits
CREATE TABLE IF NOT EXISTS otp_rate_limits (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  phone      TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS otp_rate_limits_phone_idx ON otp_rate_limits(phone, created_at);

-- admin_login_attempts
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  id         UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  ip         TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS admin_login_attempts_ip_idx ON admin_login_attempts(ip, created_at);

-- admins (column is "password" not "password_hash" — matches routes.ts usage)
CREATE TABLE IF NOT EXISTS admins (
  id                 UUID        DEFAULT gen_random_uuid() PRIMARY KEY,
  username           TEXT        NOT NULL UNIQUE,
  password           TEXT        NOT NULL,
  session_token      TEXT,
  session_expires_at TIMESTAMPTZ,
  created_at         TIMESTAMPTZ DEFAULT NOW()
);
