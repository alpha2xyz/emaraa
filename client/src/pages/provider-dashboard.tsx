import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  FileText,
  Clock,
  CheckCircle2,
  Send,
  AlertCircle,
  Package,
  Phone,
  Info,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/hooks/use-lang";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function ProviderDashboard() {
  useAuthGuard("provider");
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const userName = localStorage.getItem("userName") || "";
  const today = new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
      phoneDisclosure:
        "في حال قبول عرضك، سيتم مشاركة رقم جوالك المسجل في حسابك مع صاحب العقار للتواصل المباشر.",
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
      phoneDisclosure:
        "If your offer is accepted, your registered phone number will be shared with the property owner for direct contact.",
    },
  }[lang];

  const userPhone = localStorage.getItem("userPhone") || "";

  const {
    data,
    isLoading: providerLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["/api/provider/dashboard"],
    queryFn: async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) throw new Error("Not logged in");
      const res = await fetch("/api/provider/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
    enabled: !!userPhone,
    retry: 2,
    retryDelay: 1000,
  });

  const providerData = data ? { user: data.user, provider: data.provider } : undefined;
  const availableRequests: any[] = data?.availableRequests || [];
  const myOffers: any[] = data?.myOffers || [];

  const stats = [
    {
      label: t.available,
      value: availableRequests.length,
      icon: FileText,
      accent: "#2E4A6B",
      iconBg: "#EEF2F7",
    },
    { label: t.myOffers, value: myOffers.length, icon: Send, accent: "#7D3040", iconBg: "#FDF0F2" },
    {
      label: t.pending,
      value: myOffers.filter((o: any) => o.status === "pending").length,
      icon: Clock,
      accent: "#C4694A",
      iconBg: "#FDF3EF",
    },
    {
      label: t.accepted,
      value: myOffers.filter((o: any) => o.status === "accepted").length,
      icon: CheckCircle2,
      accent: "#6B7C5E",
      iconBg: "#F3F5F1",
    },
  ];

  const isProfileComplete = providerData?.provider?.company_name && providerData?.provider?.city;
  const isApproved = providerData?.provider?.approved;

  if (providerLoading) {
    return (
      <div className="container mx-auto p-4 space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-5 w-32" />
        <div className="grid grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-red-500 text-sm">
          {lang === "ar" ? "حدث خطأ في تحميل البيانات" : "Failed to load data"}
        </p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 me-2" />
          {lang === "ar" ? "إعادة المحاولة" : "Retry"}
        </Button>
      </div>
    );
  }

  return (
    <div className="page-enter container mx-auto p-4 space-y-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900">
          {lang === "ar"
            ? `مرحباً${userName ? `، ${userName}` : ""}`
            : `Welcome${userName ? `, ${userName}` : ""}`}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{today}</p>
      </div>

      {!providerLoading && !isProfileComplete && (
        <div className="rounded-2xl border border-orange-200 bg-orange-50/60 p-5">
          <div className="flex items-start gap-4">
            <AlertCircle className="h-8 w-8 text-orange-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{t.completeProfile}</h3>
              <p className="text-sm text-gray-900 mb-3">{t.completeProfileDesc}</p>
              <Button
                size="sm"
                onClick={() => setLocation("/dashboard/provider/profile")}
                className="bg-orange-600 hover:bg-orange-700"
              >
                <Package className="h-4 w-4 me-2" />
                {t.completeNow}
              </Button>
            </div>
          </div>
        </div>
      )}

      {!providerLoading && isProfileComplete && !isApproved && (
        <div className="rounded-2xl border border-yellow-200 bg-yellow-50/60 p-5">
          <div className="flex items-start gap-4">
            <Clock className="h-8 w-8 text-yellow-500 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">
                {lang === "ar" ? "طلبك قيد المراجعة" : "Your registration is under review"}
              </h3>
              <p className="text-sm text-gray-900">
                {lang === "ar"
                  ? "سيتم إشعارك عند قبول حسابك من قِبل الإدارة"
                  : "You will be notified once your account is approved by admin"}
              </p>
            </div>
          </div>
        </div>
      )}

      {!providerLoading && isProfileComplete && (
        <div className="rounded-2xl border border-[#B8CCD9] bg-[#EEF2F7]/60 p-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-[#3D6187] flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-[#1A2E42]">{t.phoneDisclosure}</p>
              {userPhone && (
                <div className="flex items-center gap-1.5 mt-1.5">
                  <Phone className="h-3.5 w-3.5 text-[#2E4A6B]" />
                  <span className="text-sm font-semibold text-[#2E4A6B]" dir="ltr">
                    {userPhone}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {stats.map(({ label, value, icon: Icon, accent, iconBg }) => (
          <div
            key={label}
            className="bg-white rounded-2xl shadow-sm p-5 hover:shadow-md transition-shadow"
            style={{ borderTop: `4px solid ${accent}` }}
          >
            <div className="flex items-center justify-between">
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{label}</p>
                <p className="text-xl font-bold">{value}</p>
              </div>
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: iconBg }}
              >
                <Icon className="h-5 w-5" style={{ color: accent }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
