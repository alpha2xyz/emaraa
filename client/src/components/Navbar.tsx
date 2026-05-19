import { Link, useLocation } from "wouter";
import { useLang } from "@/hooks/use-lang";
import { LanguageToggle } from "@/components/LanguageToggle";
import { queryClient } from "@/lib/queryClient";
import { logoutUser } from "@/lib/auth";

export function Navbar() {
  const { lang } = useLang();
  const [location, setLocation] = useLocation();

  const isLoggedIn = !!localStorage.getItem("userPhone");
  const isAdmin = location.startsWith("/admin");
  if (location === "/" || location === "/auth" || location === "/contact" || isAdmin) return null;

  function handleLogout() {
    logoutUser(queryClient, setLocation);
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold text-lg text-primary">
          {lang === "ar" ? "عمارة" : "Emaraa"}
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          {isLoggedIn && (
            <button
              onClick={handleLogout}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {lang === "ar" ? "خروج" : "Sign out"}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
