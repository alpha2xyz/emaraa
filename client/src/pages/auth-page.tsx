import { useState } from "react";
import { useLang } from "@/hooks/use-lang";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function AuthPage() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });

  // جلب role و mode من URL
  const urlParams = new URLSearchParams(window.location.search);
  const role = urlParams.get("role") || "owner";
  const urlMode = urlParams.get("mode");
  const [mode, setMode] = useState<"login" | "register">(
    urlMode === "login" ? "login" : "register",
  );

  const content = {
    ar: {
      ownerRegisterTitle: "إنشاء حساب مالك عقار",
      ownerLoginTitle: "تسجيل دخول مالك عقار",
      providerRegisterTitle: "إنشاء حساب مزود خدمة",
      providerLoginTitle: "تسجيل دخول مزود خدمة",
      ownerDesc: "أدير عقاراتي وأطلب خدمات الصيانة والنظافة",
      providerDesc: "أقدم خدمات صيانة ونظافة للعقارات",
      nameLabel: "الاسم الكامل",
      phoneLabel: "رقم الجوال",
      loginButton: "دخول",
      registerButton: "تسجيل",
      switchToRegister: "ليس لديك حساب؟ سجل الآن",
      switchToLogin: "لديك حساب؟ سجل دخول",
      back: "رجوع للصفحة الرئيسية",
      namePlaceholder: "أدخل اسمك الكامل",
      phonePlaceholder: "05xxxxxxxx",
    },
    en: {
      ownerRegisterTitle: "Create Property Owner Account",
      ownerLoginTitle: "Property Owner Login",
      providerRegisterTitle: "Create Service Provider Account",
      providerLoginTitle: "Service Provider Login",
      ownerDesc: "Manage my properties and request maintenance services",
      providerDesc: "Provide maintenance and cleaning services",
      nameLabel: "Full Name",
      phoneLabel: "Phone Number",
      loginButton: "Login",
      registerButton: "Register",
      switchToRegister: "Don't have an account? Register",
      switchToLogin: "Have an account? Login",
      back: "Back to Home",
      namePlaceholder: "Enter your full name",
      phonePlaceholder: "05xxxxxxxx",
    },
  };

  const t = content[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", { role, mode, ...formData });
    setLocation("/dashboard");
  };

  const getTitle = () => {
    if (role === "provider") {
      return mode === "login" ? t.providerLoginTitle : t.providerRegisterTitle;
    }
    return mode === "login" ? t.ownerLoginTitle : t.ownerRegisterTitle;
  };

  const getDescription = () => {
    return role === "provider" ? t.providerDesc : t.ownerDesc;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white shadow-xl border border-gray-200">
        <CardHeader>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="mb-4 text-gray-700 hover:text-gray-900 hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.back}
          </Button>
          <div className="text-center">
            <div
              className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                role === "provider" ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              <Building2
                className={`w-8 h-8 ${
                  role === "provider" ? "text-green-600" : "text-blue-600"
                }`}
              />
            </div>
            <CardTitle className="text-2xl text-gray-900 mb-2">
              {getTitle()}
            </CardTitle>
            <CardDescription className="text-gray-600">
              {getDescription()}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === "register" && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-gray-900">
                  {t.nameLabel}
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder={t.namePlaceholder}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  required
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-gray-900">
                {t.phoneLabel}
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder={t.phonePlaceholder}
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                required
                className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <Button
              type="submit"
              className={`w-full text-white ${
                role === "provider"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
              size="lg"
            >
              {mode === "login" ? t.loginButton : t.registerButton}
            </Button>
            <div className="text-center">
              <Button
                type="button"
                variant="link"
                onClick={() => setMode(mode === "login" ? "register" : "login")}
                className="text-gray-600 hover:text-gray-900"
              >
                {mode === "login" ? t.switchToRegister : t.switchToLogin}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
