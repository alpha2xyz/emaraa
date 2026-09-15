-- 010_rls_policies.sql
-- Row Level Security policies, captured from production (project txzbzpnrclkdodosbndy)
-- on 2026-09-15 via a read-only pg_policies query.
--
-- Why this file exists: migrations 006 and 007 run ENABLE ROW LEVEL SECURITY, but no
-- CREATE POLICY statement existed anywhere in the repo -- the policies lived only inside
-- the one live database. A fresh project rebuilt from migrations/ therefore had RLS on
-- and nothing allowed. This file closes that gap (TODO.md:150) and is what makes an
-- isolated demo project reproducible.
--
-- Idempotent: every policy is dropped before it is created. Safe to re-run.
--
-- Note on the model: Emaraa does NOT use Supabase Auth. Sessions live in public.sessions
-- and the Express API talks to Postgres with the service-role key, which bypasses RLS.
-- These policies are therefore the deny-by-default floor for the anon and authenticated
-- roles, not the app's primary authorisation. Tables with RLS enabled and no policy below
-- (deals, email_log, email_outbox, offer_declines, admin_impersonation_log) are closed to
-- every role except service_role, deliberately.

-- ── Functions the policies below depend on ────────────────────────────────────
--
-- Added 2026-09-15. These existed only inside the live database, like the policies
-- themselves. current_provider_id(), owns_request() and provider_offered_to_me()
-- are called directly by the RLS policies, so the policies cannot be created
-- without them; the update_*/prevent_* ones back triggers. Captured verbatim from
-- production with pg_get_functiondef.
--
-- CREATE OR REPLACE, so re-running against a database that already has them is a
-- no-op.

CREATE OR REPLACE FUNCTION public.create_admin_session(p_admin_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
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
$function$
;

CREATE OR REPLACE FUNCTION public.current_provider_id()
 RETURNS uuid
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select id from public.providers where user_id = auth.uid() limit 1;
$function$
;

CREATE OR REPLACE FUNCTION public.owns_request(p_request_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1 from public.requests
    where id = p_request_id and owner_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.prevent_self_approval()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$                               
  BEGIN                                                     
    IF NEW.approved IS DISTINCT FROM OLD.approved                                       
       AND current_user = 'anon' THEN
      RAISE EXCEPTION 'Cannot modify approved status';                                  
    END IF;                                                 
    RETURN NEW;                                                                         
  END;                                                                                  
  $function$
;

CREATE OR REPLACE FUNCTION public.provider_offered_to_me(p_provider_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  select exists (
    select 1
    from public.provider_offers po
    join public.requests r on r.id = po.request_id
    where po.provider_id = p_provider_id
      and r.owner_id = auth.uid()
  );
$function$
;

CREATE OR REPLACE FUNCTION public.update_provider_offers_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;

-- Enable RLS on every table (idempotent, matches production).
ALTER TABLE public.admin_impersonation_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_outbox ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offer_declines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.otp_rate_limits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.provider_offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;


-- ---------- admin_login_attempts ----------
DROP POLICY IF EXISTS "block_anon_admin_login_attempts" ON public.admin_login_attempts;
CREATE POLICY "block_anon_admin_login_attempts" ON public.admin_login_attempts
  AS PERMISSIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ---------- admins ----------
DROP POLICY IF EXISTS "block_anon_admins" ON public.admins;
CREATE POLICY "block_anon_admins" ON public.admins
  AS PERMISSIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);

-- ---------- otp_rate_limits ----------
DROP POLICY IF EXISTS "block_anon_otp_rate_limits" ON public.otp_rate_limits;
CREATE POLICY "block_anon_otp_rate_limits" ON public.otp_rate_limits
  AS RESTRICTIVE
  FOR ALL
  TO anon
  USING (false)
  WITH CHECK (false);
DROP POLICY IF EXISTS "server_only" ON public.otp_rate_limits;
CREATE POLICY "server_only" ON public.otp_rate_limits
  AS PERMISSIVE
  FOR ALL
  TO public
  USING (true)
  WITH CHECK (true);

-- ---------- properties ----------
DROP POLICY IF EXISTS "owner_delete_properties" ON public.properties;
CREATE POLICY "owner_delete_properties" ON public.properties
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING ((auth.uid() = owner_id));
DROP POLICY IF EXISTS "owner_insert_properties" ON public.properties;
CREATE POLICY "owner_insert_properties" ON public.properties
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = owner_id));
DROP POLICY IF EXISTS "owner_select_properties" ON public.properties;
CREATE POLICY "owner_select_properties" ON public.properties
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = owner_id));
DROP POLICY IF EXISTS "owner_update_properties" ON public.properties;
CREATE POLICY "owner_update_properties" ON public.properties
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = owner_id))
  WITH CHECK ((auth.uid() = owner_id));

-- ---------- provider_offers ----------
DROP POLICY IF EXISTS "offers_insert" ON public.provider_offers;
CREATE POLICY "offers_insert" ON public.provider_offers
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK ((provider_id = current_provider_id()));
DROP POLICY IF EXISTS "offers_select" ON public.provider_offers;
CREATE POLICY "offers_select" ON public.provider_offers
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((owns_request(request_id) OR (provider_id = current_provider_id())));
DROP POLICY IF EXISTS "offers_update" ON public.provider_offers;
CREATE POLICY "offers_update" ON public.provider_offers
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING ((provider_id = current_provider_id()))
  WITH CHECK ((provider_id = current_provider_id()));

-- ---------- providers ----------
DROP POLICY IF EXISTS "providers_insert" ON public.providers;
CREATE POLICY "providers_insert" ON public.providers
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK ((user_id = auth.uid()));
DROP POLICY IF EXISTS "providers_select" ON public.providers;
CREATE POLICY "providers_select" ON public.providers
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (((user_id = auth.uid()) OR provider_offered_to_me(id)));
DROP POLICY IF EXISTS "providers_update" ON public.providers;
CREATE POLICY "providers_update" ON public.providers
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING ((user_id = auth.uid()))
  WITH CHECK ((user_id = auth.uid()));

-- ---------- requests ----------
DROP POLICY IF EXISTS "owner_delete_requests" ON public.requests;
CREATE POLICY "owner_delete_requests" ON public.requests
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING ((auth.uid() = owner_id));
DROP POLICY IF EXISTS "owner_insert_requests" ON public.requests;
CREATE POLICY "owner_insert_requests" ON public.requests
  AS PERMISSIVE
  FOR INSERT
  TO authenticated
  WITH CHECK ((auth.uid() = owner_id));
DROP POLICY IF EXISTS "owner_select_requests" ON public.requests;
CREATE POLICY "owner_select_requests" ON public.requests
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = owner_id));
DROP POLICY IF EXISTS "owner_update_requests" ON public.requests;
CREATE POLICY "owner_update_requests" ON public.requests
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = owner_id))
  WITH CHECK ((auth.uid() = owner_id));
DROP POLICY IF EXISTS "provider_select_requests" ON public.requests;
CREATE POLICY "provider_select_requests" ON public.requests
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING (((status = 'pending'::text) OR (auth.uid() = owner_id)));

-- ---------- sessions ----------
DROP POLICY IF EXISTS "auth_delete_own_session" ON public.sessions;
CREATE POLICY "auth_delete_own_session" ON public.sessions
  AS PERMISSIVE
  FOR DELETE
  TO authenticated
  USING ((user_id = auth.uid()));
DROP POLICY IF EXISTS "auth_select_own_session" ON public.sessions;
CREATE POLICY "auth_select_own_session" ON public.sessions
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((user_id = auth.uid()));

-- ---------- users ----------
DROP POLICY IF EXISTS "auth_update_own_user" ON public.users;
CREATE POLICY "auth_update_own_user" ON public.users
  AS PERMISSIVE
  FOR UPDATE
  TO authenticated
  USING ((auth.uid() = id))
  WITH CHECK ((auth.uid() = id));
DROP POLICY IF EXISTS "self_select_users" ON public.users;
CREATE POLICY "self_select_users" ON public.users
  AS PERMISSIVE
  FOR SELECT
  TO authenticated
  USING ((auth.uid() = id));
