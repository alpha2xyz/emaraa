import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { useLang } from "@/hooks/use-lang";
import { Home, Building2, FileText, Settings, User, Send } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();
  const { lang } = useLang();

  if (location === "/" || location === "/auth" || location === "/contact" || location.startsWith("/admin")) return null;

  const isOwner = location.startsWith("/dashboard/owner");
  const isProvider = location.startsWith("/dashboard/provider");

  const ownerLinks = [
    { href: "/dashboard/owner", icon: Home, labelAr: "الرئيسية", labelEn: "Home" },
    { href: "/dashboard/owner/properties", icon: Building2, labelAr: "عقاراتي", labelEn: "Properties" },
    { href: "/dashboard/owner/requests", icon: FileText, labelAr: "طلباتي", labelEn: "Requests" },
    { href: "/dashboard/owner/settings", icon: Settings, labelAr: "الإعدادات", labelEn: "Settings" },
  ];

  const providerLinks = [
    { href: "/dashboard/provider", icon: Home, labelAr: "لوحة التحكم", labelEn: "Dashboard" },
    { href: "/dashboard/provider/requests", icon: FileText, labelAr: "الطلبات", labelEn: "Requests" },
    { href: "/dashboard/provider/offers", icon: Send, labelAr: "عروضي", labelEn: "My Offers" },
    { href: "/dashboard/provider/profile", icon: User, labelAr: "الملف", labelEn: "Profile" },
  ];

  const links = isOwner ? ownerLinks : isProvider ? providerLinks : [];
  if (!links.length) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-safe">
      <div className="flex items-center h-16">
        {links.map(({ href, icon: Icon, labelAr, labelEn }) => {
          const active = href === "/dashboard/owner" || href === "/dashboard/provider"
            ? location === href
            : location.startsWith(href);
          return (
            <div key={href} className="relative flex-1 flex justify-center">
              <AnimatePresence>
                {active && (
                  <motion.div
                    layoutId="nav-blob"
                    className="absolute inset-x-2 top-1.5 bottom-1.5 bg-primary/10 rounded-2xl"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.35 }}
                  />
                )}
              </AnimatePresence>
              <Link href={href}
                className={`relative z-10 flex flex-col items-center gap-1 px-3 py-2 text-xs transition-colors ${active ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                <Icon size={20} />
                <span>{lang === "ar" ? labelAr : labelEn}</span>
              </Link>
            </div>
          );
        })}
      </div>
    </nav>
  );
}
