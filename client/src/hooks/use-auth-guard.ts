import { useEffect } from "react";
import { useLocation } from "wouter";

export function useAuthGuard(requiredRole?: "owner" | "provider") {
  const [, setLocation] = useLocation();

  useEffect(() => {
    const phone = localStorage.getItem("userPhone");
    const role = localStorage.getItem("userRole");

    if (!phone || !role) {
      setLocation(`/auth?role=${requiredRole ?? "owner"}&mode=login`);
      return;
    }

    if (requiredRole && role !== requiredRole) {
      if (role === "owner") setLocation("/dashboard/owner");
      else if (role === "provider") setLocation("/dashboard/provider");
      else setLocation(`/auth?role=${requiredRole}&mode=login`);
    }
  }, [requiredRole, setLocation]);
}
