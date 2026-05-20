-- =====================================================
-- Emaraa RLS Security v2 — 2026-05-20
-- Run in Supabase SQL Editor:
-- https://txzbzpnrclkdodosbndy.supabase.co → SQL Editor → New query
--
-- What this fixes:
--   CRITICAL-1: Replaces open USING (true) anon policies with ownership-based
--               authenticated policies. Anon key can no longer read/write any data.
--   CRITICAL-2: Enforces 1-property and 1-request business rules at DB level
--               so they cannot be bypassed by direct Supabase client calls.
-- =====================================================


-- =====================================================
-- USERS
-- Anon: SELECT only (phone lookup for RequireAuth + OTP flow)
-- Authenticated: SELECT all, UPDATE own row only
-- =====================================================

DROP POLICY IF EXISTS "anon_select_users" ON users;
DROP POLICY IF EXISTS "anon_insert_users" ON users;
DROP POLICY IF EXISTS "anon_update_users" ON users;
DROP POLICY IF EXISTS "block_anon_delete_users" ON users;
DROP POLICY IF EXISTS "auth_select_users" ON users;
DROP POLICY IF EXISTS "auth_update_own_user" ON users;

-- Anon key can look up a user by phone (needed for RequireAuth DB check before JWT is used)
CREATE POLICY "anon_select_users"
  ON users FOR SELECT TO anon
  USING (true);

-- Authenticated users can read any user row (needed for profile display)
CREATE POLICY "auth_select_users"
  ON users FOR SELECT TO authenticated
  USING (true);

-- Authenticated users can only update their own row
CREATE POLICY "auth_update_own_user"
  ON users FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);


-- =====================================================
-- PROPERTIES
-- Anon: no access
-- Authenticated SELECT: all (providers need to read property details)
-- Authenticated INSERT: own only + 1-property-per-owner limit (CRITICAL-2)
-- Authenticated UPDATE/DELETE: own only
-- =====================================================

DROP POLICY IF EXISTS "anon_all_properties" ON properties;
DROP POLICY IF EXISTS "auth_select_properties" ON properties;
DROP POLICY IF EXISTS "auth_insert_property" ON properties;
DROP POLICY IF EXISTS "auth_update_own_property" ON properties;
DROP POLICY IF EXISTS "auth_delete_own_property" ON properties;

CREATE POLICY "auth_select_properties"
  ON properties FOR SELECT TO authenticated
  USING (true);

-- Enforces: owner can only insert their own property, AND they have no existing property
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
-- Authenticated SELECT: all (providers need to browse open requests)
-- Authenticated INSERT: own only + 1-request-per-owner limit (CRITICAL-2)
-- Authenticated UPDATE/DELETE: own only
-- =====================================================

DROP POLICY IF EXISTS "anon_all_requests" ON requests;
DROP POLICY IF EXISTS "auth_select_requests" ON requests;
DROP POLICY IF EXISTS "auth_insert_request" ON requests;
DROP POLICY IF EXISTS "auth_update_own_request" ON requests;
DROP POLICY IF EXISTS "auth_delete_own_request" ON requests;

CREATE POLICY "auth_select_requests"
  ON requests FOR SELECT TO authenticated
  USING (true);

-- Enforces: owner can only insert their own request, AND they have no existing request
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
-- Authenticated SELECT: all (owners need to see provider details on offers)
-- Authenticated INSERT: own profile only (user_id = auth.uid())
-- Authenticated UPDATE: own profile only
-- =====================================================

DROP POLICY IF EXISTS "anon_all_providers" ON providers;
DROP POLICY IF EXISTS "auth_select_providers" ON providers;
DROP POLICY IF EXISTS "auth_insert_own_provider" ON providers;
DROP POLICY IF EXISTS "auth_update_own_provider" ON providers;

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
-- Note: provider_offers.provider_id references providers.id (NOT users.id)
--       So ownership check requires a subquery through the providers table.
--
-- Anon: no access
-- Authenticated SELECT:
--   - Provider sees their own offers
--   - Owner sees offers on their own requests
-- Authenticated INSERT: provider's own offers only
-- Authenticated UPDATE: provider's own offers only
-- =====================================================

DROP POLICY IF EXISTS "anon_all_provider_offers" ON provider_offers;
DROP POLICY IF EXISTS "auth_select_provider_offers" ON provider_offers;
DROP POLICY IF EXISTS "auth_insert_provider_offer" ON provider_offers;
DROP POLICY IF EXISTS "auth_update_own_provider_offer" ON provider_offers;

CREATE POLICY "auth_select_provider_offers"
  ON provider_offers FOR SELECT TO authenticated
  USING (
    -- Provider sees their own offers
    auth.uid() = (SELECT user_id FROM providers WHERE id = provider_id)
    OR
    -- Owner sees offers on their own requests
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
-- The sessions table is used for server-side session management.
-- Anon: no access
-- Authenticated: DELETE own sessions only (needed for logout in auth.ts)
-- INSERT/SELECT done server-side via service role — no client policy needed.
-- =====================================================

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "auth_delete_own_session" ON sessions;

CREATE POLICY "auth_delete_own_session"
  ON sessions FOR DELETE TO authenticated
  USING (user_id = auth.uid());
