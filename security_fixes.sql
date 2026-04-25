-- =====================================================
-- Emaraa Security Fixes — Run in Supabase SQL Editor
-- =====================================================

-- 1. Add session token columns to admins table
ALTER TABLE admins ADD COLUMN IF NOT EXISTS session_token TEXT;
ALTER TABLE admins ADD COLUMN IF NOT EXISTS session_expires_at TIMESTAMPTZ;

-- 2. RPC: create_admin_session
--    Called after successful login — generates a UUID token, stores it with 24h expiry
CREATE OR REPLACE FUNCTION create_admin_session(p_admin_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_token TEXT;
BEGIN
  v_token := gen_random_uuid()::TEXT;
  UPDATE admins
  SET session_token = v_token,
      session_expires_at = NOW() + INTERVAL '24 hours'
  WHERE id = p_admin_id;
  RETURN v_token;
END;
$$;

-- 3. RPC: verify_admin_session
--    Returns true only if the token exists and has not expired
CREATE OR REPLACE FUNCTION verify_admin_session(p_token TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admins
    WHERE session_token = p_token
      AND session_expires_at > NOW()
  );
END;
$$;

-- 4. RLS on admins table — block all direct access from anon key
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "block_anon_admins" ON admins;
CREATE POLICY "block_anon_admins"
  ON admins FOR ALL TO anon
  USING (false)
  WITH CHECK (false);

-- 5. RLS on users — allow read/insert (needed for login/register), block delete
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_users" ON users;
CREATE POLICY "anon_select_users" ON users FOR SELECT TO anon USING (true);

DROP POLICY IF EXISTS "anon_insert_users" ON users;
CREATE POLICY "anon_insert_users" ON users FOR INSERT TO anon WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_users" ON users;
CREATE POLICY "anon_update_users" ON users FOR UPDATE TO anon USING (true);

DROP POLICY IF EXISTS "block_anon_delete_users" ON users;
CREATE POLICY "block_anon_delete_users" ON users FOR DELETE TO anon USING (false);

-- 6. RLS on properties
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_properties" ON properties;
CREATE POLICY "anon_all_properties" ON properties FOR ALL TO anon USING (true) WITH CHECK (true);

-- 7. RLS on requests
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_requests" ON requests;
CREATE POLICY "anon_all_requests" ON requests FOR ALL TO anon USING (true) WITH CHECK (true);

-- 8. RLS on providers
ALTER TABLE providers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_providers" ON providers;
CREATE POLICY "anon_all_providers" ON providers FOR ALL TO anon USING (true) WITH CHECK (true);

-- 9. RLS on provider_offers
ALTER TABLE provider_offers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_all_provider_offers" ON provider_offers;
CREATE POLICY "anon_all_provider_offers" ON provider_offers FOR ALL TO anon USING (true) WITH CHECK (true);
