import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  Send,
  Filter,
  Search,
  AlertCircle,
  Loader2,
  MapPin,
  Calendar,
  Package,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";

export default function ProviderRequests() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");

  const content = {
    ar: {
      title: "الطلبات المتاحة",
      subtitle: "تصفح جميع الطلبات المتاحة وقدم عروضك",
      search: "بحث عن طلب...",
      filterCity: "تصفية حسب المدينة",
      all: "الكل",
      property: "العقار",
      city: "المدينة",
      scopeTitle: "نطاق الخدمات المطلوبة",
      scopeShort: "نظافة يومية للمناطق المشتركة والأسطح والخزانات ونقل النفايات، صيانة دورية للإنارة والمضخات والمصاعد والكاميرات، رش مبيدات وبستنة عند الحاجة، طوارئ على مدار الساعة، تسديد فواتير المرافق، مع توضيح آلية العمل في الإجازات والمناسبات الوطنية. | متطلبات العرض: تفصيل الخدمات والسعر لكل وحدة وإجمالي العقد شاملاً الضريبة وشروط الدفع، مع السجل التجاري والاعتمادات والمراجع أو البورتفوليو، لمدة سنة قابلة للتجديد.",
      commercialScopeShort: "نظافة شاملة للمداخل والردهات والأدوار والمواقف والمرافق العامة، صيانة أنظمة التكييف المركزي (HVAC) والمصاعد والسلالم المتحركة والكاميرات ومنظومة الإطفاء، إدارة النفايات، طوارئ 24/7، تسديد فواتير المرافق. | متطلبات العرض: السعر لكل طابق أو وحدة تجارية، إجمالي شامل الضريبة، السجل التجاري، شهادات اعتماد، ومراجع لمشاريع تجارية مماثلة. لمدة سنة قابلة للتجديد.",
      commercialBadge: "تجاري",
      description: "الوصف",
      date: "تاريخ الإنشاء",
      submitOffer: "تقديم عرض",
      noRequests: "لا توجد طلبات متاحة",
      noResults: "لا توجد نتائج للبحث",
      loading: "جاري التحميل...",
      searchAndFilter: "البحث والفلترة",
      clearFilters: "إعادة تعيين",
      results: "نتيجة",
      completeProfile: "أكمل ملف شركتك أولاً",
      completeNow: "إكمال الآن",
    },
    en: {
      title: "Available Requests",
      subtitle: "Browse all available requests and submit your offers",
      search: "Search for a request...",
      filterCity: "Filter by City",
      all: "All",
      property: "Property",
      city: "City",
      scopeTitle: "Scope of Services Required",
      scopeShort: "Daily cleaning of common areas, rooftops, tanks, and waste removal; periodic maintenance of lighting, pumps, elevators, and cameras; pest control and landscaping as needed; 24/7 emergency support; utility bill payments; with clarification of working arrangements during holidays and national occasions. | Proposal Requirements: Full service breakdown with per-unit and total contract pricing inclusive of VAT, payment terms, commercial registration, accreditations, and client references or portfolio, for a one-year renewable contract.",
      commercialScopeShort: "Full cleaning of entrances, lobbies, floors, parking, and common areas; maintenance of central HVAC systems, elevators, escalators, cameras, and fire suppression systems; waste management; 24/7 emergencies; utility bill payments. | Proposal Requirements: Per-floor or per-commercial-unit pricing, total including VAT, commercial registration, accreditations, and references for similar commercial projects. One-year renewable.",
      commercialBadge: "Commercial",
      description: "Description",
      date: "Created Date",
      submitOffer: "Submit Offer",
      noRequests: "No requests available",
      noResults: "No results found",
      loading: "Loading...",
      searchAndFilter: "Search & Filter",
      clearFilters: "Clear Filters",
      results: "results",
      completeProfile: "Complete Your Company Profile First",
      completeNow: "Complete Now",
    },
  };

  const t = content[lang];

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

      if (!user) throw new Error("User not found");

      const { data: provider } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      return { user, provider };
    },
  });

  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/requests/all-available"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select(
          `
          *,
          properties (
            id,
            name,
            city,
            address,
            building_type
          )
        `,
        )
        .eq("status", "pending")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  const isProfileComplete =
    providerData?.provider?.company_name && providerData?.provider?.city;
  const isApproved = providerData?.provider?.approved;

  // Fetch which requests this provider already submitted an offer for
  const { data: myOffers } = useQuery({
    queryKey: ["/api/provider/submitted-offer-ids", providerData?.provider?.id],
    refetchOnMount: "always",
    queryFn: async () => {
      if (!providerData?.provider?.id) return [];
      const { data } = await supabase
        .from("provider_offers")
        .select("request_id")
        .eq("provider_id", providerData.provider.id);
      return data || [];
    },
    enabled: !!providerData?.provider?.id,
  });

  const submittedRequestIds = new Set(myOffers?.map((o: any) => o.request_id) || []);

  const filteredRequests = requests?.filter((request: any) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      request.properties?.name?.toLowerCase().includes(searchLower) ||
      request.properties?.city?.toLowerCase().includes(searchLower) ||
      request.description?.toLowerCase().includes(searchLower);

    const matchesCity =
      cityFilter === "all" || request.properties?.city === cityFilter;

    return matchesSearch && matchesCity;
  });

  const availableCities = Array.from(
    new Set(requests?.map((r: any) => r.properties?.city).filter(Boolean)),
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setCityFilter("all");
  };

  return (
    <div
      className="page-enter min-h-screen bg-[#F9F9FF] p-4 sm:p-6"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold">{t.title}</h1>
        <p className="text-muted-foreground mt-2">{t.subtitle}</p>
      </div>

      {/* تنبيه إكمال الملف الشخصي */}
      {!isProfileComplete && (
        <div className="flex items-start gap-4 rounded-xl border-l-4 border-orange-400 bg-orange-50/80 px-5 py-4">
          <AlertCircle className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">
              {t.completeProfile}
            </h3>
            <Button
              size="sm"
              onClick={() => setLocation("/dashboard/provider/profile")}
              className="bg-orange-600 hover:bg-orange-700 mt-2"
            >
              <Package className="h-4 w-4 me-2" />
              {t.completeNow}
            </Button>
          </div>
        </div>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t.searchAndFilter}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t.search}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="ps-9"
            />
          </div>

          {/* City pill chips */}
          {availableCities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setCityFilter("all")}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  cityFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-accent"
                }`}
              >
                {t.all}
              </button>
              {availableCities.map((city: string) => (
                <button
                  key={city}
                  onClick={() => setCityFilter(city)}
                  className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    cityFilter === city
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-accent"
                  }`}
                >
                  {city}
                </button>
              ))}
            </div>
          )}

          {(searchQuery || cityFilter !== "all") && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                {t.clearFilters}
              </Button>
              <span className="text-sm text-muted-foreground">
                {filteredRequests?.length || 0} {t.results}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Requests Grid */}
      {isLoading ? (
        <div className="space-y-4">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
        </div>
      ) : !filteredRequests || filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || cityFilter !== "all"
                  ? t.noResults
                  : t.noRequests}
              </h3>
              {(searchQuery || cityFilter !== "all") && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  className="mt-4"
                >
                  {t.clearFilters}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRequests.map((request: any) => (
            <Card
              key={request.id}
              className="hover:shadow-lg transition-all border-2 hover:border-primary"
            >
              <CardContent className="pt-6">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-lg">
                        {t.scopeTitle}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(request.created_at)}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-end">
                      <Badge variant="outline" className="gap-1">
                        <MapPin className="h-3 w-3" />
                        {request.properties?.city}
                      </Badge>
                      {request.properties?.building_type === 'commercial' && (
                        <Badge className="bg-amber-100 text-amber-700 border border-amber-200 text-xs">
                          {t.commercialBadge}
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Property Info */}
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {request.properties?.name}
                    </span>
                  </div>

                  {/* Scope of Services */}
                  <div>
                    <p className="text-sm line-clamp-3 text-muted-foreground">
                      {request.properties?.building_type === 'commercial' ? t.commercialScopeShort : t.scopeShort}
                    </p>
                  </div>

                  {/* Description */}
                  {request.description && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">
                        {t.description}:
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {request.description}
                      </p>
                    </div>
                  )}

                  {/* Action Button */}
                  {submittedRequestIds.has(request.id) ? (
                    <Button className="w-full bg-green-50 text-green-700 border border-green-200 hover:bg-green-50 cursor-default" variant="outline" disabled>
                      <CheckCircle2 className="h-4 w-4 me-2 text-green-600" />
                      {lang === "ar" ? "تم تقديم العرض" : "Offer Submitted"}
                    </Button>
                  ) : (
                    <Button
                      className="w-full"
                      onClick={() =>
                        setLocation(
                          `/dashboard/provider/requests/${request.id}/offer`,
                        )
                      }
                      disabled={!isProfileComplete || !isApproved}
                    >
                      <Send className="h-4 w-4 me-2" />
                      {t.submitOffer}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
