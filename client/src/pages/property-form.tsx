import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Building2, Save, Loader2, ArrowLeft } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "@/lib/supabase";
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
    city: "",
    building_type: "residential",
    units_count: "",
    map_url: "",
  });

  const content = {
    ar: {
      titleAdd: "إضافة عقار جديد",
      titleEdit: "تعديل العقار",
      name: "اسم العقار",
      namePlaceholder: "مثال: برج الياسمين",
      address: "العنوان",
      addressPlaceholder: "العنوان التفصيلي للعقار",
      city: "المدينة",
      cityPlaceholder: "مثال: الرياض",
      buildingType: "نوع المبنى",
      residential: "سكني",
      commercial: "تجاري",
      unitsCount: "عدد الوحدات",
      unitsPlaceholder: "مثال: 24",
      mapUrl: "رابط الموقع على الخريطة (اختياري)",
      mapPlaceholder: "https://maps.google.com/...",
      save: "حفظ",
      saving: "جاري الحفظ...",
      back: "رجوع",
      success: "تم حفظ العقار بنجاح!",
      error: "حدث خطأ، حاول مرة أخرى",
    },
    en: {
      titleAdd: "Add New Property",
      titleEdit: "Edit Property",
      name: "Property Name",
      namePlaceholder: "e.g. Yasmine Tower",
      address: "Address",
      addressPlaceholder: "Detailed property address",
      city: "City",
      cityPlaceholder: "e.g. Riyadh",
      buildingType: "Building Type",
      residential: "Residential",
      commercial: "Commercial",
      unitsCount: "Number of Units",
      unitsPlaceholder: "e.g. 24",
      mapUrl: "Map URL (optional)",
      mapPlaceholder: "https://maps.google.com/...",
      save: "Save",
      saving: "Saving...",
      back: "Back",
      success: "Property saved successfully!",
      error: "An error occurred, please try again",
    },
  };

  const t = content[lang];

  // Load existing property for edit mode
  const { data: existingProperty } = useQuery({
    queryKey: ["/api/property", propertyId],
    queryFn: async () => {
      if (!propertyId) return null;
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: isEdit,
  });

  useEffect(() => {
    if (existingProperty) {
      setFormData({
        name: existingProperty.name || "",
        address: existingProperty.address || "",
        city: existingProperty.city || "",
        building_type: existingProperty.building_type || "residential",
        units_count: existingProperty.units_count?.toString() || "",
        map_url: existingProperty.map_url || "",
      });
    }
  }, [existingProperty]);

  const mutation = useMutation({
    mutationFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Not logged in");

      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

      if (!user) throw new Error("User not found");

      const payload = {
        owner_id: user.id,
        name: formData.name,
        address: formData.address,
        city: formData.city,
        building_type: formData.building_type,
        units_count: formData.units_count ? parseInt(formData.units_count) : null,
        map_url: formData.map_url || null,
      };

      if (isEdit) {
        const { error } = await supabase
          .from("properties")
          .update(payload)
          .eq("id", propertyId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("properties")
          .insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast({ title: t.success });
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      setLocation("/dashboard/owner/properties");
    },
    onError: () => {
      toast({ title: t.error, variant: "destructive" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div
      className="page-enter container mx-auto p-4 max-w-2xl"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <Button
        variant="ghost"
        onClick={() => setLocation("/dashboard/owner/properties")}
        className="mb-4"
      >
        <ArrowLeft className="h-4 w-4 me-2" />
        {t.back}
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
          <Building2 className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-bold">{isEdit ? t.titleEdit : t.titleAdd}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? t.titleEdit : t.titleAdd}</CardTitle>
        </CardHeader>
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

            <div className="space-y-2">
              <Label htmlFor="address">{t.address}</Label>
              <Input
                id="address"
                placeholder={t.addressPlaceholder}
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">{t.city}</Label>
                <Input
                  id="city"
                  placeholder={t.cityPlaceholder}
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                />
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
                placeholder={t.mapPlaceholder}
                value={formData.map_url}
                onChange={(e) => setFormData({ ...formData, map_url: e.target.value })}
              />
            </div>

            <Button
              type="submit"
              className="w-full mt-2"
              disabled={mutation.isPending}
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
