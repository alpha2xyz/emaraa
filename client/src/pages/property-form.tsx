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
import { ArrowLeft, Building2, MapPin, Save, Loader2 } from "lucide-react";
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

  // إضافة state للأخطاء
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
      mapUrlPlaceholder: "https://maps.app.goo.gl/...",
      mapUrlHelper: "افتح خرائط جوجل، اضغط على مشاركة، والصق الرابط هنا",
      save: "حفظ العقار",
      cancel: "إلغاء",
      saving: "جاري الحفظ...",
      successAdd: "تم إضافة العقار بنجاح!",
      successEdit: "تم تحديث العقار بنجاح!",
      error: "حدث خطأ، حاول مرة أخرى",
      requiredField: "هذا الحقل مطلوب",
      invalidUnits: "يجب أن يكون عدد الوحدات رقم صحيح",
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
      selectType: "Select property type",
      address: "Address",
      addressPlaceholder: "Example: King Fahd Road",
      city: "City",
      cityPlaceholder: "Example: Riyadh",
      unitsCount: "Number of Units",
      unitsPlaceholder: "Example: 50",
      mapUrl: "Location Link (Google Maps)",
      mapUrlPlaceholder: "https://maps.app.goo.gl/...",
      mapUrlHelper: "Open Google Maps, tap Share, and paste the link here",
      save: "Save Property",
      cancel: "Cancel",
      saving: "Saving...",
      successAdd: "Property added successfully!",
      successEdit: "Property updated successfully!",
      error: "An error occurred, please try again",
      requiredField: "This field is required",
      invalidUnits: "Units count must be a valid number",
    },
  };

  const t = content[lang];

  // جلب بيانات العقار للتعديل
  const { data: property } = useQuery({
    queryKey: ["/api/properties", propertyId],
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

  // دالة التحقق من صحة البيانات
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = t.requiredField;
    }
    if (!formData.buildingtype) {
      newErrors.buildingtype = t.requiredField;
    }
    if (!formData.address.trim()) {
      newErrors.address = t.requiredField;
    }
    if (!formData.city.trim()) {
      newErrors.city = t.requiredField;
    }
    if (
      !formData.unitscount ||
      isNaN(Number(formData.unitscount)) ||
      Number(formData.unitscount) < 0
    ) {
      newErrors.unitscount = t.invalidUnits;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      // استخدام الطريقة الصحيحة للحصول على المستخدم
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error("Please login first");
      }

      const propertyData = {
        name: data.name,
        buildingtype: data.buildingtype,
        address: data.address,
        city: data.city,
        owner_id: user.id, // استخدام user.id مباشرة
        units_count: parseInt(data.unitscount) || 0,
        map_url: data.mapurl || null,
      };

      if (propertyId) {
        const { data: result, error } = await supabase
          .from("properties")
          .update(propertyData)
          .eq("id", propertyId)
          .select();

        if (error) throw error;
        return result;
      } else {
        const { data: result, error } = await supabase
          .from("properties")
          .insert([propertyData])
          .select();

        if (error) throw error;
        return result;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: propertyId ? t.successEdit : t.successAdd,
        variant: "default",
      });
      setLocation("/properties");
    },
    onError: (error: any) => {
      console.error("Mutation error:", error);
      toast({
        title: t.error,
        variant: "destructive",
        description: error?.message || "Unknown error",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // التحقق من صحة البيانات قبل الإرسال
    if (!validateForm()) {
      toast({
        title: t.error,
        variant: "destructive",
        description: t.requiredField,
      });
      return;
    }

    mutation.mutate(formData);
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // مسح الخطأ عند التعديل
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  return (
    <div
      className={`min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 ${lang === "ar" ? "rtl" : "ltr"}`}
    >
      <div className="max-w-2xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => setLocation("/properties")}
          className={`mb-4 ${lang === "ar" ? "flex-row-reverse" : ""}`}
        >
          <ArrowLeft
            className={`h-4 w-4 ${lang === "ar" ? "ml-2 rotate-180" : "mr-2"}`}
          />
          {t.cancel}
        </Button>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-6 w-6" />
              {propertyId ? t.editTitle : t.addTitle}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* اسم العقار */}
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder={t.namePlaceholder}
                  className={errors.name ? "border-red-500" : ""}
                />
                {errors.name && (
                  <p className="text-sm text-red-500">{errors.name}</p>
                )}
              </div>

              {/* نوع العقار */}
              <div className="space-y-2">
                <Label htmlFor="buildingtype">{t.buildingType}</Label>
                <Select
                  value={formData.buildingtype}
                  onValueChange={(value) =>
                    handleInputChange("buildingtype", value)
                  }
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
                {errors.buildingtype && (
                  <p className="text-sm text-red-500">{errors.buildingtype}</p>
                )}
              </div>

              {/* العنوان */}
              <div className="space-y-2">
                <Label htmlFor="address">{t.address}</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  placeholder={t.addressPlaceholder}
                  className={errors.address ? "border-red-500" : ""}
                />
                {errors.address && (
                  <p className="text-sm text-red-500">{errors.address}</p>
                )}
              </div>

              {/* المدينة */}
              <div className="space-y-2">
                <Label htmlFor="city">{t.city}</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder={t.cityPlaceholder}
                  className={errors.city ? "border-red-500" : ""}
                />
                {errors.city && (
                  <p className="text-sm text-red-500">{errors.city}</p>
                )}
              </div>

              {/* عدد الوحدات */}
              <div className="space-y-2">
                <Label htmlFor="unitscount">{t.unitsCount}</Label>
                <Input
                  id="unitscount"
                  type="number"
                  min="0"
                  value={formData.unitscount}
                  onChange={(e) =>
                    handleInputChange("unitscount", e.target.value)
                  }
                  placeholder={t.unitsPlaceholder}
                  className={errors.unitscount ? "border-red-500" : ""}
                />
                {errors.unitscount && (
                  <p className="text-sm text-red-500">{errors.unitscount}</p>
                )}
              </div>

              {/* رابط الخريطة */}
              <div className="space-y-2">
                <Label htmlFor="mapurl">{t.mapUrl}</Label>
                <Input
                  id="mapurl"
                  value={formData.mapurl}
                  onChange={(e) => handleInputChange("mapurl", e.target.value)}
                  placeholder={t.mapUrlPlaceholder}
                />
                <p className="text-sm text-gray-500">{t.mapUrlHelper}</p>
              </div>

              {/* أزرار الحفظ والإلغاء */}
              <div className="flex gap-2 pt-4">
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="flex-1"
                >
                  {mutation.isPending ? (
                    <>
                      <Loader2
                        className={`h-4 w-4 animate-spin ${lang === "ar" ? "ml-2" : "mr-2"}`}
                      />
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <Save
                        className={`h-4 w-4 ${lang === "ar" ? "ml-2" : "mr-2"}`}
                      />
                      {t.save}
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/properties")}
                  disabled={mutation.isPending}
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
