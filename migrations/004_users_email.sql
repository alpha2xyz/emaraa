-- Owner opt-in email for request notifications (2026-06-18)
-- Additive, nullable — safe. Owners provide this at onboarding/settings to receive
-- emails about their requests (request created, new offer, offer accepted).
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS email text;
