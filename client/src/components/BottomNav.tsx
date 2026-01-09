import { Link, useLocation } from "wouter";
import { Building2, FileText, LayoutDashboard, Settings } from "lucide-react";

export function BottomNav() {
  const [location] = useLocation();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur-sm px-4 py-2 flex justify-around items-center z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
      <TabItem
        href="/dashboard/owner"
        icon={<LayoutDashboard size={20} />}
        label="الرئيسية"
        active={location === "/dashboard/owner"}
      />
      <TabItem
        href="/properties"
        icon={<Building2 size={20} />}
        label="عقاراتي"
        active={location === "/properties"}
      />
      <TabItem
        href="/requests"
        icon={<FileText size={20} />}
        label="طلباتي"
        active={location === "/requests"}
      />
      <TabItem
        href="/settings"
        icon={<Settings size={20} />}
        label="إعدادات"
        active={location === "/settings"}
      />
    </div>
  );
}

function TabItem({ href, icon, label, active }: any) {
  return (
    <Link href={href}>
      <a
        className={`flex flex-col items-center justify-center transition-colors ${
          active ? "text-blue-600" : "text-gray-400"
        }`}
      >
        <div
          className={`${active ? "scale-110" : "scale-100"} transition-transform`}
        >
          {icon}
        </div>
        <span className="text-[10px] md:text-xs font-medium mt-1 leading-none">
          {label}
        </span>
      </a>
    </Link>
  );
}
