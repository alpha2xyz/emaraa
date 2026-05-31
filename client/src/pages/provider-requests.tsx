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
  MapPin,
  Calendar,
  Package,
  CheckCircle2,
  ExternalLink,
  Lock,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLang } from "@/hooks/use-lang";
import { ProviderHeader } from "@/components/ProviderHeader";

// ---------------------------------------------------------------------------
// Unified SOW — same text for both building types (LOCKED — do not change)
// ---------------------------------------------------------------------------

const UNIFIED_SCOPE_PART1 =
  "نظافة دورية للمناطق المشتركة والمداخل والأسطح والخزانات وإدارة النفايات، صيانة شاملة للإنارة والمضخات والتكييف المركزي (HVAC) والمصاعد والسلالم المتحركة والكاميرات ومنظومة الإطفاء، رش مبيدات وبستنة عند الحاجة، طوارئ على مدار الساعة، تسديد فواتير المرافق، مع توضيح آلية العمل في الإجازات والمناسبات الوطنية.";

const UNIFIED_SCOPE_PART2 =
  "متطلبات العرض: تفصيل الخدمات والسعر لكل وحدة وإجمالي العقد شاملاً الضريبة وشروط الدفع، لمدة سنة قابلة للتجديد.";

export default function ProviderRequests() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const content = {
    ar: {
      title: "الطلبات المتاحة",
      subtitle: "تصفح جميع الطلبات المتاحة وقدم عروضك",
      search: "بحث عن طلب...",
      all: "الكل",
      units: "وحدة",
      viewMap: "عرض الموقع على الخريطة",
      commercialBadge: "تجاري",
      residentialBadge: "سكني",
      ownerNotes: "ملاحظات المالك:",
      submitOffer: "تقديم عرض",
      offerSubmitted: "تم تقديم العرض",
      noRequests: "لا توجد طلبات متاحة",
      noResults: "لا توجد نتائج للبحث",
      searchAndFilter: "البحث والفلترة",
      clearFilters: "إعادة تعيين",
      results: "نتيجة",
      completeNow: "إكمال الآن",
      filterByType: "النوع",
      teaserBanner: "أكمل ملفك الشخصي للاطلاع على تفاصيل الطلبات وتقديم عروضك",
      teaserRequestsAvailable: "طلبات متاحة",
      scopeShort:
        "Daily cleaning of common areas, rooftops, tanks, and waste removal; comprehensive maintenance of lighting, pumps, central HVAC, elevators, escalators, cameras, and fire suppression systems; pest control and landscaping as needed; 24/7 emergency support; utility bill payments; with clarification of working arrangements during holidays and national occasions.",
    },
    en: {
      title: "Available Requests",
      subtitle: "Browse all available requests and submit your offers",
      search: "Search for a request...",
      all: "All",
      units: "units",
      viewMap: "View on Map",
      commercialBadge: "Commercial",
      residentialBadge: "Residential",
      ownerNotes: "Owner Notes:",
      submitOffer: "Submit Offer",
      offerSubmitted: "Offer Submitted",
      noRequests: "No requests available",
      noResults: "No results found",
      searchAndFilter: "Search & Filter",
      clearFilters: "Clear Filters",
      results: "results",
      completeNow: "Complete Now",
      filterByType: "Type",
      teaserBanner: "Complete your profile to view request details and submit offers",
      teaserRequestsAvailable: "requests available",
      scopeShort:
        "Daily cleaning of common areas, rooftops, tanks, and waste removal; comprehensive maintenance of lighting, pumps, central HVAC, elevators, escalators, cameras, and fire suppression systems; pest control and landscaping as needed; 24/7 emergency support; utility bill payments; with clarification of working arrangements during holidays and national occasions.",
    },
  };

  const t = content[lang];

  // ── Server API queries (supabaseAdmin — bypasses RLS) ────────────────────

  const { data: dashData } = useQuery({
    queryKey: ["/api/provider/dashboard"],
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) return null;
      const res = await fetch("/api/provider/dashboard", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      return res.json();
    },
  });

  const { data: requestsData, isLoading } = useQuery({
    queryKey: ["/api/provider/requests"],
    staleTime: 0,
    refetchOnMount: "always",
    queryFn: async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) return { requests: [], submittedRequestIds: [] };
      const res = await fetch("/api/provider/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { requests: [], submittedRequestIds: [] };
      return res.json();
    },
  });

  const requests = requestsData?.requests || [];
  const isProfileComplete = !!dashData?.provider?.company_name;
  const isApproved = !!dashData?.provider?.approved;
  const submittedRequestIds = new Set<string>(requestsData?.submittedRequestIds || []);

  // ── Filtering ──────────────────────────────────────────────────────────────

  const filteredRequests = requests?.filter((request: any) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      request.properties?.name?.toLowerCase().includes(searchLower) ||
      request.properties?.city?.toLowerCase().includes(searchLower) ||
      request.description?.toLowerCase().includes(searchLower);
    const matchesType =
      typeFilter === "all" || request.properties?.building_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const hasActiveFilters = searchQuery || typeFilter !== "all";

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
    setTypeFilter("all");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div
      className="page-enter min-h-screen bg-[#F9F9FF]"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <ProviderHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Incomplete profile banner ── */}
        {!isProfileComplete && (
          <div className="flex items-start gap-4 rounded-xl border-s-4 border-orange-400 bg-orange-50/80 px-5 py-4">
            <Lock className="h-6 w-6 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-1">{t.teaserBanner}</h3>
              <Button
                size="sm"
                onClick={() => setLocation("/dashboard/provider/profile")}
                className="mt-2"
                style={{ background: "#C2410C" }}
              >
                <Package className="h-4 w-4 me-2" />
                {t.completeNow}
              </Button>
            </div>
          </div>
        )}

        {/* ── Search & Filter card ── */}
        <Card className="rounded-xl shadow-sm" style={{ borderColor: "#DDE4EE" }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Filter className="h-4 w-4" />
              {t.searchAndFilter}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search
                className="absolute top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
                style={{ [lang === "ar" ? "right" : "left"]: "0.75rem" }}
              />
              <Input
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={lang === "ar" ? "pr-9" : "pl-9"}
              />
            </div>

            {/* Building type filter pills */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">{t.filterByType}</p>
              <div className="flex flex-wrap gap-2">
                {(["all", "residential", "commercial"] as const).map((type) => {
                  const label =
                    type === "all"
                      ? t.all
                      : type === "residential"
                        ? t.residentialBadge
                        : t.commercialBadge;
                  const activeStyle =
                    type === "commercial"
                      ? { background: "#C4694A", color: "white" }
                      : type === "residential"
                        ? { background: "#7D3040", color: "white" }
                        : { background: "#2E4A6B", color: "white" };
                  return (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                      style={
                        typeFilter === type
                          ? activeStyle
                          : { background: "#F3F4F6", color: "#6B7280" }
                      }
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  {t.clearFilters}
                </Button>
                <span className="text-sm text-gray-500">
                  {filteredRequests?.length || 0} {t.results}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Loading skeletons ── */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-64 rounded-xl" />
            ))}
          </div>
        ) : !filteredRequests || filteredRequests.length === 0 ? (
          /* ── Empty state ── */
          <Card className="rounded-xl" style={{ borderColor: "#DDE4EE" }}>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-gray-700">
                  {hasActiveFilters ? t.noResults : t.noRequests}
                </h3>
                {hasActiveFilters && (
                  <Button variant="outline" onClick={clearFilters} className="mt-4">
                    {t.clearFilters}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ) : !isProfileComplete ? (
          /* ── Teaser / blurred cards (incomplete profile) ── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequests.map((request: any) => {
              const isCommercial = request.properties?.building_type === "commercial";
              const typeColor = isCommercial ? "#C4694A" : "#7D3040";
              const typeBg = isCommercial ? "#FDF3EF" : "#FDF0F2";
              const typeBorder = isCommercial ? "#EDB99F" : "#F0C5CF";
              const typeLabel = isCommercial ? t.commercialBadge : t.residentialBadge;

              return (
                <Card
                  key={request.id}
                  className="rounded-xl shadow-sm opacity-90"
                  style={{ borderColor: "#DDE4EE" }}
                >
                  <CardContent className="pt-5 pb-5 px-5">
                    <div className="space-y-4">
                      {/* Top row */}
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1.5">
                          <Badge
                            className="text-xs w-fit font-semibold"
                            style={{
                              background: typeBg,
                              color: typeColor,
                              border: `1px solid ${typeBorder}`,
                            }}
                          >
                            {typeLabel}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span>{request.properties?.city}</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded-full px-2 py-1">
                          1 {t.teaserRequestsAvailable}
                        </span>
                      </div>

                      {/* Property name — blurred */}
                      <div className="flex items-center gap-2 select-none">
                        <Building2
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: typeColor }}
                        />
                        <span className="font-bold text-gray-900 blur-sm">
                          ████████████
                        </span>
                      </div>

                      {/* SOW — blurred */}
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3 blur-sm select-none">
                        ████████ ████ ████████ ████████ ████ ██████ ████████ ████ ████████
                      </p>

                      {/* Lock CTA */}
                      <Button
                        className="w-full text-white text-sm font-semibold"
                        style={{ background: "#C2410C" }}
                        onClick={() => setLocation("/dashboard/provider/profile")}
                      >
                        <Lock className="h-4 w-4 me-2" />
                        {t.completeNow}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* ── Full request cards (profile complete) ── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequests.map((request: any) => {
              const isCommercial = request.properties?.building_type === "commercial";
              const typeColor = isCommercial ? "#C4694A" : "#7D3040";
              const typeBg = isCommercial ? "#FDF3EF" : "#FDF0F2";
              const typeBorder = isCommercial ? "#EDB99F" : "#F0C5CF";
              const typeLabel = isCommercial ? t.commercialBadge : t.residentialBadge;
              const hasSubmitted = submittedRequestIds.has(request.id);

              return (
                <Card
                  key={request.id}
                  className="rounded-xl shadow-sm hover:shadow-md transition-shadow"
                  style={{ borderColor: "#DDE4EE" }}
                >
                  <CardContent className="pt-5 pb-5 px-5">
                    <div className="space-y-4">
                      {/* ── Top row: type tag + city + date ── */}
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col gap-1.5">
                          <Badge
                            className="text-xs w-fit font-semibold"
                            style={{
                              background: typeBg,
                              color: typeColor,
                              border: `1px solid ${typeBorder}`,
                            }}
                          >
                            {typeLabel}
                          </Badge>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span>
                              {request.properties?.city}
                              {request.properties?.address
                                ? ` · ${request.properties.address}`
                                : ""}
                              {request.properties?.units_count
                                ? ` · ${request.properties.units_count} ${t.units}`
                                : ""}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-gray-400">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(request.created_at)}</span>
                        </div>
                      </div>

                      {/* ── Property name ── */}
                      <div className="flex items-center gap-2">
                        <Building2
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: typeColor }}
                        />
                        <span className="font-bold text-gray-900">
                          {request.properties?.name}
                        </span>
                      </div>

                      {/* ── Unified SOW excerpt (same for both types) ── */}
                      <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                        {lang === "ar"
                          ? UNIFIED_SCOPE_PART1
                          : t.scopeShort}
                      </p>

                      {/* ── Owner notes ── */}
                      {request.description && (
                        <div
                          className="rounded-lg px-3 py-2.5 text-xs text-gray-600 leading-relaxed"
                          style={{ background: "#F9F9FF", border: "1px solid #DDE4EE" }}
                        >
                          <span className="font-semibold text-gray-700 block mb-1">
                            {t.ownerNotes}
                          </span>
                          {request.description}
                        </div>
                      )}

                      {/* ── Map button ── */}
                      {request.properties?.map_url && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full text-xs"
                          onClick={() =>
                            window.open(request.properties.map_url, "_blank")
                          }
                        >
                          <ExternalLink className="h-3 w-3 me-1" />
                          {t.viewMap}
                        </Button>
                      )}

                      {/* ── Submit / submitted button ── */}
                      {hasSubmitted ? (
                        <Button
                          className="w-full text-sm font-semibold"
                          style={{
                            background: "#E8F5F2",
                            color: "#0E7C66",
                            border: "1px solid #A8D8CF",
                          }}
                          variant="outline"
                          disabled
                        >
                          <CheckCircle2 className="h-4 w-4 me-2" style={{ color: "#0E7C66" }} />
                          {t.offerSubmitted}
                        </Button>
                      ) : (
                        <Button
                          className="w-full text-sm font-semibold text-white"
                          style={{ background: "#0E7C66" }}
                          onClick={() =>
                            setLocation(
                              `/dashboard/provider/requests/${request.id}/offer`
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
