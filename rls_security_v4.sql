-- =====================================================
-- Emaraa RLS Security v4 — 2026-05-21
-- Run in Supabase SQL Editor:
-- https://txzbzpnrclkdodosbndy.supabase.co → SQL Editor → New query
--
-- WHY v4: v3 DO $$ block failed (schema-qualified table syntax invalid
-- for DROP POLICY). v4 uses explicit DROP for every policy name confirmed
-- from pg_policies diagnostic. No dynamic SQL, nothing can silently fail.
-- =====================================================


-- =====================================================
-- STEP 1: Drop every known policy by exact name
-- =====================================================

-- properties
DROP POLICY IF EXISTS "Allow all on properties"  ON properties;
DROP POLICY IF EXISTS "anon_all_properties"       ON properties;
DROP POLICY IF EXISTS "prop_del"                  ON properties;
DROP POLICY IF EXISTS "prop_ins"                  ON properties;
DROP POLICY IF EXISTS "prop_sel"                  ON properties;
DROP POLICY IF EXISTS "prop_upd"                  ON properties;
DROP POLICY IF EXISTS "auth_select_properties"    ON properties;
DROP POLICY IF EXISTS "auth_insert_property"      ON properties;
DROP POLICY IF EXISTS "auth_update_own_property"  ON properties;
DROP POLICY IF EXISTS "auth_delete_own_property"  ON properties;

-- requests
DROP POLICY IF EXISTS "Allow all on requests"     ON requests;
DROP POLICY IF EXISTS "anon_all_requests"         ON requests;
DROP POLICY IF EXISTS "req_del"                   ON requests;
DROP POLICY IF EXISTS "req_ins"                   ON requests;
DROP POLICY IF EXISTS "req_sel_owner"             ON requests;
DROP POLICY IF EXISTS "req_sel_provider"          ON requests;
DROP POLICY IF EXISTS "req_upd"                   ON requests;
DROP POLICY IF EXISTS "auth_select_requests"      ON requests;
DROP POLICY IF EXISTS "auth_insert_request"       ON requests;
DROP POLICY IF EXISTS "auth_update_own_request"   ON requests;
DROP POLICY IF EXISTS "auth_delete_own_request"   ON requests;

-- providers
DROP POLICY IF EXISTS "Allow all on providers"    ON providers;
DROP POLICY IF EXISTS "anon_all_providers"        ON providers;
DROP POLICY IF EXISTS "prov_ins"                  ON providers;
DROP POLICY IF EXISTS "prov_sel"                  ON providers;
DROP POLICY IF EXISTS "prov_upd"                  ON providers;
DROP POLICY IF EXISTS "auth_select_providers"     ON providers;
DROP POLICY IF EXISTS "auth_insert_own_provider"  ON providers;
DROP POLICY IF EXISTS "auth_update_own_provider"  ON providers;

-- provider_offers
DROP POLICY IF EXISTS "anon_all_provider_offers"       ON provider_offers;
DROP POLICY IF EXISTS "off_del_prov"                   ON provider_offers;
DROP POLICY IF EXISTS "off_ins_prov"                   ON provider_offers;
DROP POLICY IF EXISTS "off_sel_owner"                  ON provider_offers;
DROP POLICY IF EXISTS "off_sel_prov"                   ON provider_offers;
DROP POLICY IF EXISTS "off_upd_owner"                  ON provider_offers;
DROP POLICY IF EXISTS "auth_select_provider_offers"    ON provider_offers;
DROP POLICY IF EXISTS "auth_insert_provider_offer"     ON provider_offers;
DROP POLICY IF EXISTS "auth_update_own_provider_offer" ON provider_offers;

-- sessions
DROP POLICY IF EXISTS "anon_delete_sessions"      ON sessions;
DROP POLICY IF EXISTS "anon_read_sessions"        ON sessions;
DROP POLICY IF EXISTS "auth_select_own_session"   ON sessions;
DROP POLICY IF EXISTS "auth_delete_own_session"   ON sessions;

-- users
DROP POLICY IF EXISTS "Allow all on users"        ON users;
DROP POLICY IF EXISTS "allow_public_insert"       ON users;
DROP POLICY IF EXISTS "allow_public_select"       ON users;
DROP POLICY IF EXISTS "anon_insert_users"         ON users;
DROP POLICY IF EXISTS "anon_select_users"         ON users;
DROP POLICY IF EXISTS "anon_update_users"         ON users;
DROP POLICY IF EXISTS "block_anon_delete_users"   ON users;
DROP POLICY IF EXISTS "auth_select_users"         ON users;
DROP POLICY IF EXISTS "auth_update_own_user"      ON users;


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
--       INSERT (new user created on first OTP verify)
-- Authenticated: SELECT all, UPDATE own row only
-- =====================================================

CREATE POLICY "anon_select_users"
  ON users FOR SELECT TO anon
  USING (true);

CREATE POLICY "anon_insert_users"
  ON users FOR INSERT TO anon
  WITH CHECK (true);

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
-- provider_offers.provider_id → providers.id (NOT users.id directly)
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
-- INSERT done server-side via service role (bypasses RLS).
-- Client needs: SELECT own (RequireAuth), DELETE own (logout).
-- Anon: no access
-- =====================================================

CREATE POLICY "auth_select_own_session"
  ON sessions FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "auth_delete_own_session"
  ON sessions FOR DELETE TO authenticated
  USING (user_id = auth.uid());
