-- E-signature workflow columns + audit table. All nullable/additive — existing rows untouched.
-- See ~/.claude/plans/fancy-wiggling-blanket.md and _work/esign-workflow-spec-v1.md.
-- Applied to the demo-env Supabase project first; production gets it too since it's a no-op
-- there until ESIGN_ENABLED is ever set (see server/app.ts's boot guard).

ALTER TABLE public.deals
  ADD COLUMN IF NOT EXISTS signature_status text,          -- null|preparing|sent|partially_signed|signed|rejected|expired|voided|failed
  ADD COLUMN IF NOT EXISTS signature_request_id text,
  ADD COLUMN IF NOT EXISTS signature_provider text,         -- 'signit'
  ADD COLUMN IF NOT EXISTS contract_pdf_path text,
  ADD COLUMN IF NOT EXISTS signed_pdf_path text,
  ADD COLUMN IF NOT EXISTS signature_sent_at timestamptz,
  ADD COLUMN IF NOT EXISTS signature_rejected_reason text,
  ADD COLUMN IF NOT EXISTS signature_signatory_ids jsonb;    -- {"owner": "...", "provider": "..."}

ALTER TABLE public.providers
  ADD COLUMN IF NOT EXISTS cr_number text,
  ADD COLUMN IF NOT EXISTS fal_license_number text,
  ADD COLUMN IF NOT EXISTS signatory_name text,
  ADD COLUMN IF NOT EXISTS signatory_contact text,
  ADD COLUMN IF NOT EXISTS signatory_verified_at timestamptz,
  ADD COLUMN IF NOT EXISTS signatory_verification_result jsonb; -- outcome only — never a national ID

CREATE TABLE IF NOT EXISTS public.signature_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  deal_id uuid NOT NULL,
  provider text NOT NULL,
  event_type text NOT NULL,
  payload jsonb,
  received_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_signature_events_deal_id ON public.signature_events (deal_id);

-- No CREATE POLICY: deals, email_log, email_outbox, offer_declines, and
-- admin_impersonation_log are closed to every role but service_role by design
-- (see 010_rls_policies.sql's header comment). signature_events joins that group —
-- nothing reads it through the anon/authenticated Supabase client.
ALTER TABLE public.signature_events ENABLE ROW LEVEL SECURITY;
