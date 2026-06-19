import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { User, Save, Loader2, Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/hooks/use-lang";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<string | null>(null);

  const [profileData, setProfileData] = useState({
    name: localStorage.getItem("userName") || "",
    phone: localStorage.getItem("userPhone") || "",
    email: "",
    company_name: "",
    city: "",
  });
  const [nameError, setNameError] = useState("");

  const t = {
    ar: {
      title: "الإعدادات",
      subtitle: "إدارة حسابك وتفضيلاتك",
      profile: "الملف الشخصي",
      name: "الاسم",
      phone: "رقم الجوال",
      email: "البريد الإلكتروني (اختياري)",
      emailHint: "أضف بريدك لتصلك إشعارات عن طلباتك (طلب جديد، عرض جديد، قبول العرض) بدون الحاجة لتسجيل الدخول للتحقق.",
      companyName: "اسم الشركة",
      city: "المدينة",
      completeProfile: "إكمال ملف الشركة",
      save: "حفظ التغييرات",
      saving: "جاري الحفظ...",
      success: "تم حفظ التغييرات بنجاح!",
      error: "حدث خطأ، حاول مرة أخرى",
      nameRequired: "الاسم مطلوب",
    },
    en: {
      title: "Settings",
      subtitle: "Manage your account and preferences",
      profile: "Profile",
      name: "Name",
      phone: "Phone Number",
      email: "Email (optional)",
      emailHint: "Add your email to get notified about your requests (new request, new offer, offer accepted) — no need to log in just to check.",
      companyName: "Company Name",
      city: "City",
      completeProfile: "Complete Company Profile",
      save: "Save Changes",
      saving: "Saving...",
      success: "Changes saved successfully!",
      error: "An error occurred, please try again",
      nameRequired: "Name is required",
    },
  }[lang];

  useEffect(() => {
    setUserRole(localStorage.getItem("userRole"));
  }, []);

  const { data: userData, isLoading } = useQuery({
    queryKey: ["/api/user/profile"],
    queryFn: async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) throw new Error("Not logged in");
      // Read profile via server (supabaseAdmin bypasses RLS)
      const res = await fetch("/api/user/profile", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("profile_load_failed");
      const user = await res.json();
      if (user.role === "provider") {
        const providerRes = await fetch("/api/provider/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const provider = providerRes.ok ? await providerRes.json() : null;
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
        email: (userData as any).email || "",
        company_name: (userData as any).provider?.company_name || "",
        city: (userData as any).provider?.city || "",
      });
    }
  }, [userData]);

  const mutation = useMutation({
    mutationFn: async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) throw new Error("Not logged in");

      // Update name via server (bypasses RLS)
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: profileData.name, email: profileData.email }),
      });
      if (!res.ok) throw new Error("update_failed");

      // Update localStorage so navbar reflects new name immediately
      localStorage.setItem("userName", profileData.name);

      // Provider-specific fields — via server (supabaseAdmin bypasses RLS recursion)
      if (userRole === "provider" && userData) {
        const providerRes = await fetch("/api/provider/profile", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            company_name: profileData.company_name,
            city: profileData.city,
          }),
        });
        if (!providerRes.ok) throw new Error("provider_update_failed");
      }
    },
    onSuccess: () => toast({ title: t.success }),
    onError: () => toast({ title: t.error, variant: "destructive" }),
  });

  const headerGradient =
    userRole === "provider"
      ? "linear-gradient(135deg, #0e3a5c, #193546)"
      : "linear-gradient(135deg, #0f3a47, #193546)";

  const brandColor = userRole === "provider" ? "var(--provider)" : "var(--owner)";

  return (
    <div
      className="page-enter min-h-screen"
      style={{ background: "var(--navy-2)" }}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Role-aware gradient header strip */}
      <div
        style={{ background: headerGradient, borderBottom: `2px solid ${brandColor}` }}
        className="py-5 px-4 flex items-center gap-3"
      >
        <button
          type="button"
          onClick={() => setLocation(userRole === "provider" ? "/dashboard/provider" : "/dashboard/owner")}
          className="text-white p-1 rounded-lg hover:bg-white/10 flex-shrink-0"
          aria-label={lang === "ar" ? "رجوع" : "Back"}
        >
          {lang === "ar" ? <ChevronRight className="w-6 h-6" /> : <ChevronLeft className="w-6 h-6" />}
        </button>
        <h1 className="text-xl font-bold text-white flex-1">{t.title}</h1>
        <span className="text-white font-extrabold text-lg tracking-wide">عِمارة</span>
      </div>

      <div className="p-4 sm:p-6">
      <div className="mb-8">
        <p className="text-muted-foreground">{t.subtitle}</p>
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
            {isLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
              <Input
                id="name"
                value={profileData.name}
                onChange={(e) => {
                  setProfileData({ ...profileData, name: e.target.value });
                  if (e.target.value.trim()) setNameError("");
                }}
                className={nameError ? "border-red-500 focus-visible:ring-red-400" : ""}
              />
            )}
            {nameError && (
              <div
                className="text-sm rounded-md px-3 py-2"
                style={{ background: "var(--err-soft)", color: "var(--err)", border: "1px solid rgba(248,113,113,0.4)" }}
              >
                {nameError}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">{t.phone}</Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full rounded-xl" />
            ) : (
              <Input id="phone" value={profileData.phone} disabled className="bg-white/5" />
            )}
          </div>

          {userRole !== "provider" && (
            <div className="space-y-2">
              <Label htmlFor="email">{t.email}</Label>
              {isLoading ? (
                <Skeleton className="h-10 w-full rounded-xl" />
              ) : (
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  placeholder="example@email.com"
                  value={profileData.email}
                  onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                />
              )}
              <p className="text-xs text-muted-foreground leading-relaxed">{t.emailHint}</p>
            </div>
          )}

          {userRole === "provider" && (
            <>
              <Separator className="my-2" />
              <div className="space-y-2">
                <Label htmlFor="company_name">{t.companyName}</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full rounded-xl" />
                ) : (
                  <Input
                    id="company_name"
                    value={profileData.company_name}
                    onChange={(e) =>
                      setProfileData({ ...profileData, company_name: e.target.value })
                    }
                  />
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t.city}</Label>
                {isLoading ? (
                  <Skeleton className="h-10 w-full rounded-xl" />
                ) : (
                  <Input
                    id="city"
                    value={profileData.city}
                    onChange={(e) => setProfileData({ ...profileData, city: e.target.value })}
                  />
                )}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setLocation("/dashboard/provider/profile")}
              >
                <Building2 className="w-4 h-4 me-2" />
                {t.completeProfile}
              </Button>
            </>
          )}

          <div className="pt-2 flex justify-end">
            <Button
              onClick={() => {
                if (!profileData.name.trim()) {
                  setNameError(t.nameRequired);
                  return;
                }
                setNameError("");
                mutation.mutate();
              }}
              style={{ background: brandColor, color: userRole === "provider" ? "#FFFFFF" : "#04222c" }}
              disabled={mutation.isPending || isLoading}
            >
              {mutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 me-2 animate-spin" />
                  {t.saving}
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 me-2" />
                  {t.save}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
