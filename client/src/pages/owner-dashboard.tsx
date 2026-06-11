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
      style={{ background: "var(--owner)", color: "#04222c" }}
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
      const token = localStorage.getItem("sessionToken");
      if (!token) return [];
      const res = await fetch(`/api/owner/offers/${requestId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  // Determine request display config
  const requestStatus = request?.status ?? null;
  const statusConfig = requestStatus ? getRequestStatusConfig(requestStatus) : null;

  // Lock property/request editing once the request has any non-rejected offer.
  // The owner can edit again only after rejecting all received offers.
  const isRequestLocked = (offers ?? []).some((o: any) => o.status !== "rejected");

  // ---------------------------------------------------------------------------
  // Edit mode init — populate form fields from property
  // ---------------------------------------------------------------------------

  function enterEditMode() {
    if (isRequestLocked) {
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
      <div className="page-enter min-h-screen bg-background p-4 sm:p-6" dir={isRTL ? "rtl" : "ltr"}>
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
    <div className="page-enter min-h-screen bg-background" dir={isRTL ? "rtl" : "ltr"}>

      {/* ── Navy gradient header strip ── */}
      <div
        className="w-full py-5 px-4"
        style={{ background: "linear-gradient(135deg, #0f3a47, #193546)", borderBottom: "2px solid var(--owner)" }}
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
                        ? { background: "var(--residential-soft)", color: "#E58AA0" }
                        : { background: "var(--commercial-soft)", color: "#F0A87F" }
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
            <span className="text-sm font-semibold text-foreground">
              {lang === "ar" ? "العقار وطلب الخدمة" : "Property & Service Request"}
            </span>
          </div>

          <Card className="rounded-xl shadow-sm border border-border">
            <CardContent className="pt-5 pb-5 space-y-4">

              {/* Edit locked notice */}
              {showEditLocked && (
                <div
                  className="flex items-start gap-2 rounded-lg px-4 py-3 text-sm"
                  style={{ background: "var(--warn-soft)", color: "var(--warn)", border: "1px solid rgba(251,191,36,0.4)" }}
                >
                  <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>
                    {lang === "ar"
                      ? "التعديل محجوب — وصلتك عروض على طلبك. ارفض جميع العروض لتتمكن من تعديل الطلب من جديد."
                      : "Editing locked — you've received offers on your request. Reject all offers to edit the request again."}
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
                    label={lang === "ar" ? "الحي" : "District"}
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
                      <span className="text-xs text-muted-foreground w-28 flex-shrink-0 pt-0.5">
                        {lang === "ar" ? "رابط الخريطة" : "Map URL"}
                      </span>
                      <a
                        href={property.map_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm flex items-center gap-1 hover:underline"
                        style={{ color: "var(--owner)" }}
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
                      style={{ borderColor: "var(--owner)", color: "var(--owner)", background: "transparent" }}
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
                            ? { border: "2px solid var(--residential)", background: "var(--residential-soft)" }
                            : { border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)" }
                        }
                      >
                        <span className="text-2xl">🏠</span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: editBuildingType === "residential" ? "#E58AA0" : "#9FC2D3" }}
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
                            ? { border: "2px solid var(--commercial)", background: "var(--commercial-soft)" }
                            : { border: "1px solid var(--border)", background: "rgba(255,255,255,0.03)" }
                        }
                      >
                        <span className="text-2xl">🏢</span>
                        <span
                          className="text-sm font-medium"
                          style={{ color: editBuildingType === "commercial" ? "#F0A87F" : "#9FC2D3" }}
                        >
                          {lang === "ar" ? "تجاري" : "Commercial"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* District */}
                  <div className="space-y-1.5">
                    <Label htmlFor="editNeighborhood">
                      {lang === "ar" ? "الحي" : "District"} *
                    </Label>
                    <select
                      id="editNeighborhood"
                      value={editNeighborhood}
                      onChange={(e) => setEditNeighborhood(e.target.value)}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <option value="" disabled>
                        {lang === "ar" ? "اختر الحي..." : "Select district..."}
                      </option>
                      {DISTRICTS.map((d) => (
                        <option key={d.ar} value={d.ar}>
                          {lang === "ar" ? d.ar : d.en}
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
                      <span className="text-muted-foreground font-normal text-xs">
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
                      style={{ background: "var(--owner)", color: "#04222c" }}
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
                  style={{ borderTop: "1px solid var(--border)" }}
                >
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-4 h-4 flex-shrink-0" style={{ color: "var(--owner)" }} />
                    <span className="text-sm font-medium text-foreground">
                      {lang === "ar" ? "حالة الطلب" : "Request Status"}
                    </span>
                    <span
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold"
                      style={{ background: statusConfig?.bg, color: statusConfig?.color }}
                    >
                      {lang === "ar" ? statusConfig?.label : statusConfig?.labelEn}
                    </span>
                    {request.created_at && (
                      <span className="text-xs text-muted-foreground mr-auto">
                        {new Date(request.created_at).toLocaleDateString(
                          lang === "ar" ? "ar-SA-u-nu-latn" : "en-US",
                          { year: "numeric", month: "short", day: "numeric" }
                        )}
                      </span>
                    )}
                  </div>

                  {request.description && (
                    <div className="text-xs text-muted-foreground bg-white/5 rounded-lg px-3 py-2 leading-relaxed">
                      <span className="text-muted-foreground block mb-1">
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
            <span className="text-sm font-semibold text-foreground">
              {lang === "ar" ? "عروض المزودين" : "Provider Offers"}
            </span>
            {offersList.length > 0 && (
              <span
                className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-bold"
                style={{ background: "var(--owner-soft)", color: "var(--owner)", border: "1px solid var(--owner)" }}
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
            <Card className="rounded-xl shadow-sm border border-border">
              <CardContent className="pt-5 pb-5 text-center">
                <p className="text-sm text-muted-foreground">
                  {lang === "ar"
                    ? "لا يوجد طلب نشط لعرض العروض"
                    : "No active request to show offers"}
                </p>
              </CardContent>
            </Card>
          ) : offersList.length === 0 ? (
            <Card className="rounded-xl shadow-sm border border-border">
              <CardContent className="pt-8 pb-8 text-center">
                <div className="text-3xl mb-3">📭</div>
                <p className="text-sm font-semibold text-foreground mb-1">
                  {lang === "ar" ? "لم يصلك أي عرض بعد" : "No offers yet"}
                </p>
                <p className="text-xs text-muted-foreground max-w-xs mx-auto">
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
                  className="rounded-xl shadow-sm border border-border hover:shadow-md transition-shadow"
                >
                  <CardContent className="pt-4 pb-4 space-y-3">
                    {/* Header: provider name + status */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="font-semibold text-foreground flex items-center gap-1.5">
                          <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: "var(--owner)" }} />
                          {offer.providers?.company_name}
                        </p>
                        {offer.providers?.city && (
                          <p className="text-xs text-muted-foreground mt-0.5">{offer.providers.city}</p>
                        )}
                      </div>
                      <StatusBadge status={offer.status} lang={lang} />
                    </div>

                    {/* Notes */}
                    {offer.notes && (
                      <div className="text-xs text-muted-foreground bg-white/5 rounded px-3 py-2 leading-relaxed">
                        {offer.notes}
                      </div>
                    )}

                    {/* Price */}
                    {offer.price_total && (
                      <div
                        className="flex gap-4 rounded-lg px-3 py-2"
                        style={{ background: "rgba(255,255,255,0.04)", border: "1px solid var(--border)" }}
                      >
                        <div>
                          <p className="text-xs text-muted-foreground">
                            {lang === "ar" ? "السعر الإجمالي" : "Total Price"}
                          </p>
                          <p className="font-bold text-foreground text-sm">
                            {Number(offer.price_total).toLocaleString("en-US")}{" "}
                            {lang === "ar" ? "ريال" : "SAR"}
                          </p>
                        </div>
                        {property?.units_count && (
                          <div
                            className="border-s border-border ps-4"
                          >
                            <p className="text-xs text-muted-foreground">
                              {lang === "ar" ? "السعر لكل وحدة" : "Per Unit"}
                            </p>
                            <p className="font-bold text-sm" style={{ color: "var(--owner)" }}>
                              {Math.round(
                                Number(offer.price_total) / property.units_count
                              ).toLocaleString("en-US")}{" "}
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
                          background: "var(--provider-soft)",
                          border: "1px solid rgba(27,127,220,0.4)",
                        }}
                      >
                        <Phone className="w-4 h-4 flex-shrink-0" style={{ color: "var(--provider)" }} />
                        <div>
                          <p className="text-xs font-medium" style={{ color: "var(--provider)" }}>
                            {lang === "ar" ? "رقم التواصل" : "Contact Number"}
                          </p>
                          <a
                            href={`tel:${offer.providers.users.phone}`}
                            className="text-sm font-bold hover:underline"
                            style={{ color: "#7bb6f0" }}
                          >
                            {offer.providers.users.phone}
                          </a>
                        </div>
                      </div>
                    )}

                    {/* PDF proposal — locked until the owner accepts the offer */}
                    {offer.status === "pending" && (
                      <div
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs"
                        style={{ background: "rgba(255,255,255,0.04)", color: "#9FC2D3", border: "1px solid var(--border)" }}
                      >
                        <Lock className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>
                          {lang === "ar"
                            ? "يُفتح ملف العرض بعد قبوله"
                            : "Proposal unlocks after you accept"}
                        </span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-2 flex-wrap">
                      {offer.status === "accepted" && offer.offer_file_url && (
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
                            style={{ background: "var(--owner)", color: "#04222c" }}
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
                ? "قبول هذا العرض يفتح لك ملف العرض الكامل (PDF) ويظهر رقم مزود الخدمة للتواصل معه، وسيؤدي تلقائياً إلى رفض جميع العروض الأخرى. هل أنت متأكد؟"
                : "Accepting this offer unlocks the provider's full proposal (PDF), reveals their phone number for direct contact, and automatically rejects all other offers. Are you sure?"}
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
      <span className="text-xs text-muted-foreground w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span className="text-sm text-foreground">{value}</span>
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
      <span className="text-xs text-muted-foreground w-28 flex-shrink-0 pt-0.5">{label}</span>
      <span
        className="text-xs font-medium px-2.5 py-0.5 rounded-full"
        style={
          isResidential
            ? { background: "var(--residential-soft)", color: "#E58AA0", border: "1px solid rgba(199,91,114,0.4)" }
            : { background: "var(--commercial-soft)", color: "#F0A87F", border: "1px solid rgba(224,138,91,0.4)" }
        }
      >
        {displayText}
      </span>
    </div>
  );
}
