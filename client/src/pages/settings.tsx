import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Settings as SettingsIcon, User, Save, Loader2, Building2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    name: "",
    phone: "",
    company_name: "",
    city: "",
  });

  const t = {
    ar: {
      title: "الإعدادات",
      subtitle: "إدارة حسابك وتفضيلاتك",
      profile: "الملف الشخصي",
      name: "الاسم الكامل",
      phone: "رقم الجوال",
      companyName: "اسم الشركة",
      city: "المدينة",
      completeProfile: "إكمال ملف الشركة",
      save: "حفظ التغييرات",
      saving: "جاري الحفظ...",
      success: "تم حفظ التغييرات بنجاح!",
      error: "حدث خطأ، حاول مرة أخرى",
    },
    en: {
      title: "Settings",
      subtitle: "Manage your account and preferences",
      profile: "Profile",
      name: "Full Name",
      phone: "Phone Number",
      companyName: "Company Name",
      city: "City",
      completeProfile: "Complete Company Profile",
      save: "Save Changes",
      saving: "Saving...",
      success: "Changes saved successfully!",
      error: "An error occurred, please try again",
    },
  }[lang];

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  const { data: userData } = useQuery({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Not logged in");
      const { data: user, error } = await supabase.from("users").select("*").eq("phone", phone).single();
      if (error) throw error;
      if (user.role === "provider") {
        const { data: provider } = await supabase.from("providers").select("*").eq("user_id", user.id).single();
        return { ...user, provider };
      }
      return user;
    },
  });

  useEffect(() => {
    if (userData) {
      setProfileData({
        name: (userData as any).name || "",
        phone: (userData as any).phone || "",
        company_name: (userData as any).provider?.company_name || "",
        city: (userData as any).provider?.city || "",
      });
    }
  }, [userData]);

  const mutation = useMutation({
    mutationFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Not logged in");
      const { error: userError } = await supabase.from("users").update({ name: profileData.name }).eq("phone", phone);
      if (userError) throw userError;
      if (userRole === "provider" && userData) {
        const { error: providerError } = await supabase.from("providers").update({ company_name: profileData.company_name, city: profileData.city }).eq("user_id", (userData as any).id);
        if (providerError) throw providerError;
      }
    },
    onSuccess: () => toast({ title: t.success }),
    onError: () => toast({ title: t.error, variant: "destructive" }),
  });

  return (
    <div className="min-h-screen bg-[#F9F9FF] p-4 sm:p-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        </div>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5" />
            {t.profile}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t.name}</Label>
            <Input id="name" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone}</Label>
            <Input id="phone" value={profileData.phone} disabled className="bg-gray-100" />
          </div>

          {userRole === "provider" && (
            <>
              <Separator className="my-2" />
              <div className="space-y-2">
                <Label htmlFor="company_name">{t.companyName}</Label>
                <Input id="company_name" value={profileData.company_name} onChange={(e) => setProfileData({ ...profileData, company_name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t.city}</Label>
                <Input id="city" value={profileData.city} onChange={(e) => setProfileData({ ...profileData, city: e.target.value })} />
              </div>
              <Button variant="outline" className="w-full" onClick={() => setLocation("/dashboard/provider/profile")}>
                <Building2 className="w-4 h-4 me-2" />
                {t.completeProfile}
              </Button>
            </>
          )}

          <Button onClick={() => mutation.mutate()} className="w-full bg-gradient-to-r from-[#2E4A6B] to-[#3F6690] hover:from-[#243A56] hover:to-[#2E4A6B] text-white" disabled={mutation.isPending}>
            {mutation.isPending ? (
              <><Loader2 className="w-4 h-4 me-2 animate-spin" />{t.saving}</>
            ) : (
              <><Save className="w-4 h-4 me-2" />{t.save}</>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
