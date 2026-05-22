import React, { useEffect, useState } from "react";
import { useLocation } from "wouter";

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
        setLocation(`/auth?role=${role ?? "owner"}&mode=login`);
        return;
      }

      if (role && userRole !== role) {
        setLocation(`/dashboard/${userRole}`);
        return;
      }

      // Validate session token via server (supabaseAdmin bypasses RLS — no JWT dependency)
      const res = await fetch("/api/session/verify", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) {
        localStorage.removeItem("sessionToken");
        localStorage.removeItem("userId");
        localStorage.removeItem("userPhone");
        localStorage.removeItem("userRole");
        localStorage.removeItem("userName");
        localStorage.removeItem("supabaseToken");
        setLocation(`/auth?role=${role ?? "owner"}&mode=login`);
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
