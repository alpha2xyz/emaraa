-- Sprint 1 DB migration — run once in Supabase SQL editor

ALTER TABLE providers ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE providers ADD COLUMN IF NOT EXISTS iban text;

ALTER TABLE provider_offers ADD COLUMN IF NOT EXISTS price_total numeric;

ALTER TABLE properties ADD COLUMN IF NOT EXISTS national_address text;
