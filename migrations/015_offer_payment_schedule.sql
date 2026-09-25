-- Purpose: add the provider-chosen payment schedule to an offer. Abdallah's decision
-- 2026-09-26: every new offer must declare how often the owner pays across the
-- contract term — exactly one of quarterly (every 3 months), semiannual (every 6
-- months), or annual (once a year). The owner sees the value on the submitted
-- offer; it is later printed as checkboxes in the e-signed contract.
--
-- Date: 2026-09-26.
-- Run on production before merging offer-pdf-required (this branch requires the
-- column server-side). 014 is taken by another branch, so this is 015.
--
-- Nullable so old offers are unaffected — the column is NOT NULL nowhere; every
-- existing provider_offers row keeps payment_schedule = NULL and stays valid.
-- The app layer (Zod) makes it mandatory going forward for new/revived offers.

ALTER TABLE public.provider_offers
  ADD COLUMN IF NOT EXISTS payment_schedule text;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'provider_offers_payment_schedule_check'
  ) THEN
    ALTER TABLE public.provider_offers
      ADD CONSTRAINT provider_offers_payment_schedule_check
      CHECK (payment_schedule IS NULL OR payment_schedule IN ('quarterly', 'semiannual', 'annual'));
  END IF;
END $$;
