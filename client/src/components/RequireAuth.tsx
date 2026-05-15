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
      const token = localStorage.getItem("sessionToken");
      const userRole = localStorage.getItem("userRole");

      if (!token || !userRole) {
        setLocation(`/auth?role=${role ?? "owner"}`);
        return;
      }

      if (role && userRole !== role) {
        setLocation(`/dashboard/${userRole}`);
        return;
      }

      // Validate session token against DB
      const { data, error } = await supabase
        .from("sessions")
        .select("user_id, expires_at")
        .eq("token", token)
        .single();

      if (error || !data || new Date(data.expires_at) < new Date()) {
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userPhone");
        localStorage.removeItem("userRole");
        setLocation(`/auth?role=${role ?? "owner"}`);
        return;
      }

      setChecking(false);
      setVerified(true);
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
