import { SearchX, Globe } from "lucide-react";
import { Link } from "wouter";
import { useLang } from "@/hooks/use-lang";

export default function NotFound() {
  const { lang, setLang } = useLang();
  const isRTL = lang === "ar";

  return (
    <div className="min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header strip */}
      <div
        style={{ background: "linear-gradient(135deg, #0f3a47, #193546)", borderBottom: "2px solid var(--owner)" }}
        className="text-white py-6 px-4 flex items-center justify-between"
        dir="rtl"
      >
        <p className="font-bold text-xl">عِمارة</p>
        <div className="flex items-center gap-3">
          <p className="font-extrabold" style={{ fontSize: "2.5rem", lineHeight: 1, opacity: 0.9 }}>٤٠٤</p>
          <button
            onClick={() => setLang(lang === "ar" ? "en" : "ar")}
            className="flex items-center gap-1 text-xs font-semibold rounded-full px-3 py-1"
            style={{ background: "rgba(255,255,255,0.15)", color: "white" }}
          >
            <Globe className="w-3.5 h-3.5" />
            {lang === "ar" ? "EN" : "ع"}
          </button>
        </div>
      </div>

      {/* Card */}
      <div className="max-w-md mx-auto mt-8 px-4">
        <div className="bg-card rounded-xl border border-border shadow-sm p-10 text-center">
          <SearchX
            style={{ color: "var(--owner)" }}
            className="mx-auto mb-5"
            size={64}
            strokeWidth={1.5}
          />
          <h1 className="text-xl font-bold mb-2" style={{ color: "var(--owner)" }}>
            الصفحة غير موجودة
          </h1>
          <p className="text-sm text-muted-foreground mb-1">
            لم نتمكن من العثور على الصفحة التي تبحث عنها
          </p>
          <p className="text-xs text-muted-foreground mb-6">Page not found</p>
          <Link href="/">
            <button
              className="font-semibold px-6 py-3 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: "var(--owner)", color: "#04222c" }}
            >
              العودة للرئيسية
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
