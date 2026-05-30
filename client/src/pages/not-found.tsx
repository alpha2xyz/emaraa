import { SearchX } from "lucide-react";
import { Link } from "wouter";
import { useLang } from "@/hooks/use-lang";

export default function NotFound() {
  const { lang } = useLang();
  const isRTL = lang === "ar";

  return (
    <div className="min-h-screen bg-[#F9F9FF]" dir={isRTL ? "rtl" : "ltr"}>
      {/* Header strip */}
      <div
        style={{ background: "linear-gradient(135deg, #2E4A6B, #243A56)" }}
        className="text-white py-6 px-4 flex items-center justify-between"
        dir="rtl"
      >
        <p className="font-bold text-xl">عِمارة</p>
        <p
          className="font-extrabold"
          style={{ fontSize: "2.5rem", lineHeight: 1, opacity: 0.9 }}
        >
          ٤٠٤
        </p>
      </div>

      {/* Card */}
      <div className="max-w-md mx-auto mt-8 px-4">
        <div className="bg-white rounded-xl border border-[#DDE4EE] shadow-sm p-10 text-center">
          <SearchX
            style={{ color: "#2E4A6B" }}
            className="mx-auto mb-5"
            size={64}
            strokeWidth={1.5}
          />
          <h1 className="text-xl font-bold mb-2" style={{ color: "#2E4A6B" }}>
            الصفحة غير موجودة
          </h1>
          <p className="text-sm text-gray-500 mb-1">
            لم نتمكن من العثور على الصفحة التي تبحث عنها
          </p>
          <p className="text-xs text-gray-400 mb-6">Page not found</p>
          <Link href="/">
            <button
              className="text-white font-semibold px-6 py-3 rounded-xl transition-opacity hover:opacity-90"
              style={{ background: "#2E4A6B" }}
            >
              العودة للرئيسية
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
