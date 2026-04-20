import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { Link } from "wouter";
import { useLang } from "@/hooks/use-lang";

export default function NotFound() {
  const { lang } = useLang();
  const t = lang === "ar"
    ? { title: "الصفحة غير موجودة", desc: "عذراً، الصفحة التي تبحث عنها غير موجودة.", back: "العودة للرئيسية" }
    : { title: "404 - Page Not Found", desc: "Sorry, the page you are looking for does not exist.", back: "Back to Home" };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      <Card className="w-full max-w-md mx-4">
        <CardContent className="pt-6 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t.title}</h1>
          <p className="text-sm text-gray-600 mb-6">{t.desc}</p>
          <Link href="/">
            <button className="text-sm text-blue-600 hover:underline">{t.back}</button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
