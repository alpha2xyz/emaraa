import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Building2,
  ClipboardList,
  FileText,
  Edit2,
  Save,
  Lock,
  Phone,
  CheckCircle2,
  XCircle,
  ExternalLink,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLang } from "@/hooks/use-lang";
import { useToast } from "@/hooks/use-toast";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { StatusBadge } from "@/components/StatusBadge";
import { openSignedPdf } from "@/lib/storage";
import { supabase } from "@/lib/supabase";

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

function isValidMapUrl(url: string): boolean {
  return MAP_URL_PREFIXES.some((prefix) => url.startsWith(prefix));
}

// ---------------------------------------------------------------------------
// Section badge helper
// ---------------------------------------------------------------------------

function SectionBadge({ number }: { number: number }) {
  return (
    <span
      className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-xs font-bold flex-shrink-0"
      style={{ background: "#2E4A6B" }}
    >
      {number}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Request status helpers
// ---------------------------------------------------------------------------

function getRequestStatusConfig(status: string) {
  switch (status) {
    case "pending":
      return {
        label: "قيد الانتظار",
        labelEn: "Pending",
        bg: "#FEF3C7",
        color: "#92400E",
        isActive: true,
      };
    case "in_progress":
      return {
        label: "نشط",
        labelEn: "Active",
        bg: "#D1FAE5",
        color: "#065F46",
        isActive: true,
      };
    case "completed":
      return {
        label: "مغلق",
        labelEn: "Closed",
        bg: "#F3F4F6",
        color: "#6B7280",
        isActive: false,
      };
    case "cancelled":
      return {
        label: "ملغي",
        labelEn: "Cancelled",
        bg: "#F3F4F6",
        color: "#6B7280",
        isActive: false,
      };
    default:
      return {
        label: status,
        labelEn: status,
        bg: "#F3F4F6",
        color: "#6B7280",
        isActive: false,
      };
  }
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function OwnerDashboard() {
  useAuthGuard("owner");
  const { lang } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  const userName = localStorage.getItem("userName") || "";
  const isRTL = lang === "ar";

  // Property edit state
  const [isEditing, setIsEditing] = useState(false);
  const [showEditLocked, setShowEditLocked] = useState(false);
  const [editName, setEditName] = useState("");
  const [editNeighborhood, setEditNeighborhood] = useState("");
  const [editBuildingType, setEditBuildingType] = useState<"residential" | "commercial">(
    "residential"
  );
  const [editUnitsCount, setEditUnitsCount] = useState("");
  const [editCustomUnits, setEditCustomUnits] = useState("");
  const [editMapUrl, setEditMapUrl] = useState("");
  const [editNationalAddress, setEditNationalAddress] = useState("");

  // Offer accept dialog
  const [acceptingOfferId, setAcceptingOfferId] = useState<string | null>(null);

  // ---------------------------------------------------------------------------
  // Data queries
  // ---------------------------------------------------------------------------

  // Property query
  const {
    data: properties,
    isLoading: propertyLoading,
  } = useQuery({
    queryKey: ["owner-property"],
    queryFn: async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) return [];
      const res = await fetch("/api/properties", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Request query
  const {
    data: requests,
    isLoading: requestLoading,
  } = useQuery({
    queryKey: ["/api/requests"],
    queryFn: async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) return [];
      const res = await fetch("/api/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const property = properties?.[0] ?? null;
  const request = requests?.[0] ?? null;
  const isLoading = propertyLoading || requestLoading;

  // Redirect to onboarding if no property found (after loading)
  useEffect(() => {
    if (!isLoading && properties && properties.length === 0) {
      setLocation("/dashboard/owner/onboarding");
    }
  }, [isLoading, properties, setLocation]);

  // Offers query — enabled only after request is loaded
  const requestId = request?.id ?? null;
  const { data: offers, isLoading: offersLoading } = useQuery({
    queryKey: ["owner", "offers", requestId],
    enabled: !!requestId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("provider_offers")
        .select(
          "id, offer_file_url, notes, status, price_total, created_at, providers(id, company_name, city, users(phone))"
        )
        .eq("request_id", requestId!)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Determine request display config
  const requestStatus = request?.status ?? null;
  const statusConfig = requestStatus ? getRequestStatusConfig(requestStatus) : null;

  // Block property editing only when an offer has been ACCEPTED (not just when request is pending)
  const hasAcceptedOffer = (offers ?? []).some((o: any) => o.status === "accepted");

  // ---------------------------------------------------------------------------
  // Edit mode init — populate form fields from property
  // ---------------------------------------------------------------------------

  function enterEditMode() {
    if (hasAcceptedOffer) {
      setShowEditLocked(true);
      return;
    }
    if (!property) return;
    setEditName(property.name ?? "");
    setEditNeighborhood(property.address ?? "");
    setEditBuildingType(
      property.building_type === "commercial" ? "commercial" : "residential"
    );
    setEditUnitsCount(property.units_count != null ? String(property.units_count) : "");
    setEditCustomUnits("");
    setEditMapUrl(property.map_url ?? "");
    setEditNationalAddress(property.national_address ?? "");
    setIsEditing(true);
    setShowEditLocked(false);
  }

  function cancelEdit() {
    setIsEditing(false);
    setShowEditLocked(false);
  }

  // ---------------------------------------------------------------------------
  // Save property mutation
  // ---------------------------------------------------------------------------

  const saveMutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) throw new Error("Unauthorized");

      const unitsValue =
        editUnitsCount === "other"
          ? parseInt(editCustomUnits.trim(), 10)
          : parseInt(editUnitsCount, 10);

      const body: Record<string, unknown> = {
        name: editName.trim(),
        building_type: editBuildingType,
        address: editNeighborhood,
        city: "الرياض",
        units_count: isNaN(unitsValue) ? null : unitsValue,
        map_url: editMapUrl.trim() || null,
        national_address: editNationalAddress.trim() || null,
      };

      const res = await fetch(`/api/properties/${property!.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as any).error ?? "Failed to save");
      }
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: lang === "ar" ? "تم حفظ التعديلات" : "Changes saved",
      });
      queryClient.invalidateQueries({ queryKey: ["owner-property"] });
      setIsEditing(false);
    },
    onError: (err: Error) => {
      toast({
        title: err.message || (lang === "ar" ? "حدث خطأ" : "An error occurred"),
        variant: "destructive",
      });
    },
  });

  // ---------------------------------------------------------------------------
  // Offer status mutation
  // ---------------------------------------------------------------------------

  const offerStatusMutation = useMutation({
    mutationFn: async ({
      offerId,
      status,
    }: {
      offerId: string;
      status: "accepted" | "rejected";
    }) => {
      const token = localStorage.getItem("sessionToken");
      if (!token) throw new Error("Unauthorized");
      const res = await fetch(`/api/offers/${offerId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error((body as any).error || "Failed");
      }
    },
    onSuccess: (_, { status }) => {
      toast({
        title:
          status === "accepted"
            ? lang === "ar"
              ? "تم قبول العرض بنجاح"
              : "Offer accepted"
            : lang === "ar"
              ? "تم رفض العرض"
              : "Offer rejected",
      });
      queryClient.invalidateQueries({ queryKey: ["owner", "offers", requestId] });
    },
    onError: () => {
      toast({
        title: lang === "ar" ? "حدث خطأ" : "An error occurred",
        variant: "destructive",
      });
    },
  });

  // ---------------------------------------------------------------------------
  // Computed for editing units
  // ---------------------------------------------------------------------------

  const isCustomUnits =
    editUnitsCount !== "" &&
    !UNIT_OPTIONS.includes(parseInt(editUnitsCount, 10)) &&
    editUnitsCount !== "other";

  // On initial load if units_count doesn't match preset, use "other"
  const effectiveUnitSelect =
    editUnitsCount === "other"
      ? "other"
      : UNIT_OPTIONS.includes(parseInt(editUnitsCount, 10))
        ? editUnitsCount
        : isCustomUnits && editUnitsCount !== ""
          ? "other"
          : editUnitsCount;

  // ---------------------------------------------------------------------------
  // Skeleton loading
  // ---------------------------------------------------------------------------

  if (isLoading) {
    return (
      <div className="page-enter min-h-screen bg-[#F9F9FF] p-4 sm:p-6" dir={isRTL ? "rtl" : "ltr"}>
        <div className="max-w-2xl mx-auto space-y-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-32 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  // Guard: redirect in flight — don't render partial content
  if (!isLoading && !property) return null;

  const offersList = offers ?? [];

  return (
    <div className="page-enter min-h-screen bg-[#F9F9FF]" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Navy gradient header strip ── */}
      <div
        className="w-full py-5 px-4"
        style={{ background: "linear-gradient(135deg, #2E4A6B, #243A56)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          {/* Right side (first child in RTL): wordmark + sub-label */}
          <div>
            <p className="font-bold text-lg text-white leading-tight">عِمارة</p>
            <p className="text-sm text-white" style={{ opacity: 0.75 }}>لوحة المالك</p>
          </div>

          {/* Left side (second child in RTL): greeting + chips */}
          <div className="flex flex-col items-end gap-1.5">
            <p className="text-base font-semibold text-white leading-tight">
              {lang === "ar"
                ? `أهلاً${userName ? `، ${userName}` : ""}`
                : `Hello${userName ? `, ${userName}` : ""}`}
            </p>
            {property && (
              <div className="flex flex-wrap gap-1.5 justify-end">
                {property.building_type && (
                  <span
                    className="inline-flex items-center text-xs rounded-full px-2 py-0.5 font-medium"
                    style={
                      property.building_type === "residential"
                        ? { background: "#FDF0F2", color: "#7D3040" }
                        : { background: "#FDF3EF", color: "#C4694A" }
                    }
                  >
                    {property.building_type === "residential"
                      ? lang === "ar" ? "سكني" : "Residential"
                      : lang === "ar" ? "تجاري" : "Commercial"}
                  </span>
                )}
                {property.city && (
                  <span
                    className="inline-flex items-center text-xs rounded-full px-2 py-0.5 text-white"
                    style={{ background: "rgba(255,255,255,0.10)" }}
                  >
                    {property.city}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* ══════════════════════════════════════════════════
            SECTION 1 — Property + Service Request (merged)
        ══════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <SectionBadge number={1} />
            <span className="text-sm font-semibold text-gray-700">
              {lang === "ar" ? "العقار وطلب الخدمة" : "Property & Service Request"}
            </span>
          </div>

          <Card className="rounded-xl shadow-sm border border-gray-100">
            <CardContent className="pt-5 pb-5 space-y-4">

              {/* Edit locked notice */}
              {showEditLocked && (
                <div
                  className="flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
                  style={{ background: "#FEF3C7", color: "#92400E", border: "1px solid #FCD34D" }}
                >
                  <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    {lang === "ar"
                      ? "التعديل محجوب — لديك عرضاً مقبولاً من مزود خدمة"
                      : "Editing locked — you have an accepted offer from a provider"}
                  </span>
                </div>
              )}

              {!isEditing ? (
                /* ── Display mode ── */
                <div className="space-y-3">
                  <PropertyRow
                    label={lang === "ar" ? "اسم العقار" : "Property Name"}
                    value={property?.name}
                  />
                  <PropertyRowTyped
                    label={lang === "ar" ? "نوع المبنى" : "Building Type"}
                    buildingType={property?.building_type}
                    lang={lang}
                  />
                  <PropertyRow
                    label={lang === "ar" ? "الحي" : "Neighborhood"}
                    value={property?.address}
                  />
                  <PropertyRow
                    label={lang === "ar" ? "المدينة" : "City"}
                    value={property?.city}
                  />
                  <PropertyRow
                    label={lang === "ar" ? "عدد الوحدات" : "Units Count"}
                    value={property?.units_count != null ? String(property.units_count) : undefined}
                  />
                  {property?.map_url && (
                    <div className="flex items-start gap-3">
                      <span className="text-xs text-gray-400 w-28 flex-shrink-0 pt-0.5">
                        {lang === "ar" ? "رابط الخريطة" : "Map URL"}
                      </span>
                      <a
                        href={property.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm flex items-center gap-1 hover:underline"
                        style={{ color: "#2E4A6B" }}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        {lang === "ar" ? "افتح الخريطة" : "Open Map"}
                      </a>
                    </div>
                  )}
                  {property?.national_address && (
                    <PropertyRow
                      label={lang === "ar" ? "العنوان الوطني" : "National Address"}
                      value={property.national_address}
                    />
                  )}

                  <div className="pt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={enterEditMode}
                      className="gap-1.5"
                      style={{ borderColor: "#2E4A6B", color: "#2E4A6B" }}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                      {lang === "ar" ? "تعديل" : "Edit"}
                    </Button>
                  </div>
                </div>
              ) : (
                /* ── Edit mode ── */
                <div className="space-y-4">
                  {/* Property name */}
                  <div className="space-y-1.5">
                    <Label htmlFor="editName">
                      {lang === "ar" ? "اسم العقار" : "Property Name"} *
                    </Label>
                    <Input
                      id="editName"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      placeholder={lang === "ar" ? "مثال: برج الياسمين" : "e.g. Al Yasmeen Tower"}
                    />
                  </div>

                  {/* Building type — clickable cards matching onboarding style */}
                  <div className="space-y-1.5">
                    <Label>{lang === "ar" ? "نوع المبنى" : "Building Type"} *</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Residential — Burgundy #7D3040 */}
                      <button
                        type="button"
                        onClick={() => setEditBuildingType("residential")}
                        className="rounded-xl py-4 px-3 flex flex-col items-center gap-2 cursor-pointer transition-colors"
                        style={
                          editBuildingType === "residential"
                            ? { border: "2px solid #7D3040", background: "#FDF0F2" }
                            : { border: "1px solid #E5E7EB", background: "#FFFFFF" }
                        }
                      >
                        <span className="text-2xl">🏠</span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: editBuildingType === "residential" ? "#7D3040" : "#374151" }}
                        >
                          {lang === "ar" ? "سكني" : "Residential"}
                        </span>
                      </button>
                      {/* Commercial — Terracotta #C4694A */}
                      <button
                        type="button"
                        onClick={() => setEditBuildingType("commercial")}
                        className="rounded-xl py-4 px-3 flex flex-col items-center gap-2 cursor-pointer transition-colors"
                        style={
                          editBuildingType === "commercial"
                            ? { border: "2px solid #C4694A", background: "#FDF3EF" }
                            : { border: "1px solid #E5E7EB", background: "#FFFFFF" }
                        }
                      >
                        <span className="text-2xl">🏢</span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: editBuildingType === "commercial" ? "#C4694A" : "#374151" }}
                        >
                          {lang === "ar" ? "تجاري" : "Commercial"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Neighborhood */}
                  <div className="space-y-1.5">
                    <Label htmlFor="editNeighborhood">
                      {lang === "ar" ? "الحي" : "Neighborhood"} *
                    </Label>
                    <select
                      id="editNeighborhood"
                      value={editNeighborhood}
                      onChange={(e) => setEditNeighborhood(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="" disabled>
                        {lang === "ar" ? "اختر الحي..." : "Select neighborhood..."}
                      </option>
                      {NEIGHBORHOODS.map((n) => (
                        <option key={n} value={n}>
                          {n}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Units count */}
                  <div className="space-y-1.5">
                    <Label htmlFor="editUnitsCount">
                      {lang === "ar" ? "عدد الوحدات" : "Units Count"} *
                    </Label>
                    <select
                      id="editUnitsCount"
                      value={effectiveUnitSelect}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (val === "other") {
                          setEditUnitsCount("other");
                          setEditCustomUnits("");
                        } else {
                          setEditUnitsCount(val);
                          setEditCustomUnits("");
                        }
                      }}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="" disabled>
                        {lang === "ar" ? "اختر عدد الوحدات..." : "Select units count..."}
                      </option>
                      {UNIT_OPTIONS.map((n) => (
                        <option key={n} value={String(n)}>
                          {n}
                        </option>
                      ))}
                      <option value="other">{lang === "ar" ? "أخرى / Other" : "Other"}</option>
                    </select>
                    {(editUnitsCount === "other" || isCustomUnits) && (
                      <Input
                        type="number"
                        min="1"
                        placeholder={lang === "ar" ? "أدخل عدد الوحدات" : "Enter units count"}
                        value={
                          editUnitsCount === "other"
                            ? editCustomUnits
                            : isCustomUnits
                              ? editUnitsCount
                              : editCustomUnits
                        }
                        onChange={(e) => {
                          setEditCustomUnits(e.target.value);
                          setEditUnitsCount("other");
                        }}
                        className="mt-2"
                      />
                    )}
                  </div>

                  {/* Map URL */}
                  <div className="space-y-1.5">
                    <Label htmlFor="editMapUrl">
                      {lang === "ar" ? "رابط Google Maps" : "Google Maps URL"}
                    </Label>
                    <Input
                      id="editMapUrl"
                      type="url"
                      placeholder="https://maps.google.com/..."
                      value={editMapUrl}
                      onChange={(e) => setEditMapUrl(e.target.value)}
                      className={
                        editMapUrl.trim() && !isValidMapUrl(editMapUrl.trim())
                          ? "border-red-500"
                          : ""
                      }
                    />
                    {editMapUrl.trim() && !isValidMapUrl(editMapUrl.trim()) && (
                      <p className="text-red-500 text-xs">
                        {lang === "ar"
                          ? "الرابط غير صحيح — استخدم رابطاً من Google Maps"
                          : "Invalid URL — use a Google Maps link"}
                      </p>
                    )}
                  </div>

                  {/* National address */}
                  <div className="space-y-1.5">
                    <Label htmlFor="editNationalAddress">
                      {lang === "ar" ? "العنوان الوطني" : "National Address"}{" "}
                      <span className="text-gray-400 font-normal text-xs">
                        ({lang === "ar" ? "اختياري" : "optional"})
                      </span>
                    </Label>
                    <Input
                      id="editNationalAddress"
                      placeholder={lang === "ar" ? "مثال: RTHA1234" : "e.g. RTHA1234"}
                      value={editNationalAddress}
                      onChange={(e) => setEditNationalAddress(e.target.value)}
                      className="border-dashed"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      size="sm"
                      onClick={() => saveMutation.mutate()}
                      disabled={saveMutation.isPending}
                      className="gap-1.5 text-white"
                      style={{ background: "#2E4A6B" }}
                    >
                      <Save className="w-3.5 h-3.5" />
                      {saveMutation.isPending
                        ? lang === "ar"
                          ? "جاري الحفظ..."
                          : "Saving..."
                        : lang === "ar"
                          ? "حفظ"
                          : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={cancelEdit}>
                      {lang === "ar" ? "إلغاء" : "Cancel"}
                    </Button>
                  </div>
                </div>
              )}
              {/* ── Request status (merged into same card) ── */}
              {request && (
                <div
                  className="mt-5 pt-5 space-y-3"
                  style={{ borderTop: "1px solid #DDE4EE" }}
                >
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 flex-shrink-0" style={{ color: "#2E4A6B" }} />
                    <span className="text-sm font-medium text-gray-700">
                      {lang === "ar" ? "حالة الطلب" : "Request Status"}
                    </span>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: statusConfig?.bg, color: statusConfig?.color }}
                    >
                      {lang === "ar" ? statusConfig?.label : statusConfig?.labelEn}
                    </span>
                    {request.created_at && (
                      <span className="text-xs text-gray-400 mr-auto">
                        {new Date(request.created_at).toLocaleDateString(
                          lang === "ar" ? "ar-SA" : "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </span>
                    )}
                  </div>

                  {request.description && (
                    <div className="text-xs text-gray-600 bg-gray-50 rounded-lg px-3 py-2 leading-relaxed">
                      <span className="text-gray-400 block mb-1">
                        {lang === "ar" ? "ملاحظاتك للمزودين" : "Your notes to providers"}
                      </span>
                      {request.description}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ══════════════════════════════════════════════════
            SECTION 2 — Provider Offers
        ══════════════════════════════════════════════════ */}
        <div>
          <div className="flex items-center gap-2 mb-3">
            <SectionBadge number={2} />
            <span className="text-sm font-semibold text-gray-700">
              {lang === "ar" ? "عروض المزودين" : "Provider Offers"}
            </span>
            {offersList.length > 0 && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                style={{ background: "#EEF2F7", color: "#2E4A6B", border: "1px solid #2E4A6B" }}
              >
                {offersList.length}
              </span>
            )}
          </div>

          {offersLoading ? (
            <div className="space-y-3">
              {[1, 2].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : !requestId ? (
            <Card className="rounded-xl shadow-sm border border-gray-100">
              <CardContent className="pt-5 pb-5 text-center">
                <p className="text-sm text-gray-400">
                  {lang === "ar"
                    ? "لا يوجد طلب نشط لعرض العروض"
                    : "No active request to show offers"}
                </p>
              </CardContent>
            </Card>
          ) : offersList.length === 0 ? (
            <Card className="rounded-xl shadow-sm border border-gray-100">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="text-3xl mb-3">📭</div>
                <p className="text-sm font-semibold text-gray-700 mb-1">
                  {lang === "ar" ? "لم يصلك أي عرض بعد" : "No offers yet"}
                </p>
                <p className="text-xs text-gray-400 max-w-xs mx-auto">
                  {lang === "ar"
                    ? "تم إخطار المزودين بطلبك — ستظهر العروض هنا عند استلامها"
                    : "Providers have been notified of your request — offers will appear here when received"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {offersList.map((offer: any) => (
                <Card
                  key={offer.id}
                  className="rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-4 pb-4 space-y-3">
                    {/* Header: provider name + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-gray-800 flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: "#2E4A6B" }} />
                          {offer.providers?.company_name}
                        </p>
                        {offer.providers?.city && (
                          <p className="text-xs text-gray-400 mt-0.5">{offer.providers.city}</p>
                        )}
                      </div>
                      <StatusBadge status={offer.status} lang={lang} />
                    </div>

                    {/* Notes */}
                    {offer.notes && (
                      <div className="text-xs text-gray-600 bg-gray-50 rounded px-3 py-2 leading-relaxed">
                        {offer.notes}
                      </div>
                    )}

                    {/* Price */}
                    {offer.price_total && (
                      <div
                        className="flex gap-4 rounded-lg px-3 py-2"
                        style={{ background: "#F9F9FF", border: "1px solid #E5E7EB" }}
                      >
                        <div>
                          <p className="text-xs text-gray-400">
                            {lang === "ar" ? "السعر الإجمالي" : "Total Price"}
                          </p>
                          <p className="font-bold text-gray-800 text-sm">
                            {Number(offer.price_total).toLocaleString("ar-SA")}{" "}
                            {lang === "ar" ? "ريال" : "SAR"}
                          </p>
                        </div>
                        {property?.units_count && (
                          <div
                            className="border-s border-gray-200 ps-4"
                          >
                            <p className="text-xs text-gray-400">
                              {lang === "ar" ? "السعر لكل وحدة" : "Per Unit"}
                            </p>
                            <p className="font-bold text-sm" style={{ color: "#2E4A6B" }}>
                              {Math.round(
                                Number(offer.price_total) / property.units_count
                              ).toLocaleString("ar-SA")}{" "}
                              {lang === "ar" ? "ريال" : "SAR"}
                            </p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Phone — revealed on accepted */}
                    {offer.status === "accepted" && offer.providers?.users?.phone && (
                      <div
                        className="flex items-center gap-2 rounded-lg px-3 py-2"
                        style={{
                          background: "#E6F4F1",
                          border: "1px solid #A7D4CB",
                        }}
                      >
                        <Phone className="w-4 h-4 flex-shrink-0" style={{ color: "#0E7C66" }} />
                        <div>
                          <p className="text-xs font-medium" style={{ color: "#0E7C66" }}>
                            {lang === "ar" ? "رقم التواصل" : "Contact Number"}
                          </p>
                          <a
                            href={`tel:${offer.providers.users.phone}`}
                            className="text-sm font-bold hover:underline"
                            style={{ color: "#0A6355" }}
                          >
                            {offer.providers.users.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {offer.offer_file_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openSignedPdf("provider-offers", offer.offer_file_url)}
                          className="gap-1.5"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {lang === "ar" ? "عرض الملف" : "View File"}
                        </Button>
                      )}
                      {offer.status === "pending" && (
                        <>
                          <Button
                            size="sm"
                            disabled={offerStatusMutation.isPending}
                            onClick={() => setAcceptingOfferId(offer.id)}
                            className="gap-1.5 text-white"
                            style={{ background: "#2E4A6B" }}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            {lang === "ar" ? "قبول" : "Accept"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            disabled={offerStatusMutation.isPending}
                            onClick={() =>
                              offerStatusMutation.mutate({
                                offerId: offer.id,
                                status: "rejected",
                              })
                            }
                            className="gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            {lang === "ar" ? "رفض" : "Reject"}
                          </Button>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Accept confirmation dialog ── */}
      <AlertDialog
        open={!!acceptingOfferId}
        onOpenChange={(open) => {
          if (!open) setAcceptingOfferId(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lang === "ar" ? "تأكيد القبول" : "Confirm Accept"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === "ar"
                ? "قبول هذا العرض يظهر لك رقم مزود الخدمة للتواصل معه وسيؤدي تلقائياً إلى رفض جميع العروض الأخرى. هل أنت متأكد؟"
                : "Accepting this offer will reveal the provider's phone number for direct contact and will automatically reject all other offers. Are you sure?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setAcceptingOfferId(null)}>
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-green-600 hover:bg-green-700"
              onClick={() => {
                if (acceptingOfferId) {
                  offerStatusMutation.mutate({ offerId: acceptingOfferId, status: "accepted" });
                  setAcceptingOfferId(null);
                }
              }}
            >
              {lang === "ar" ? "نعم، قبول" : "Yes, Accept"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Helper: display row
// ---------------------------------------------------------------------------

function PropertyRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-gray-400 w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-gray-800">{value}</span>
    </div>
  );
}

// Building type row with brand color badge
function PropertyRowTyped({
  label,
  buildingType,
  lang,
}: {
  label: string;
  buildingType?: string | null;
  lang: string;
}) {
  if (!buildingType) return null;
  const isResidential = buildingType === "residential";
  const displayText = isResidential
    ? lang === "ar" ? "سكني" : "Residential"
    : lang === "ar" ? "تجاري" : "Commercial";
  return (
    <div className="flex items-start gap-3">
      <span className="text-xs text-gray-400 w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span
        className="text-xs font-medium px-2.5 py-0.5 rounded-full"
        style={
          isResidential
            ? { background: "#FDF0F2", color: "#7D3040", border: "1px solid #C9929E" }
            : { background: "#FDF3EF", color: "#C4694A", border: "1px solid #E8B49E" }
        }
      >
        {displayText}
      </span>
    </div>
  );
}
