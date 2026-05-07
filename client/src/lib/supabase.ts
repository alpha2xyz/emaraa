import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string,
);

// Restore Supabase auth session from stored JWT so RLS auth.uid() works
const _st = localStorage.getItem("supabaseToken");
if (_st) {
  supabase.auth.setSession({ access_token: _st, refresh_token: _st });
}
