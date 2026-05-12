import { useState } from "react";
import { useLang } from "@/hooks/use-lang";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Building2, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { useLocation } from "wouter";

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
        body: JSON.stringify({
          phone: formData.phone,
          code: otpCode,
          mode,
          role,
          name: formData.name,
        }),
      });

      if (!res.ok) {
        if (res.status === 409) setError(t.phoneExists);
        else if (res.status === 404) setError(t.phoneNotFound);
        else setError(t.otpInvalid);
        setLoading(false);
        return;
      }

      const { token, userId, phone, role: userRole, name: returnedName, supabaseToken } = await res.json();

      localStorage.removeItem("adminSessionToken");
      localStorage.removeItem("adminId");
      localStorage.setItem("sessionToken", token);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userPhone", phone);
      localStorage.setItem("userRole", userRole);
      localStorage.setItem("userName", returnedName || formData.name || "");
      if (supabaseToken) {
        localStorage.setItem("supabaseToken", supabaseToken);
        import("../lib/supabase").then(({ supabase }) => {
          supabase.auth.setSession({ access_token: supabaseToken, refresh_token: supabaseToken });
        });
      }

      if (userRole === "owner") {
        setLocation(mode === "register" ? "/dashboard/owner/properties/new" : "/dashboard/owner");
      } else {
        setLocation(mode === "register" ? "/dashboard/provider/profile" : "/dashboard/provider");
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

  const marketingFeatures = lang === "ar"
    ? ["إدارة سهلة لعقاراتك", "موردون معتمدون ومراجَعون", "عروض شفافة وموثوقة"]
    : ["Easy property management", "Vetted service providers", "Transparent, reliable offers"];

  return (
    <div className="page-enter min-h-screen bg-white flex">
      {/* Left marketing panel — desktop only */}
      <div className="hidden lg:flex w-5/12 bg-gradient-to-br from-[#2E4A6B] via-[#243A56] to-[#162534] flex-col justify-center p-14 text-white" dir="rtl">
        <Building2 className="w-12 h-12 mb-8 text-[#8AAABF]" />
        <h1 className="text-4xl font-extrabold mb-3">عمارة</h1>
        <p className="text-lg text-blue-100 mb-2">
          {lang === "ar" ? "منصة إدارة المرافق العقارية" : "Facility Management Platform"}
        </p>
        <p className="text-blue-300 text-sm mb-10">
          {lang === "ar" ? "ربط مالكي العقارات بمزودي الخدمات في المملكة" : "Connecting property owners with service providers in Saudi Arabia"}
        </p>
        <div className="space-y-4">
          {marketingFeatures.map(item => (
            <div key={item} className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-blue-300 flex-shrink-0" />
              <span className="text-blue-100">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Form panel */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 lg:p-12" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="w-full max-w-md">
          <button type="button" onClick={() => setLocation("/")} className="mb-4 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </button>

        <div className="rounded-[20px] shadow-xl bg-white overflow-hidden">
          <div className="px-6 pt-6 pb-2">
            <div className="flex items-center gap-3 mb-2">
              <Building2 className="w-8 h-8 text-[#2E4A6B]" />
              <h2 className="text-xl font-bold text-gray-900">{getTitle()}</h2>
            </div>
            <p className="text-sm text-gray-500">{getDescription()}</p>
          </div>

          <div className="px-6 pb-6">
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
                      className={`rounded-xl text-base ${validationErrors.name ? "border-red-500" : ""}`}
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
                    className={`rounded-xl text-base ${validationErrors.phone ? "border-red-500" : ""}`}
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

                <Button type="submit" className="w-full bg-gradient-to-r from-[#2E4A6B] to-[#3F6690] hover:from-[#243A56] hover:to-[#2E4A6B] text-white" disabled={loading}>
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
                    className="text-sm text-[#2E4A6B] hover:underline"
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
                    className="rounded-xl text-base text-center tracking-widest text-xl"
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    <AlertCircle className="w-4 h-4" />
                    {error}
                  </div>
                )}

                <Button type="submit" className="w-full bg-gradient-to-r from-[#2E4A6B] to-[#3F6690] hover:from-[#243A56] hover:to-[#2E4A6B] text-white" disabled={loading || otpCode.length < 4}>
                  {loading ? t.loading : t.otpVerify}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => { setStep("phone"); setOtpCode(""); setError(""); }}
                    className="text-sm text-[#2E4A6B] hover:underline"
                  >
                    {t.otpResend}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
