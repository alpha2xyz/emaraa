import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, Building2, Calendar, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";
import { openSignedPdf } from "../lib/storage";
import { StatusBadge } from "@/components/StatusBadge";

export default function ProviderOffers() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();

  const t = {
    ar: {
      title: "عروضي المقدمة",
      subtitle: "تتبع جميع العروض التي قدمتها",
      noOffers: "لم تقدم أي عروض بعد",
      browseRequests: "تصفح الطلبات",
      request: "الطلب",
      property: "العقار",
      city: "المدينة",
      date: "التاريخ",
      status: "الحالة",
      viewFile: "عرض الملف",
      notes: "الملاحظات",
      loading: "جاري التحميل...",
      accepted: "مقبول",
      pending: "قيد المراجعة",
      rejected: "مرفوض",
      cleaning: "نظافة",
      maintenance: "صيانة",
    },
    en: {
      title: "My Submitted Offers",
      subtitle: "Track all offers you have submitted",
      noOffers: "You haven't submitted any offers yet",
      browseRequests: "Browse Requests",
      request: "Request",
      property: "Property",
      city: "City",
      date: "Date",
      status: "Status",
      viewFile: "View File",
      notes: "Notes",
      loading: "Loading...",
      accepted: "Accepted",
      pending: "Pending Review",
      rejected: "Rejected",
      cleaning: "Cleaning",
      maintenance: "Maintenance",
    },
  }[lang];

  const { data: offers, isLoading } = useQuery({
    queryKey: ["/api/provider/all-offers"],
    refetchOnMount: "always",
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Not logged in");

      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

      if (!user) throw new Error("User not found");

      const { data: provider } = await supabase
        .from("providers")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!provider) return [];

      const { data, error } = await supabase
        .from("provider_offers")
        .select(`
          id, offer_file_url, notes, status, created_at,
          requests (
            id, service_category,
            properties ( name, city )
          )
        `)
        .eq("provider_id", provider.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });

  const statusBadge = (status: string) => <StatusBadge status={status} lang={lang} />;

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <div
      className="page-enter min-h-screen bg-[#F9F9FF] p-4 sm:p-6"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <Send className="w-8 h-8 text-blue-600" />
            {t.title}
          </h1>
          <p className="text-gray-600 mt-1">{t.subtitle}</p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="space-y-4">
            {[1,2].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </div>
        )}

        {/* Empty */}
        {!isLoading && (!offers || offers.length === 0) && (
          <Card className="text-center py-14">
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 bg-green-50 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16">
                    <rect x="8" y="16" width="48" height="60" rx="5" fill="#DCFCE7"/>
                    <rect x="16" y="28" width="32" height="4" rx="2" fill="#86EFAC"/>
                    <rect x="16" y="37" width="24" height="4" rx="2" fill="#86EFAC"/>
                    <rect x="16" y="46" width="28" height="4" rx="2" fill="#86EFAC"/>
                    <circle cx="58" cy="54" r="16" fill="#22C55E"/>
                    <path d="M50 54l6 6 10-10" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="absolute -right-1 -bottom-1 w-7 h-7 bg-green-100 rounded-full" />
                <div className="absolute -left-2 top-3 w-5 h-5 bg-green-100 rounded-full" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-1">{t.noOffers}</h2>
              <p className="text-gray-400 text-sm mb-6">{lang === "ar" ? "ابدأ بتصفح الطلبات وتقديم عروضك" : "Browse available requests and start submitting"}</p>
              <Button onClick={() => setLocation("/dashboard/provider/requests")} className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4 me-2" />
                {t.browseRequests}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Offers List */}
        {!isLoading && offers && offers.length > 0 && (
          <div className="space-y-4">
            {offers.map((offer: any) => (
              <Card key={offer.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="space-y-2 flex-1">
                      {/* Category */}
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-lg">
                          {offer.requests?.service_category === "standard"
                            ? (lang === "ar" ? "نطاق الخدمات المطلوبة" : "Scope of Services")
                            : (offer.requests?.service_category === "cleaning" ? t.cleaning : t.maintenance)}
                        </span>
                        {statusBadge(offer.status)}
                      </div>

                      {/* Property */}
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Building2 className="w-4 h-4" />
                        <span>{offer.requests?.properties?.name}</span>
                        <span className="text-gray-500">·</span>
                        <span>{offer.requests?.properties?.city}</span>
                      </div>

                      {/* Date */}
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{formatDate(offer.created_at)}</span>
                      </div>

                      {/* Notes */}
                      {offer.notes && (
                        <p className="text-sm text-gray-600 bg-gray-50 rounded p-2 mt-2">
                          {offer.notes}
                        </p>
                      )}
                    </div>

                    {/* Actions */}
                    {offer.offer_file_url && (
                      <Button variant="outline" size="sm" onClick={() => openSignedPdf('provider-offers', offer.offer_file_url)}>
                        <FileText className="w-4 h-4 me-2" />
                        {t.viewFile}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
