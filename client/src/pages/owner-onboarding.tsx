import { useState } from "react";
import ContractStartDatePicker from "@/components/ContractStartDatePicker";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, Building2, ClipboardList, FileText, Home, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLang } from "@/hooks/use-lang";
import AmbientBackground from "@/components/AmbientBackground";
import { trackConversion } from "@/lib/gtag";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PropertyResponse {
  id: string;
  name: string;
  building_type: string;
  address: string;
  city: string;
  units_count: number | null;
  map_url: string | null;
  national_address: string | null;
}

interface RequestResponse {
  id: string;
  property_id: string;
  service_category: string;
  status: string;
}

interface ApiErrorBody {
  error?: string;
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DISTRICTS: { ar: string; en: string }[] = [
  { ar: "العليا", en: "Al Olaya" },
  { ar: "النزهة", en: "Al Nuzha" },
  { ar: "الملقا", en: "Al Malqa" },
  { ar: "الغدير", en: "Al Ghadir" },
  { ar: "حطين", en: "Hittin" },
  { ar: "الياسمين", en: "Al Yasmin" },
  { ar: "الورود", en: "Al Wurud" },
  { ar: "الروضة", en: "Al Rawdah" },
  { ar: "المروج", en: "Al Muruj" },
  { ar: "الربوة", en: "Al Rabwah" },
  { ar: "السليمانية", en: "Al Sulaymaniyah" },
  { ar: "الحمراء", en: "Al Hamra" },
  { ar: "الفيصلية", en: "Al Faisaliyah" },
  { ar: "الوزارات", en: "Al Wizarat" },
  { ar: "العقيق", en: "Al Aqiq" },
  { ar: "الصحافة", en: "Al Sahafa" },
  { ar: "الشفا", en: "Al Shifa" },
  { ar: "المصيف", en: "Al Musayf" },
  { ar: "الروابي", en: "Al Rawabi" },
  { ar: "قرطبة", en: "Qurtuba" },
  { ar: "بنبان", en: "Banban" },
  { ar: "النرجس", en: "Al Narjis" },
  { ar: "الواحة", en: "Al Wahah" },
  { ar: "الخزامى", en: "Al Khuzama" },
  { ar: "المهدية", en: "Al Mahdiyah" },
  { ar: "الطيبة", en: "Al Taybah" },
  { ar: "أم الحمام", en: "Umm Al Hamam" },
  { ar: "البديعة", en: "Al Badi'ah" },
  { ar: "لبن", en: "Laban" },
  { ar: "الدار البيضاء", en: "Al Dar Al Baida" },
  { ar: "الشميسي", en: "Al Shumaisi" },
  { ar: "الفيحاء", en: "Al Fayhaa" },
  { ar: "المنصورة", en: "Al Mansurah" },
  { ar: "الجزيرة", en: "Al Jazirah" },
  { ar: "النسيم", en: "Al Nasim" },
  { ar: "العزيزية", en: "Al Aziziyah" },
  { ar: "ذهبان", en: "Dhahban" },
  { ar: "المعيزيلة", en: "Al Muaizilah" },
  { ar: "الحزم", en: "Al Hazm" },
  { ar: "الرمال", en: "Al Rimal" },
  { ar: "البرية", en: "Al Bariyah" },
  { ar: "السعادة", en: "Al Saadah" },
  { ar: "الشرق", en: "Al Sharq" },
  { ar: "الوادي", en: "Al Wadi" },
];

const UNIT_OPTIONS: number[] = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26];

const MAP_URL_PREFIXES: string[] = [
  "https://maps.google.com",
  "https://maps.app.goo.gl",
  "https://goo.gl/maps",
];

// Unified SOW — single text for both residential and commercial (LOCKED — do not change)
const UNIFIED_SCOPE = {
  part1:
    "نظافة دورية للمناطق المشتركة والمداخل والأسطح والخزانات وإدارة النفايات، صيانة شاملة للإنارة والمضخات والتكييف المركزي (HVAC) والمصاعد والسلالم المتحركة والكاميرات ومنظومة الإطفاء، رش مبيدات وبستنة عند الحاجة، طوارئ على مدار الساعة، تسديد فواتير المرافق، مع توضيح آلية العمل في الإجازات والمناسبات الوطنية.",
  part2:
    "متطلبات العرض: تفصيل الخدمات والسعر لكل وحدة وإجمالي العقد شاملاً الضريبة وشروط الدفع، لمدة سنة قابلة للتجديد.",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function isValidMapUrl(url: string): boolean {
  return MAP_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function OwnerOnboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { lang } = useLang();

  // Form state
  const [propertyName, setPropertyName] = useState("");
  const [buildingType, setBuildingType] = useState<"residential" | "commercial">("residential");
  const [neighborhood, setNeighborhood] = useState("");
  const [unitsCount, setUnitsCount] = useState("");
  const [customUnits, setCustomUnits] = useState("");
  const [areaSqm, setAreaSqm] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [nationalAddress, setNationalAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [contractStartDate, setContractStartDate] = useState<string | null>(null);
  const [ownerEmail, setOwnerEmail] = useState("");

  // UI state
  const [showValidation, setShowValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapUrlTouched, setMapUrlTouched] = useState(false);

  // Derived validation
  const isMapUrlValid = mapUrl.trim() === "" || isValidMapUrl(mapUrl.trim());
  const isPropertyNameValid = propertyName.trim().length > 0;
  const isNeighborhoodValid = neighborhood !== "";
  // Commercial properties are measured in m²; residential in units
  const isUnitsValid =
    buildingType === "commercial"
      ? areaSqm.trim() !== "" && parseInt(areaSqm.trim(), 10) > 0
      : unitsCount !== "" && (unitsCount !== "other" || customUnits.trim().length > 0);
  const isMapUrlPresent = mapUrl.trim().length > 0;
  // Saudi short national address: 4 letters + 4 digits (e.g. RUYF1234) — optional
  const isNationalAddressValid =
    nationalAddress.trim() === "" || /^[A-Z]{4}\d{4}$/.test(nationalAddress.trim());
  const isFormValid =
    isPropertyNameValid &&
    isNeighborhoodValid &&
    isUnitsValid &&
    isMapUrlPresent &&
    isMapUrlValid &&
    isNationalAddressValid;

  // ---------------------------------------------------------------------------
  // Submit handler
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Step 1 — validate
    setShowValidation(true);
    if (!isFormValid) {
      toast({
        title: lang === "ar" ? "يرجى إكمال جميع الحقول المطلوبة" : "Please complete all required fields",
        variant: "destructive",
      });
      return;
    }

    // Step 2 — lock UI
    setIsSubmitting(true);

    const token = localStorage.getItem("sessionToken");

    // Step 3 — POST /api/properties
    let propertyData: PropertyResponse;
    try {
      const unitsValue =
        buildingType === "commercial"
          ? parseInt(areaSqm.trim(), 10)
          : unitsCount === "other"
            ? parseInt(customUnits.trim(), 10)
            : parseInt(unitsCount, 10);

      const propertyRes = await fetch("/api/properties", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: propertyName.trim(),
          building_type: buildingType,
          address: neighborhood,
          city: "الرياض",
          units_count: isNaN(unitsValue) ? null : unitsValue,
          map_url: mapUrl.trim(),
          national_address: nationalAddress.trim() || undefined,
        }),
      });

      const propertyBody: PropertyResponse & ApiErrorBody = await propertyRes
        .json()
        .catch(() => ({}) as PropertyResponse & ApiErrorBody);

      if (!propertyRes.ok) {
        if (propertyBody.error === "limit_reached") {
          toast({
            title: lang === "ar" ? "لديك عقار مسجل مسبقاً" : "You already have a registered property",
            variant: "destructive",
          });
          setIsSubmitting(false);
          setLocation("/dashboard/owner");
          return;
        }
        toast({
          title:
            propertyBody.error ??
            (lang === "ar"
              ? `خطأ في الخادم (${propertyRes.status})`
              : `Server error (${propertyRes.status})`),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      propertyData = propertyBody as PropertyResponse;
    } catch {
      toast({
        title:
          lang === "ar"
            ? "تعذّر الاتصال بالخادم. تحقق من الاتصال وحاول مجدداً."
            : "Could not reach the server. Check your connection and try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Step 4 — extract property id
    const propertyId = propertyData.id;

    // Step 4b — save optional notification email FIRST, so the request-created
    // confirmation email can fire from POST /api/requests.
    if (ownerEmail.trim() && token) {
      await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: ownerEmail.trim() }),
      }).catch(() => {});
    }

    // Step 5 — POST /api/requests (soft failure)
    let newRequestId: string | null = null;
    try {
      const requestRes = await fetch("/api/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          property_id: propertyId,
          service_category: "standard",
          description: notes.trim() || null,
          contract_start_date: contractStartDate,
        }),
      });

      if (requestRes.ok) {
        const requestBody: RequestResponse = await requestRes
          .json()
          .catch(() => ({ id: "" }) as RequestResponse);
        newRequestId = requestBody.id ?? null;
      } else {
        toast({
          title:
            lang === "ar"
              ? "تم إنشاء العقار. يمكنك رفع الطلب من لوحة التحكم."
              : "Property created. You can submit the request from your dashboard.",
          variant: "default",
        });
      }
    } catch {
      toast({
        title:
          lang === "ar"
            ? "تم إنشاء العقار. يمكنك رفع الطلب من لوحة التحكم."
            : "Property created. You can submit the request from your dashboard.",
        variant: "default",
      });
    }

    // Provider notifications are sent server-side inside POST /api/requests.
    // Do not add a client-side trigger here — the old fire-and-forget call ran
    // just before the redirect below, so a failed call or a closed tab meant no
    // provider was ever told the request existed.

    // Step 7 — invalidate query cache (include "owner-property" so dashboard loads fresh data)
    queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    queryClient.invalidateQueries({ queryKey: ["owner-property"] });

    // Step 8 — success toast
    toast({
      title:
        lang === "ar"
          ? "تم إرسال طلبك بنجاح! سيتواصل معك المزودون قريباً."
          : "Your request was submitted! Providers will be in touch soon.",
      description:
        lang === "ar"
          ? "يمكنك تعديل طلبك من لوحة التحكم قبل وصول أول عرض — بعد أول عرض يُقفل التعديل حتى ترفض جميع العروض."
          : "You can edit your request from the dashboard before the first offer arrives — editing locks after the first offer until you reject all offers.",
      variant: "default",
    });

    // Primary Google Ads conversion — property + service request submitted.
    trackConversion("request_submitted", {
      building_type: buildingType,
      has_request: newRequestId !== null,
    });

    // Step 9 — navigate
    setLocation("/dashboard/owner");
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="page-enter min-h-screen" dir="rtl">
      <AmbientBackground />
      {/* ── Branded header ── */}
      <div
        className="px-6 pt-8 pb-7 text-white"
        style={{
          background: "linear-gradient(135deg, #0f3a47, #193546)",
          borderBottom: "2px solid var(--owner)",
        }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="mb-6">
            <span className="text-xl font-bold tracking-wide">{lang === "ar" ? "عِمارة" : "Emaraa"}</span>
          </div>
          <h1 className="text-2xl font-bold leading-snug mb-2">
            {lang === "ar" ? "أهلاً! سجّل عقارك وأرسل أول طلب خدمة" : "Welcome! Register your property and send your first service request"}
          </h1>
          <p className="text-sm" style={{ opacity: 0.78 }}>
            {lang === "ar"
              ? "خطوة واحدة تنشئ حسابك كاملاً وتُخطر المزودين المعتمدين في الرياض"
              : "One step creates your full account and notifies approved providers in Riyadh"}
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>

          {/* ── SECTION 1 — Property data ── */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: "var(--owner)" }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                style={{ width: "1.5rem", height: "1.5rem", background: "var(--owner)", color: "#04222c", flexShrink: 0 }}
              >
                1
              </span>
              {lang === "ar" ? "بيانات العقار" : "Property Details"}
            </p>
            <Card className="rounded-xl shadow-sm">
              <CardContent className="pt-6 space-y-5">
                {/* Property name */}
                <div className="space-y-1.5">
                  <Label htmlFor="propertyName">{lang === "ar" ? "اسم العقار *" : "Property Name *"}</Label>
                  <Input
                    id="propertyName"
                    placeholder={lang === "ar" ? "مثال: برج الياسمين" : "e.g. Al Yasmin Tower"}
                    value={propertyName}
                    onChange={(e) => setPropertyName(e.target.value)}
                    className={
                      showValidation && !isPropertyNameValid
                        ? "border-red-500 focus-visible:ring-red-400"
                        : ""
                    }
                  />
                  {showValidation && !isPropertyNameValid && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {lang === "ar" ? "اسم العقار مطلوب" : "Property name is required"}
                    </p>
                  )}
                </div>

                {/* Building type — tag selector */}
                <div className="space-y-1.5">
                  <Label>{lang === "ar" ? "نوع المبنى *" : "Building Type *"}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setBuildingType("residential")}
                      className="rounded-xl py-4 px-3 flex flex-col items-center gap-2 cursor-pointer transition-colors"
                      style={
                        buildingType === "residential"
                          ? { border: "2px solid var(--residential)", background: "var(--residential-soft)" }
                          : { border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)" }
                      }
                    >
                      <Home
                        className="w-6 h-6"
                        style={{ color: buildingType === "residential" ? "#E58AA0" : "#9FC2D3" }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: buildingType === "residential" ? "#E58AA0" : "#9FC2D3" }}
                      >
                        {lang === "ar" ? "سكني" : "Residential"}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setBuildingType("commercial")}
                      className="rounded-xl py-4 px-3 flex flex-col items-center gap-2 cursor-pointer transition-colors"
                      style={
                        buildingType === "commercial"
                          ? { border: "2px solid var(--commercial)", background: "var(--commercial-soft)" }
                          : { border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)" }
                      }
                    >
                      <Building2
                        className="w-6 h-6"
                        style={{ color: buildingType === "commercial" ? "#F0A87F" : "#9FC2D3" }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: buildingType === "commercial" ? "#F0A87F" : "#9FC2D3" }}
                      >
                        {lang === "ar" ? "تجاري" : "Commercial"}
                      </span>
                    </button>
                  </div>
                </div>

                {/* City — fixed, read-only */}
                <div className="space-y-1.5">
                  <Label htmlFor="city">{lang === "ar" ? "المدينة" : "City"}</Label>
                  <Input
                    id="city"
                    value={lang === "ar" ? "الرياض" : "Riyadh"}
                    disabled
                    readOnly
                    className="opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground">
                    {lang === "ar" ? "الإصدار الأول — الرياض فقط" : "V1 — Riyadh only"}
                  </p>
                </div>

                {/* District */}
                <div className="space-y-1.5">
                  <Label>{lang === "ar" ? "الحي *" : "District *"}</Label>
                  <Select value={neighborhood} onValueChange={setNeighborhood}>
                    <SelectTrigger
                      className={`w-full h-10 text-sm${
                        showValidation && !isNeighborhoodValid ? " border-red-500 ring-red-400" : ""
                      }`}
                    >
                      <SelectValue placeholder={lang === "ar" ? "اختر الحي..." : "Select district..."} />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {DISTRICTS.map((d) => (
                        <SelectItem key={d.ar} value={d.ar}>
                          {lang === "ar" ? d.ar : d.en}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showValidation && !isNeighborhoodValid && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {lang === "ar" ? "يرجى اختيار الحي" : "Please select a district"}
                    </p>
                  )}
                </div>

                {/* Units count (residential) / Area in m² (commercial) */}
                {buildingType === "commercial" ? (
                  <div className="space-y-1.5">
                    <Label htmlFor="areaSqm">{lang === "ar" ? "المساحة (م²) *" : "Area (m²) *"}</Label>
                    <Input
                      id="areaSqm"
                      type="number"
                      min="1"
                      placeholder={lang === "ar" ? "أدخل مساحة العقار بالمتر المربع" : "Enter the property area in square meters"}
                      value={areaSqm}
                      onChange={(e) => setAreaSqm(e.target.value)}
                      className={
                        showValidation && !isUnitsValid ? "border-red-500 ring-red-400" : ""
                      }
                    />
                    {showValidation && !isUnitsValid && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {lang === "ar" ? "يرجى إدخال المساحة بالمتر المربع" : "Please enter the area in square meters"}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <Label>{lang === "ar" ? "عدد الوحدات *" : "Number of Units *"}</Label>
                    <Select
                      value={unitsCount}
                      onValueChange={(v) => {
                        setUnitsCount(v);
                        if (v !== "other") setCustomUnits("");
                      }}
                    >
                      <SelectTrigger
                        className={`w-full h-10 text-sm${
                          showValidation && unitsCount === "" ? " border-red-500 ring-red-400" : ""
                        }`}
                      >
                        <SelectValue placeholder={lang === "ar" ? "اختر عدد الوحدات..." : "Select number of units..."} />
                      </SelectTrigger>
                      <SelectContent>
                        {UNIT_OPTIONS.map((n) => (
                          <SelectItem key={n} value={String(n)}>
                            {lang === "ar" ? `${n} وحدة` : `${n} units`}
                          </SelectItem>
                        ))}
                        <SelectItem value="other">{lang === "ar" ? "أخرى" : "Other"}</SelectItem>
                      </SelectContent>
                    </Select>
                    <div
                      className="overflow-hidden transition-all duration-200"
                      style={{
                        maxHeight: unitsCount === "other" ? "80px" : "0",
                        opacity: unitsCount === "other" ? 1 : 0,
                      }}
                    >
                      <Input
                        type="number"
                        min="1"
                        placeholder={lang === "ar" ? "أدخل عدد الوحدات" : "Enter number of units"}
                        value={customUnits}
                        onChange={(e) => setCustomUnits(e.target.value)}
                        className={`mt-2 ${
                          showValidation && unitsCount === "other" && customUnits.trim() === ""
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                    </div>
                    {showValidation && !isUnitsValid && (
                      <p className="text-red-500 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {unitsCount === "other"
                          ? lang === "ar"
                            ? "يرجى إدخال عدد الوحدات"
                            : "Please enter the number of units"
                          : lang === "ar"
                            ? "يرجى اختيار عدد الوحدات"
                            : "Please select the number of units"}
                      </p>
                    )}
                  </div>
                )}

                {/* Google Maps URL */}
                <div className="space-y-1.5">
                  <Label htmlFor="mapUrl">{lang === "ar" ? "رابط الموقع على Google Maps *" : "Google Maps Location Link *"}</Label>
                  <Input
                    id="mapUrl"
                    type="url"
                    placeholder="https://maps.google.com/..."
                    value={mapUrl}
                    onChange={(e) => setMapUrl(e.target.value)}
                    onBlur={() => setMapUrlTouched(true)}
                    className={
                      (showValidation || mapUrlTouched) && (!isMapUrlPresent || !isMapUrlValid)
                        ? "border-red-500 focus-visible:ring-red-400"
                        : ""
                    }
                  />
                  {(showValidation || mapUrlTouched) && !isMapUrlPresent && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {lang === "ar" ? "رابط الخريطة مطلوب" : "Map link is required"}
                    </p>
                  )}
                  {(showValidation || mapUrlTouched) && isMapUrlPresent && !isMapUrlValid && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {lang === "ar"
                        ? "الرابط غير صحيح — استخدم رابطاً من Google Maps"
                        : "Invalid link — use a Google Maps link"}
                    </p>
                  )}
                </div>

                {/* National address — optional */}
                <div className="space-y-1.5">
                  <Label htmlFor="nationalAddress" className="flex items-center gap-1.5">
                    {lang === "ar" ? "العنوان الوطني" : "National Address"}{" "}
                    <span className="text-muted-foreground font-normal text-xs">
                      {lang === "ar" ? "(اختياري)" : "(optional)"}
                    </span>
                  </Label>
                  <Input
                    id="nationalAddress"
                    type="text"
                    placeholder={lang === "ar" ? "مثال: RUYF1234" : "e.g. RUYF1234"}
                    value={nationalAddress}
                    maxLength={8}
                    onChange={(e) =>
                      setNationalAddress(
                        e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
                      )
                    }
                    className={`border-dashed${
                      nationalAddress.trim() !== "" && !isNationalAddressValid
                        ? " border-red-500"
                        : ""
                    }`}
                  />
                  {nationalAddress.trim() !== "" && !isNationalAddressValid && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      {lang === "ar"
                        ? "العنوان الوطني المختصر: 4 أحرف ثم 4 أرقام — مثال: RUYF1234"
                        : "Short national address: 4 letters then 4 digits — e.g. RUYF1234"}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── SECTION 2 — Service scope (unified, read-only) ── */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: "var(--owner)" }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                style={{ width: "1.5rem", height: "1.5rem", background: "var(--owner)", color: "#04222c", flexShrink: 0 }}
              >
                2
              </span>
              {lang === "ar" ? "نطاق الخدمة" : "Service Scope"}
            </p>
            <Card className="rounded-xl shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <ClipboardList
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: "var(--owner)" }}
                  />
                  <p className="text-sm font-medium text-foreground">
                    {lang === "ar" ? "نطاق الخدمات المطلوبة" : "Required Service Scope"}
                  </p>
                </div>
                <div className="space-y-3 text-sm text-foreground leading-relaxed">
                  <p>{UNIFIED_SCOPE.part1}</p>
                  <p
                    className="text-xs leading-relaxed pt-2 border-t"
                    style={{ color: "#9FC2D3", borderColor: "var(--border)" }}
                  >
                    {UNIFIED_SCOPE.part2}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── SECTION 3 — Notes for providers (optional) ── */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: "var(--owner)" }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full text-xs font-bold"
                style={{ width: "1.5rem", height: "1.5rem", background: "var(--owner)", color: "#04222c", flexShrink: 0 }}
              >
                3
              </span>
              {lang === "ar" ? "ملاحظات للمزودين (اختياري)" : "Notes for Providers (optional)"}
            </p>
            <Card className="rounded-xl shadow-sm">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <div className="mb-5">
                    <ContractStartDatePicker
                      value={contractStartDate}
                      onChange={setContractStartDate}
                    />
                  </div>
                  <Label htmlFor="notes" className="text-sm text-muted-foreground">
                    {lang === "ar" ? "تفاصيل أو ملاحظات إضافية للمزودين" : "Additional details or notes for providers"}
                  </Label>
                </div>
                <Textarea
                  id="notes"
                  placeholder={lang === "ar" ? "اكتب أي تفاصيل تريد إيصالها للمزودين..." : "Write any details you'd like providers to know..."}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  rows={4}
                  maxLength={500}
                  className="resize-none text-base"
                />
                <p className="text-xs text-muted-foreground text-start">{notes.length} / 500</p>
              </CardContent>
            </Card>
          </div>

          {/* ── Notification email (optional) ── */}
          <div>
            <p className="flex items-center gap-2 text-base font-semibold mb-3">
              <span
                className="flex items-center justify-center w-7 h-7 rounded-lg text-sm"
                style={{ background: "var(--owner-soft)", color: "var(--owner)" }}
              >
                <Mail className="w-4 h-4" />
              </span>
              {lang === "ar" ? "البريد الإلكتروني للإشعارات (اختياري)" : "Notification Email (optional)"}
            </p>
            <Card className="rounded-xl shadow-sm">
              <CardContent className="pt-6 space-y-2">
                <Label htmlFor="owner_email" className="text-sm text-muted-foreground">
                  {lang === "ar" ? "أضف بريدك لتصلك إشعارات عن طلبك" : "Add your email to get notifications about your request"}
                </Label>
                <Input
                  id="owner_email"
                  type="email"
                  inputMode="email"
                  dir="ltr"
                  placeholder="example@email.com"
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="text-base text-start"
                />
                <p className="text-xs text-muted-foreground text-start">
                  {lang === "ar"
                    ? "سنُرسل لك بريداً عند استلام طلبك، ووصول عرض جديد، وقبول العرض — بدون الحاجة لتسجيل الدخول للتحقق."
                    : "We'll email you when your request is received, when a new offer arrives, and when you accept an offer — no need to log in to check."}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* ── Submit ── */}
          <div>
            <Button
              type="submit"
              className="w-full py-6 text-base font-semibold rounded-xl shadow-md"
              style={{ background: "var(--owner)", color: "#04222c" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {lang === "ar" ? "جاري الإرسال..." : "Sending..."}
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {lang === "ar"
                    ? "أرسل طلبي — ينشئ عقاراً وطلباً في خطوة واحدة"
                    : "Send My Request — creates a property and a request in one step"}
                </span>
              )}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-2">
              {lang === "ar"
                ? "ستُنشأ تلقائياً: عقار + طلب خدمة + إشعار للمزودين"
                : "This will automatically create: a property + a service request + a provider notification"}
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
