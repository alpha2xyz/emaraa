import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Globe,
  Shield,
  Save,
  Loader2,
  Building2,
  FileText,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { lang, toggleLang } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    company_name: "",
    city: "",
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    newRequests: true,
    statusUpdates: true,
  });

  const content = {
    ar: {
      title: "الإعدادات",
      subtitle: "إدارة حسابك وتفضيلاتك",
      profile: "الملف الشخصي",
      notifications: "الإشعارات",
      language: "اللغة والمنطقة",
      security: "الأمان",
      name: "الاسم الكامل",
      email: "البريد الإلكتروني",
      phone: "رقم الجوال",
      companyName: "اسم الشركة",
      city: "المدينة",
      emailNotif: "إشعارات البريد الإلكتروني",
      smsNotif: "إشعارات الرسائل النصية",
      newRequests: "إشعار عند الطلبات الجديدة",
      statusUpdates: "إشعار عند تحديث الحالة",
      currentLang: "اللغة الحالية",
      changeLanguage: "تغيير اللغة",
      privacySettings: "إعدادات الخصوصية",
      twoFactor: "المصادقة الثنائية",
      save: "حفظ التغييرات",
      saving: "جاري الحفظ...",
      success: "تم حفظ التغييرات بنجاح!",
      error: "حدث خطأ، حاول مرة أخرى",
      documents: "المستندات",
      updateDocs: "تحديث المستندات",
      commercialRegister: "السجل التجاري",
      companyProfile: "بروفايل الشركة",
    },
    en: {
      title: "Settings",
      subtitle: "Manage your account and preferences",
      profile: "Profile",
      notifications: "Notifications",
      language: "Language & Region",
      security: "Security",
      name: "Full Name",
      email: "Email Address",
      phone: "Phone Number",
      companyName: "Company Name",
      city: "City",
      emailNotif: "Email Notifications",
      smsNotif: "SMS Notifications",
      newRequests: "Notify on New Requests",
      statusUpdates: "Notify on Status Updates",
      currentLang: "Current Language",
      changeLanguage: "Change Language",
      privacySettings: "Privacy Settings",
      twoFactor: "Two-Factor Authentication",
      save: "Save Changes",
      saving: "Saving...",
      success: "Changes saved successfully!",
      error: "An error occurred, please try again",
      documents: "Documents",
      updateDocs: "Update Documents",
      commercialRegister: "Commercial Register",
      companyProfile: "Company Profile",
    },
  };

  const t = content[lang];

  // جلب نوع المستخدم
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    setUserRole(role);
  }, []);

  // جلب بيانات المستخدم
  const { data: userData } = useQuery({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Not logged in");

      const { data: user, error } = await supabase
        .from("users")
        .select("*")
        .eq("phone", phone)
        .single();

      if (error) throw error;

      // إذا كان مزود، جلب بيانات الشركة
      if (user.role === "provider") {
        const { data: provider } = await supabase
          .from("providers")
          .select("*")
          .eq("user_id", user.id)
          .single();

        return { ...user, provider };
      }

      return user;
    },
    onSuccess: (data) => {
      setProfileData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        company_name: data.provider?.company_name || "",
        city: data.provider?.city || "",
      });
    },
  });

  // حفظ التغييرات
  const mutation = useMutation({
    mutationFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Not logged in");

      // تحديث بيانات المستخدم الأساسية
      const { error: userError } = await supabase
        .from("users")
        .update({
          name: profileData.name,
          email: profileData.email,
        })
        .eq("phone", phone);

      if (userError) throw userError;

      // إذا كان مزود، تحديث بيانات الشركة
      if (userRole === "provider" && userData) {
        const { error: providerError } = await supabase
          .from("providers")
          .update({
            company_name: profileData.company_name,
            city: profileData.city,
          })
          .eq("user_id", userData.id);

        if (providerError) throw providerError;
      }
    },
    onSuccess: () => {
      toast({
        title: t.success,
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: t.error,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    mutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <SettingsIcon className="w-8 h-8 text-gray-700" />
          <h1 className="text-3xl font-bold text-gray-900">{t.title}</h1>
        </div>
        <p className="text-gray-600">{t.subtitle}</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="profile" className="max-w-4xl">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="w-4 h-4" />
            {t.profile}
          </TabsTrigger>
          <TabsTrigger
            value="notifications"
            className="flex items-center gap-2"
          >
            <Bell className="w-4 h-4" />
            {t.notifications}
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            {t.language}
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="w-4 h-4" />
            {t.security}
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{t.profile}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t.name}</Label>
                <Input
                  id="name"
                  value={profileData.name}
                  onChange={(e) =>
                    setProfileData({ ...profileData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t.email}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profileData.email}
                  onChange={(e) =>
                    setProfileData({ ...profileData, email: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">{t.phone}</Label>
                <Input
                  id="phone"
                  value={profileData.phone}
                  disabled
                  className="bg-gray-100"
                />
              </div>

              {userRole === "provider" && (
                <>
                  <Separator className="my-4" />

                  <div className="space-y-2">
                    <Label htmlFor="company_name">{t.companyName}</Label>
                    <Input
                      id="company_name"
                      value={profileData.company_name}
                      onChange={(e) =>
                        setProfileData({
                          ...profileData,
                          company_name: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="city">{t.city}</Label>
                    <Input
                      id="city"
                      value={profileData.city}
                      onChange={(e) =>
                        setProfileData({ ...profileData, city: e.target.value })
                      }
                    />
                  </div>

                  {/* زر إكمال ملف الشركة */}
                  <Button
                    variant="outline"
                    className="w-full mt-4"
                    onClick={() => setLocation("/dashboard/provider/profile")}
                  >
                    <Building2 className="w-4 h-4 mr-2" />
                    {lang === "ar"
                      ? "إكمال ملف الشركة"
                      : "Complete Company Profile"}
                  </Button>
                </>
              )}

              <Button
                onClick={handleSave}
                className="w-full mt-4"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {t.saving}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {t.save}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>{t.notifications}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notif" className="text-base">
                    {t.emailNotif}
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via email
                  </p>
                </div>
                <Switch
                  id="email-notif"
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      emailNotifications: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="sms-notif" className="text-base">
                    {t.smsNotif}
                  </Label>
                  <p className="text-sm text-gray-500">
                    Receive notifications via SMS
                  </p>
                </div>
                <Switch
                  id="sms-notif"
                  checked={notificationSettings.smsNotifications}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      smsNotifications: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="new-requests" className="text-base">
                    {t.newRequests}
                  </Label>
                  <p className="text-sm text-gray-500">
                    Get notified when you receive new requests
                  </p>
                </div>
                <Switch
                  id="new-requests"
                  checked={notificationSettings.newRequests}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      newRequests: checked,
                    })
                  }
                />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="status-updates" className="text-base">
                    {t.statusUpdates}
                  </Label>
                  <p className="text-sm text-gray-500">
                    Get notified about status changes
                  </p>
                </div>
                <Switch
                  id="status-updates"
                  checked={notificationSettings.statusUpdates}
                  onCheckedChange={(checked) =>
                    setNotificationSettings({
                      ...notificationSettings,
                      statusUpdates: checked,
                    })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Language Tab */}
        <TabsContent value="language">
          <Card>
            <CardHeader>
              <CardTitle>{t.language}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <Label className="text-base">{t.currentLang}</Label>
                  <p className="text-sm text-gray-500">
                    {lang === "ar" ? "العربية" : "English"}
                  </p>
                </div>
                <Button onClick={toggleLang} variant="outline">
                  {t.changeLanguage}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>{t.security}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="two-factor" className="text-base">
                    {t.twoFactor}
                  </Label>
                  <p className="text-sm text-gray-500">
                    Add an extra layer of security
                  </p>
                </div>
                <Switch id="two-factor" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base">{t.privacySettings}</Label>
                  <p className="text-sm text-gray-500">
                    Control who can see your information
                  </p>
                </div>
                <Button variant="outline">Manage</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
