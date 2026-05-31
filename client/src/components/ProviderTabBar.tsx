import { Link, useLocation } from "wouter";
import { useLang } from "@/hooks/use-lang";

export function ProviderTabBar() {
  const [location] = useLocation();
  const { lang } = useLang();

  if (!location.startsWith("/dashboard/provider")) return null;
  if (location.includes("/requests/") && location.endsWith("/offer")) return null;

  const tabs = [
    { href: "/dashboard/provider", labelAr: "لوحة التحكم", labelEn: "Dashboard", exact: true },
    { href: "/dashboard/provider/requests", labelAr: "الطلبات", labelEn: "Requests", exact: false },
    { href: "/dashboard/provider/profile", labelAr: "الملف", labelEn: "Profile", exact: false },
  ];

  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderBottom: "1px solid #E5E7EB",
        display: "flex",
        position: "sticky",
        top: 56,
        zIndex: 40,
      }}
    >
      {tabs.map(({ href, labelAr, labelEn, exact }) => {
        const active = exact ? location === href : location.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            style={{
              flex: 1,
              textAlign: "center",
              padding: "12px 0",
              fontSize: "14px",
              fontWeight: active ? 700 : 400,
              color: active ? "#0E7C66" : "#6B7280",
              borderBottom: active ? "2px solid #0E7C66" : "2px solid transparent",
              textDecoration: "none",
              transition: "color 0.15s, border-color 0.15s",
            }}
          >
            {lang === "ar" ? labelAr : labelEn}
          </Link>
        );
      })}
    </div>
  );
}
