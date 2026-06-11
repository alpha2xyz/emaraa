import { Link, useLocation } from "wouter";
import { useLang } from "@/hooks/use-lang";

const TABS = [
  { href: "/dashboard/provider", labelAr: "لوحة التحكم", labelEn: "Dashboard", exact: true },
  { href: "/dashboard/provider/requests", labelAr: "الطلبات", labelEn: "Requests", exact: false },
];

export function ProviderHeader() {
  const [location] = useLocation();
  const { lang } = useLang();

  return (
    <div
      style={{
        background: "linear-gradient(135deg, #0e3a5c, #193546)",
        borderBottom: "1px solid var(--border)",
        position: "sticky",
        top: 56,
        zIndex: 40,
      }}
    >
      <div style={{ display: "flex" }}>
        {TABS.map(({ href, labelAr, labelEn, exact }) => {
          const active = exact ? location === href : location.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              style={{
                flex: 1,
                textAlign: "center",
                padding: "13px 0",
                fontSize: "14px",
                fontWeight: active ? 800 : 500,
                color: active ? "#FFFFFF" : "rgba(255,255,255,0.62)",
                borderBottom: active ? "2px solid var(--provider)" : "2px solid transparent",
                textDecoration: "none",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {lang === "ar" ? labelAr : labelEn}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
