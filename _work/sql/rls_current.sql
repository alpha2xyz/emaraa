-- ============================================================
-- EMARAA — CANONICAL RLS POLICY STATE
-- Update this file every time policies change.
-- Apply via: Supabase Dashboard → SQL Editor → New Query
-- Last updated: 2026-05-22
-- ============================================================

-- ── USERS ────────────────────────────────────────────────────
-- anon: NO access (S1 fix applied 2026-05-22)
-- authenticated: can SELECT all rows (needed: forms look up user by phone)
-- authenticated: can UPDATE own row only

DROP POLICY IF EXISTS anon_select_users    ON users;
DROP POLICY IF EXISTS auth_select_users    ON users;
DROP POLICY IF EXISTS auth_update_users    ON users;

CREATE POLICY auth_select_users ON users
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY auth_update_users ON users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ── PROPERTIES ───────────────────────────────────────────────
-- authenticated owner: full CRUD on own rows only

DROP POLICY IF EXISTS owner_select_properties ON properties;
DROP POLICY IF EXISTS owner_insert_properties  ON properties;
DROP POLICY IF EXISTS owner_update_properties  ON properties;
DROP POLICY IF EXISTS owner_delete_properties  ON properties;

CREATE POLICY owner_select_properties ON properties
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY owner_insert_properties ON properties
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY owner_update_properties ON properties
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY owner_delete_properties ON properties
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- ── REQUESTS ─────────────────────────────────────────────────
-- authenticated owner: full CRUD on own rows only
-- authenticated provider: SELECT only (to browse open requests)

DROP POLICY IF EXISTS owner_select_requests    ON requests;
DROP POLICY IF EXISTS owner_insert_requests    ON requests;
DROP POLICY IF EXISTS owner_update_requests    ON requests;
DROP POLICY IF EXISTS owner_delete_requests    ON requests;
DROP POLICY IF EXISTS provider_select_requests ON requests;

CREATE POLICY owner_select_requests ON requests
  FOR SELECT TO authenticated
  USING (auth.uid() = owner_id);

CREATE POLICY owner_insert_requests ON requests
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY owner_update_requests ON requests
  FOR UPDATE TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY owner_delete_requests ON requests
  FOR DELETE TO authenticated
  USING (auth.uid() = owner_id);

-- Providers can browse all pending requests
CREATE POLICY provider_select_requests ON requests
  FOR SELECT TO authenticated
  USING (
    status = 'pending'
    OR auth.uid() = owner_id
  );

-- ── PROVIDERS ────────────────────────────────────────────────
-- authenticated: SELECT own row only (IBAN privacy — S2 fix)
-- authenticated owner with an offer: SELECT that provider's row
-- authenticated: INSERT/UPDATE/DELETE own row

DROP POLICY IF EXISTS auth_select_providers         ON providers;
DROP POLICY IF EXISTS auth_select_providers_own     ON providers;
DROP POLICY IF EXISTS auth_select_providers_offered ON providers;
DROP POLICY IF EXISTS provider_insert               ON providers;
DROP POLICY IF EXISTS provider_update               ON providers;
DROP POLICY IF EXISTS provider_delete               ON providers;

-- Own row
CREATE POLICY auth_select_providers_own ON providers
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- Owner who received an offer can see that provider's profile
CREATE POLICY auth_select_providers_offered ON providers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM provider_offers po
        JOIN requests r ON r.id = po.request_id
       WHERE po.provider_id = providers.id
         AND r.owner_id = auth.uid()
    )
  );

CREATE POLICY provider_insert ON providers
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY provider_update ON providers
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY provider_delete ON providers
  FOR DELETE TO authenticated
  USING (auth.uid() = id);

-- ── PROVIDER_OFFERS ──────────────────────────────────────────
-- provider: full CRUD on own offers
-- owner: SELECT offers on their own requests

DROP POLICY IF EXISTS provider_manage_offers ON provider_offers;
DROP POLICY IF EXISTS owner_view_offers      ON provider_offers;

CREATE POLICY provider_manage_offers ON provider_offers
  FOR ALL TO authenticated
  USING (auth.uid() = provider_id)
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY owner_view_offers ON provider_offers
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM requests r
       WHERE r.id = provider_offers.request_id
         AND r.owner_id = auth.uid()
    )
  );

-- ── SESSIONS ─────────────────────────────────────────────────
-- Managed entirely by server (supabaseAdmin). No client-side access needed.
-- RLS enabled but no client policies — all access via service role.

-- ── VERIFICATION ─────────────────────────────────────────────
-- Run this after applying to confirm policies are active:
--
-- SELECT tablename, policyname, roles, cmd
-- FROM pg_policies
-- WHERE tablename IN ('users','properties','requests','providers','provider_offers')
-- ORDER BY tablename, policyname;
