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
  MapPin,
  ExternalLink,
  Plus,
  Trash2,
} from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { formatContractDate } from "@/components/ContractStartDatePicker";

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
  // Structured breakdown (master plan v1006 item #26). Starts with one empty row so
  // the field reads as fillable rather than as an empty list needing discovery.
  const [lineItems, setLineItems] = useState<{ service: string; price_per_unit: string }[]>([
    { service: "", price_per_unit: "" },
  ]);
  const [durationMonths, setDurationMonths] = useState("12");

  const content = {
    ar: {
      title: "تقديم عرض",
      subtitle: "فصّل بنود خدمتك وسعرها، وأرفق ملف العرض إن رغبت",
      requestDetails: "تفاصيل الطلب",
      property: "العقار",
      city: "المدينة",
      address: "الحي",
      units: "الوحدات",
      viewMap: "عرض الموقع",
      description: "الوصف",
      offerFile: "ملف العرض (PDF)",
      offerFileOptional: "ملف العرض (اختياري)",
      offerFileHint: "إن كان لديك عرض جاهز بصيغة PDF أرفقه هنا. البنود أعلاه كافية بدونه.",
      lineItems: "بنود الخدمة",
      lineItemsHint: "فصّل ما يشمله عرضك. المالك يرى هذه البنود قبل القبول.",
      lineItemService: "بند الخدمة",
      lineItemServicePlaceholder: "مثال: نظافة دورية للمناطق المشتركة",
      lineItemPrice: "السعر للوحدة (ريال)",
      addLineItem: "أضف بنداً",
      removeLineItem: "حذف البند",
      lineItemsSum: "مجموع البنود لكل وحدة",
      duration: "مدة العقد",
      durationMonths: "شهراً",
      errorLineItems: "أضف بنداً واحداً على الأقل باسم وسعر",
      chooseFile: "اختر ملف PDF",
      fileSelected: "تم اختيار الملف",
      priceTotal: "السعر الإجمالي السنوي (ريال سعودي)",
      priceTotalPlaceholder: "مثال: 48000",
      priceTotalHint: "سيتم احتساب السعر لكل وحدة تلقائياً وعرضه للمالك",
      priceTotalHintSqm: "سيتم احتساب السعر لكل م² تلقائياً وعرضه للمالك",
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
      scopePart1: "نظافة دورية للمناطق المشتركة والمداخل والأسطح والخزانات وإدارة النفايات، صيانة شاملة للإنارة والمضخات والتكييف المركزي (HVAC) والمصاعد والسلالم المتحركة والكاميرات ومنظومة الإطفاء، رش مبيدات وبستنة عند الحاجة، طوارئ على مدار الساعة، تسديد فواتير المرافق، مع توضيح آلية العمل في الإجازات والمناسبات الوطنية.",
      scopePart2: "متطلبات العرض: تفصيل الخدمات والسعر لكل وحدة وإجمالي العقد شاملاً الضريبة وشروط الدفع، لمدة سنة قابلة للتجديد.",
      alreadySubmitted: "لقد قدمت عرضاً لهذا الطلب مسبقاً ولا يمكن تقديم أكثر من عرض واحد",
      buildingType: "نوع المبنى",
      commercial: "تجاري",
      residential: "سكني",
      notApproved: "حسابك لم يتم قبوله بعد من قِبل الإدارة — لا يمكنك تقديم عروض حتى يتم القبول.",
      phoneDisclosure:
        "في حال قبول عرضك، يتم تبادل رقم الجوال بينك وبين مالك العقار للتواصل المباشر.",
      invalidFileType: "يجب أن يكون الملف بصيغة PDF فقط",
      fileTooLarge: "حجم الملف يتجاوز 10 ميغابايت",
    },
    en: {
      title: "Submit Offer",
      subtitle: "Break down your services and pricing, and attach an offer file if you want to",
      requestDetails: "Request Details",
      property: "Property",
      city: "City",
      address: "Neighborhood",
      units: "Units",
      viewMap: "View Location",
      description: "Description",
      offerFile: "Offer File (PDF)",
      offerFileOptional: "Offer file (optional)",
      offerFileHint: "If you already have a PDF proposal, attach it. The line items above are enough on their own.",
      lineItems: "Service line items",
      lineItemsHint: "Break down what your offer covers. The owner sees these before accepting.",
      lineItemService: "Service",
      lineItemServicePlaceholder: "e.g. Periodic cleaning of common areas",
      lineItemPrice: "Price per unit (SAR)",
      addLineItem: "Add item",
      removeLineItem: "Remove item",
      lineItemsSum: "Line items total per unit",
      duration: "Contract duration",
      durationMonths: "months",
      errorLineItems: "Add at least one line item with a name and a price",
      chooseFile: "Choose PDF File",
      fileSelected: "File selected",
      priceTotal: "Total Annual Price (SAR)",
      priceTotalPlaceholder: "e.g. 48000",
      priceTotalHint: "Price per unit will be calculated automatically and shown to the owner",
      priceTotalHintSqm: "Price per m² will be calculated automatically and shown to the owner",
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
      scopePart1: "Periodic cleaning of common areas, entrances, rooftops, tanks, and waste management; comprehensive maintenance of lighting, pumps, central HVAC, elevators, escalators, cameras, and fire suppression systems; pest control and landscaping as needed; 24/7 emergency response; utility bill payments; with clarification of holiday and national occasion work procedures.",
      scopePart2: "Proposal requirements: detailed services and per-unit pricing plus total contract amount including VAT and payment terms, for a one-year renewable term.",
      alreadySubmitted:
        "You have already submitted an offer for this request. Only one offer per request is allowed.",
      buildingType: "Building Type",
      commercial: "Commercial",
      residential: "Residential",
      notApproved:
        "Your account has not been approved by admin yet — you cannot submit offers until approved.",
      phoneDisclosure:
        "If your offer is accepted, you and the property owner exchange phone numbers for direct contact.",
      invalidFileType: "Only PDF files are accepted",
      fileTooLarge: "File size exceeds 10MB",
    },
  };

  const t = content[lang];

  const { data: providerData } = useQuery({
    queryKey: ["/api/provider/dashboard"],
    queryFn: async () => {
      const token = localStorage.getItem("sessionToken");
      const res = await fetch("/api/provider/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("provider_not_found");
      return res.json();
    },
  });

  const { data: request, isLoading } = useQuery({
    queryKey: ["/api/provider/requests", requestId],
    queryFn: async () => {
      const token = localStorage.getItem("sessionToken");
      const res = await fetch(`/api/provider/requests/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("request_not_found");
      return res.json();
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
      if (!providerData?.provider?.id) throw new Error("provider_not_found");
      if (!providerData.provider.approved) throw new Error("not_approved");

      const cleanItems = lineItems
        .map((li) => ({ service: li.service.trim(), price_per_unit: parseFloat(li.price_per_unit) }))
        .filter((li) => li.service.length >= 2 && Number.isFinite(li.price_per_unit));
      if (cleanItems.length === 0) throw new Error("no_line_items");

      const token = localStorage.getItem("sessionToken");

      // The PDF is optional now: the structured breakdown is what the owner reads.
      let fileName: string | null = null;
      if (offerFile) {
        if (
          !["application/pdf"].includes(offerFile.type) &&
          !offerFile.name.toLowerCase().endsWith(".pdf")
        ) {
          throw new Error("invalid_file_type");
        }
        if (offerFile.size > 10 * 1024 * 1024) {
          throw new Error("file_too_large");
        }
        fileName = `${providerData.provider.id}_${requestId}_${Date.now()}.pdf`;
        const uploadRes = await fetch(
          `/api/upload/offer-document?filename=${encodeURIComponent(fileName)}`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/pdf" },
            body: offerFile,
          }
        );
        if (!uploadRes.ok) {
          const err = await uploadRes.json().catch(() => ({}));
          throw new Error(err.error || "upload_failed");
        }
      }

      const submitRes = await fetch("/api/provider/offers", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          request_id: requestId,
          offer_file_url: fileName,
          notes: notes || null,
          price_total: priceTotal ? parseFloat(priceTotal) : null,
          line_items: cleanItems,
          duration_months: parseInt(durationMonths, 10),
        }),
      });
      if (!submitRes.ok) {
        const err = await submitRes.json().catch(() => ({}));
        throw new Error(err.error || "submit_failed");
      }
      return submitRes.json();
    },
    onSuccess: () => {
      toast({ title: t.success, variant: "default" });
      queryClient.invalidateQueries({ queryKey: ["/api/provider/all-offers"] });
      // Notification emails (provider, owner, admin) are sent server-side inside
      // POST /api/provider/offers. Do not add a client-side trigger here — the old
      // fire-and-forget call could silently fail and drop the owner's alert.
      setLocation("/dashboard/provider");
    },
    onError: (error: any) => {
      if (import.meta.env.DEV) console.error("Offer submission error:", error);
      let errorMessage = t.error;
      if (error.message === "no_file") errorMessage = t.errorFile;
      else if (error.message === "no_line_items") errorMessage = t.errorLineItems;
      else if (error.message === "invalid_file_type") errorMessage = t.invalidFileType;
      else if (error.message === "file_too_large") errorMessage = t.fileTooLarge;
      else if (error.message === "already_submitted") errorMessage = t.alreadySubmitted;
      else if (error.message === "provider_not_found" || error.message === "profile_incomplete")
        errorMessage =
          lang === "ar"
            ? "يرجى إكمال ملف شركتك أولاً"
            : "Please complete your company profile first";
      else if (error.message === "not_approved")
        errorMessage =
          lang === "ar"
            ? "حسابك لم يتم قبوله بعد من قِبل الإدارة"
            : "Your account has not been approved by admin yet";
      else if (error.message === "user_not_found")
        errorMessage =
          lang === "ar"
            ? "لم يتم التعرف على حسابك، حاول تسجيل الدخول مجدداً"
            : "Account not recognized, please log in again";
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
        <Loader2 className="w-8 h-8 animate-spin text-[#1B7FDC]" />
        <p className="text-muted-foreground">{t.loading}</p>
        <button onClick={() => history.back()} className="text-sm text-[#7bb6f0] hover:underline">
          {lang === "ar" ? "رجوع" : "Back"}
        </button>
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <AlertCircle className="w-8 h-8 text-red-500" />
        <p className="text-muted-foreground">{t.error}</p>
        <button onClick={() => history.back()} className="text-sm text-[#7bb6f0] hover:underline">
          {lang === "ar" ? "رجوع" : "Back"}
        </button>
      </div>
    );
  }

  // Sum of the per-unit line prices. Shown as a sanity check only: price_total stays
  // the figure the provider enters, because terms.tsx pins the 1% commission to it.
  // Some offers carry fixed costs that are not per-unit, so the two need not match.
  const lineItemsPerUnitSum = lineItems.reduce((acc, li) => {
    const n = parseFloat(li.price_per_unit);
    return Number.isFinite(n) ? acc + n : acc;
  }, 0);

  const buildingType = request?.properties?.building_type;
  const buildingChipStyle =
    buildingType === "commercial"
      ? { background: "var(--commercial-soft)", color: "#F0A87F" }
      : { background: "var(--residential-soft)", color: "#E58AA0" };
  const buildingLabel =
    buildingType === "commercial"
      ? lang === "ar"
        ? "تجاري"
        : "Commercial"
      : lang === "ar"
        ? "سكني"
        : "Residential";

  return (
    <div className="min-h-screen" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Emerald gradient header strip */}
      <div
        style={{ background: "linear-gradient(135deg, #0e3a5c, #193546)" }}
        className="py-5 px-4 flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {request?.properties?.name && (
            <span className="text-white font-bold text-lg">{request.properties.name}</span>
          )}
          {buildingType && (
            <span
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={buildingChipStyle}
            >
              {buildingLabel}
            </span>
          )}
        </div>
        <div className="text-right">
          <div className="text-white font-extrabold text-lg tracking-wide">عِمارة</div>
          <div className="text-white/80 text-xs">{t.title}</div>
        </div>
      </div>

      <div className="container mx-auto p-4 max-w-4xl py-8">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard/provider/requests")}
          className="mb-4"
        >
          {lang === "ar" ? (
            <ArrowRight className="w-4 h-4 me-2" />
          ) : (
            <ArrowLeft className="w-4 h-4 me-2" />
          )}
          {t.back}
        </Button>

        {/* Issue 3: early approval gate banner */}
        {isNotApproved && (
          <div className="mb-4 flex items-start gap-3 rounded-xl border-s-4 border-orange-500/40 bg-orange-500/10 px-4 py-3">
            <AlertCircle className="h-5 w-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <span className="text-sm text-foreground font-medium">{t.notApproved}</span>
          </div>
        )}

        {/* Issue 5B: phone consent checkbox */}
        <div className="flex items-start gap-3 rounded-xl border px-4 py-3 mb-4" style={{ borderColor: "var(--border)", background: "var(--provider-soft)" }}>
          <input
            type="checkbox"
            id="phoneConsent"
            checked={phoneConsent}
            onChange={(e) => setPhoneConsent(e.target.checked)}
            className="mt-1 h-4 w-4 accent-[#1B7FDC] flex-shrink-0 cursor-pointer"
          />
          <label
            htmlFor="phoneConsent"
            className="text-sm text-foreground cursor-pointer leading-relaxed"
          >
            {lang === "ar"
              ? "أوافق على تبادل رقم الجوال مع مالك العقار في حال قبول عرضي"
              : "I agree to exchange phone numbers with the property owner if my offer is accepted"}
          </label>
        </div>

        {providerData?.provider?.company_name && (
          <div className="mb-4 flex items-center gap-2 rounded-xl border-s-4 px-4 py-3 text-sm font-medium text-foreground" style={{ borderInlineStartColor: "var(--provider)", background: "var(--provider-soft)" }}>
            <Building2 className="h-4 w-4 shrink-0" />
            <span>
              {lang === "ar"
                ? `سيُقدَّم هذا العرض باسم: ${providerData.provider.company_name}`
                : `This offer will be submitted as: ${providerData.provider.company_name}`}
            </span>
          </div>
        )}

        {/* Scope of services — unified read-only card */}
        <div
          className="mb-6 rounded-xl border p-4 text-sm bg-white/5"
          style={{ borderColor: "var(--border)" }}
        >
          <p className="text-foreground leading-relaxed mb-3">{t.scopePart1}</p>
          <p className="text-muted-foreground leading-relaxed font-medium">{t.scopePart2}</p>
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
                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <p className="text-sm">{request.properties.address}</p>
                  </div>
                </div>
              )}

              {/* Issue 2: units_count — commercial properties are measured in m² */}
              {request.properties?.units_count && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {request.properties?.building_type === "commercial"
                      ? lang === "ar"
                        ? "المساحة (م²)"
                        : "Area (m²)"
                      : t.units}
                    :
                  </p>
                  <p className="font-medium">
                    {request.properties.units_count}
                    {request.properties?.building_type === "commercial"
                      ? lang === "ar"
                        ? " م²"
                        : " m²"
                      : ""}
                  </p>
                </div>
              )}

              {request.contract_start_date && (
                <div>
                  <p className="text-sm text-muted-foreground">
                    {lang === "ar" ? "بداية العقد المطلوبة" : "Requested contract start"}:
                  </p>
                  <p className="font-medium">
                    {formatContractDate(request.contract_start_date, lang)}
                  </p>
                </div>
              )}

              <div>
                <p className="text-sm text-muted-foreground">{t.buildingType}:</p>
                <p className="font-medium">
                  {request.properties?.building_type === "commercial"
                    ? t.commercial
                    : t.residential}
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
              <CardTitle>{t.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="offer-file">{t.offerFileOptional}</Label>
                  <p className="text-xs text-muted-foreground mt-1">{t.offerFileHint}</p>
                  <div className="mt-2">
                    <input
                      type="file"
                      id="offer-file"
                      accept=".pdf,application/pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="offer-file">
                      <div className="border-2 border-dashed border-border rounded-xl p-6 text-center cursor-pointer hover:border-primary bg-card transition-colors">
                        {offerFile ? (
                          <>
                            <FileText className="h-12 w-12 mx-auto text-green-400 mb-2" />
                            <p className="text-sm font-medium text-green-400">{t.fileSelected}</p>
                            <p className="text-xs text-muted-foreground mt-1">{offerFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              ({(offerFile.size / 1024 / 1024).toFixed(2)} MB)
                            </p>
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

                </div>

                {/* Structured line items. This is what the owner actually reads
                    before deciding, and what turns "a PDF and one number" into a
                    comparable offer. */}
                <div>
                  <Label>
                    {t.lineItems} <span className="text-red-500">*</span>
                  </Label>
                  <p className="text-xs text-muted-foreground mt-1">{t.lineItemsHint}</p>
                  <div className="mt-3 space-y-3">
                    {lineItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border p-3 space-y-2"
                        style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.02)" }}
                      >
                        <div className="flex items-center gap-2">
                          <input
                            aria-label={`${t.lineItemService} ${idx + 1}`}
                            placeholder={t.lineItemServicePlaceholder}
                            value={item.service}
                            onChange={(e) => {
                              const next = [...lineItems];
                              next[idx] = { ...next[idx], service: e.target.value };
                              setLineItems(next);
                            }}
                            maxLength={120}
                            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                          {lineItems.length > 1 && (
                            <button
                              type="button"
                              aria-label={t.removeLineItem}
                              title={t.removeLineItem}
                              onClick={() => setLineItems(lineItems.filter((_, i) => i !== idx))}
                              className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:text-red-400 hover:border-red-400/50"
                              style={{ borderColor: "var(--border)" }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            aria-label={`${t.lineItemPrice} ${idx + 1}`}
                            type="number"
                            min="0"
                            step="1"
                            placeholder={t.lineItemPrice}
                            value={item.price_per_unit}
                            onChange={(e) => {
                              const next = [...lineItems];
                              next[idx] = { ...next[idx], price_per_unit: e.target.value };
                              setLineItems(next);
                            }}
                            className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-2 flex items-center justify-between gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setLineItems([...lineItems, { service: "", price_per_unit: "" }])}
                      disabled={lineItems.length >= 20}
                    >
                      <Plus className="h-4 w-4 me-1" />
                      {t.addLineItem}
                    </Button>
                    {lineItemsPerUnitSum > 0 && (
                      <span className="text-xs text-muted-foreground">
                        {t.lineItemsSum}: {lineItemsPerUnitSum.toLocaleString("en-US")}
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="duration-months">
                    {t.duration} <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="duration-months"
                    value={durationMonths}
                    onChange={(e) => setDurationMonths(e.target.value)}
                    className="mt-2 flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {[3, 6, 12, 18, 24, 36].map((m) => (
                      <option key={m} value={String(m)}>
                        {m} {t.durationMonths}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="price-total">
                    {t.priceTotal} <span className="text-red-500">*</span>
                  </Label>
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
                  <p className="text-xs text-muted-foreground mt-1">
                    {request?.properties?.building_type === "commercial"
                      ? t.priceTotalHintSqm
                      : t.priceTotalHint}
                  </p>
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
                    className="flex-1 text-white"
                    style={{ background: "var(--provider)" }}
                    disabled={
                      mutation.isPending ||
                      !!isNotApproved ||
                      !phoneConsent ||
                      !priceTotal ||
                      !durationMonths ||
                      !lineItems.some(
                        (li) => li.service.trim().length >= 2 && li.price_per_unit !== ""
                      )
                    }
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
    </div>
  );
}
