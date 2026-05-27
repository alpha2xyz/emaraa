import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Building2, Save, Loader2, ArrowLeft, ArrowRight, AlertCircle } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { useToast } from "@/hooks/use-toast";

export default function PropertyForm() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, params] = useRoute("/dashboard/owner/properties/:id/edit");
  const propertyId = params?.id;
  const isEdit = !!propertyId;

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "الرياض",
    building_type: "residential",
    units_count: "",
    map_url: "",
    national_address: "",
  });

  const content = {
    ar: {
      titleAdd: "إضافة عقار جديد",
      titleEdit: "تعديل العقار",
      name: "اسم العقار",
      namePlaceholder: "مثال: برج الياسمين",
      neighborhood: "الحي",
      neighborhoodPlaceholder: "مثال: العليا، النرجس، حطين...",
      city: "المدينة",
      buildingType: "نوع المبنى",
      residential: "سكني",
      commercial: "تجاري",
      unitsCount: "عدد الوحدات",
      unitsPlaceholder: "مثال: 24",
      mapUrl: "رابط الموقع على الخريطة",
      mapPlaceholder: "https://maps.google.com/...",
      nationalAddress: "العنوان الوطني (اختياري)",
      nationalAddressPlaceholder: "مثال: RTHA1234",
      save: "حفظ",
      saving: "جاري الحفظ...",
      back: "رجوع",
      success: "تم حفظ العقار بنجاح!",
      error: "حدث خطأ، حاول مرة أخرى",
      editLocked: "لا يمكن تعديل العقار — يوجد طلب خدمة نشط مرتبط به",
    },
    en: {
      titleAdd: "Add New Property",
      titleEdit: "Edit Property",
      name: "Property Name",
      namePlaceholder: "e.g. Yasmine Tower",
      neighborhood: "Neighborhood",
      neighborhoodPlaceholder: "e.g. Al Olaya, Al Narjis, Hittin...",
      city: "City",
      buildingType: "Building Type",
      residential: "Residential",
      commercial: "Commercial",
      unitsCount: "Number of Units",
      unitsPlaceholder: "e.g. 24",
      mapUrl: "Map URL",
      mapPlaceholder: "https://maps.google.com/...",
      nationalAddress: "National Address (Optional)",
      nationalAddressPlaceholder: "e.g. RTHA1234",
      save: "Save",
      saving: "Saving...",
      back: "Back",
      success: "Property saved successfully!",
      error: "An error occurred, please try again",
      editLocked: "Cannot edit property — it has an active service request",
    },
  };

  const t = content[lang];

  // Load existing property for edit mode
  const { data: existingProperty } = useQuery({
    queryKey: ["/api/property", propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const token = localStorage.getItem("sessionToken");
      const res = await fetch(`/api/properties/${propertyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
    enabled: isEdit,
  });

  // Check for active (non-closed) requests on this property in edit mode
  const { data: activeRequests } = useQuery({
    queryKey: ["/api/requests/active-check", propertyId],
    queryFn: async () => {
      const token = localStorage.getItem("sessionToken");
      const res = await fetch("/api/requests", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return [];
      const all = await res.json();
      return (all as any[]).filter(
        (r: any) => r.property_id === propertyId && r.status !== "closed"
      );
    },
    enabled: isEdit && !!propertyId,
  });

  const hasActiveRequest = isEdit && (activeRequests?.length ?? 0) > 0;

  useEffect(() => {
    if (existingProperty) {
      setFormData({
        name: existingProperty.name || "",
        address: existingProperty.address || "",
        city: existingProperty.city || "الرياض",
        building_type: existingProperty.building_type || "residential",
        units_count: existingProperty.units_count?.toString() || "",
        map_url: existingProperty.map_url || "",
        national_address: existingProperty.national_address || "",
      });
    }
  }, [existingProperty]);

  const mutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) throw new Error("Not logged in");

      const payload = {
        name: formData.name,
        address: formData.address,
        city: formData.city,
        building_type: formData.building_type,
        units_count: formData.units_count ? parseInt(formData.units_count) : null,
        map_url: formData.map_url || null,
        national_address: formData.national_address.trim() || null,
      };

      const url = isEdit ? `/api/properties/${propertyId}` : "/api/properties";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }
    },
    onSuccess: () => {
      toast({ title: t.success });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setLocation("/dashboard/owner/properties");
    },
    onError: (error: any) => {
      console.error("[property-form] save error:", error?.message, error);
      const msg =
        error?.message === "limit_reached"
          ? lang === "ar"
            ? "لديك عقار مسجّل بالفعل"
            : "You already have a registered property"
          : t.error;
      toast({ title: msg, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasActiveRequest) {
      toast({ title: t.editLocked, variant: "destructive" });
      return;
    }
    const url = formData.map_url.trim();
    if (
      url &&
      !url.startsWith("https://maps.google.com") &&
      !url.startsWith("https://maps.app.goo.gl") &&
      !url.startsWith("https://goo.gl/maps")
    ) {
      toast({
        title:
          lang === "ar"
            ? "رابط الخريطة غير صحيح. استخدم رابطاً من Google Maps"
            : "Invalid map URL. Use a Google Maps link.",
        variant: "destructive",
      });
      return;
    }
    mutation.mutate();
  };

  return (
    <div
      className="page-enter min-h-screen bg-[#F9F9FF] p-4 sm:p-6"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <Button
        variant="ghost"
        onClick={() => setLocation("/dashboard/owner/properties")}
        className="mb-4"
      >
        {lang === "ar" ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
        {t.back}
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{isEdit ? t.titleEdit : t.titleAdd}</h1>
      </div>

      {hasActiveRequest && (
        <div className="mb-4 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 px-4 py-3 text-amber-800">
          <AlertCircle className="mt-0.5 w-5 h-5 flex-shrink-0 text-amber-600" />
          <p className="text-sm font-medium">{t.editLocked}</p>
        </div>
      )}

      <Card>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t.name}</Label>
              <Input
                id="name"
                placeholder={t.namePlaceholder}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t.city}</Label>
                <Input id="city" value="الرياض" disabled className="bg-gray-100 text-gray-500" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">{t.neighborhood}</Label>
                <Input
                  id="address"
                  placeholder={t.neighborhoodPlaceholder}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t.buildingType}</Label>
              <Select
                value={formData.building_type}
                onValueChange={(v) => setFormData({ ...formData, building_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="residential">{t.residential}</SelectItem>
                  <SelectItem value="commercial">{t.commercial}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="units_count">{t.unitsCount}</Label>
              <Input
                id="units_count"
                type="number"
                min="1"
                placeholder={t.unitsPlaceholder}
                value={formData.units_count}
                onChange={(e) => setFormData({ ...formData, units_count: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="map_url">{t.mapUrl}</Label>
              <Input
                id="map_url"
                type="url"
                required
                placeholder={t.mapPlaceholder}
                value={formData.map_url}
                onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="national_address">{t.nationalAddress}</Label>
              <Input
                id="national_address"
                type="text"
                placeholder={t.nationalAddressPlaceholder}
                value={formData.national_address}
                onChange={(e) => setFormData({ ...formData, national_address: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2 bg-gradient-to-r from-[#2E4A6B] to-[#3F6690] hover:from-[#243A56] hover:to-[#2E4A6B] text-white"
              disabled={mutation.isPending || hasActiveRequest}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 me-2 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 me-2" />
                  {t.save}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
