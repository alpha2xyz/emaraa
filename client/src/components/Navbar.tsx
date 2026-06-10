import { Link, useLocation } from "wouter";
import { useLang } from "@/hooks/use-lang";
import { queryClient } from "@/lib/queryClient";
import { logoutUser } from "@/lib/auth";
import { Settings, LogOut } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function Navbar() {
  const { lang, setLang } = useLang();
  const [location, setLocation] = useLocation();

  const isLoggedIn = !!localStorage.getItem("userPhone");
  const isAdmin = location.startsWith("/admin");
  if (location === "/" || location === "/auth" || location === "/contact" || isAdmin) return null;

  const userName = localStorage.getItem("userName") || "";
  const userRole = localStorage.getItem("userRole") || "";

  function handleLogout() {
    logoutUser(queryClient, setLocation);
  }

  const settingsHref =
    userRole === "provider" ? "/dashboard/provider/profile" : "/dashboard/owner/settings";

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="font-bold text-lg text-foreground">
          {lang === "ar" ? "عِمارة" : "Emaraa"}
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {/* User name chip + role badge */}
          {isLoggedIn && (
            <div className="flex items-center gap-1.5">
              {userName && (
                <span className="text-sm text-foreground font-medium">{userName}</span>
              )}
              {userRole === "provider" && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: "var(--provider-soft)", color: "#7bb6f0" }}
                >
                  مزود
                </span>
              )}
            </div>
          )}

          {/* Gear icon dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <button className="p-1.5 rounded-lg transition-colors text-muted-foreground hover:text-foreground cursor-pointer">
                <Settings size={18} />
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-48 p-2 rounded-xl shadow-md" align="end">
              {/* Section 1 — Language toggle (compact) */}
              <button
                onClick={() => setLang(lang === "ar" ? "en" : "ar")}
                className="text-sm px-2 py-1.5 rounded-lg hover:bg-white/5 flex items-center gap-2 w-full transition-colors text-foreground"
              >
                <span className="text-base">🌐</span>
                <span>{lang === "ar" ? "English" : "العربية"}</span>
              </button>

              <div className="border-t my-1" />

              {/* Section 2 — Settings link */}
              {isLoggedIn && (
                <Link
                  href={settingsHref}
                  className="text-sm px-2 py-1.5 rounded-lg hover:bg-white/5 flex items-center gap-2 w-full transition-colors text-foreground"
                >
                  <Settings size={15} />
                  الإعدادات
                </Link>
              )}

              <div className="border-t my-1" />

              {/* Section 3 — Sign out */}
              {isLoggedIn && (
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-400 hover:bg-red-500/10 px-2 py-1.5 rounded-lg flex items-center gap-2 w-full transition-colors"
                >
                  <LogOut size={15} />
                  تسجيل الخروج
                </button>
              )}
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  );
}
