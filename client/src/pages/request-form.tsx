import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Building2, Save, Loader2, ArrowLeft } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { getServicesByCategory } from "@/lib/services";

export default function RequestForm() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [match, params] = useRoute("/dashboard/owner/requests/:id/edit");
  const requestId = params?.id;
  const [formData, setFormData] = useState({
    property_id: "",
    service_ids: [] as string[],
    description: "",
  });

  const content = {
    ar: {
      title: "طلب خدمة جديد",
      subtitle: "اختر العقار والخدمات المطلوبة",
      selectProperty: "اختر العقار",
      propertyPlaceholder: "اختر العقار",
      cleaning: "خدمات النظافة",
      maintenance: "خدمات الصيانة",
      description: "تفاصيل إضافية",
      descriptionPlaceholder: "اكتب أي تفاصيل أو ملاحظات إضافية...",
      submit: "إرسال الطلب",
      submitting: "جاري الإرسال...",
      cancel: "إلغاء",
      success: "تم إرسال الطلب بنجاح!",
      error: "حدث خطأ، حاول مرة أخرى",
      noProperties: "لا توجد عقارات! أضف عقاراً أولاً",
      addProperty: "إضافة عقار",
    },
    en: {
      title: "New Service Request",
      subtitle: "Select property and required services",
      selectProperty: "Select Property",
      propertyPlaceholder: "Select property",
      cleaning: "Cleaning Services",
      maintenance: "Maintenance Services",
      description: "Additional Details",
      descriptionPlaceholder: "Write any additional details or notes...",
      submit: "Submit Request",
      submitting: "Submitting...",
      cancel: "Cancel",
      success: "Request submitted successfully!",
      error: "An error occurred, please try again",
      noProperties: "No properties! Add a property first",
      addProperty: "Add Property",
    },
  };

  const t = content[lang];

  // جلب عقارات المستخدم
  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Not logged in");

      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
  // بعد استعلام properties
  const { data: existingRequest } = useQuery({
    queryKey: ["request", requestId],
    enabled: !!requestId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("*")
        .eq("id", requestId)
        .single();

      if (error) throw error;
      return data;
    },
  });

  // تحميل البيانات في النموذج
  useEffect(() => {
    if (existingRequest) {
      setFormData({
        propertyid: existingRequest.propertyid || "",
        serviceids: existingRequest.serviceids || [],
        description: existingRequest.description || "",
      });
    }
  }, [existingRequest]);

  // التعامل مع اختيار الخدمات
  const handleServiceToggle = (serviceId: string) => {
    setFormData((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter((id) => id !== serviceId)
        : [...prev.service_ids, serviceId],
    }));
  };
  // إرسال الطلب
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

      const cleaningServices = getServicesByCategory("cleaning").map(
        (s) => s.id,
      );
      const hasCleaningService = formData.serviceids.some((id) =>
        cleaningServices.includes(id),
      );

      const payload = {
        ownerid: user.id,
        propertyid: formData.propertyid,
        servicecategory: hasCleaningService ? "cleaning" : "maintenance",
        serviceids: formData.serviceids,
        description: formData.description || null,
      };

      const { error } = requestId
        ? await supabase.from("requests").update(payload).eq("id", requestId)
        : await supabase.from("requests").insert(payload);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: requestId ? "تم التحديث بنجاح!" : t.success,
        variant: "default",
      });
      setLocation("/dashboard/owner/requests");
    },
    onError: (error: any) => {
      console.error("Error:", error);
      toast({
        title: t.error,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/dashboard/owner/requests")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t.cancel}
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-8 h-8 text-blue-600" />
            {t.title}
          </h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* اختيار العقار */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                {t.selectProperty}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.property_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, property_id: value })
                }
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder={t.propertyPlaceholder} />
                </SelectTrigger>
                <SelectContent>
                  {properties?.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.name} - {property.city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* خدمات النظافة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🧹 {t.cleaning}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getServicesByCategory("cleaning").map((service) => (
                  <div
                    key={service.id}
                    className={`relative border-2 rounded-lg p-4 transition-all ${
                      formData.service_ids.includes(service.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={service.id}
                        checked={formData.service_ids.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={service.id}
                          className="font-semibold cursor-pointer block mb-1"
                        >
                          {service.name[lang]}
                        </Label>
                        <p className="text-xs text-gray-500">
                          {service.description[lang]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* خدمات الصيانة */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🔧 {t.maintenance}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getServicesByCategory("maintenance").map((service) => (
                  <div
                    key={service.id}
                    className={`relative border-2 rounded-lg p-4 transition-all ${
                      formData.service_ids.includes(service.id)
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id={service.id}
                        checked={formData.service_ids.includes(service.id)}
                        onCheckedChange={() => handleServiceToggle(service.id)}
                      />
                      <div className="flex-1">
                        <Label
                          htmlFor={service.id}
                          className="font-semibold cursor-pointer block mb-1"
                        >
                          {service.name[lang]}
                        </Label>
                        <p className="text-xs text-gray-500">
                          {service.description[lang]}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* التفاصيل */}
          <Card>
            <CardHeader>
              <CardTitle>{t.description}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder={t.descriptionPlaceholder}
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows={4}
              />
            </CardContent>
          </Card>

          {/* أزرار */}
          <div className="flex gap-4">
            <Button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700"
              disabled={
                mutation.isPending ||
                !formData.property_id ||
                formData.service_ids.length === 0
              }
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {t.submitting}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {t.submit}
                </>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setLocation("/requests")}
            >
              {t.cancel}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
