import { Link, useLocation } from "wouter";
import {
  LayoutDashboard,
  Building2,
  FileText,
  User,
  Package,
} from "lucide-react";
import { useLang } from "@/hooks/use-lang";

export function BottomNav() {
  const [location] = useLocation();
  const { lang } = useLang();
  const userRole = localStorage.getItem("userRole");

  const navItems = userRole === "owner" 
    ? [
        {
          href: "/dashboard/owner",
          icon: LayoutDashboard,
          label: { ar: "الرئيسية", en: "Dashboard" },
        },
        {
          href: "/dashboard/owner/properties",
          icon: Building2,
          label: { ar: "العقارات", en: "Properties" },
        },
        {
          href: "/dashboard/owner/requests",
          icon: FileText,
          label: { ar: "الطلبات", en: "Requests" },
        },
      ]
    : [
        {
          href: "/dashboard/provider",
          icon: LayoutDashboard,
          label: { ar: "الرئيسية", en: "Dashboard" },
        },
        {
          href: "/dashboard/provider/requests",
          icon: Package,
          label: { ar: "الطلبات", en: "Requests" },
        },
        {
          href: "/dashboard/provider/profile",
          icon: User,
          label: { ar: "الملف", en: "Profile" },
        },
      ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background md:hidden"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;

          return (
            <Link key={item.href} href={item.href}>
              <a
                className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-colors ${
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? "fill-primary" : ""}`} />
                <span className="text-xs font-medium">
                  {item.label[lang]}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
