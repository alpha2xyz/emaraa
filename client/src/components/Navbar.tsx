import { Link, useLocation } from "wouter";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";

export function Navbar() {
  const { lang, setLang } = useLang();
  const [location] = useLocation();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user ?? null));
  }, []);

  const isRTL = lang === "ar";
  const isAdmin = location.startsWith("/admin");
  if (location === "/" || location === "/auth" || location === "/contact" || isAdmin) return null;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
      <div className="container flex h-14 items-center justify-between px-4">
        <Link href="/" className="font-bold text-lg text-primary">
          {lang === "ar" ? "عمارة" : "Emaraa"}
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="text-sm px-3 py-1 rounded border hover:bg-accent transition-colors"
          >
            {lang === "ar" ? "EN" : "عربي"}
          </button>
          {user && (
            <button
              onClick={() => supabase.auth.signOut()}
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
