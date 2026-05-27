import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, AlertCircle, Building2, ClipboardList, FileText, Home } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
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

const NEIGHBORHOODS: string[] = [
  "العليا",
  "النزهة",
  "الملقا",
  "الغدير",
  "حطين",
  "الياسمين",
  "الورود",
  "الروضة",
  "المروج",
  "الربوة",
  "السليمانية",
  "الحمراء",
  "الفيصلية",
  "الوزارات",
  "العقيق",
  "الصحافة",
  "الشفا",
  "المصيف",
  "الروابي",
  "قرطبة",
  "بنبان",
  "النرجس",
  "الواحة",
  "الخزامى",
  "المهدية",
  "الطيبة",
  "أم الحمام",
  "البديعة",
  "لبن",
  "الدار البيضاء",
  "الشميسي",
  "الفيحاء",
  "المنصورة",
  "الجزيرة",
  "النسيم",
  "العزيزية",
  "ذهبان",
  "المعيزيلة",
  "الحزم",
  "الرمال",
  "البرية",
  "السعادة",
  "الشرق",
  "الوادي",
];

const UNIT_OPTIONS: number[] = [2, 4, 6, 8, 10, 12, 14, 16, 18, 20, 22, 24, 26];

const MAP_URL_PREFIXES: string[] = [
  "https://maps.google.com",
  "https://maps.app.goo.gl",
  "https://goo.gl/maps",
];

const SERVICE_SCOPE: Record<string, { part1: string; part2: string }> = {
  residential: {
    part1:
      "نظافة يومية للمناطق المشتركة والأسطح والخزانات ونقل النفايات، صيانة دورية للإنارة والمضخات والمصاعد والكاميرات، رش مبيدات وبستنة عند الحاجة، طوارئ على مدار الساعة، تسديد فواتير المرافق، مع توضيح آلية العمل في الإجازات والمناسبات الوطنية.",
    part2:
      "متطلبات العرض: تفصيل الخدمات والسعر لكل وحدة وإجمالي العقد شاملاً الضريبة وشروط الدفع، مع السجل التجاري والاعتمادات والمراجع أو البورتفوليو، لمدة سنة قابلة للتجديد.",
  },
  commercial: {
    part1:
      "نظافة شاملة للمداخل والردهات والأدوار والمواقف والمرافق العامة، صيانة أنظمة التكييف المركزي (HVAC) والمصاعد والسلالم المتحركة والكاميرات ومنظومة الإطفاء، إدارة النفايات، طوارئ 24/7، تسديد فواتير المرافق.",
    part2:
      "متطلبات العرض: السعر لكل طابق أو وحدة تجارية، إجمالي شامل الضريبة، السجل التجاري، شهادات اعتماد، ومراجع لمشاريع تجارية مماثلة. لمدة سنة قابلة للتجديد.",
  },
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

  // Form state
  const [propertyName, setPropertyName] = useState("");
  const [buildingType, setBuildingType] = useState<"residential" | "commercial">("residential");
  const [neighborhood, setNeighborhood] = useState("");
  const [unitsCount, setUnitsCount] = useState("");
  const [customUnits, setCustomUnits] = useState("");
  const [mapUrl, setMapUrl] = useState("");
  const [nationalAddress, setNationalAddress] = useState("");
  const [notes, setNotes] = useState("");

  // UI state
  const [showValidation, setShowValidation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mapUrlTouched, setMapUrlTouched] = useState(false);

  // Derived validation
  const isMapUrlValid = mapUrl.trim() === "" || isValidMapUrl(mapUrl.trim());
  const isPropertyNameValid = propertyName.trim().length > 0;
  const isNeighborhoodValid = neighborhood !== "";
  const isUnitsValid =
    unitsCount !== "" && (unitsCount !== "other" || customUnits.trim().length > 0);
  const isMapUrlPresent = mapUrl.trim().length > 0;
  const isFormValid =
    isPropertyNameValid && isNeighborhoodValid && isUnitsValid && isMapUrlPresent && isMapUrlValid;

  // ---------------------------------------------------------------------------
  // Submit handler
  // ---------------------------------------------------------------------------

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // Step 1 — validate
    setShowValidation(true);
    if (!isFormValid) return;

    // Step 2 — lock UI
    setIsSubmitting(true);

    const token = localStorage.getItem("sessionToken");

    // Step 3 — POST /api/properties
    let propertyData: PropertyResponse;
    try {
      const unitsValue =
        unitsCount === "other" ? parseInt(customUnits.trim(), 10) : parseInt(unitsCount, 10);

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
            title: "لديك عقار مسجل مسبقاً",
            variant: "destructive",
          });
          setIsSubmitting(false);
          setLocation("/dashboard/owner");
          return;
        }
        toast({
          title: propertyBody.error ?? `خطأ في الخادم (${propertyRes.status})`,
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      propertyData = propertyBody as PropertyResponse;
    } catch {
      toast({
        title: "تعذّر الاتصال بالخادم. تحقق من الاتصال وحاول مجدداً.",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    // Step 4 — extract property id
    const propertyId = propertyData.id;

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
        }),
      });

      if (requestRes.ok) {
        const requestBody: RequestResponse = await requestRes
          .json()
          .catch(() => ({ id: "" }) as RequestResponse);
        newRequestId = requestBody.id ?? null;
      } else {
        toast({
          title: "تم إنشاء العقار. يمكنك رفع الطلب من لوحة التحكم.",
          variant: "default",
        });
      }
    } catch {
      toast({
        title: "تم إنشاء العقار. يمكنك رفع الطلب من لوحة التحكم.",
        variant: "default",
      });
    }

    // Step 6 — fire-and-forget SMS
    if (newRequestId && token) {
      fetch("/api/sms/new-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ requestId: newRequestId }),
      }).catch(() => {});
    }

    // Step 7 — invalidate query cache (include "owner-property" so dashboard loads fresh data)
    queryClient.invalidateQueries({ queryKey: ["owner-stats"] });
    queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
    queryClient.invalidateQueries({ queryKey: ["owner-property"] });

    // Step 8 — success toast
    toast({
      title: "تم إرسال طلبك بنجاح! سيتواصل معك المزودون قريباً.",
      variant: "default",
    });

    // Step 9 — navigate
    setLocation("/dashboard/owner");
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <div className="page-enter min-h-screen bg-[#F9F9FF]" dir="rtl">
      {/* ── Page header ── */}
      <div className="px-6 py-10 text-white" style={{ background: "#2E4A6B" }}>
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold leading-snug mb-2">
            أهلاً! سجّل عقارك وأرسل أول طلب خدمة
          </h1>
          <p className="text-sm opacity-80">
            خطوة واحدة تنشئ حسابك كاملاً وتُخطر المزودين المعتمدين في الرياض
          </p>
        </div>
      </div>

      {/* ── Form ── */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          {/* ────────────────────────────────────────────────
              SECTION 1 — Property data
          ──────────────────────────────────────────────── */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: "#2E4A6B" }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full text-xs font-bold text-white"
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  background: "#2E4A6B",
                  flexShrink: 0,
                }}
              >
                1
              </span>
              بيانات العقار
            </p>
            <Card className="rounded-xl shadow-sm">
              <CardContent className="pt-6 space-y-5">
                {/* Property name */}
                <div className="space-y-1.5">
                  <Label htmlFor="propertyName">اسم العقار *</Label>
                  <Input
                    id="propertyName"
                    placeholder="مثال: برج الياسمين"
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
                      اسم العقار مطلوب
                    </p>
                  )}
                </div>

                {/* Building type — clickable cards */}
                <div className="space-y-1.5">
                  <Label>نوع المبنى *</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Residential card — Burgundy #7D3040 */}
                    <button
                      type="button"
                      onClick={() => setBuildingType("residential")}
                      className="rounded-xl py-4 px-3 flex flex-col items-center gap-2 cursor-pointer transition-colors"
                      style={
                        buildingType === "residential"
                          ? { border: "2px solid #7D3040", background: "#FDF0F2" }
                          : { border: "1px solid #E5E7EB", background: "#FFFFFF" }
                      }
                    >
                      <Home
                        className="w-6 h-6"
                        style={{ color: buildingType === "residential" ? "#7D3040" : "#9CA3AF" }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: buildingType === "residential" ? "#7D3040" : "#374151" }}
                      >
                        سكني
                      </span>
                    </button>

                    {/* Commercial card — Terracotta #C4694A */}
                    <button
                      type="button"
                      onClick={() => setBuildingType("commercial")}
                      className="rounded-xl py-4 px-3 flex flex-col items-center gap-2 cursor-pointer transition-colors"
                      style={
                        buildingType === "commercial"
                          ? { border: "2px solid #C4694A", background: "#FDF3EF" }
                          : { border: "1px solid #E5E7EB", background: "#FFFFFF" }
                      }
                    >
                      <Building2
                        className="w-6 h-6"
                        style={{ color: buildingType === "commercial" ? "#C4694A" : "#9CA3AF" }}
                      />
                      <span
                        className="text-sm font-medium"
                        style={{ color: buildingType === "commercial" ? "#C4694A" : "#374151" }}
                      >
                        تجاري
                      </span>
                    </button>
                  </div>
                </div>

                {/* Neighborhood */}
                <div className="space-y-1.5">
                  <Label>الحي *</Label>
                  <Select value={neighborhood} onValueChange={setNeighborhood}>
                    <SelectTrigger
                      className={`w-full h-10 text-sm${
                        showValidation && !isNeighborhoodValid ? " border-red-500 ring-red-400" : ""
                      }`}
                    >
                      <SelectValue placeholder="اختر الحي..." />
                    </SelectTrigger>
                    <SelectContent className="max-h-64">
                      {NEIGHBORHOODS.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {showValidation && !isNeighborhoodValid && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      يرجى اختيار الحي
                    </p>
                  )}
                </div>

                {/* Units count */}
                <div className="space-y-1.5">
                  <Label>عدد الوحدات *</Label>
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
                      <SelectValue placeholder="اختر عدد الوحدات..." />
                    </SelectTrigger>
                    <SelectContent>
                      {UNIT_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n} وحدة
                        </SelectItem>
                      ))}
                      <SelectItem value="other">أخرى / Other</SelectItem>
                    </SelectContent>
                  </Select>
                  {/* Smooth slide-in for custom units */}
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
                      placeholder="أدخل عدد الوحدات"
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
                        ? "يرجى إدخال عدد الوحدات"
                        : "يرجى اختيار عدد الوحدات"}
                    </p>
                  )}
                </div>

                {/* Google Maps URL */}
                <div className="space-y-1.5">
                  <Label htmlFor="mapUrl">رابط الموقع على Google Maps *</Label>
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
                      رابط الخريطة مطلوب
                    </p>
                  )}
                  {(showValidation || mapUrlTouched) && isMapUrlPresent && !isMapUrlValid && (
                    <p className="text-red-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      الرابط غير صحيح — استخدم رابطاً من Google Maps
                    </p>
                  )}
                </div>

                {/* National address — optional */}
                <div className="space-y-1.5">
                  <Label htmlFor="nationalAddress" className="flex items-center gap-1.5">
                    العنوان الوطني{" "}
                    <span className="text-gray-400 font-normal text-xs">(اختياري)</span>
                  </Label>
                  <Input
                    id="nationalAddress"
                    type="text"
                    placeholder="مثال: RTHA1234"
                    value={nationalAddress}
                    onChange={(e) => setNationalAddress(e.target.value)}
                    className="border-dashed"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ────────────────────────────────────────────────
              SECTION 2 — Service scope (read-only, auto-updates)
          ──────────────────────────────────────────────── */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: "#2E4A6B" }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full text-xs font-bold text-white"
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  background: "#2E4A6B",
                  flexShrink: 0,
                }}
              >
                2
              </span>
              نطاق الخدمة (يتحدد تلقائياً)
            </p>
            <Card className="rounded-xl shadow-sm">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3 mb-3">
                  <ClipboardList
                    className="w-5 h-5 mt-0.5 flex-shrink-0"
                    style={{ color: "#2E4A6B" }}
                  />
                  <p className="text-sm font-medium text-gray-700">نطاق الخدمات المطلوبة</p>
                </div>
                <div className="space-y-3 text-sm text-gray-700 leading-relaxed">
                  <p>{SERVICE_SCOPE[buildingType].part1}</p>
                  <p
                    className="text-xs leading-relaxed pt-2 border-t"
                    style={{ color: "#5A6880", borderColor: "#DDE4EE" }}
                  >
                    {SERVICE_SCOPE[buildingType].part2}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ────────────────────────────────────────────────
              SECTION 3 — Notes for providers (optional)
          ──────────────────────────────────────────────── */}
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest mb-3 flex items-center gap-2"
              style={{ color: "#2E4A6B" }}
            >
              <span
                className="inline-flex items-center justify-center rounded-full text-xs font-bold text-white"
                style={{
                  width: "1.5rem",
                  height: "1.5rem",
                  background: "#2E4A6B",
                  flexShrink: 0,
                }}
              >
                3
              </span>
              ملاحظات للمزودين (اختياري)
            </p>
            <Card className="rounded-xl shadow-sm">
              <CardContent className="pt-6 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="w-4 h-4 text-gray-400" />
                  <Label htmlFor="notes" className="text-sm text-gray-600">
                    تفاصيل أو ملاحظات إضافية للمزودين
                  </Label>
                </div>
                <Textarea
                  id="notes"
                  placeholder="اكتب أي تفاصيل تريد إيصالها للمزودين..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value.slice(0, 500))}
                  rows={4}
                  maxLength={500}
                  className="resize-none text-base"
                />
                <p className="text-xs text-gray-400 text-start">{notes.length} / 500</p>
              </CardContent>
            </Card>
          </div>

          {/* ── Submit ── */}
          <div>
            <Button
              type="submit"
              className="w-full py-6 text-base font-semibold text-white rounded-xl shadow-md"
              style={{ background: "#2E4A6B" }}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  جاري الإرسال...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  أرسل طلبي — ينشئ عقاراً وطلباً في خطوة واحدة
                </span>
              )}
            </Button>
            <p className="text-xs text-center text-gray-400 mt-2">
              ستُنشأ تلقائياً: عقار + طلب خدمة + إشعار للمزودين
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
