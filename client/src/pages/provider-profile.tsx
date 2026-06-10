import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Loader2, Upload, FileText, CheckCircle2, Clock, ChevronRight, ChevronLeft, Lock, AlertTriangle } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { useToast } from "@/hooks/use-toast";

export default function ProviderProfile() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [userData] = useState({
    name: localStorage.getItem("userName") || "",
    phone: localStorage.getItem("userPhone") || "",
  });
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
  });
  const [awaitingConfirm, setAwaitingConfirm] = useState(false);

  const [files, setFiles] = useState<{
    commercial_register: File | null;
    company_profile: File | null;
    fal_license: File | null;
  }>({
    commercial_register: null,
    company_profile: null,
    fal_license: null,
  });

  const content = {
    ar: {
      title: "تسجيل بيانات مزود الخدمة",
      subtitle: "أكمل بياناتك لبدء تقديم الخدمات",
      personalInfo: "المعلومات الشخصية",
      name: "الاسم",
      phone: "رقم الجوال",
      companyInfo: "بيانات الشركة",
      companyName: "اسم الشركة",
      companyPlaceholder: "مثال: شركة الخدمات المتكاملة",
      email: "البريد الإلكتروني (اختياري)",
      emailPlaceholder: "example@company.com",
      city: "المدينة",
      cityPlaceholder: "مثال: الرياض",
      description: "نبذة عن الشركة",
      descriptionPlaceholder: "اكتب نبذة مختصرة عن شركتك وخدماتها...",
      documents: "المستندات المطلوبة (إجباري)",
      commercialRegister: "السجل التجاري",
      companyProfile: "بروفايل الشركة",
      falLicense: "رخصة فال",
      chooseFile: "اختر ملف",
      fileTypes: "PDF أو صورة (بحد أقصى 10MB)",
      save: "حفظ والمتابعة",
      saving: "جاري الحفظ...",
      success: "تم حفظ البيانات بنجاح!",
      error: "حدث خطأ، حاول مرة أخرى",
      errorDocuments: "يجب رفع جميع المستندات المطلوبة (السجل التجاري، بروفايل الشركة، رخصة فال)",
    },
    en: {
      title: "Service Provider Registration",
      subtitle: "Complete your information to start providing services",
      personalInfo: "Personal Information",
      name: "Name",
      phone: "Phone Number",
      companyInfo: "Company Information",
      companyName: "Company Name",
      companyPlaceholder: "Example: Integrated Services Company",
      email: "Email (Optional)",
      emailPlaceholder: "example@company.com",
      city: "City",
      cityPlaceholder: "Example: Riyadh",
      description: "Company Description",
      descriptionPlaceholder: "Write a brief description of your company and services...",
      documents: "Required Documents (Mandatory)",
      commercialRegister: "Commercial Register",
      companyProfile: "Company Profile",
      falLicense: "FAL License",
      chooseFile: "Choose File",
      fileTypes: "PDF or Image (max 10MB)",
      save: "Save & Continue",
      saving: "Saving...",
      success: "Data saved successfully!",
      error: "An error occurred, please try again",
      errorDocuments:
        "All required documents must be uploaded (Commercial Register, Company Profile, FAL License)",
    },
  };

  const t = content[lang];

  // جلب بيانات المستخدم والشركة الموجودة
  const { data: existingProvider } = useQuery({
    queryKey: ["/api/provider/profile/edit"],
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) return null;
      const res = await fetch("/api/provider/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return { provider: data.provider ?? null };
    },
  });

  useEffect(() => {
    if (existingProvider?.provider) {
      const p = existingProvider.provider;
      setFormData({
        company_name: p.company_name || "",
        email: p.email || "",
      });
    }
  }, [existingProvider]);

  const handleFileChange = async (
    field: "commercial_register" | "company_profile" | "fal_license",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const allowedExts = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      toast({
        title: lang === "ar" ? "نوع الملف غير مدعوم" : "Unsupported file type",
        description:
          lang === "ar"
            ? "يُقبل PDF أو صورة (JPG, PNG) فقط"
            : "Only PDF or images (JPG, PNG) are accepted",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: lang === "ar" ? "الملف كبير جداً" : "File too large",
        description: lang === "ar" ? "الحد الأقصى 10MB" : "Maximum 10MB",
        variant: "destructive",
      });
      return;
    }

    const buf = await file.slice(0, 8).arrayBuffer();
    const b = new Uint8Array(buf);
    const isPdf = b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46;
    const isJpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
    const isPng = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;
    if (!isPdf && !isJpeg && !isPng) {
      toast({
        title: lang === "ar" ? "الملف تالف أو غير صالح" : "File is corrupt or invalid",
        description:
          lang === "ar"
            ? "تأكد من أن الملف سليم ومن النوع الصحيح"
            : "Make sure the file is valid and of the correct type",
        variant: "destructive",
      });
      return;
    }

    setFiles((prev) => ({ ...prev, [field]: file }));
  };

  // حفظ البيانات
  const mutation = useMutation({
    mutationFn: async () => {
      // التحقق من المستندات — مطلوبة فقط عند التسجيل الأول
      const isNew = !existingProvider?.provider?.id;
      if (isNew && (!files.commercial_register || !files.company_profile || !files.fal_license)) {
        throw new Error("documents_required");
      }

      const userId = localStorage.getItem("userId");
      if (!userId) throw new Error("User not found");

      // رفع الملفات إلى Supabase Storage عبر الخادم (supabaseAdmin — لا حاجة لـ JWT)
      const uploadFile = async (file: File, folder: string) => {
        const token = localStorage.getItem("sessionToken");
        const fileExt = file.name.includes(".") ? file.name.split(".").pop()?.toLowerCase() : null;
        if (!fileExt || !["pdf", "jpg", "jpeg", "png"].includes(fileExt)) {
          throw new Error("invalid_extension");
        }
        const fileName = `${userId}_${Date.now()}.${fileExt}`;
        const res = await fetch(
          `/api/upload/provider-document?folder=${encodeURIComponent(folder)}&filename=${encodeURIComponent(fileName)}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": file.type || "application/octet-stream",
            },
            body: file,
          }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || "File upload failed");
        }
        const { path } = await res.json();
        return path;
      };

      const commercialRegisterPath = files.commercial_register
        ? await uploadFile(files.commercial_register, "commercial-registers")
        : existingProvider?.provider?.commercial_register_url || null;
      const companyProfilePath = files.company_profile
        ? await uploadFile(files.company_profile, "company-profiles")
        : existingProvider?.provider?.company_profile_url || null;
      const falLicensePath = files.fal_license
        ? await uploadFile(files.fal_license, "fal-licenses")
        : existingProvider?.provider?.fal_license_url || null;

      const token = localStorage.getItem("sessionToken");
      const profileRes = await fetch("/api/provider/profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          company_name: formData.company_name,
          email: formData.email || null,
          commercial_register_url: commercialRegisterPath,
          company_profile_url: companyProfilePath,
          fal_license_url: falLicensePath,
        }),
      });
      if (!profileRes.ok) {
        const errBody = await profileRes.json().catch(() => ({}));
        throw new Error((errBody as any).error || "فشل حفظ البيانات");
      }
    },
    onSuccess: () => {
      toast({
        title: t.success,
        variant: "default",
      });
      setLocation("/dashboard/provider");
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) console.error("Error:", error);
      let errorMessage = t.error;

      if (error.message === "documents_required") {
        errorMessage = t.errorDocuments;
      } else if (error.message) {
        errorMessage = error.message;
      }

      toast({
        title: errorMessage,
        variant: "destructive",
      });
    },
  });

  const isApproved = existingProvider?.provider?.approved ?? false;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isApproved && !awaitingConfirm) {
      setAwaitingConfirm(true);
      return;
    }
    setAwaitingConfirm(false);
    mutation.mutate();
  };

  return (
    <div
      className="page-enter min-h-screen"
      style={{ background: "var(--navy-2)" }}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Emerald gradient header strip */}
      <div
        style={{ background: "linear-gradient(135deg, #0e3a5c, #193546)" }}
        className="py-5 px-4 flex items-center gap-3"
      >
        <button
          type="button"
          onClick={() => setLocation("/dashboard/provider")}
          className="text-white p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
          aria-label={lang === "ar" ? "رجوع" : "Back"}
        >
          {lang === "ar" ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
        <h1 className="text-lg font-bold text-white flex-1">
          {lang === "ar" ? "ملف الشركة" : "Company Profile"}
        </h1>
        <div className="text-end">
          <div className="text-white font-extrabold text-lg tracking-wide">عِمارة</div>
          <div className="text-white/80 text-xs">
            {lang === "ar" ? "مزود خدمات" : "Service Provider"}
          </div>
        </div>
      </div>

      <div className="p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-xl font-bold text-foreground">
            {existingProvider?.provider
              ? lang === "ar" ? "تعديل ملف الشركة" : "Edit Company Profile"
              : t.title}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">{t.subtitle}</p>
        </div>

        {/* Approval Status Banner */}
        {existingProvider?.provider &&
          (existingProvider.provider.approved ? (
            <div className="flex items-center gap-3 rounded-xl border-s-4 border-green-500/40 bg-green-500/10 px-4 py-3 text-foreground mb-6">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-400" />
              <div>
                <p className="font-semibold">
                  {lang === "ar" ? "تم قبول حسابك ✓" : "Your account is approved ✓"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lang === "ar"
                    ? "يمكنك الآن تصفح الطلبات وتقديم عروضك"
                    : "You can now browse requests and submit offers"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border-s-4 border-yellow-500/40 bg-yellow-500/10 px-4 py-3 text-foreground mb-6">
              <Clock className="h-5 w-5 shrink-0 text-yellow-400" />
              <div>
                <p className="font-semibold">
                  {lang === "ar" ? "طلبك قيد المراجعة" : "Your registration is under review"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {lang === "ar"
                    ? "سيتم إشعارك عند قبول حسابك من قِبل الإدارة"
                    : "You will be notified once your account is approved by admin"}
                </p>
              </div>
            </div>
          ))}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* المعلومات الشخصية */}
          <Card>
            <CardHeader>
              <CardTitle>{t.personalInfo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.name}</Label>
                  <Input value={userData.name} disabled className="bg-white/5" />
                </div>
                <div className="space-y-2">
                  <Label>{t.phone}</Label>
                  <Input value={userData.phone} disabled className="bg-white/5" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* بيانات الشركة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {t.companyInfo}
                {isApproved && (
                  <span className="ms-auto flex items-center gap-1 text-xs font-normal text-amber-400">
                    <Lock className="w-3.5 h-3.5" />
                    {lang === "ar" ? "مقفل بعد الاعتماد" : "Locked after approval"}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">{t.companyName}</Label>
                <Input
                  id="company_name"
                  type="text"
                  placeholder={t.companyPlaceholder}
                  value={formData.company_name}
                  onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
                  required
                  disabled={isApproved}
                  className={isApproved ? "bg-white/5" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t.emailPlaceholder}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isApproved}
                  className={isApproved ? "bg-white/5" : ""}
                />
              </div>
            </CardContent>
          </Card>

          {/* المستندات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t.documents}
                {isApproved && (
                  <span className="ms-auto flex items-center gap-1 text-xs font-normal text-amber-400">
                    <Lock className="w-3.5 h-3.5" />
                    {lang === "ar" ? "مقفل بعد الاعتماد" : "Locked after approval"}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* السجل التجاري */}
              <div className="space-y-2">
                <Label htmlFor="commercial_register" className="flex items-center gap-2">
                  {t.commercialRegister}
                  {!isApproved && <span className="text-red-500">*</span>}
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="commercial_register"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange("commercial_register", e)}
                    className="hidden"
                    disabled={isApproved}
                  />
                  {isApproved ? (
                    <span className="flex items-center gap-2 px-4 py-2 bg-white/5 text-muted-foreground rounded-lg text-sm">
                      <Lock className="w-4 h-4" />
                      {lang === "ar" ? "مقفل" : "Locked"}
                    </span>
                  ) : (
                    <Label
                      htmlFor="commercial_register"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
                      style={{ background: "var(--provider-soft)", color: "var(--provider)" }}
                    >
                      <Upload className="w-4 h-4" />
                      {t.chooseFile}
                    </Label>
                  )}
                  {!isApproved && files.commercial_register ? (
                    <span className="text-sm text-muted-foreground">{files.commercial_register.name}</span>
                  ) : existingProvider?.provider?.commercial_register_url ? (
                    <span className="text-sm text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {lang === "ar" ? "تم الرفع مسبقاً ✓" : "Already uploaded ✓"}
                    </span>
                  ) : null}
                </div>
                {!isApproved && <p className="text-xs text-muted-foreground">{t.fileTypes}</p>}
              </div>

              {/* بروفايل الشركة */}
              <div className="space-y-2">
                <Label htmlFor="company_profile" className="flex items-center gap-2">
                  {t.companyProfile}
                  {!isApproved && <span className="text-red-500">*</span>}
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="company_profile"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange("company_profile", e)}
                    className="hidden"
                    disabled={isApproved}
                  />
                  {isApproved ? (
                    <span className="flex items-center gap-2 px-4 py-2 bg-white/5 text-muted-foreground rounded-lg text-sm">
                      <Lock className="w-4 h-4" />
                      {lang === "ar" ? "مقفل" : "Locked"}
                    </span>
                  ) : (
                    <Label
                      htmlFor="company_profile"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
                      style={{ background: "var(--provider-soft)", color: "var(--provider)" }}
                    >
                      <Upload className="w-4 h-4" />
                      {t.chooseFile}
                    </Label>
                  )}
                  {!isApproved && files.company_profile ? (
                    <span className="text-sm text-muted-foreground">{files.company_profile.name}</span>
                  ) : existingProvider?.provider?.company_profile_url ? (
                    <span className="text-sm text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {lang === "ar" ? "تم الرفع مسبقاً ✓" : "Already uploaded ✓"}
                    </span>
                  ) : null}
                </div>
                {!isApproved && <p className="text-xs text-muted-foreground">{t.fileTypes}</p>}
              </div>

              {/* رخصة فال */}
              <div className="space-y-2">
                <Label htmlFor="fal_license" className="flex items-center gap-2">
                  {t.falLicense}
                  {!isApproved && <span className="text-red-500">*</span>}
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="fal_license"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange("fal_license", e)}
                    className="hidden"
                    disabled={isApproved}
                  />
                  {isApproved ? (
                    <span className="flex items-center gap-2 px-4 py-2 bg-white/5 text-muted-foreground rounded-lg text-sm">
                      <Lock className="w-4 h-4" />
                      {lang === "ar" ? "مقفل" : "Locked"}
                    </span>
                  ) : (
                    <Label
                      htmlFor="fal_license"
                      className="flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer"
                      style={{ background: "var(--provider-soft)", color: "var(--provider)" }}
                    >
                      <Upload className="w-4 h-4" />
                      {t.chooseFile}
                    </Label>
                  )}
                  {!isApproved && files.fal_license ? (
                    <span className="text-sm text-muted-foreground">{files.fal_license.name}</span>
                  ) : existingProvider?.provider?.fal_license_url ? (
                    <span className="text-sm text-green-400 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {lang === "ar" ? "تم الرفع مسبقاً ✓" : "Already uploaded ✓"}
                    </span>
                  ) : null}
                </div>
                {!isApproved && <p className="text-xs text-muted-foreground">{t.fileTypes}</p>}
              </div>
            </CardContent>
          </Card>

          {/* Confirmation warning (shown only when editing an approved profile) */}
          {awaitingConfirm && (
            <div className="flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-4">
              <AlertTriangle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm mb-1">
                  {lang === "ar"
                    ? "ملفك الشخصي معتمد — التعديل يتطلب مراجعة جديدة"
                    : "Your profile is approved — editing requires re-review"}
                </p>
                <p className="text-xs text-muted-foreground mb-3">
                  {lang === "ar"
                    ? "بعد الحفظ، سيتم إعادة مراجعة حسابك من قِبل الإدارة قبل تفعيله مجدداً."
                    : "After saving, your account will be re-reviewed by admin before it is reactivated."}
                </p>
                <div className="flex gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="text-white"
                    style={{ background: "#EA7C1A", color: "#1a0f04" }}
                    disabled={mutation.isPending}
                  >
                    {mutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      lang === "ar" ? "تأكيد التعديل" : "Confirm Edit"
                    )}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => setAwaitingConfirm(false)}
                  >
                    {lang === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* زر الحفظ */}
          {!awaitingConfirm && (
            <Button
              type="submit"
              className="w-full text-white"
              style={{ background: "var(--provider)" }}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 me-2 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 me-2" />
                  {t.save}
                </>
              )}
            </Button>
          )}
        </form>
      </div>
      </div>
    </div>
  );
}
