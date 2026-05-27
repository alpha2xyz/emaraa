import { useEffect, useRef } from "react";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { useLang } from "@/hooks/use-lang";
import { logoutUser } from "@/lib/auth";

const IDLE_TIMEOUT_MS = 30 * 60 * 1000; // 30 minutes
const WARN_BEFORE_MS = 2 * 60 * 1000; // warn 2 minutes before logout

const ACTIVITY_EVENTS = ["mousemove", "mousedown", "keydown", "scroll", "touchstart"] as const;

export function useIdleLogout() {
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { lang } = useLang();

  const logoutTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warnTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dismissWarn = useRef<(() => void) | null>(null);

  useEffect(() => {
    function doLogout() {
      logoutUser(queryClient, setLocation);
    }

    function resetTimers() {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      if (warnTimer.current) clearTimeout(warnTimer.current);
      if (dismissWarn.current) {
        dismissWarn.current();
        dismissWarn.current = null;
      }

      warnTimer.current = setTimeout(() => {
        const { dismiss } = toast({
          title: lang === "ar" ? "ستنتهي جلستك قريباً" : "Session expiring soon",
          description:
            lang === "ar"
              ? "سيتم تسجيل خروجك خلال دقيقتين بسبب عدم النشاط"
              : "You'll be signed out in 2 minutes due to inactivity",
        });
        dismissWarn.current = dismiss;
      }, IDLE_TIMEOUT_MS - WARN_BEFORE_MS);

      logoutTimer.current = setTimeout(doLogout, IDLE_TIMEOUT_MS);
    }

    resetTimers();

    for (const event of ACTIVITY_EVENTS) {
      window.addEventListener(event, resetTimers, { passive: true });
    }

    return () => {
      if (logoutTimer.current) clearTimeout(logoutTimer.current);
      if (warnTimer.current) clearTimeout(warnTimer.current);
      if (dismissWarn.current) dismissWarn.current();
      for (const event of ACTIVITY_EVENTS) {
        window.removeEventListener(event, resetTimers);
      }
    };
  }, [lang, queryClient, setLocation]);
}
