import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Save, Loader2, Upload, FileText } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { SERVICES, getServicesByCategory } from "@/lib/services";
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
    services: [] as string[],
    other_services: "",
  });

  const [files, setFiles] = useState<{
    commercial_register: File | null;
    company_profile: File | null;
  }>({
    commercial_register: null,
    company_profile: null,
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
      services: "الخدمات المقدمة",
      cleaningServices: "خدمات النظافة",
      maintenanceServices: "خدمات الصيانة",
      otherServices: "خدمات أخرى",
      otherServicesPlaceholder: "اكتب الخدمات الأخرى التي تقدمها...",
      documents: "المستندات المطلوبة (إجباري)",
      commercialRegister: "السجل التجاري",
      companyProfile: "بروفايل الشركة",
      chooseFile: "اختر ملف",
      fileTypes: "PDF أو صورة (بحد أقصى 5MB)",
      save: "حفظ والمتابعة",
      saving: "جاري الحفظ...",
      success: "تم حفظ البيانات بنجاح!",
      error: "حدث خطأ، حاول مرة أخرى",
      errorDocuments: "يجب رفع جميع المستندات المطلوبة",
      errorServices: "يجب اختيار خدمة واحدة على الأقل",
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
      services: "Services Offered",
      cleaningServices: "Cleaning Services",
      maintenanceServices: "Maintenance Services",
      otherServices: "Other Services",
      otherServicesPlaceholder: "Write other services you provide...",
      documents: "Required Documents (Mandatory)",
      commercialRegister: "Commercial Register",
      companyProfile: "Company Profile",
      chooseFile: "Choose File",
      fileTypes: "PDF or Image (max 5MB)",
      save: "Save & Continue",
      saving: "Saving...",
      success: "Data saved successfully!",
      error: "An error occurred, please try again",
      errorDocuments: "All required documents must be uploaded",
      errorServices: "You must select at least one service",
    },
  };

  const t = content[lang];

  // جلب بيانات المستخدم
  useEffect(() => {
    const phone = localStorage.getItem("userPhone");
    if (phone) {
      supabase
        .from("users")
        .select("name, phone")
        .eq("phone", phone)
        .single()
        .then(({ data }) => {
          if (data) {
            setUserData({ name: data.name, phone: data.phone });
          }
        });
    }
  }, []);

  // خدمات النظافة والصيانة
  const cleaningServices = getServicesByCategory("cleaning");
  const maintenanceServices = getServicesByCategory("maintenance");

  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      services: prev.services.includes(serviceId)
        ? prev.services.filter((id) => id !== serviceId)
        : [...prev.services, serviceId],
    }));
  };

  const handleFileChange = (
    field: "commercial_register" | "company_profile",
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      // التحقق من حجم الملف (5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: lang === "ar" ? "الملف كبير جداً" : "File too large",
          description: lang === "ar" ? "الحد الأقصى 5MB" : "Maximum 5MB",
          variant: "destructive",
        });
        return;
      }
      setFiles((prev) => ({ ...prev, [field]: file }));
    }
  };

  // حفظ البيانات
  const mutation = useMutation({
    mutationFn: async () => {
      // التحقق من المستندات
      if (!files.commercial_register || !files.company_profile) {
        throw new Error("documents_required");
      }

      // التحقق من الخدمات
      if (formData.services.length === 0 && !formData.other_services) {
        throw new Error("services_required");
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

      const commercialRegisterPath = await uploadFile(
        files.commercial_register,
        "commercial-registers",
      );
      const companyProfilePath = await uploadFile(
        files.company_profile,
        "company-profiles",
      );

      // حفظ البيانات في قاعدة البيانات
      const { error } = await supabase.from("providers").insert([
        {
          user_id: user.id,
          company_name: formData.company_name,
          email: formData.email || null,
          city: formData.city,
          description: formData.description,
          services: formData.services,
          other_services: formData.other_services || null,
          commercial_register_url: commercialRegisterPath,
          company_profile_url: companyProfilePath,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: t.success,
        variant: "default",
      });
      setLocation("/dashboard/provider");
    },
    onError: (error: any) => {
      console.error("Error:", error);
      let errorMessage = t.error;

      if (error.message === "documents_required") {
        errorMessage = t.errorDocuments;
      } else if (error.message === "services_required") {
        errorMessage = t.errorServices;
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
      className="min-h-screen bg-gray-50 p-6"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <Building2 className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
          <p className="text-gray-600 mt-2">{t.subtitle}</p>
        </div>

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

          {/* الخدمات المقدمة */}
          <Card>
            <CardHeader>
              <CardTitle>{t.services}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* خدمات النظافة */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900">
                  {t.cleaningServices}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {cleaningServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start space-x-2 space-x-reverse"
                    >
                      <Checkbox
                        id={service.id}
                        checked={formData.services.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                      <Label
                        htmlFor={service.id}
                        className="text-sm font-normal cursor-pointer leading-tight"
                      >
                        {service.name[lang]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* خدمات الصيانة */}
              <div className="space-y-3">
                <h3 className="font-semibold text-lg text-gray-900">
                  {t.maintenanceServices}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto border rounded-lg p-4">
                  {maintenanceServices.map((service) => (
                    <div
                      key={service.id}
                      className="flex items-start space-x-2 space-x-reverse"
                    >
                      <Checkbox
                        id={service.id}
                        checked={formData.services.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                      <Label
                        htmlFor={service.id}
                        className="text-sm font-normal cursor-pointer leading-tight"
                      >
                        {service.name[lang]}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              {/* خدمات أخرى */}
              <div className="space-y-2">
                <Label htmlFor="other_services">{t.otherServices}</Label>
                <Textarea
                  id="other_services"
                  placeholder={t.otherServicesPlaceholder}
                  value={formData.other_services}
                  onChange={(e) =>
                    setFormData({ ...formData, other_services: e.target.value })
                  }
                  rows={3}
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
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100"
                  >
                    <Upload className="w-4 h-4" />
                    {t.chooseFile}
                  </Label>
                  {files.commercial_register && (
                    <span className="text-sm text-gray-600">
                      {files.commercial_register.name}
                    </span>
                  )}
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
                    className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg cursor-pointer hover:bg-blue-100"
                  >
                    <Upload className="w-4 h-4" />
                    {t.chooseFile}
                  </Label>
                  {files.company_profile && (
                    <span className="text-sm text-gray-600">
                      {files.company_profile.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-500">{t.fileTypes}</p>
              </div>
            </CardContent>
          </Card>

          {/* زر الحفظ */}
          <div className="flex justify-center">
            <Button
              type="submit"
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-6 text-lg"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  {t.save}
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
