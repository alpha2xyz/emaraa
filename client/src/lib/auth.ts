import { supabase } from "@/lib/supabase";
import type { QueryClient } from "@tanstack/react-query";

export function logoutUser(queryClient: QueryClient, setLocation: (path: string) => void) {
  const token = localStorage.getItem("sessionToken");
  if (token) {
    supabase
      .from("sessions")
      .delete()
      .eq("token", token)
      .then(() => {});
  }
  supabase.auth.signOut();
  localStorage.removeItem("sessionToken");
  localStorage.removeItem("userId");
  localStorage.removeItem("userPhone");
  localStorage.removeItem("userRole");
  localStorage.removeItem("supabaseToken");
  queryClient.clear();
  setLocation("/");
}
