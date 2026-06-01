import type { QueryClient } from "@tanstack/react-query";

export function logoutUser(queryClient: QueryClient, setLocation: (path: string) => void) {
  const token = localStorage.getItem("sessionToken");
  if (token) {
    // Delete the session server-side (supabaseAdmin bypasses RLS) — fire-and-forget
    fetch("/api/auth/logout", {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  localStorage.removeItem("sessionToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userPhone");
  localStorage.removeItem("userRole");
  localStorage.removeItem("supabaseToken");
  queryClient.clear();
  setLocation("/");
}
