-- =====================================================
-- Emaraa RLS Security v3 — 2026-05-21
-- Run in Supabase SQL Editor:
-- https://txzbzpnrclkdodosbndy.supabase.co → SQL Editor → New query
--
-- WHY v3 instead of v2:
--   v2 used DROP POLICY IF EXISTS with specific names.
--   Curl tests confirmed the open policies are STILL active — v2 either
--   hit a mid-run error or the names didn't match what was in the DB.
--   v3 first enumerates and drops ALL existing policies on every affected
--   table (regardless of name), then recreates the correct ones.
-- =====================================================


-- =====================================================
-- STEP 1: Nuclear drop — remove ALL existing policies
--         on affected tables, whatever they are named.
-- =====================================================

DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE tablename IN ('properties', 'requests', 'providers', 'provider_offers', 'users', 'sessions')
      AND schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', r.policyname, r.schemaname, r.tablename);
  END LOOP;
END $$;


-- =====================================================
-- STEP 2: Ensure RLS is enabled on all tables
-- =====================================================

ALTER TABLE users            ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties       ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests         ENABLE ROW LEVEL SECURITY;
ALTER TABLE providers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE provider_offers  ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions         ENABLE ROW LEVEL SECURITY;


-- =====================================================
-- USERS
-- Anon: SELECT only (phone lookup in OTP/RequireAuth flow)
-- Authenticated: SELECT all, UPDATE own row only
-- =====================================================

CREATE POLICY "anon_select_users"
  ON users FOR SELECT TO anon
  USING (true);

CREATE POLICY "auth_select_users"
  ON users FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "auth_update_own_user"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- =====================================================
-- PROPERTIES
-- Anon: no access
-- Authenticated: SELECT all, INSERT own + 1-per-owner limit, UPDATE/DELETE own
-- =====================================================

CREATE POLICY "auth_select_properties"
  ON properties FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "auth_insert_property"
  ON properties FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND (SELECT COUNT(*) FROM properties p2 WHERE p2.owner_id = auth.uid()) = 0
  );

CREATE POLICY "auth_update_own_property"
  ON properties FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "auth_delete_own_property"
  ON properties FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);


-- =====================================================
-- REQUESTS
-- Anon: no access
-- Authenticated: SELECT all, INSERT own + 1-per-owner limit, UPDATE/DELETE own
-- =====================================================

CREATE POLICY "auth_select_requests"
  ON requests FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "auth_insert_request"
  ON requests FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = owner_id
    AND (SELECT COUNT(*) FROM requests r2 WHERE r2.owner_id = auth.uid()) = 0
  );

CREATE POLICY "auth_update_own_request"
  ON requests FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "auth_delete_own_request"
  ON requests FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);


-- =====================================================
-- PROVIDERS
-- Anon: no access
-- Authenticated: SELECT all, INSERT own profile, UPDATE own
-- =====================================================

CREATE POLICY "auth_select_providers"
  ON providers FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "auth_insert_own_provider"
  ON providers FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "auth_update_own_provider"
  ON providers FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- =====================================================
-- PROVIDER_OFFERS
-- Note: provider_offers.provider_id → providers.id (NOT users.id directly)
--
-- Anon: no access
-- Authenticated SELECT: provider sees own offers OR owner sees offers on own requests
-- Authenticated INSERT/UPDATE: provider's own offers only
-- =====================================================

CREATE POLICY "auth_select_provider_offers"
  ON provider_offers FOR SELECT TO authenticated
  USING (
    auth.uid() = (SELECT user_id FROM providers WHERE id = provider_id)
    OR
    auth.uid() = (SELECT owner_id FROM requests WHERE id = request_id)
  );

CREATE POLICY "auth_insert_provider_offer"
  ON provider_offers FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM providers WHERE id = provider_id)
  );

CREATE POLICY "auth_update_own_provider_offer"
  ON provider_offers FOR UPDATE TO authenticated
  USING (
    auth.uid() = (SELECT user_id FROM providers WHERE id = provider_id)
  )
  WITH CHECK (
    auth.uid() = (SELECT user_id FROM providers WHERE id = provider_id)
  );


-- =====================================================
-- SESSIONS
-- INSERT/SELECT for session creation done server-side via service role key.
-- Client needs: SELECT own (RequireAuth validation), DELETE own (logout).
-- Anon: no access
-- =====================================================

CREATE POLICY "auth_select_own_session"
  ON sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "auth_delete_own_session"
  ON sessions FOR DELETE TO authenticated
  USING (user_id = auth.uid());
