import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Building2, Save, Loader2, Upload, FileText, CheckCircle2, Clock, CreditCard } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function ProviderProfile() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [userData, setUserData] = useState({ name: "", phone: "" });
  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    city: "",
    description: "",
    bank_name: "",
    iban: "",
  });

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
      bankInfo: "بيانات الحساب البنكي",
      bankName: "اسم البنك",
      bankNamePlaceholder: "اختر البنك",
      iban: "رقم الآيبان (IBAN)",
      ibanPlaceholder: "SA00000000000000000000",
      ibanHint: "يبدأ بـ SA ويتكون من 24 خانة",
      documents: "المستندات المطلوبة (إجباري)",
      commercialRegister: "السجل التجاري",
      companyProfile: "بروفايل الشركة",
      falLicense: "رخصة فال",
      chooseFile: "اختر ملف",
      fileTypes: "PDF أو صورة (بحد أقصى 5MB)",
      save: "حفظ والمتابعة",
      saving: "جاري الحفظ...",
      success: "تم حفظ البيانات بنجاح!",
      error: "حدث خطأ، حاول مرة أخرى",
      errorDocuments: "يجب رفع جميع المستندات المطلوبة (السجل التجاري، بروفايل الشركة، رخصة فال)",
      errorIban: "رقم الآيبان يجب أن يبدأ بـ SA ويتكون من 24 خانة",
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
      descriptionPlaceholder:
        "Write a brief description of your company and services...",
      bankInfo: "Bank Account Details",
      bankName: "Bank Name",
      bankNamePlaceholder: "Select bank",
      iban: "IBAN Number",
      ibanPlaceholder: "SA00000000000000000000",
      ibanHint: "Starts with SA, 24 characters total",
      documents: "Required Documents (Mandatory)",
      commercialRegister: "Commercial Register",
      companyProfile: "Company Profile",
      falLicense: "FAL License",
      chooseFile: "Choose File",
      fileTypes: "PDF or Image (max 5MB)",
      save: "Save & Continue",
      saving: "Saving...",
      success: "Data saved successfully!",
      error: "An error occurred, please try again",
      errorDocuments: "All required documents must be uploaded (Commercial Register, Company Profile, FAL License)",
      errorIban: "IBAN must start with SA and be 24 characters",
    },
  };

  const t = content[lang];

  // جلب بيانات المستخدم والشركة الموجودة
  const { data: existingProvider } = useQuery({
    queryKey: ["/api/provider/profile/edit"],
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) return null;
      const { data: user } = await supabase.from("users").select("id, name, phone").eq("phone", phone).single();
      if (!user) return null;
      const { data: provider } = await supabase.from("providers").select("*").eq("user_id", user.id).single();
      return { user, provider };
    },
  });

  useEffect(() => {
    if (existingProvider?.user) {
      const u = existingProvider.user;
      setUserData({ name: u.name || "", phone: u.phone });
    }
    if (existingProvider?.provider) {
      const p = existingProvider.provider;
      setFormData({
        company_name: p.company_name || "",
        email: p.email || "",
        city: p.city || "",
        description: p.description || "",
        bank_name: p.bank_name || "",
        iban: p.iban || "",
      });
    }
  }, [existingProvider]);

  const handleFileChange = async (
    field: "commercial_register" | "company_profile" | "fal_license",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    const allowedExts = [".pdf", ".jpg", ".jpeg", ".png"];
    const ext = "." + (file.name.split(".").pop() ?? "").toLowerCase();
    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      toast({
        title: lang === "ar" ? "نوع الملف غير مدعوم" : "Unsupported file type",
        description: lang === "ar" ? "يُقبل PDF أو صورة (JPG, PNG) فقط" : "Only PDF or images (JPG, PNG) are accepted",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: lang === "ar" ? "الملف كبير جداً" : "File too large",
        description: lang === "ar" ? "الحد الأقصى 5MB" : "Maximum 5MB",
        variant: "destructive",
      });
      return;
    }

    const buf = await file.slice(0, 8).arrayBuffer();
    const b = new Uint8Array(buf);
    const isPdf  = b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46;
    const isJpeg = b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF;
    const isPng  = b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47;
    if (!isPdf && !isJpeg && !isPng) {
      toast({
        title: lang === "ar" ? "الملف تالف أو غير صالح" : "File is corrupt or invalid",
        description: lang === "ar" ? "تأكد من أن الملف سليم ومن النوع الصحيح" : "Make sure the file is valid and of the correct type",
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

      // IBAN validation — SA + 22 digits
      if (formData.iban && !/^SA\d{22}$/.test(formData.iban.trim())) {
        throw new Error("iban_invalid");
      }

      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("User not found");

      // جلب user_id
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

      if (!user) throw new Error("User not found");

      // رفع الملفات إلى Supabase Storage
      const uploadFile = async (file: File, folder: string) => {
        const fileExt = file.name.split(".").pop();
        const fileName = `${user.id}_${Date.now()}.${fileExt}`;
        const { data, error } = await supabase.storage
          .from("provider-documents")
          .upload(`${folder}/${fileName}`, file);

        if (error) throw error;
        return data.path;
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

      const profilePayload: any = {
        user_id: user.id,
        company_name: formData.company_name,
        email: formData.email || null,
        city: formData.city,
        description: formData.description,
        bank_name: formData.bank_name || null,
        iban: formData.iban.trim() || null,
        services: [],
        other_services: null,
        commercial_register_url: commercialRegisterPath,
        company_profile_url: companyProfilePath,
        fal_license_url: falLicensePath,
      };

      const existingId = existingProvider?.provider?.id;
      let dbError;
      if (existingId) {
        const { error } = await supabase.from("providers").update(profilePayload).eq("id", existingId);
        dbError = error;
      } else {
        const { error } = await supabase.from("providers").insert([profilePayload]);
        dbError = error;
      }

      if (dbError) throw dbError;
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
      } else if (error.message === "iban_invalid") {
        errorMessage = t.errorIban;
      }

      toast({
        title: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div
      className="page-enter min-h-screen bg-[#F9F9FF] p-4 sm:p-6"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-4 shadow-md"
            style={{ background: 'linear-gradient(135deg, #2E4A6B 0%, #243A56 100%)' }}>
            {formData.company_name ? (
              <span className="text-3xl font-extrabold text-white select-none">
                {formData.company_name.trim().charAt(0).toUpperCase()}
              </span>
            ) : (
              <Building2 className="w-10 h-10 text-white" />
            )}
          </div>
          {formData.company_name && (
            <p className="text-sm text-gray-500 mb-1">{formData.company_name}</p>
          )}
          <h1 className="text-3xl font-bold text-gray-900">
            {existingProvider?.provider
              ? (lang === "ar" ? "تعديل ملف الشركة" : "Edit Company Profile")
              : t.title}
          </h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
        </div>

        {/* Approval Status Banner */}
        {existingProvider?.provider && (
          existingProvider.provider.approved ? (
            <div className="flex items-center gap-3 rounded-xl border-s-4 border-green-500 bg-green-50/80 px-4 py-3 text-green-800 mb-6">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
              <div>
                <p className="font-semibold">
                  {lang === "ar" ? "تم قبول حسابك ✓" : "Your account is approved ✓"}
                </p>
                <p className="text-sm opacity-75">
                  {lang === "ar" ? "يمكنك الآن تصفح الطلبات وتقديم عروضك" : "You can now browse requests and submit offers"}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl border-s-4 border-yellow-400 bg-yellow-50/80 px-4 py-3 text-gray-900 mb-6">
              <Clock className="h-5 w-5 shrink-0 text-yellow-600" />
              <div>
                <p className="font-semibold">
                  {lang === "ar" ? "طلبك قيد المراجعة" : "Your registration is under review"}
                </p>
                <p className="text-sm opacity-75">
                  {lang === "ar" ? "سيتم إشعارك عند قبول حسابك من قِبل الإدارة" : "You will be notified once your account is approved by admin"}
                </p>
              </div>
            </div>
          )
        )}

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
                  <Input
                    value={userData.name}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.phone}</Label>
                  <Input
                    value={userData.phone}
                    disabled
                    className="bg-gray-100"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* بيانات الشركة */}
          <Card>
            <CardHeader>
              <CardTitle>{t.companyInfo}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="company_name">{t.companyName}</Label>
                <Input
                  id="company_name"
                  type="text"
                  placeholder={t.companyPlaceholder}
                  value={formData.company_name}
                  onChange={(e) =>
                    setFormData({ ...formData, company_name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">{t.email}</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={t.emailPlaceholder}
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{t.city}</Label>
                  <Input
                    id="city"
                    type="text"
                    placeholder={t.cityPlaceholder}
                    value={formData.city}
                    onChange={(e) =>
                      setFormData({ ...formData, city: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t.description}</Label>
                <Textarea
                  id="description"
                  placeholder={t.descriptionPlaceholder}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  rows={4}
                  required
                />
              </div>
            </CardContent>
          </Card>

          {/* البنك والآيبان */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                {t.bankInfo}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="bank_name">{t.bankName} <span className="text-red-500">*</span></Label>
                  <Select
                    value={formData.bank_name}
                    onValueChange={(v) => setFormData({ ...formData, bank_name: v })}
                  >
                    <SelectTrigger id="bank_name">
                      <SelectValue placeholder={t.bankNamePlaceholder} />
                    </SelectTrigger>
                    <SelectContent>
                      {[
                        "البنك الأهلي السعودي",
                        "بنك الراجحي",
                        "بنك الرياض",
                        "البنك السعودي الفرنسي",
                        "بنك البلاد",
                        "بنك الجزيرة",
                        "بنك ساب",
                        "البنك السعودي للاستثمار",
                        "البنك العربي الوطني",
                        "بنك الأول",
                      ].map((b) => (
                        <SelectItem key={b} value={b}>{b}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="iban">{t.iban} <span className="text-red-500">*</span></Label>
                  <Input
                    id="iban"
                    type="text"
                    placeholder={t.ibanPlaceholder}
                    value={formData.iban}
                    onChange={(e) => setFormData({ ...formData, iban: e.target.value.toUpperCase() })}
                    maxLength={24}
                    required
                  />
                  <p className="text-xs text-gray-500">{t.ibanHint}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* المستندات */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                {t.documents}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* السجل التجاري */}
              <div className="space-y-2">
                <Label
                  htmlFor="commercial_register"
                  className="flex items-center gap-2"
                >
                  {t.commercialRegister}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="commercial_register"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange("commercial_register", e)}
                    className="hidden"
                  />
                  <Label
                    htmlFor="commercial_register"
                    className="flex items-center gap-2 px-4 py-2 bg-[#EEF2F7] text-[#2E4A6B] rounded-lg cursor-pointer hover:bg-[#D8E4EE]"
                  >
                    <Upload className="w-4 h-4" />
                    {t.chooseFile}
                  </Label>
                  {files.commercial_register ? (
                    <span className="text-sm text-gray-600">{files.commercial_register.name}</span>
                  ) : existingProvider?.provider?.commercial_register_url ? (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {lang === "ar" ? "تم الرفع مسبقاً ✓" : "Already uploaded ✓"}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500">{t.fileTypes}</p>
              </div>

              {/* بروفايل الشركة */}
              <div className="space-y-2">
                <Label
                  htmlFor="company_profile"
                  className="flex items-center gap-2"
                >
                  {t.companyProfile}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="company_profile"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange("company_profile", e)}
                    className="hidden"
                  />
                  <Label
                    htmlFor="company_profile"
                    className="flex items-center gap-2 px-4 py-2 bg-[#EEF2F7] text-[#2E4A6B] rounded-lg cursor-pointer hover:bg-[#D8E4EE]"
                  >
                    <Upload className="w-4 h-4" />
                    {t.chooseFile}
                  </Label>
                  {files.company_profile ? (
                    <span className="text-sm text-gray-600">{files.company_profile.name}</span>
                  ) : existingProvider?.provider?.company_profile_url ? (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {lang === "ar" ? "تم الرفع مسبقاً ✓" : "Already uploaded ✓"}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500">{t.fileTypes}</p>
              </div>

              {/* رخصة فال */}
              <div className="space-y-2">
                <Label
                  htmlFor="fal_license"
                  className="flex items-center gap-2"
                >
                  {t.falLicense}
                  <span className="text-red-500">*</span>
                </Label>
                <div className="flex items-center gap-4">
                  <Input
                    id="fal_license"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange("fal_license", e)}
                    className="hidden"
                  />
                  <Label
                    htmlFor="fal_license"
                    className="flex items-center gap-2 px-4 py-2 bg-[#EEF2F7] text-[#2E4A6B] rounded-lg cursor-pointer hover:bg-[#D8E4EE]"
                  >
                    <Upload className="w-4 h-4" />
                    {t.chooseFile}
                  </Label>
                  {files.fal_license ? (
                    <span className="text-sm text-gray-600">{files.fal_license.name}</span>
                  ) : existingProvider?.provider?.fal_license_url ? (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      {lang === "ar" ? "تم الرفع مسبقاً ✓" : "Already uploaded ✓"}
                    </span>
                  ) : null}
                </div>
                <p className="text-xs text-gray-500">{t.fileTypes}</p>
              </div>
            </CardContent>
          </Card>

          {/* زر الحفظ */}
          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-[#2E4A6B] to-[#3F6690] hover:from-[#243A56] hover:to-[#2E4A6B] text-white"
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
        </form>
      </div>
    </div>
  );
}
