import { Home, Building2, FileText, LogOut, User } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { useLocation } from "wouter";
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
  const { lang } = useLang();
  const [location, setLocation] = useLocation();

  const content = {
    ar: {
      title: "عمارة",
      subtitle: "بوابة إدارة العقارات",
      navigation: "التنقل",
      dashboard: "لوحة التحكم",
      properties: "العقارات",
      requests: "طلبات الخدمة",
      profile: "الملف الشخصي",
      logout: "تسجيل الخروج",
    },
    en: {
      title: "EMARA",
      subtitle: "Property Management Portal",
      navigation: "Navigation",
      dashboard: "Dashboard",
      properties: "Properties",
      requests: "Service Requests",
      profile: "Profile",
      logout: "Logout",
    },
  };

  const t = content[lang];
  const isRTL = lang === "ar";

  const menuItems = [
    { icon: Home, label: t.dashboard, path: "/dashboard" },
    { icon: Building2, label: t.properties, path: "/properties" },
    { icon: FileText, label: t.requests, path: "/requests" },
  ];

  const handleLogout = () => {
    setLocation("/");
  };

  return (
    <Sidebar dir={isRTL ? "rtl" : "ltr"} side={isRTL ? "right" : "left"}>
      <SidebarHeader className="border-b p-4">
        <div
          className={`flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
        >
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <div className={isRTL ? "text-right" : "text-left"}>
            <h2 className="text-lg font-bold">{t.title}</h2>
            <p className="text-xs text-gray-600">{t.subtitle}</p>
          </div>
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
                      className={isRTL ? "flex-row-reverse" : ""}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={() => setLocation("/profile")}
              className={isRTL ? "flex-row-reverse" : ""}
            >
              <User className="h-4 w-4" />
              <span>{t.profile}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              className={`${isRTL ? "flex-row-reverse" : ""} text-red-600 hover:text-red-700 hover:bg-red-50`}
            >
              <LogOut className="h-4 w-4" />
              <span>{t.logout}</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
