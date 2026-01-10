import { useLocation } from "wouter";
import {
  LayoutDashboard,
  Building2,
  FileText,
  User,
  LogOut,
  ArrowLeft,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";

import { useLang } from "@/hooks/use-lang";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const { lang, toggleLang } = useLang();
  const userRole = localStorage.getItem("userRole");

  const content = {
    ar: {
      appName: "عِمارة",
      dashboard: "الرئيسية",
      properties: "العقارات",
      requests: "الطلبات",
      providerRequests: "الطلبات المتاحة",
      profile: "الملف الشخصي",
      settings: "الإعدادات",
      logout: "خروج",
      back: "رجوع",
    },
    en: {
      appName: "Emaraa",
      dashboard: "Dashboard",
      properties: "Properties",
      requests: "Requests",
      providerRequests: "Available Requests",
      profile: "Profile",
      settings: "Settings",
      logout: "Logout",
      back: "Back",
    },
  };

  const t = content[lang];

  // تحديد الروابط حسب نوع المستخدم
  const navItems = userRole === "owner"
    ? [
        {
          href: "/dashboard/owner",
          icon: LayoutDashboard,
          label: t.dashboard,
        },
        {
          href: "/dashboard/owner/properties",
          icon: Building2,
          label: t.properties,
        },
        {
          href: "/dashboard/owner/requests",
          icon: FileText,
          label: t.requests,
        },
      ]
    : [
        {
          href: "/dashboard/provider",
          icon: LayoutDashboard,
          label: t.dashboard,
        },
        {
          href: "/dashboard/provider/requests",
          icon: Package,
          label: t.providerRequests,
        },
        {
          href: "/dashboard/provider/profile",
          icon: User,
          label: t.profile,
        },
      ];

  const dashboardPath = userRole === "owner" 
    ? "/dashboard/owner" 
    : "/dashboard/provider";

  // تحديد متى يظهر زر الرجوع
  const showBackButton =
    location !== dashboardPath &&
    (location.startsWith("/dashboard/owner") ||
     location.startsWith("/dashboard/provider"));

  // تحديد وجهة زر الرجوع
  const getBackPath = () => {
    if (location.includes("/offer")) {
      return `${dashboardPath}/requests`;
    }
    if (location.includes("/properties/") || location.includes("/requests/")) {
      const basePath = location.includes("/properties/") 
        ? "/dashboard/owner/properties"
        : `${dashboardPath}/requests`;
      return basePath;
    }
    return dashboardPath;
  };

  const handleLogout = () => {
    localStorage.clear();
    setLocation("/auth");
  };

  return (
    <nav
      className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Left/Right - Back Button or Logo */}
          <div className="flex items-center gap-4">
            {showBackButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLocation(getBackPath())}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">{t.back}</span>
              </Button>
            )}
            
            <button
              onClick={() => setLocation(dashboardPath)}
              className="text-xl font-bold hover:text-primary transition-colors"
            >
              {t.appName}
            </button>
          </div>

          {/* Center - Navigation Links (Desktop Only) */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.href;

              return (
                <Button
                  key={item.href}
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  onClick={() => setLocation(item.href)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Right/Left - Actions */}
          <div className="flex items-center gap-2">

            {/* Language Toggle */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLang}
              className="text-xs font-bold min-w-[40px]"
            >
              {lang === "ar" ? "EN" : "ع"}
            </Button>

            {/* Logout */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden lg:inline ms-2">{t.logout}</span>
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
