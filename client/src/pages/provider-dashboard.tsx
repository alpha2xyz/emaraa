import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { FileText, Clock, CheckCircle2, Send, AlertCircle, Package } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/use-lang";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { supabase } from "../lib/supabase";

export default function ProviderDashboard() {
  useAuthGuard("provider");
  const { lang } = useLang();
  const [, setLocation] = useLocation();

  const t = {
    ar: {
      title: "لوحة التحكم",
      subtitle: "مرحباً بك في لوحة التحكم الخاصة بك",
      available: "الطلبات المتاحة",
      myOffers: "عروضي المقدمة",
      pending: "قيد المراجعة",
      accepted: "مقبول",
      completeProfile: "أكمل ملف شركتك أولاً",
      completeProfileDesc: "يجب إكمال معلومات الشركة قبل البدء في تقديم العروض",
      completeNow: "إكمال الآن",
    },
    en: {
      title: "Dashboard",
      subtitle: "Welcome to your dashboard",
      available: "Available Requests",
      myOffers: "My Offers",
      pending: "Pending Review",
      accepted: "Accepted",
      completeProfile: "Complete Your Company Profile First",
      completeProfileDesc: "You must complete company information before submitting offers",
      completeNow: "Complete Now",
    },
  }[lang];

  const { data: providerData, isLoading: providerLoading } = useQuery({
    queryKey: ["/api/provider/profile"],
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Not logged in");
      const { data: user } = await supabase.from("users").select("id").eq("phone", phone).single();
      if (!user) throw new Error("User not found");
      const { data: provider } = await supabase.from("providers").select("*").eq("user_id", user.id).single();
      return { user, provider };
    },
  });

  const { data: availableRequests } = useQuery({
    queryKey: ["/api/requests/available"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select("id")
        .eq("status", "pending");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: myOffers } = useQuery({
    queryKey: ["/api/provider/my-offers"],
    queryFn: async () => {
      if (!providerData?.provider?.id) return [];
      const { data, error } = await supabase
        .from("provider_offers")
        .select("id, status")
        .eq("provider_id", providerData.provider.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!providerData?.provider?.id,
  });

  const stats = [
    { label: t.available, value: availableRequests?.length || 0, icon: FileText, color: "text-blue-500" },
    { label: t.myOffers, value: myOffers?.length || 0, icon: Send, color: "text-purple-500" },
    { label: t.pending, value: myOffers?.filter((o: any) => o.status === "pending").length || 0, icon: Clock, color: "text-yellow-500" },
    { label: t.accepted, value: myOffers?.filter((o: any) => o.status === "accepted").length || 0, icon: CheckCircle2, color: "text-green-500" },
  ];

  const isProfileComplete = providerData?.provider?.company_name && providerData?.provider?.city;
  const isApproved = providerData?.provider?.approved;

  return (
    <div className="page-enter container mx-auto p-4 space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      {!providerLoading && !isProfileComplete && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 text-orange-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{t.completeProfile}</h3>
                <p className="text-sm text-gray-900 mb-3">{t.completeProfileDesc}</p>
                <Button size="sm" onClick={() => setLocation("/dashboard/provider/profile")} className="bg-orange-600 hover:bg-orange-700">
                  <Package className="h-4 w-4 me-2" />
                  {t.completeNow}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!providerLoading && isProfileComplete && !isApproved && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Clock className="h-8 w-8 text-yellow-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {lang === "ar" ? "طلبك قيد المراجعة" : "Your registration is under review"}
                </h3>
                <p className="text-sm text-gray-900">
                  {lang === "ar" ? "سيتم إشعارك عند قبول حسابك من قِبل الإدارة" : "You will be notified once your account is approved by admin"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 gap-4">
        {stats.map(({ label, value, icon: Icon, color }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-3xl font-bold">{value}</p>
                </div>
                <Icon className={`h-10 w-10 ${color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
