-- Production has four named foreign keys on `deals` that exist in no earlier migration file —
-- added by hand at some point, the same class of gap 010_rls_policies.sql closed for RLS.
-- Found 2026-09-15 while building the e-signature feature: a demo-env PostgREST embed
-- (`providers!deals_provider_fk(...)`) failed with "Could not find a relationship between
-- 'deals' and 'providers'" because demo-env's deals table, rebuilt from migrations alone, never
-- got these constraints. Any other embed using these names (server/routes.ts:2357, 2479, 2510)
-- was equally broken on demo-env before this — this closes that gap generally, not just for
-- e-signature. Names and ON DELETE behavior copied verbatim from production.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deals_offer_fk'
  ) THEN
    ALTER TABLE public.deals
      ADD CONSTRAINT deals_offer_fk FOREIGN KEY (offer_id) REFERENCES public.provider_offers(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deals_owner_fk'
  ) THEN
    ALTER TABLE public.deals
      ADD CONSTRAINT deals_owner_fk FOREIGN KEY (owner_id) REFERENCES public.users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deals_provider_fk'
  ) THEN
    ALTER TABLE public.deals
      ADD CONSTRAINT deals_provider_fk FOREIGN KEY (provider_id) REFERENCES public.providers(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'deals_request_fk'
  ) THEN
    ALTER TABLE public.deals
      ADD CONSTRAINT deals_request_fk FOREIGN KEY (request_id) REFERENCES public.requests(id) ON DELETE CASCADE;
  END IF;
END $$;
