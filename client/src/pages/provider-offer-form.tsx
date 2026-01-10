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
  Send, // ← تأكد من وجود هذا
} from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { SERVICES } from "@/lib/services";

export default function ProviderOfferForm() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/dashboard/provider/requests/:id/offer");
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
      cleaning: "خدمات النظافة",
      maintenance: "خدمات الصيانة",
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
      cleaning: "Cleaning Services",
      maintenance: "Maintenance Services",
    },
  };

  const t = content[lang];

  // جلب بيانات المزود
  const { data: providerData } = useQuery({
    queryKey: ["/api/provider/profile"],
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Not logged in");

      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

      const { data: provider } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .single();

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

      if (!providerData?.provider?.id) {
        throw new Error("provider_not_found");
      }

      // رفع الملف إلى Supabase Storage
      const fileExt = "pdf";
      const fileName = `${providerData.provider.id}_${requestId}_${Date.now()}.${fileExt}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from("provider-offers")
        .upload(fileName, offerFile);

      if (uploadError) throw uploadError;

      // الحصول على رابط الملف
      const { data: urlData } = supabase.storage
        .from("provider-offers")
        .getPublicUrl(fileName);

      // حفظ العرض في قاعدة البيانات
      const { data, error } = await supabase
        .from("provider_offers")
        .insert([
          {
            request_id: requestId,
            provider_id: providerData.provider.id,
            offer_file_url: urlData.publicUrl,
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
      queryClient.invalidateQueries({ queryKey: ["/api/provider/offers"] });
      setLocation("/dashboard/provider");
    },

    onError: (error: any) => {
      console.error("Error:", error);
      let errorMessage = t.error;

      if (error.message === "no_file") {
        errorMessage = t.errorFile;
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

  const getCategoryName = (category: string) => {
    return category === "cleaning" ? t.cleaning : t.maintenance;
  };

  const getServiceNames = (serviceIds: string[]) => {
    if (!serviceIds || serviceIds.length === 0) return "";

    return serviceIds
      .map((id) => {
        const service = SERVICES.find((s) => s.id === id);
        return service ? service.name[lang] : "";
      })
      .filter(Boolean)
      .join(", ");
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

            <div>
              <p className="text-sm text-muted-foreground">{t.category}:</p>
              <p className="font-medium">
                {getCategoryName(request.service_category)}
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground">{t.services}:</p>
              <p className="text-sm">{getServiceNames(request.service_ids)}</p>
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
