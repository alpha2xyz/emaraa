-- Run this in Supabase Dashboard → SQL Editor

CREATE TABLE IF NOT EXISTS provider_offers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id UUID REFERENCES requests(id) ON DELETE CASCADE,
  provider_id UUID REFERENCES providers(id) ON DELETE CASCADE,
  offer_file_url TEXT,
  notes TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(request_id, provider_id)
);

ALTER TABLE provider_offers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all on provider_offers" ON provider_offers
  FOR ALL USING (true) WITH CHECK (true);
