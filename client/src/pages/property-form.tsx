import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import { ArrowLeft, Building2, Save, Loader2 } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function PropertyForm() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const [match, params] = useRoute("/properties/:id/edit");
  const propertyId = params?.id;
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState({
    name: "",
    buildingtype: "",
    address: "",
    city: "",
    unitscount: "",
    mapurl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const content = {
    ar: {
      addTitle: "إضافة عقار جديد",
      editTitle: "تعديل العقار",
      name: "اسم العقار",
      namePlaceholder: "مثال: برج الخليج",
      buildingType: "نوع العقار",
      residential: "سكني",
      commercial: "تجاري",
      mixed: "مختلط",
      selectType: "اختر نوع العقار",
      address: "العنوان",
      addressPlaceholder: "مثال: شارع الملك فهد",
      city: "المدينة",
      cityPlaceholder: "مثال: الرياض",
      unitsCount: "عدد الوحدات",
      unitsPlaceholder: "مثال: 50",
      mapUrl: "رابط الموقع (خرائط جوجل)",
      mapUrlPlaceholder: "https://maps.google.com/...",
      mapUrlHelper: "افتح خرائط جوجل، اضغط على مشاركة، والصق الرابط هنا",
      save: "حفظ العقار",
      cancel: "إلغاء",
      saving: "جاري الحفظ...",
      successAdd: "تم إضافة العقار بنجاح!",
      successEdit: "تم تحديث العقار بنجاح!",
      requiredField: "هذا الحقل مطلوب",
      invalidUnits: "يجب أن يكون عدد الوحدات رقماً صحيحاً",
      loginRequired: "يرجى تسجيل الدخول أولاً",
    },
    en: {
      addTitle: "Add New Property",
      editTitle: "Edit Property",
      name: "Property Name",
      namePlaceholder: "Example: Gulf Tower",
      buildingType: "Property Type",
      residential: "Residential",
      commercial: "Commercial",
      mixed: "Mixed",
      selectType: "Select type",
      address: "Address",
      addressPlaceholder: "Example: King Fahd Road",
      city: "City",
      cityPlaceholder: "Example: Riyadh",
      unitsCount: "Number of Units",
      unitsPlaceholder: "50",
      mapUrl: "Map Link",
      mapUrlPlaceholder: "https://maps.google.com/...",
      mapUrlHelper: "Copy link from Google Maps",
      save: "Save",
      cancel: "Cancel",
      saving: "Saving...",
      successAdd: "Added successfully!",
      successEdit: "Updated successfully!",
      requiredField: "Required",
      invalidUnits: "Must be a number",
      loginRequired: "Please login",
    },
  };

  const t = content[lang as keyof typeof content] || content.ar;

  // جلب بيانات العقار في حال التعديل
  const { data: property } = useQuery({
    queryKey: ["properties", propertyId],
    enabled: !!propertyId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("id", propertyId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (property) {
      setFormData({
        name: property.name || "",
        buildingtype: property.buildingtype || "",
        address: property.address || "",
        city: property.city || "",
        unitscount: property.units_count?.toString() || "",
        mapurl: property.map_url || "",
      });
    }
  }, [property]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = t.requiredField;
    if (!formData.buildingtype) newErrors.buildingtype = t.requiredField;
    if (!formData.address.trim()) newErrors.address = t.requiredField;
    if (!formData.city.trim()) newErrors.city = t.requiredField;
    if (isNaN(Number(formData.unitscount)))
      newErrors.unitscount = t.invalidUnits;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error(t.loginRequired);

      // 1. جلب ID المستخدم من رقم الجوال
      const { data: user, error: userErr } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .maybeSingle();

      if (userErr || !user) throw new Error("حساب المستخدم غير موجود");

      // 2. تجهيز البيانات للحفظ
      const payload = {
        name: data.name,
        buildingtype: data.buildingtype,
        address: data.address,
        city: data.city,
        owner_id: user.id,
        units_count: parseInt(data.unitscount) || 0,
        map_url: data.mapurl || null,
      };

      // 3. تنفيذ الإضافة أو التحديث
      const { error } = propertyId
        ? await supabase.from("properties").update(payload).eq("id", propertyId)
        : await supabase.from("properties").insert([payload]);

      if (error) throw error;
    },
    onSuccess: () => {
      // تحديث بيانات الداشبورد فوراً بعد الحفظ
      queryClient.invalidateQueries({ queryKey: ["owner-stats"] });
      queryClient.invalidateQueries({ queryKey: ["properties"] });

      toast({ title: propertyId ? t.successEdit : t.successAdd });
      setLocation("/dashboard/owner");
    },
    onError: (error: any) => {
      toast({
        title: "خطأ في الحفظ",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      mutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 p-4 ${lang === "ar" ? "rtl" : "ltr"}`}
    >
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard/owner")}
          className="mb-4"
        >
          <ArrowLeft
            className={`h-4 w-4 ${lang === "ar" ? "ml-2 rotate-180" : "mr-2"}`}
          />
          {t.cancel}
        </Button>

        <Card className="shadow-lg border-t-4 border-t-blue-600">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6 text-blue-600" />
              {propertyId ? t.editTitle : t.addTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t.name}</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t.namePlaceholder}
                  className={errors.name ? "border-red-500" : ""}
                />
              </div>

              <div className="space-y-2">
                <Label>{t.buildingType}</Label>
                <Select
                  value={formData.buildingtype}
                  onValueChange={(v) => handleInputChange("buildingtype", v)}
                >
                  <SelectTrigger
                    className={errors.buildingtype ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder={t.selectType} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="residential">{t.residential}</SelectItem>
                    <SelectItem value="commercial">{t.commercial}</SelectItem>
                    <SelectItem value="mixed">{t.mixed}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t.city}</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    placeholder={t.cityPlaceholder}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.unitsCount}</Label>
                  <Input
                    type="number"
                    value={formData.unitscount}
                    onChange={(e) =>
                      handleInputChange("unitscount", e.target.value)
                    }
                    placeholder={t.unitsPlaceholder}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t.address}</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder={t.addressPlaceholder}
                />
              </div>

              <div className="space-y-2">
                <Label>{t.mapUrl}</Label>
                <Input
                  value={formData.mapurl}
                  onChange={(e) => handleInputChange("mapurl", e.target.value)}
                  placeholder={t.mapUrlPlaceholder}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1 bg-blue-600"
                >
                  {mutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 ml-2" />
                  )}
                  {t.save}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/dashboard/owner")}
                >
                  {t.cancel}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
