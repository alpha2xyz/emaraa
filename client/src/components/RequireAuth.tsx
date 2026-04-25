import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { supabase } from "@/lib/supabase";

interface RequireAuthProps {
  children: React.ReactNode;
  role?: "owner" | "provider";
}

export default function RequireAuth({ children, role }: RequireAuthProps) {
  const [, setLocation] = useLocation();
  const [verified, setVerified] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    async function verifySession() {
      const phone = localStorage.getItem("userPhone");
      const userRole = localStorage.getItem("userRole");

      if (!phone || !userRole) {
        setLocation(`/auth?role=${role ?? "owner"}`);
        return;
      }

      if (role && userRole !== role) {
        setLocation(`/dashboard/${userRole}`);
        return;
      }

      // Live DB check — verify the phone+role actually exist in the users table
      const { data, error } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .eq("role", userRole)
        .single();

      if (error || !data) {
        localStorage.removeItem("userPhone");
        localStorage.removeItem("userRole");
        setLocation(`/auth?role=${role ?? "owner"}`);
        return;
      }

      setVerified(true);
      setChecking(false);
    }

    verifySession();
  }, [role, setLocation]);

  if (checking || !verified) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground text-sm">جارٍ التحقق…</p>
      </div>
    );
  }

  return <>{children}</>;
}
