import { useEffect } from "react";
import { useLocation } from "wouter";

export function useAdminAuth() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // تحقق من صلاحيات الأدمن
    const isAdmin = localStorage.getItem("isAdmin") === "true";

    if (!isAdmin) {
      setLocation("/auth");
    }
  }, [setLocation]);
}
