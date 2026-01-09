import { Link, useLocation } from "wouter";
import { Building2, FileText, LayoutDashboard, Settings, LogOut, Globe } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { lang, toggleLang } = useLang();
  const [location, setLocation] = useLocation();
  const userRole = localStorage.getItem("userRole");

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2 font-bold text-xl text-blue-600">
          <Building2 className="w-6 h-6" />
          <span>عمارة</span>
        </div>

        {/* الروابط للكمبيوتر فقط */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink href="/dashboard/owner" icon={<LayoutDashboard size={18}/>} label="الرئيسية" active={location === "/dashboard/owner"} />
          <NavLink href="/properties" icon={<Building2 size={18}/>} label="العقارات" active={location === "/properties"} />
          <NavLink href="/requests" icon={<FileText size={18}/>} label="الطلبات" active={location === "/requests"} />
        </div>

        {/* أزرار الإعدادات واللغة */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleLang}>
            <Globe className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setLocation("/settings")}>
            <Settings className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon" className="text-red-500" onClick={() => {
            localStorage.clear();
            setLocation("/");
          }}>
            <LogOut className="w-5 h-5" />
          </Button>
        </div>
      </div>
    </nav>
  );
}

function NavLink({ href, icon, label, active }: any) {
  return (
    <Link href={href}>
      <a className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-blue-600 ${active ? 'text-blue-600' : 'text-gray-500'}`}>
        {icon}
        {label}
      </a>
    </Link>
  );
}