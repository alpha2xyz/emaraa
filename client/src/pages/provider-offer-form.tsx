import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Upload,
  FileText,
  Loader2,
  Building2,
  AlertCircle,
  Send,
  ClipboardList,
} from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function ProviderOfferForm() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/dashboard/provider/requests/:id/offer");
  const requestId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [offerFile, setOfferFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");

  const content = {
    ar: {
      title: "تقديم عرض",
      subtitle: "ارفع ملف العرض بصيغة PDF",
      requestDetails: "تفاصيل الطلب",
      property: "العقار",
      city: "المدينة",
      category: "الفئة",
      services: "الخدمات المطلوبة",
      description: "الوصف",
      offerFile: "ملف العرض (PDF)",
      chooseFile: "اختر ملف PDF",
      fileSelected: "تم اختيار الملف",
      notes: "ملاحظات إضافية (اختياري)",
      notesPlaceholder: "أضف أي ملاحظات أو تفاصيل إضافية...",
      submit: "إرسال العرض",
      submitting: "جاري الإرسال...",
      cancel: "إلغاء",
      back: "رجوع",
      success: "تم إرسال العرض بنجاح!",
      error: "حدث خطأ، حاول مرة أخرى",
      errorFile: "يرجى اختيار ملف PDF",
      errorFileSize: "حجم الملف كبير جداً (الحد الأقصى 10MB)",
      errorFileType: "يجب أن يكون الملف بصيغة PDF",
      loading: "جاري التحميل...",
      scopeTitle: "نطاق الخدمات المطلوبة",
      scopeText: `نرجو تقديم عرض سعر شامل للخدمات التالية:

1. خدمات النظافة: تنظيف المناطق المشتركة يومياً، تنظيف الأسطح والخزانات بشكل دوري، جمع النفايات ونقلها بشكل يومي، تنظيف النوافذ والواجهات وقت الحاجة.

2. خدمات الصيانة (وقت الحاجة والمتابعة بشكل دوري): صيانة الإنارة والكهرباء، صيانة المضخات والخزانات، صيانة الأبواب والمصاعد، متابعة كاميرات المراقبة.

3. أعمال أخرى: رش المبيدات الحشرية، أعمال الزراعة والبستنة (وقت الحاجة وإن وجد أو طلب).

4. خدمة التواصل للطوارئ على مدار الساعة.

5. تسديد فواتير المرافق للمناطق المشتركة.

6. توضيح أيام الاجازات والية العمل في فترات الأعياد والمناسبات الوطنية.

**متطلبات العرض:** يجب أن يتضمن العرض المقدم ما يلي: تفصيل كامل للخدمات، السعر يقسم لكل وحدة سكنية وإجمالي العقد شاملاً الضريبة، وشروط الدفع، السجل التجاري وشهادات الاعتماد، مراجع من عملاء سابقين أو البورتوفوليو. تكون مدة العقد سنة وقابل للتجديد لمدد مماثلة.`,
      alreadySubmitted: "لقد قدمت عرضاً لهذا الطلب مسبقاً ولا يمكن تقديم أكثر من عرض واحد",
    },
    en: {
      title: "Submit Offer",
      subtitle: "Upload your offer file in PDF format",
      requestDetails: "Request Details",
      property: "Property",
      city: "City",
      category: "Category",
      services: "Requested Services",
      description: "Description",
      offerFile: "Offer File (PDF)",
      chooseFile: "Choose PDF File",
      fileSelected: "File selected",
      notes: "Additional Notes (Optional)",
      notesPlaceholder: "Add any additional notes or details...",
      submit: "Submit Offer",
      submitting: "Submitting...",
      cancel: "Cancel",
      back: "Back",
      success: "Offer submitted successfully!",
      error: "An error occurred, please try again",
      errorFile: "Please select a PDF file",
      errorFileSize: "File size is too large (max 10MB)",
      errorFileType: "File must be in PDF format",
      loading: "Loading...",
      scopeTitle: "Scope of Services Required",
      scopeText: `Please provide a comprehensive price quote for the following services:

1. Cleaning Services: Daily cleaning of common areas, periodic cleaning of roofs and tanks, daily waste collection and removal, and window and facade cleaning as needed.

2. Maintenance Services (as needed and on a regular basis): Lighting and electrical maintenance, pump and tank maintenance, door and elevator maintenance, and monitoring of security cameras.

3. Other Services: Pest control, landscaping and gardening (as needed, if required, or upon request).

4. 24/7 Emergency Contact Service.

5. Payment of utility bills for common areas.

6. Clear description of holidays and work procedures during national holidays and special occasions.

**Proposal Requirements:** The submitted proposal must include the following: a full breakdown of services, the price per residential unit, the total contract amount including tax, payment terms, commercial registration and certifications, and references from previous clients or a portfolio. The contract term is one year and is renewable for similar periods.`,
      alreadySubmitted: "You have already submitted an offer for this request. Only one offer per request is allowed.",
    },
  };

  const t = content[lang];

  // جلب بيانات المزود
  const { data: providerData } = useQuery({
    queryKey: ["/api/provider/profile"],
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Not logged in");

      const { data: user, error: userError } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

      if (userError || !user) throw new Error("user_not_found");

      const { data: provider, error: providerError } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (providerError || !provider) throw new Error("profile_incomplete");

      return { user, provider };
    },
  });

  // جلب تفاصيل الطلب
  const { data: request, isLoading } = useQuery({
    queryKey: ["/api/requests", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select(
          `
          *,
          properties (
            id,
            name,
            address,
            city,
            building_type
          )
        `,
        )
        .eq("id", requestId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
  });

  // التعامل مع اختيار الملف
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // التحقق من نوع الملف
    if (file.type !== "application/pdf") {
      toast({
        title: t.errorFileType,
        variant: "destructive",
      });
      return;
    }

    // التحقق من حجم الملف (10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: t.errorFileSize,
        variant: "destructive",
      });
      return;
    }

    setOfferFile(file);
  };

  // إرسال العرض
  const mutation = useMutation({
    mutationFn: async () => {
      if (!offerFile) {
        throw new Error("no_file");
      }

      if (!providerData?.user || !providerData?.provider?.id) {
        throw new Error("provider_not_found");
      }

      if (!providerData.provider.approved) {
        throw new Error(lang === "ar" ? "حسابك لم يتم قبوله بعد من قِبل الإدارة" : "Your account has not been approved by admin yet");
      }

      // Check if provider already submitted an offer for this request
      const { count: existingCount } = await supabase
        .from("provider_offers")
        .select("id", { count: "exact", head: true })
        .eq("request_id", requestId)
        .eq("provider_id", providerData.provider.id);

      if ((existingCount ?? 0) > 0) throw new Error("already_submitted");

      // رفع الملف إلى Supabase Storage
      const fileExt = "pdf";
      const fileName = `${providerData.provider.id}_${requestId}_${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("provider-offers")
        .upload(fileName, offerFile);

      if (uploadError) throw uploadError;

      // حفظ العرض في قاعدة البيانات
      const { data, error } = await supabase
        .from("provider_offers")
        .insert([
          {
            request_id: requestId,
            provider_id: providerData.provider.id,
            offer_file_url: fileName,
            notes: notes || null,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: t.success,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/all-offers"] });
      setLocation("/dashboard/provider");
    },

    onError: (error: any) => {
      if (import.meta.env.DEV) console.error("Offer submission error:", error);
      let errorMessage = t.error;

      if (error.message === "no_file") errorMessage = t.errorFile;
      else if (error.message === "already_submitted") errorMessage = t.alreadySubmitted;
      else if (error.message === "provider_not_found" || error.message === "profile_incomplete") {
        errorMessage = lang === "ar" ? "يرجى إكمال ملف شركتك أولاً" : "Please complete your company profile first";
      } else if (error.message === "user_not_found") {
        errorMessage = lang === "ar" ? "لم يتم التعرف على حسابك، حاول تسجيل الدخول مجدداً" : "Account not recognized, please log in again";
      } else if (error?.message) {
        errorMessage = error.message;
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t.loading}</p>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>{t.error}</p>
      </div>
    );
  }

  return (
    <div
      className="container mx-auto p-4 max-w-4xl"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <Button
        variant="ghost"
        onClick={() => setLocation("/dashboard/provider/requests")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 me-2" />
        {t.back}
      </Button>

      <div className="mb-6">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      {providerData?.provider?.company_name && (
        <div className="mb-4 flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-gray-900">
          <Building2 className="h-4 w-4 shrink-0" />
          <span>
            {lang === "ar"
              ? `سيُقدَّم هذا العرض باسم: ${providerData.provider.company_name}`
              : `This offer will be submitted as: ${providerData.provider.company_name}`}
          </span>
        </div>
      )}

      {/* نطاق الخدمات المطلوبة */}
      <Card className="mb-6 border-blue-200 bg-blue-50/40">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <ClipboardList className="w-5 h-5" />
            {t.scopeTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="whitespace-pre-line text-sm text-gray-800 leading-relaxed">
            {t.scopeText}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* تفاصيل الطلب */}
        <Card>
          <CardHeader>
            <CardTitle>{t.requestDetails}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">{t.property}:</p>
              <div className="flex items-center gap-2 mt-1">
                <Building2 className="h-4 w-4" />
                <p className="font-medium">{request.properties?.name}</p>
              </div>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t.city}:</p>
              <p className="font-medium">{request.properties?.city}</p>
            </div>

            {request.description && (
              <div>
                <p className="text-sm text-muted-foreground">
                  {t.description}:
                </p>
                <p className="text-sm">{request.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* نموذج تقديم العرض */}
        <Card>
          <CardHeader>
            <CardTitle>{t.offerFile}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* رفع الملف */}
              <div>
                <Label htmlFor="offer-file">{t.offerFile}</Label>
                <div className="mt-2">
                  <input
                    type="file"
                    id="offer-file"
                    accept=".pdf,application/pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="offer-file">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors">
                      {offerFile ? (
                        <>
                          <FileText className="h-12 w-12 mx-auto text-green-500 mb-2" />
                          <p className="text-sm font-medium text-green-600">
                            {t.fileSelected}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {offerFile.name}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            ({(offerFile.size / 1024 / 1024).toFixed(2)} MB)
                          </p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                          <p className="text-sm font-medium">{t.chooseFile}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            PDF (max 10MB)
                          </p>
                        </>
                      )}
                    </div>
                  </label>
                </div>
                <div className="flex items-start gap-2 mt-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3 mt-0.5" />
                  <p>{t.errorFileType}</p>
                </div>
              </div>

              {/* الملاحظات */}
              <div>
                <Label htmlFor="notes">{t.notes}</Label>
                <Textarea
                  id="notes"
                  placeholder={t.notesPlaceholder}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="mt-2"
                />
              </div>

              {/* الأزرار */}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setLocation("/dashboard/provider/requests")}
                  disabled={mutation.isPending}
                >
                  {t.cancel}
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={mutation.isPending || !offerFile}
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 me-2 animate-spin" />
                      {t.submitting}
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 me-2" />
                      {t.submit}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
