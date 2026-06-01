import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Anon client. Only used for the admin session-verify RPC, which runs as the
// anon role. All authenticated data access goes through the Express server
// (supabaseAdmin) — the project uses ES256 JWT signing keys, so the old
// hand-signed HS256 token path was removed.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
