import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
  Clock,
  BadgePercent,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useLang } from "@/hooks/use-lang";
import { scopePart1 } from "@shared/scope-of-work";
import { useToast } from "@/hooks/use-toast";
import { formatContractDate } from "@/components/ContractStartDatePicker";
import { ProviderHeader } from "@/components/ProviderHeader";

// ---------------------------------------------------------------------------
// Scope of work lives in shared/scope-of-work.ts and varies by building type.


export default function ProviderRequests() {
  const { lang } = useLang();
  const { toast } = useToast();
  const queryClient = useQueryClient();
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
      declineBtn: "لم أقدّم عرضاً",
      declineTitle: "ليش ما قدّمت عرضاً على هذا الطلب؟",
      declineHint: "جوابك يساعدنا نحسّن الطلبات القادمة، ولا يظهر لمالك العقار.",
      reasonScopeUnclear: "نطاق الخدمة غير واضح",
      reasonOutOfArea: "خارج نطاق تغطيتي",
      reasonTooSmall: "حجم المبنى صغير على خدماتنا",
      reasonOther: "سبب آخر",
      declineNotePlaceholder: "اكتب السبب باختصار (اختياري)",
      declineSubmit: "إرسال",
      declineCancel: "إلغاء",
      declineSaved: "شكراً، سجّلنا ملاحظتك",
      declineFailed: "تعذّر حفظ السبب، حاول مرة أخرى",
      declinedBadge: "تم تخطي هذا الطلب",
      undoDecline: "تراجع",
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
      pendingBanner: "ملفك قيد المراجعة — ستتمكن من الاطلاع على تفاصيل الطلبات وتقديم عروضك بعد موافقة الإدارة",
      pendingBtn: "بانتظار موافقة الإدارة",
      sqm: "م²",
      teaserRequestsAvailable: "طلبات متاحة",
      commissionTitle: "عمولة عِمارة 1% فقط",
      commissionBody:
        "يلتزم مقدم الخدمة بسداد عمولة منصة عِمارة البالغة 1% فقط من قيمة العرض بعد توقيع العقد مع المالك. عِمارة سترسل بيانات التحويل آلياً عبر البريد الإلكتروني بعد قبول المالك للعرض بفترة قصيرة.",
      scopeShort:
        "Daily cleaning of common areas, rooftops, tanks, and waste removal; comprehensive maintenance of lighting, pumps, central HVAC, elevators, escalators, cameras, and fire suppression systems; pest control and landscaping as needed; 24/7 emergency support; utility bill payments; with clarification of working arrangements during holidays and national occasions.",
    },
    en: {
      title: "Available Requests",
      subtitle: "Browse all available requests and submit your offers",
      search: "Search for a request...",
      all: "All",
      units: "units",
      declineBtn: "I did not bid",
      declineTitle: "Why did you pass on this request?",
      declineHint: "Your answer helps us improve future requests. The owner never sees it.",
      reasonScopeUnclear: "Scope of work is unclear",
      reasonOutOfArea: "Outside my coverage area",
      reasonTooSmall: "Building is too small for our services",
      reasonOther: "Another reason",
      declineNotePlaceholder: "Briefly, what was it? (optional)",
      declineSubmit: "Send",
      declineCancel: "Cancel",
      declineSaved: "Thanks, we logged that",
      declineFailed: "Could not save the reason, please try again",
      declinedBadge: "You passed on this request",
      undoDecline: "Undo",
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
      pendingBanner: "Your profile is under review — you'll see request details and submit offers once the admin approves you",
      pendingBtn: "Awaiting admin approval",
      sqm: "m²",
      teaserRequestsAvailable: "requests available",
      commissionTitle: "Just 1% Emaraa Commission",
      commissionBody:
        "The service provider agrees to pay Emaraa's commission of just 1% of the offer value after signing the contract with the owner. Emaraa will automatically email you the transfer details a short while after the owner accepts the offer.",
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
      if (!token) return { requests: [], submittedRequestIds: [], declinedRequestIds: [] };
      const res = await fetch("/api/provider/requests", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { requests: [], submittedRequestIds: [], declinedRequestIds: [] };
      return res.json();
    },
  });

  const requests = requestsData?.requests || [];
  const isProfileComplete = !!dashData?.provider?.company_name;
  const isApproved = !!dashData?.provider?.approved;
  const submittedRequestIds = new Set<string>(requestsData?.submittedRequestIds || []);
  const declinedRequestIds = new Set<string>(requestsData?.declinedRequestIds || []);

  // ── Decline capture (master plan v1006 item #26) ──────────────────────────
  // Three of four approved providers have never submitted an offer. Until now the
  // product had no way for them to say why, so "no offers" and "never looked" were
  // the same signal. A pass with a reason separates them.
  const [declineFor, setDeclineFor] = useState<string | null>(null);
  const [declineReason, setDeclineReason] = useState<string>("scope_unclear");
  const [declineNote, setDeclineNote] = useState("");

  const declineMutation = useMutation({
    mutationFn: async ({ requestId, reason, note }: { requestId: string; reason: string; note: string }) => {
      const token = localStorage.getItem("sessionToken");
      const res = await fetch(`/api/provider/requests/${requestId}/decline`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason, note: note || null }),
      });
      if (!res.ok) throw new Error("decline_failed");
      return res.json();
    },
    onSuccess: () => {
      toast({ title: t.declineSaved });
      setDeclineFor(null);
      setDeclineNote("");
      setDeclineReason("scope_unclear");
      queryClient.invalidateQueries({ queryKey: ["/api/provider/requests"] });
    },
    onError: () => toast({ title: t.declineFailed, variant: "destructive" }),
  });

  const undoDeclineMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const token = localStorage.getItem("sessionToken");
      const res = await fetch(`/api/provider/requests/${requestId}/decline`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("undo_failed");
      return res.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["/api/provider/requests"] }),
    onError: () => toast({ title: t.declineFailed, variant: "destructive" }),
  });

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
    return date.toLocaleDateString(lang === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
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
      className="page-enter min-h-screen"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <ProviderHeader />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Incomplete profile banner ── */}
        {!isProfileComplete && (
          <div className="flex items-start gap-4 rounded-xl border-s-4 border-orange-500/40 bg-orange-500/10 px-5 py-4">
            <Lock className="h-6 w-6 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">{t.teaserBanner}</h3>
              <Button
                size="sm"
                onClick={() => setLocation("/dashboard/provider/profile")}
                className="mt-2"
                style={{ background: "#EA7C1A", color: "#1a0f04" }}
              >
                <Package className="h-4 w-4 me-2" />
                {t.completeNow}
              </Button>
            </div>
          </div>
        )}

        {/* ── Awaiting admin approval banner ── */}
        {isProfileComplete && !isApproved && (
          <div className="flex items-start gap-4 rounded-xl border-s-4 border-orange-500/40 bg-orange-500/10 px-5 py-4">
            <Clock className="h-6 w-6 text-orange-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-foreground">{t.pendingBanner}</h3>
            </div>
          </div>
        )}

        {/* ── Search & Filter card ── */}
        <Card className="rounded-xl shadow-sm bg-card" style={{ borderColor: "var(--border)" }}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Filter className="h-4 w-4" />
              {t.searchAndFilter}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search
                className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              />
              <Input
                placeholder={t.search}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ps-9"
              />
            </div>

            {/* Building type filter pills */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 font-medium">{t.filterByType}</p>
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
                      ? { background: "var(--commercial)", color: "white" }
                      : type === "residential"
                        ? { background: "var(--residential)", color: "white" }
                        : { background: "var(--provider)", color: "white" };
                  return (
                    <button
                      key={type}
                      onClick={() => setTypeFilter(type)}
                      className="px-4 py-1.5 rounded-full text-sm font-medium transition-colors"
                      style={
                        typeFilter === type
                          ? activeStyle
                          : { background: "rgba(255,255,255,0.06)", color: "var(--muted-foreground)" }
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
                <span className="text-sm text-muted-foreground">
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
          <Card className="rounded-xl bg-card" style={{ borderColor: "var(--border)" }}>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-foreground">
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
        ) : !isProfileComplete || !isApproved ? (
          /* ── Teaser / blurred cards (incomplete profile OR not yet approved) ── */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredRequests.map((request: any) => {
              const isCommercial = request.properties?.building_type === "commercial";
              const typeColor = isCommercial ? "#F0A87F" : "#E58AA0";
              const typeBg = isCommercial ? "var(--commercial-soft)" : "var(--residential-soft)";
              const typeBorder = isCommercial ? "rgba(224,138,91,0.4)" : "rgba(199,91,114,0.4)";
              const typeLabel = isCommercial ? t.commercialBadge : t.residentialBadge;

              return (
                <Card
                  key={request.id}
                  className="rounded-xl shadow-sm opacity-90 bg-card"
                  style={{ borderColor: "var(--border)" }}
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
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span>{request.properties?.city}</span>
                          </div>
                        </div>
                        <span className="text-xs font-semibold text-orange-300 bg-orange-500/15 border border-orange-500/30 rounded-full px-2 py-1">
                          1 {t.teaserRequestsAvailable}
                        </span>
                      </div>

                      {/* Property name — blurred */}
                      <div className="flex items-center gap-2 select-none">
                        <Building2
                          className="h-4 w-4 flex-shrink-0"
                          style={{ color: typeColor }}
                        />
                        <span className="font-bold text-foreground blur-sm">
                          ████████████
                        </span>
                      </div>

                      {/* SOW — blurred */}
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 blur-sm select-none">
                        ████████ ████ ████████ ████████ ████ ██████ ████████ ████ ████████
                      </p>

                      {/* Lock CTA — complete profile, or wait for admin approval */}
                      {!isProfileComplete ? (
                        <Button
                          className="w-full text-sm font-semibold"
                          style={{ background: "#EA7C1A", color: "#1a0f04" }}
                          onClick={() => setLocation("/dashboard/provider/profile")}
                        >
                          <Lock className="h-4 w-4 me-2" />
                          {t.completeNow}
                        </Button>
                      ) : (
                        <Button
                          className="w-full text-sm font-semibold"
                          variant="outline"
                          disabled
                          style={{
                            background: "rgba(234,124,26,0.12)",
                            color: "#EA7C1A",
                            border: "1px solid rgba(234,124,26,0.4)",
                          }}
                        >
                          <Clock className="h-4 w-4 me-2" />
                          {t.pendingBtn}
                        </Button>
                      )}
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
              const typeColor = isCommercial ? "#F0A87F" : "#E58AA0";
              const typeBg = isCommercial ? "var(--commercial-soft)" : "var(--residential-soft)";
              const typeBorder = isCommercial ? "rgba(224,138,91,0.4)" : "rgba(199,91,114,0.4)";
              const typeLabel = isCommercial ? t.commercialBadge : t.residentialBadge;
              const hasSubmitted = submittedRequestIds.has(request.id);

              return (
                <Card
                  key={request.id}
                  className="rounded-xl shadow-sm hover:shadow-md transition-shadow bg-card"
                  style={{ borderColor: "var(--border)" }}
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
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3 flex-shrink-0" />
                            <span>
                              {request.properties?.city}
                              {request.properties?.address
                                ? ` · ${request.properties.address}`
                                : ""}
                              {request.properties?.units_count
                                ? ` · ${request.properties.units_count} ${isCommercial ? t.sqm : t.units}`
                                : ""}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
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
                        <span className="font-bold text-foreground">
                          {request.properties?.name}
                        </span>
                      </div>

                      {/* ── Unified SOW excerpt (same for both types) ── */}
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {lang === "ar"
                          ? scopePart1(request.properties?.building_type, lang)
                          : t.scopeShort}
                      </p>

                      {/* ── Owner notes ── */}
                      {request.description && (
                        <div
                          className="rounded-lg px-3 py-2.5 text-xs text-muted-foreground leading-relaxed bg-white/5"
                          style={{ border: "1px solid var(--border)" }}
                        >
                          <span className="font-semibold text-foreground block mb-1">
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

                      {request.contract_start_date && (
                        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                          <span>
                            {lang === "ar" ? "بداية العقد: " : "Starts: "}
                            <span className="text-foreground">
                              {formatContractDate(request.contract_start_date, lang)}
                            </span>
                          </span>
                        </div>
                      )}

                      {/* ── Submit / submitted button ── */}
                      {hasSubmitted ? (
                        <Button
                          className="w-full text-sm font-semibold"
                          style={{
                            background: "var(--provider-soft)",
                            color: "var(--provider)",
                            border: "1px solid rgba(27,127,220,0.4)",
                          }}
                          variant="outline"
                          disabled
                        >
                          <CheckCircle2 className="h-4 w-4 me-2" style={{ color: "var(--provider)" }} />
                          {t.offerSubmitted}
                        </Button>
                      ) : declinedRequestIds.has(request.id) ? (
                        <div className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2" style={{ borderColor: "var(--border)", background: "rgba(255,255,255,0.03)" }}>
                          <span className="text-xs text-muted-foreground">{t.declinedBadge}</span>
                          <button
                            type="button"
                            onClick={() => undoDeclineMutation.mutate(request.id)}
                            disabled={undoDeclineMutation.isPending}
                            className="text-xs font-semibold hover:underline"
                            style={{ color: "var(--provider)" }}
                          >
                            {t.undoDecline}
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Button
                            className="w-full text-sm font-semibold text-white"
                            style={{ background: "var(--provider)" }}
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
                          {/* The whole point of this button is that passing silently
                              and passing for a reason look identical in the data
                              otherwise. Kept quiet so it never competes with the
                              primary action. */}
                          <button
                            type="button"
                            onClick={() => setDeclineFor(request.id)}
                            disabled={!isProfileComplete || !isApproved}
                            className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {t.declineBtn}
                          </button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── 1% commission notice (approved providers only) ── */}
        {isProfileComplete && isApproved && (
          <div
            className="flex items-start gap-4 rounded-xl px-5 py-4"
            style={{
              background: "var(--provider-soft)",
              border: "1px solid rgba(27,127,220,0.4)",
            }}
          >
            <div
              className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
              style={{ background: "var(--provider)" }}
            >
              <BadgePercent className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1" style={{ color: "var(--provider)" }}>
                {t.commissionTitle}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{t.commissionBody}</p>
            </div>
          </div>
        )}
      </div>

      {/* ── Decline reason dialog ── */}
      {declineFor && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={t.declineTitle}
          onClick={() => setDeclineFor(null)}
        >
          <div
            className="w-full max-w-md rounded-t-2xl border bg-card p-5 sm:rounded-2xl"
            style={{ borderColor: "var(--border)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-bold text-foreground">{t.declineTitle}</h3>
            <p className="mt-1 text-xs text-muted-foreground">{t.declineHint}</p>

            <div className="mt-4 space-y-2">
              {[
                { value: "scope_unclear", label: t.reasonScopeUnclear },
                { value: "out_of_area", label: t.reasonOutOfArea },
                { value: "too_small", label: t.reasonTooSmall },
                { value: "other", label: t.reasonOther },
              ].map((opt) => (
                <label
                  key={opt.value}
                  className="flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition-colors"
                  style={{
                    borderColor: declineReason === opt.value ? "var(--provider)" : "var(--border)",
                    background:
                      declineReason === opt.value ? "var(--provider-soft)" : "transparent",
                  }}
                >
                  <input
                    type="radio"
                    name="declineReason"
                    value={opt.value}
                    checked={declineReason === opt.value}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    className="h-4 w-4 flex-shrink-0 accent-[#1B7FDC]"
                  />
                  <span className="text-foreground">{opt.label}</span>
                </label>
              ))}
            </div>

            <Input
              value={declineNote}
              onChange={(e) => setDeclineNote(e.target.value)}
              placeholder={t.declineNotePlaceholder}
              maxLength={500}
              className="mt-3"
            />

            <div className="mt-4 flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeclineFor(null)}
                disabled={declineMutation.isPending}
              >
                {t.declineCancel}
              </Button>
              <Button
                className="flex-1 text-white"
                style={{ background: "var(--provider)" }}
                disabled={declineMutation.isPending}
                onClick={() =>
                  declineMutation.mutate({
                    requestId: declineFor,
                    reason: declineReason,
                    note: declineNote,
                  })
                }
              >
                {t.declineSubmit}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
