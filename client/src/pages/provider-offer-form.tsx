import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  Loader2,
  Building2,
  AlertCircle,
  Send,
  ClipboardList,
  MapPin,
  ExternalLink,
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
  const [phoneConsent, setPhoneConsent] = useState(false);
  const [priceTotal, setPriceTotal] = useState("");

  const content = {
    ar: {
      title: "تقديم عرض",
      subtitle: "ارفع ملف العرض بصيغة PDF",
      requestDetails: "تفاصيل الطلب",
      property: "العقار",
      city: "المدينة",
      address: "الحي",
      units: "الوحدات",
      viewMap: "عرض الموقع",
      description: "الوصف",
      offerFile: "ملف العرض (PDF)",
      chooseFile: "اختر ملف PDF",
      fileSelected: "تم اختيار الملف",
      priceTotal: "السعر الإجمالي السنوي (ريال سعودي)",
      priceTotalPlaceholder: "مثال: 48000",
      priceTotalHint: "سيتم احتساب السعر لكل وحدة تلقائياً وعرضه للمالك",
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
      commercialScopeText: `نرجو تقديم عرض سعر شامل للخدمات التالية:

1. خدمات النظافة: تنظيف المداخل والردهات يومياً، تنظيف الأدوار والمواقف والمرافق العامة، جمع النفايات ونقلها، تنظيف الواجهات عند الحاجة.

2. خدمات الصيانة: صيانة أنظمة التكييف المركزي (HVAC)، صيانة المصاعد والسلالم المتحركة، متابعة منظومة الإطفاء والكاميرات، صيانة الإنارة والكهرباء.

3. أعمال أخرى: رش المبيدات الحشرية، أعمال البستنة (إن وجدت)، إدارة مواقف السيارات (إن طُلب).

4. خدمة الطوارئ على مدار الساعة لجميع الأعطال الحرجة.

5. تسديد فواتير المرافق للمناطق المشتركة.

6. توضيح آلية العمل في الإجازات والمناسبات الوطنية.

**متطلبات العرض:** تفصيل كامل للخدمات، السعر لكل طابق أو وحدة تجارية وإجمالي العقد شاملاً الضريبة، شروط الدفع، السجل التجاري وشهادات الاعتماد، مراجع من عملاء تجاريين سابقين أو بورتفوليو لمشاريع مماثلة. مدة العقد سنة وقابل للتجديد.`,
      buildingType: "نوع المبنى",
      commercial: "تجاري",
      residential: "سكني",
      notApproved: "حسابك لم يتم قبوله بعد من قِبل الإدارة — لا يمكنك تقديم عروض حتى يتم القبول.",
      phoneDisclosure: "في حال قبول عرضك، سيتم مشاركة رقم جوالك المسجل في حسابك مع صاحب العقار للتواصل المباشر.",
      invalidFileType: "يجب أن يكون الملف بصيغة PDF فقط",
      fileTooLarge: "حجم الملف يتجاوز 10 ميغابايت",
    },
    en: {
      title: "Submit Offer",
      subtitle: "Upload your offer file in PDF format",
      requestDetails: "Request Details",
      property: "Property",
      city: "City",
      address: "Neighborhood",
      units: "Units",
      viewMap: "View Location",
      description: "Description",
      offerFile: "Offer File (PDF)",
      chooseFile: "Choose PDF File",
      fileSelected: "File selected",
      priceTotal: "Total Annual Price (SAR)",
      priceTotalPlaceholder: "e.g. 48000",
      priceTotalHint: "Price per unit will be calculated automatically and shown to the owner",
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
      commercialScopeText: `Please provide a comprehensive price quote for the following services:

1. Cleaning Services: Daily cleaning of entrances and lobbies, cleaning of floors, parking areas, and common facilities, daily waste collection and removal, facade cleaning as needed.

2. Maintenance Services: Central HVAC system maintenance, elevator and escalator maintenance, fire suppression and camera monitoring, lighting and electrical maintenance.

3. Other Services: Pest control, landscaping (if applicable), parking management (if requested).

4. 24/7 emergency service for all critical faults.

5. Payment of utility bills for common areas.

6. Clear description of work procedures during holidays and national occasions.

**Proposal Requirements:** Full service breakdown, per-floor or per-commercial-unit pricing plus total contract amount including VAT, payment terms, commercial registration and certifications, references from previous commercial clients or a portfolio of similar projects. Contract term is one year, renewable.`,
      buildingType: "Building Type",
      commercial: "Commercial",
      residential: "Residential",
      notApproved: "Your account has not been approved by admin yet — you cannot submit offers until approved.",
      phoneDisclosure: "If your offer is accepted, your registered phone number will be shared with the property owner for direct contact.",
      invalidFileType: "Only PDF files are accepted",
      fileTooLarge: "File size exceeds 10MB",
    },
  };

  const t = content[lang];

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

  const { data: request, isLoading } = useQuery({
    queryKey: ["/api/requests", requestId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          properties (
            id,
            name,
            address,
            city,
            building_type,
            map_url,
            units_count
          )
        `)
        .eq("id", requestId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!requestId,
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      toast({ title: t.errorFileType, variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: t.errorFileSize, variant: "destructive" });
      return;
    }
    const buf = await file.slice(0, 4).arrayBuffer();
    const b = new Uint8Array(buf);
    if (!(b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46)) {
      toast({ title: t.errorFileType, variant: "destructive" });
      return;
    }
    setOfferFile(file);
  };

  const isNotApproved = providerData && !providerData.provider?.approved;

  const mutation = useMutation({
    mutationFn: async () => {
      if (!offerFile) throw new Error("no_file");
      if (!providerData?.user || !providerData?.provider?.id) throw new Error("provider_not_found");
      if (!providerData.provider.approved) {
        throw new Error(lang === "ar" ? "حسابك لم يتم قبوله بعد من قِبل الإدارة" : "Your account has not been approved by admin yet");
      }
      const { count: existingCount } = await supabase
        .from("provider_offers")
        .select("id", { count: "exact", head: true })
        .eq("request_id", requestId)
        .eq("provider_id", providerData.provider.id);
      if ((existingCount ?? 0) > 0) throw new Error("already_submitted");

      if (!['application/pdf'].includes(offerFile.type) && !offerFile.name.toLowerCase().endsWith('.pdf')) {
        throw new Error('invalid_file_type')
      }
      if (offerFile.size > 10 * 1024 * 1024) {
        throw new Error('file_too_large')
      }

      const fileName = `${providerData.provider.id}_${requestId}_${Date.now()}.pdf`;
      const { error: uploadError } = await supabase.storage
        .from("provider-offers")
        .upload(fileName, offerFile);
      if (uploadError) throw uploadError;

      const { data, error } = await supabase
        .from("provider_offers")
        .insert([{
          request_id: requestId,
          provider_id: providerData.provider.id,
          offer_file_url: fileName,
          notes: notes || null,
          price_total: priceTotal ? parseFloat(priceTotal) : null,
        }])
        .select()
        .single();
      if (error) {
        await supabase.storage.from("provider-offers").remove([fileName]);
        throw error;
      }
      return data;
    },
    onSuccess: (data) => {
      toast({ title: t.success, variant: "default" });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/all-offers"] });
      // Fire SMS notifications (non-blocking)
      if (data?.id) {
        const token = localStorage.getItem("sessionToken");
        if (token) {
          fetch("/api/sms/offer-submitted", {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ offerId: data.id }),
          }).catch(() => {});
        }
      }
      setLocation("/dashboard/provider/offers");
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) console.error("Offer submission error:", error);
      let errorMessage = t.error;
      if (error.message === "no_file") errorMessage = t.errorFile;
      else if (error.message === "invalid_file_type") errorMessage = t.invalidFileType;
      else if (error.message === "file_too_large") errorMessage = t.fileTooLarge;
      else if (error.message === "already_submitted") errorMessage = t.alreadySubmitted;
      else if (error.message === "provider_not_found" || error.message === "profile_incomplete")
        errorMessage = lang === "ar" ? "يرجى إكمال ملف شركتك أولاً" : "Please complete your company profile first";
      else if (error.message === "user_not_found")
        errorMessage = lang === "ar" ? "لم يتم التعرف على حسابك، حاول تسجيل الدخول مجدداً" : "Account not recognized, please log in again";
      else if (error?.message) errorMessage = error.message;
      toast({ title: errorMessage, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-[#2E4A6B]" />
        <p className="text-gray-500">{t.loading}</p>
        <button onClick={() => history.back()} className="text-sm text-[#2E4A6B] hover:underline">{lang === "ar" ? "رجوع" : "Back"}</button>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-gray-500">{t.error}</p>
        <button onClick={() => history.back()} className="text-sm text-[#2E4A6B] hover:underline">{lang === "ar" ? "رجوع" : "Back"}</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F9F9FF]" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto p-4 max-w-4xl py-8">
        <Button variant="ghost" onClick={() => setLocation("/dashboard/provider/requests")} className="mb-4">
          {lang === "ar" ? <ArrowRight className="w-4 h-4 me-2" /> : <ArrowLeft className="w-4 h-4 me-2" />}
          {t.back}
        </Button>

        <div className="mb-6">
          <h1 className="text-3xl font-bold">{t.title}</h1>
          <p className="text-muted-foreground mt-2">{t.subtitle}</p>
        </div>

        {/* Issue 3: early approval gate banner */}
        {isNotApproved && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border-s-4 border-orange-400 bg-orange-50/80 px-4 py-3">
            <AlertCircle className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-orange-900 font-medium">{t.notApproved}</span>
          </div>
        )}

        {/* Issue 5B: phone consent checkbox */}
        <div className="flex items-start gap-3 rounded-xl border border-[#B8CCD9] bg-[#EEF2F7]/60 px-4 py-3 mb-4">
          <input
            type="checkbox"
            id="phoneConsent"
            checked={phoneConsent}
            onChange={(e) => setPhoneConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#2E4A6B] flex-shrink-0 cursor-pointer"
          />
          <label htmlFor="phoneConsent" className="text-sm text-[#1A2E42] cursor-pointer leading-relaxed">
            {lang === 'ar'
              ? 'أوافق على مشاركة رقم جوالي المسجّل مع مالك العقار في حال قبول عرضي'
              : 'I agree to share my registered phone number with the property owner if my offer is accepted'}
          </label>
        </div>

        {providerData?.provider?.company_name && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border-s-4 border-[#2E4A6B] bg-[#EEF2F7]/80 px-4 py-3 text-sm font-medium text-[#1A2E42]">
            <Building2 className="h-4 w-4 shrink-0" />
            <span>
              {lang === "ar"
                ? `سيُقدَّم هذا العرض باسم: ${providerData.provider.company_name}`
                : `This offer will be submitted as: ${providerData.provider.company_name}`}
            </span>
          </div>
        )}

        {/* Scope of services */}
        <div className={`mb-6 rounded-2xl border-s-4 p-6 ${request.properties?.building_type === 'commercial' ? 'border-[#C4694A] bg-[#FDF3EF]/60' : 'border-[#7D3040] bg-[#FDF0F2]/60'}`}>
          <div className={`flex items-center gap-2 font-bold mb-3 ${request.properties?.building_type === 'commercial' ? 'text-[#5A2D1E]' : 'text-[#5A2030]'}`}>
            <ClipboardList className="w-5 h-5" />
            {t.scopeTitle}
          </div>
          <div className="whitespace-pre-line text-sm text-gray-800 leading-relaxed">
            {request.properties?.building_type === 'commercial' ? t.commercialScopeText : t.scopeText}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Request details card */}
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

              {/* Issue 2: address */}
              {request.properties?.address && (
                <div>
                  <p className="text-sm text-muted-foreground">{t.address}:</p>
                  <div className="flex items-start gap-1 mt-1">
                    <MapPin className="h-4 w-4 mt-0.5 text-gray-400 flex-shrink-0" />
                    <p className="text-sm">{request.properties.address}</p>
                  </div>
                </div>
              )}

              {/* Issue 2: units_count */}
              {request.properties?.units_count && (
                <div>
                  <p className="text-sm text-muted-foreground">{t.units}:</p>
                  <p className="font-medium">{request.properties.units_count}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">{t.buildingType}:</p>
                <p className="font-medium">
                  {request.properties?.building_type === 'commercial' ? t.commercial : t.residential}
                </p>
              </div>

              {/* Issue 2: map_url */}
              {request.properties?.map_url && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => window.open(request.properties.map_url, "_blank")}
                >
                  <ExternalLink className="h-4 w-4 me-2" />
                  {t.viewMap}
                </Button>
              )}

              {request.description && (
                <div>
                  <p className="text-sm text-muted-foreground">{t.description}:</p>
                  <p className="text-sm">{request.description}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Offer form card */}
          <Card>
            <CardHeader>
              <CardTitle>{t.offerFile}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
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
                      <div className="border-2 border-dashed rounded-xl p-6 text-center cursor-pointer hover:border-primary bg-white transition-colors">
                        {offerFile ? (
                          <>
                            <FileText className="h-12 w-12 mx-auto text-green-500 mb-2" />
                            <p className="text-sm font-medium text-green-600">{t.fileSelected}</p>
                            <p className="text-xs text-muted-foreground mt-1">{offerFile.name}</p>
                            <p className="text-xs text-muted-foreground">({(offerFile.size / 1024 / 1024).toFixed(2)} MB)</p>
                          </>
                        ) : (
                          <>
                            <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                            <p className="text-sm font-medium">{t.chooseFile}</p>
                            <p className="text-xs text-muted-foreground mt-1">PDF (max 10MB)</p>
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

                <div>
                  <Label htmlFor="price-total">{t.priceTotal} <span className="text-red-500">*</span></Label>
                  <div className="relative mt-2">
                    <input
                      id="price-total"
                      type="number"
                      min="1"
                      step="1"
                      placeholder={t.priceTotalPlaceholder}
                      value={priceTotal}
                      onChange={(e) => setPriceTotal(e.target.value)}
                      required
                      className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{t.priceTotalHint}</p>
                </div>

                <div>
                  <Label htmlFor="notes">{t.notes}</Label>
                  <Textarea
                    id="notes"
                    placeholder={t.notesPlaceholder}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    className="mt-2 rounded-xl"
                  />
                </div>

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
                    className="flex-1 bg-gradient-to-r from-[#2E4A6B] to-[#3F6690] hover:from-[#243A56] hover:to-[#2E4A6B] text-white"
                    disabled={mutation.isPending || !offerFile || !!isNotApproved || !phoneConsent || !priceTotal}
                  >
                    {mutation.isPending ? (
                      <><Loader2 className="h-4 w-4 me-2 animate-spin" />{t.submitting}</>
                    ) : (
                      <><Send className="h-4 w-4 me-2" />{t.submit}</>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
