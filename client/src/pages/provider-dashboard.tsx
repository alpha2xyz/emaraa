import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Building2,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  TrendingUp,
  AlertCircle,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";
import { SERVICES } from "@/lib/services";

export default function ProviderDashboard() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();

  const content = {
    ar: {
      title: "لوحة التحكم",
      subtitle: "مرحباً بك في لوحة التحكم الخاصة بك",
      stats: {
        available: "الطلبات المتاحة",
        myOffers: "عروضي المقدمة",
        pending: "قيد المراجعة",
        accepted: "مقبول",
      },
      availableRequests: "الطلبات المتاحة",
      viewAll: "عرض الكل",
      myOffers: "عروضي الأخيرة",
      noRequests: "لا توجد طلبات متاحة حالياً",
      noOffers: "لم تقدم أي عروض بعد",
      submitOffer: "تقديم عرض",
      viewDetails: "عرض التفاصيل",
      status: {
        pending: "قيد المراجعة",
        accepted: "مقبول",
        rejected: "مرفوض",
      },
      cleaning: "خدمات النظافة",
      maintenance: "خدمات الصيانة",
      loading: "جاري التحميل...",
      completeProfile: "أكمل ملف شركتك أولاً",
      completeProfileDesc: "يجب إكمال معلومات الشركة قبل البدء في تقديم العروض",
      completeNow: "إكمال الآن",
    },
    en: {
      title: "Dashboard",
      subtitle: "Welcome to your dashboard",
      stats: {
        available: "Available Requests",
        myOffers: "My Offers",
        pending: "Pending Review",
        accepted: "Accepted",
      },
      availableRequests: "Available Requests",
      viewAll: "View All",
      myOffers: "My Recent Offers",
      noRequests: "No requests available",
      noOffers: "No offers submitted yet",
      submitOffer: "Submit Offer",
      viewDetails: "View Details",
      status: {
        pending: "Pending Review",
        accepted: "Accepted",
        rejected: "Rejected",
      },
      cleaning: "Cleaning Services",
      maintenance: "Maintenance Services",
      loading: "Loading...",
      completeProfile: "Complete Your Company Profile First",
      completeProfileDesc: "You must complete company information before submitting offers",
      completeNow: "Complete Now",
    },
  };

  const t = content[lang];

  // جلب بيانات المزود
  const { data: providerData } = useQuery({
    queryKey: ["/api/provider/profile"],
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Not logged in");

      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

      const { data: provider } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      return { user, provider };
    },
  });

  // جلب الطلبات المتاحة (آخر 6)
  const { data: availableRequests, isLoading: loadingRequests } = useQuery({
    queryKey: ["/api/requests/available"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select(
          `
          *,
          properties (
            id,
            name,
            city
          )
        `
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(6);

      if (error) throw error;
      return data || [];
    },
  });

  // جلب عروضي (آخر 5)
  const { data: myOffers, isLoading: loadingOffers } = useQuery({
    queryKey: ["/api/provider/my-offers"],
    queryFn: async () => {
      if (!providerData?.provider?.id) return [];

      const { data, error } = await supabase
        .from("provider_offers")
        .select(
          `
          *,
          requests (
            id,
            service_category,
            properties (
              name
            )
          )
        `
        )
        .eq("provider_id", providerData.provider.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data || [];
    },
    enabled: !!providerData?.provider?.id,
  });

  // حساب الإحصائيات
  const stats = {
    available: availableRequests?.length || 0,
    myOffers: myOffers?.length || 0,
    pending: myOffers?.filter((o: any) => o.status === "pending").length || 0,
    accepted: myOffers?.filter((o: any) => o.status === "accepted").length || 0,
  };

  const getCategoryName = (category: string) => {
    return category === "cleaning" ? t.cleaning : t.maintenance;
  };

  const getStatusBadge = (status: string) => {
    const variants: any = {
      pending: { variant: "secondary", icon: Clock, color: "text-yellow-600" },
      accepted: { variant: "default", icon: CheckCircle2, color: "text-green-600" },
      rejected: { variant: "destructive", icon: XCircle, color: "text-red-600" },
    };

    const config = variants[status] || variants.pending;
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="gap-1">
        <Icon className="h-3 w-3" />
        {t.status[status as keyof typeof t.status]}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // التحقق من اكتمال الملف الشخصي
  const isProfileComplete = providerData?.provider?.company_name && 
                           providerData?.provider?.city;

  return (
    <div
      className="container mx-auto p-4 space-y-6"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <p className="text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      {/* تنبيه إكمال الملف الشخصي */}
      {!isProfileComplete && (
        <Card className="border-orange-200 bg-orange-50 dark:bg-orange-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-8 w-8 text-orange-500 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-orange-900 dark:text-orange-100 mb-1">
                  {t.completeProfile}
                </h3>
                <p className="text-sm text-orange-700 dark:text-orange-200 mb-3">
                  {t.completeProfileDesc}
                </p>
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
          </CardContent>
        </Card>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.stats.available}</p>
                <p className="text-3xl font-bold">{stats.available}</p>
              </div>
              <FileText className="h-10 w-10 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.stats.myOffers}</p>
                <p className="text-3xl font-bold">{stats.myOffers}</p>
              </div>
              <Send className="h-10 w-10 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.stats.pending}</p>
                <p className="text-3xl font-bold">{stats.pending}</p>
              </div>
              <Clock className="h-10 w-10 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t.stats.accepted}</p>
                <p className="text-3xl font-bold">{stats.accepted}</p>
              </div>
              <CheckCircle2 className="h-10 w-10 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Available Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            {t.availableRequests}
          </CardTitle>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocation("/dashboard/provider/requests")}
          >
            {t.viewAll}
          </Button>
        </CardHeader>
        <CardContent>
          {loadingRequests ? (
            <p className="text-center py-8 text-muted-foreground">{t.loading}</p>
          ) : !availableRequests || availableRequests.length === 0 ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{t.noRequests}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableRequests.map((request: any) => (
                <Card key={request.id} className="hover:shadow-lg transition-shadow border-2 hover:border-primary">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-lg">
                          {getCategoryName(request.service_category)}
                        </h3>
                        <Badge variant="outline">{request.properties?.city}</Badge>
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Building2 className="h-4 w-4" />
                        <span>{request.properties?.name}</span>
                      </div>

                      <p className="text-xs text-muted-foreground">
                        {formatDate(request.created_at)}
                      </p>

                      <Button
                        size="sm"
                        className="w-full"
                        onClick={() =>
                          setLocation(`/dashboard/provider/requests/${request.id}/offer`)
                        }
                        disabled={!isProfileComplete}
                      >
                        <Send className="h-4 w-4 me-2" />
                        {t.submitOffer}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* My Recent Offers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t.myOffers}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingOffers ? (
            <p className="text-center py-8 text-muted-foreground">{t.loading}</p>
          ) : !myOffers || myOffers.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <p className="text-muted-foreground">{t.noOffers}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-start p-3 font-medium">
                      {lang === "ar" ? "الطلب" : "Request"}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {lang === "ar" ? "العقار" : "Property"}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {lang === "ar" ? "التاريخ" : "Date"}
                    </th>
                    <th className="text-start p-3 font-medium">
                      {lang === "ar" ? "الحالة" : "Status"}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {myOffers.map((offer: any) => (
                    <tr key={offer.id} className="border-b hover:bg-muted/50 transition-colors">
                      <td className="p-3 font-medium">
                        {getCategoryName(offer.requests?.service_category)}
                      </td>
                      <td className="p-3">{offer.requests?.properties?.name}</td>
                      <td className="p-3 text-sm text-muted-foreground">
                        {formatDate(offer.created_at)}
                      </td>
                      <td className="p-3">{getStatusBadge(offer.status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
