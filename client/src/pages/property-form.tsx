import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Building2, Save, Loader2, ArrowLeft } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { getServicesByCategory } from "@/lib/services";

export default function RequestForm() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      descriptionPlaceholder: "اكتب أي ملاحظات إضافية...",
      submit: "إرسال الطلب",
      submitting: "جاري الإرسال...",
      cancel: "إلغاء",
    },
    en: {
      title: "New Request",
      subtitle: "Select property and services",
      selectProperty: "Property",
      propertyPlaceholder: "Select property",
      cleaning: "Cleaning",
      maintenance: "Maintenance",
      description: "Details",
      descriptionPlaceholder: "Notes...",
      submit: "Submit",
      submitting: "Sending...",
      cancel: "Cancel",
    }
  };

  const t = content[lang];

  const { data: properties } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone");
      const { data, error } = await supabase.from("properties").select("*").eq("owner_phone", phone);
      if (error) throw error;
      return data;
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const phone = localStorage.getItem("userPhone");
      const { error } = await supabase.from("maintenance_requests").insert([
        {
          property_id: data.property_id,
          service_ids: data.service_ids,
          description: data.description,
          status: "pending",
          owner_phone: phone, // ✅ الربط برقم الجوال
        },
      ]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({ title: lang === "ar" ? "تم الإرسال بنجاح" : "Sent successfully" });
      setLocation("/requests");
    }
  });

  const handleServiceToggle = (serviceId: string) => {
    setFormData(prev => ({
      ...prev,
      service_ids: prev.service_ids.includes(serviceId)
        ? prev.service_ids.filter(id => id !== serviceId)
        : [...prev.service_ids, serviceId]
    }));
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/requests")}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{t.title}</h1>
          <p className="text-gray-500">{t.subtitle}</p>
        </div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(formData); }} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg"><Building2 className="inline ml-2" />{t.selectProperty}</CardTitle></CardHeader>
          <CardContent>
            <Select value={formData.property_id} onValueChange={(v) => setFormData({...formData, property_id: v})}>
              <SelectTrigger><SelectValue placeholder={t.propertyPlaceholder}/></SelectTrigger>
              <SelectContent>{properties?.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>{t.cleaning}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {getServicesByCategory("cleaning").map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <Checkbox id={s.id} checked={formData.service_ids.includes(s.id)} onCheckedChange={() => handleServiceToggle(s.id)} />
                  <Label htmlFor={s.id}>{s.name[lang]}</Label>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle>{t.maintenance}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {getServicesByCategory("maintenance").map(s => (
                <div key={s.id} className="flex items-center gap-3">
                  <Checkbox id={s.id} checked={formData.service_ids.includes(s.id)} onCheckedChange={() => handleServiceToggle(s.id)} />
                  <Label htmlFor={s.id}>{s.name[lang]}</Label>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
        <Card>
          <CardHeader><CardTitle>{t.description}</CardTitle></CardHeader>
          <CardContent><Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder={t.descriptionPlaceholder}/></CardContent>
        </Card>
        <Button type="submit" className="w-full bg-blue-600 h-12" disabled={mutation.isPending}>
          {mutation.isPending ? <Loader2 className="animate-spin" /> : t.submit}
        </Button>
      </form>
    </div>
  );
}