// import {
  Home,
  Building2,
  FileText,
  LogOut,
  User,
  Settings,
  Briefcase,
  TrendingUp,
  Globe,
} from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { useLocation } from "wouter";
import { useEffect, useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  const { lang, toggleLang } = useLang();
  const [location, setLocation] = useLocation();
  const [userRole, setUserRole] = useState<string | null>(null);

  // جلب نوع المستخدم من localStorage
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  const content = {
    ar: {
      title: "عمارة",
      subtitle: "بوابة إدارة العقارات",
      navigation: "التنقل",
      dashboard: "لوحة التحكم",
      properties: "العقارات",
      requests: "طلبات الخدمة",
      myServices: "خدماتي",
      providerRequests: "الطلبات",
      profile: "الملف الشخصي",
      settings: "الإعدادات",
      language: "English",
      logout: "تسجيل الخروج",
    },
    en: {
      title: "EMARA",
      subtitle: "Property Management Portal",
      navigation: "Navigation",
      dashboard: "Dashboard",
      properties: "Properties",
      requests: "Service Requests",
      myServices: "My Services",
      providerRequests: "Requests",
      profile: "Profile",
      settings: "Settings",
      language: "العربية",
      logout: "Logout",
    },
  };

  const t = content[lang];
  const isRTL = lang === "ar";

  // قائمة المالك
  const ownerMenuItems = [
    { icon: Home, label: t.dashboard, path: "/dashboard/owner" },
    { icon: Building2, label: t.properties, path: "/properties" },
    { icon: FileText, label: t.requests, path: "/requests" },
  ];

  // قائمة المزود
  const providerMenuItems = [
    { icon: TrendingUp, label: t.dashboard, path: "/dashboard/provider" },
    { icon: Briefcase, label: t.myServices, path: "/provider/services" },
    { icon: FileText, label: t.providerRequests, path: "/provider/requests" },
  ];

  // اختيار القائمة حسب نوع المستخدم
  const menuItems =
    userRole === "provider" ? providerMenuItems : ownerMenuItems;

  const handleLogout = () => {
    localStorage.removeItem("userPhone");
    localStorage.removeItem("userRole");
    setLocation("/");
  };

  return (
    <Sidebar
      side={isRTL ? "right" : "left"}
      collapsible="offcanvas"
      className={isRTL ? "text-right" : "text-left"}
    >
      <SidebarHeader className={`${isRTL ? "items-end" : "items-start"}`}>
        <div
          className={`flex flex-col ${isRTL ? "items-end" : "items-start"} gap-1`}
        >
          <h2 className="text-lg font-bold text-sidebar-foreground">
            {t.title}
          </h2>
          <p className="text-xs text-sidebar-foreground/70">{t.subtitle}</p>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={isRTL ? "text-right" : "text-left"}>
            {t.navigation}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      onClick={() => setLocation(item.path)}
                      isActive={isActive}
                      className={
                        isRTL ? "flex-row-reverse justify-end" : "justify-start"
                      }
                      tooltip={item.label}
                    >
                      <Icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setLocation("/settings")}
              className={
                isRTL ? "flex-row-reverse justify-end" : "justify-start"
              }
            >
              <Settings />
              <span>{t.settings}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={toggleLang}
              className={
                isRTL ? "flex-row-reverse justify-end" : "justify-start"
              }
            >
              <Globe />
              <span>{t.language}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className={
                isRTL ? "flex-row-reverse justify-end" : "justify-start"
              }
            >
              <LogOut />
              <span>{t.logout}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
