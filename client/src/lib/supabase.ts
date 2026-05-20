import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

// Custom fetch injects the JWT on every request so queries run as the
// 'authenticated' PostgreSQL role and auth.uid() returns the correct user UUID.
// Reading localStorage at request time means login/logout take effect immediately
// without needing to recreate the client or reload the page.
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
  global: {
    fetch: (url, options = {}) => {
      const token = localStorage.getItem("supabaseToken");
      if (token) {
        const headers = new Headers(options.headers as HeadersInit);
        headers.set("Authorization", `Bearer ${token}`);
        return fetch(url, { ...options, headers });
      }
      return fetch(url, options);
    },
  },
});
