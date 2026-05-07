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
import { Building2, ArrowLeft, AlertCircle } from "lucide-react";
import { useLocation } from "wouter";
import { supabase } from "../lib/supabase";

export default function AuthPage() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [validationErrors, setValidationErrors] = useState({
    name: "",
    phone: "",
  });
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [otpCode, setOtpCode] = useState("");

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
      phoneExists: "رقم الجوال مسجل مسبقاً",
      phoneNotFound: "رقم الجوال غير مسجل",
      registrationSuccess: "تم التسجيل بنجاح!",
      loginSuccess: "تم تسجيل الدخول بنجاح!",
      phoneInvalid: "رقم جوال سعودي فقط (يبدأ بـ 05 ويتكون من 10 أرقام)",
      nameInvalid: "الاسم يجب أن يكون عربي أو إنجليزي فقط (حد أقصى 25 حرف)",
      loading: "جاري التحميل...",
      otpTitle: "التحقق عبر رسالة نصية",
      otpDesc: "تم إرسال رمز التحقق عبر SMS إلى رقم جوالك",
      otpPlaceholder: "أدخل الرمز المكون من 4 أرقام",
      otpVerify: "تحقق",
      otpResend: "إعادة إرسال الرمز",
      otpInvalid: "رمز التحقق غير صحيح أو منتهي الصلاحية",
      otpSendFailed: "فشل إرسال رمز التحقق، حاول مرة أخرى",
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
      phoneExists: "Phone number already registered",
      phoneNotFound: "Phone number not found",
      registrationSuccess: "Registration successful!",
      loginSuccess: "Login successful!",
      phoneInvalid: "Saudi phone number only (starts with 05 and 10 digits)",
      nameInvalid: "Name must be Arabic or English only (max 25 characters)",
      loading: "Loading...",
      otpTitle: "SMS Verification",
      otpDesc: "A verification code was sent to your mobile number via SMS",
      otpPlaceholder: "Enter 4-digit code",
      otpVerify: "Verify",
      otpResend: "Resend code",
      otpInvalid: "Invalid or expired verification code",
      otpSendFailed: "Failed to send verification code, try again",
    },
  };

  const t = content[lang];

  // ✅ Validate Saudi phone number
  const validatePhone = (phone: string): boolean => {
    const saudiPhoneRegex = /^05\d{8}$/;
    return saudiPhoneRegex.test(phone);
  };

  // ✅ Validate name (Arabic or English only, max 25 chars)
  const validateName = (name: string): boolean => {
    const nameRegex = /^[\u0600-\u06FFa-zA-Z\s]{1,25}$/;
    return nameRegex.test(name.trim());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setValidationErrors({ name: "", phone: "" });
    setLoading(true);

    let hasErrors = false;
    const newErrors = { name: "", phone: "" };

    if (!validatePhone(formData.phone)) {
      newErrors.phone = t.phoneInvalid;
      hasErrors = true;
    }

    if (mode === "register" && !validateName(formData.name)) {
      newErrors.name = t.nameInvalid;
      hasErrors = true;
    }

    if (hasErrors) {
      setValidationErrors(newErrors);
      setLoading(false);
      return;
    }

    try {
      // Send OTP via WhatsApp
      const res = await fetch("/api/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone }),
      });

      if (!res.ok) {
        setError(t.otpSendFailed);
        setLoading(false);
        return;
      }

      setStep("otp");
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error:", err);
      setError(t.otpSendFailed);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: formData.phone, code: otpCode }),
      });

      if (!res.ok) {
        setError(t.otpInvalid);
        setLoading(false);
        return;
      }

      // OTP verified — proceed with register or login
      if (mode === "register") {
        const { data: existingUser } = await supabase
          .from("users")
          .select("phone")
          .eq("phone", formData.phone)
          .single();

        if (existingUser) {
          setError(t.phoneExists);
          setLoading(false);
          return;
        }

        const { error: insertError } = await supabase.from("users").insert([
          { phone: formData.phone, name: formData.name.trim(), role: role },
        ]);

        if (insertError) throw insertError;

        localStorage.setItem("userPhone", formData.phone);
        localStorage.setItem("userRole", role);

        if (role === "owner") setLocation("/dashboard/owner/properties/new");
        else if (role === "provider") setLocation("/dashboard/provider/profile");
      } else {
        const { data: user, error: loginError } = await supabase
          .from("users")
          .select("*")
          .eq("phone", formData.phone)
          .eq("role", role)
          .single();

        if (loginError || !user) {
          setError(t.phoneNotFound);
          setLoading(false);
          return;
        }

        localStorage.setItem("userPhone", formData.phone);
        localStorage.setItem("userRole", role);

        if (role === "owner") setLocation("/dashboard/owner");
        else if (role === "provider") setLocation("/dashboard/provider");
      }
    } catch (err) {
      if (import.meta.env.DEV) console.error("Error:", err);
      setError("حدث خطأ، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
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
    <div className="page-enter min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => setLocation("/")}
          className="mb-4"
        >
          <ArrowLeft className="w-4 h-4 me-2" />
          {t.back}
        </Button>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-blue-600" />
              <CardTitle>{getTitle()}</CardTitle>
            </div>
            <CardDescription>{getDescription()}</CardDescription>
          </CardHeader>

          <CardContent>
            {step === "phone" ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field - only for register */}
                {mode === "register" && (
                  <div className="space-y-2">
                    <Label htmlFor="name">{t.nameLabel}</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder={t.namePlaceholder}
                      value={formData.name}
                      onChange={(e) => {
                        setFormData({ ...formData, name: e.target.value });
                        setValidationErrors({ ...validationErrors, name: "" });
                      }}
                      maxLength={25}
                      required
                      className={`text-base ${validationErrors.name ? "border-red-500" : ""}`}
                    />
                    {validationErrors.name && (
                      <div className="flex items-center gap-2 text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {validationErrors.name}
                      </div>
                    )}
                  </div>
                )}

                {/* Phone Field */}
                <div className="space-y-2">
                  <Label htmlFor="phone">{t.phoneLabel}</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder={t.phonePlaceholder}
                    value={formData.phone}
                    onChange={(e) => {
                      setFormData({ ...formData, phone: e.target.value });
                      setValidationErrors({ ...validationErrors, phone: "" });
                    }}
                    maxLength={10}
                    required
                    className={`text-base ${validationErrors.phone ? "border-red-500" : ""}`}
                  />
                  {validationErrors.phone && (
                    <div className="flex items-center gap-2 text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {validationErrors.phone}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t.loading : mode === "login" ? t.loginButton : t.registerButton}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      const newMode = mode === "login" ? "register" : "login";
                      setMode(newMode);
                      setLocation(`/auth?role=${role}&mode=${newMode}`);
                    }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {mode === "login" ? t.switchToRegister : t.switchToLogin}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleOtpVerify} className="space-y-4">
                <div className="text-center p-3 bg-green-50 rounded-lg text-sm text-green-700">
                  {t.otpDesc}
                  <span className="block font-bold mt-1 dir-ltr">{formData.phone}</span>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="otp">{t.otpPlaceholder}</Label>
                  <Input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    placeholder="xxxx"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    maxLength={4}
                    required
                    className="text-base text-center tracking-widest text-xl"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full" disabled={loading || otpCode.length < 4}>
                  {loading ? t.loading : t.otpVerify}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setStep("phone"); setOtpCode(""); setError(""); }}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    {t.otpResend}
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
