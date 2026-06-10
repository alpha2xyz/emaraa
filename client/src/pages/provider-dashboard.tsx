import { useState } from "react";
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
  Building2,
  Calendar,
  MapPin,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useLang } from "@/hooks/use-lang";
import { useAuthGuard } from "@/hooks/use-auth-guard";
import { openSignedPdf } from "../lib/storage";
import { StatusBadge } from "@/components/StatusBadge";
import { ProviderHeader } from "@/components/ProviderHeader";


// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

function StatCard({
  label,
  value,
  color,
  bg,
  icon: Icon,
}: {
  label: string;
  value: number;
  color: string;
  bg: string;
  icon: React.ElementType;
}) {
  return (
    <div
      className="bg-card rounded-xl border shadow-sm p-4"
      style={{ borderColor: "var(--border)", borderTop: `3px solid ${color}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-2xl font-bold" style={{ color }}>
            {value}
          </p>
          <p className="text-sm text-muted-foreground mt-0.5 leading-snug">{label}</p>
        </div>
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ background: bg }}
        >
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function ProviderDashboard() {
  useAuthGuard("provider");
  const { lang } = useLang();
  const [, setLocation] = useLocation();

  const userPhone = localStorage.getItem("userPhone") || "";

  const t = {
    ar: {
      available: "الطلبات المتاحة",
      myOffers: "عروضي",
      pending: "قيد المراجعة",
      accepted: "مقبول",
      completeProfile: "أكمل ملف شركتك أولاً",
      completeProfileDesc: "يجب إكمال معلومات الشركة قبل البدء في تقديم العروض",
      completeNow: "إكمال الآن",
      underReview: "طلبك قيد المراجعة",
      underReviewDesc: "سيتم إشعارك عند قبول حسابك من قِبل الإدارة",
      phoneDisclosure:
        "في حال قبول عرضك، سيتم مشاركة رقم جوالك المسجل في حسابك مع صاحب العقار للتواصل المباشر.",
      browseRequests: "تصفح الطلبات",
      updateProfile: "تحديث الملف",
      noOffers: "لم تقدم أي عروض بعد",
      noOffersHint: "ابدأ بتصفح الطلبات وتقديم عروضك",
      viewFile: "عرض الملف",
      overview: "نظرة عامة",
      offers: "عروضي",
      errorLoad: "حدث خطأ في تحميل البيانات",
      retry: "إعادة المحاولة",
      scopeLabel: "نطاق الخدمات المطلوبة",
    },
    en: {
      available: "Available Requests",
      myOffers: "My Offers",
      pending: "Pending Review",
      accepted: "Accepted",
      completeProfile: "Complete Your Company Profile First",
      completeProfileDesc: "You must complete company information before submitting offers",
      completeNow: "Complete Now",
      underReview: "Your registration is under review",
      underReviewDesc: "You will be notified once your account is approved by admin",
      phoneDisclosure:
        "If your offer is accepted, your registered phone number will be shared with the property owner for direct contact.",
      browseRequests: "Browse Requests",
      updateProfile: "Update Profile",
      noOffers: "You haven't submitted any offers yet",
      noOffersHint: "Browse available requests and start submitting",
      viewFile: "View File",
      overview: "Overview",
      offers: "My Offers",
      errorLoad: "Failed to load data",
      retry: "Retry",
      scopeLabel: "Scope of Services",
    },
  }[lang];

  // ── Stats query ──────────────────────────────────────────────────────────
  const {
    data,
    isLoading: statsLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["/api/provider/dashboard"],
    staleTime: 0,
    refetchOnMount: "always",
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
    retry: 1,
    retryDelay: 1000,
  });

  const providerData = data ? { user: data.user, provider: data.provider } : undefined;
  const availableRequests: any[] = data?.availableRequests || [];
  const myOffersStats: any[] = data?.myOffers || [];

  const companyName = providerData?.provider?.company_name || "";
  const isProfileComplete = !!providerData?.provider?.company_name;
  const isApproved = providerData?.provider?.approved;

  // ── Offers list query (Tab 2) ────────────────────────────────────────────
  const { data: offersList, isLoading: offersLoading } = useQuery({
    queryKey: ["/api/provider/all-offers"],
    refetchOnMount: "always",
    queryFn: async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) throw new Error("Not logged in");
      const res = await fetch("/api/provider/all-offers", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return [];
      return res.json();
    },
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString(lang === "ar" ? "ar-SA-u-nu-latn" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  // ── Loading / error ──────────────────────────────────────────────────────
  if (statsLoading) {
    return (
      <div className="p-4 space-y-4 max-w-2xl mx-auto">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-4">
        <p className="text-red-500 text-sm">{t.errorLoad}</p>
        <Button size="sm" variant="outline" onClick={() => refetch()}>
          <RefreshCw className="w-4 h-4 me-2" />
          {t.retry}
        </Button>
      </div>
    );
  }

  const isRTL = lang === "ar";

  return (
    <div
      className="page-enter min-h-screen"
      style={{ background: "var(--navy-2)" }}
      dir={isRTL ? "rtl" : "ltr"}
    >
      <ProviderHeader />

      <div className="max-w-2xl mx-auto px-4 py-5 space-y-5">

        {/* Profile incomplete banner */}
            {!isProfileComplete && (
              <div className="rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold text-foreground text-sm mb-1">{t.completeProfile}</p>
                    <p className="text-sm text-muted-foreground mb-3">{t.completeProfileDesc}</p>
                    <button
                      onClick={() => setLocation("/dashboard/provider/profile")}
                      className="text-xs font-bold rounded-lg px-4 py-2 text-white"
                      style={{ background: "#EA7C1A", color: "#1a0f04" }}
                    >
                      <Package className="inline w-3.5 h-3.5 me-1" />
                      {t.completeNow}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Approval pending banner */}
            {isProfileComplete && !isApproved && (
              <div className="rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-4">
                <div className="flex items-start gap-3">
                  <Clock className="h-6 w-6 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm">{t.underReview}</p>
                    <p className="text-sm text-muted-foreground mt-0.5">{t.underReviewDesc}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Stat cards */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard
                label={t.available}
                value={availableRequests.length}
                color="#1B7FDC"
                bg="var(--provider-soft)"
                icon={FileText}
              />
              <StatCard
                label={t.myOffers}
                value={myOffersStats.length}
                color="#0DB8D3"
                bg="var(--owner-soft)"
                icon={Send}
              />
              <StatCard
                label={t.pending}
                value={myOffersStats.filter((o: any) => o.status === "pending").length}
                color="#FBBF24"
                bg="var(--warn-soft)"
                icon={Clock}
              />
              <StatCard
                label={t.accepted}
                value={myOffersStats.filter((o: any) => o.status === "accepted").length}
                color="#34D399"
                bg="var(--ok-soft)"
                icon={CheckCircle2}
              />
            </div>

            {/* Phone disclosure */}
            {isProfileComplete && (
              <div
                className="rounded-xl border p-3"
                style={{ background: "var(--provider-soft)", borderColor: "rgba(27,127,220,0.3)" }}
              >
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-[#7bb6f0] flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs text-foreground">{t.phoneDisclosure}</p>
                    {userPhone && (
                      <div className="flex items-center gap-1 mt-1">
                        <Phone className="h-3 w-3 text-[#7bb6f0]" />
                        <span className="text-xs font-semibold text-[#7bb6f0]" dir="ltr">
                          {userPhone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

        {/* ── My Offers ── */}
        <div>
          <h2 className="text-sm font-bold mb-3 text-foreground">
            {isRTL ? "عروضي" : "My Offers"}
          </h2>
          {offersLoading && (
              <div className="space-y-3">
                {[1, 2].map((i) => (
                  <Skeleton key={i} className="h-28 rounded-xl" />
                ))}
              </div>
            )}

            {!offersLoading && (!offersList || offersList.length === 0) && (
              <div
                className="rounded-xl border p-8 text-center"
                style={{ background: "var(--card)", borderColor: "var(--border)" }}
              >
                <Send className="w-10 h-10 mx-auto mb-3" style={{ color: "var(--muted-foreground)" }} />
                <p className="font-semibold text-foreground">{t.noOffers}</p>
                <p className="text-sm text-muted-foreground mt-1 mb-4">{t.noOffersHint}</p>
                <button
                  onClick={() => setLocation("/dashboard/provider/requests")}
                  className="text-sm font-bold rounded-xl px-5 py-2 text-white"
                  style={{ background: "var(--provider)" }}
                >
                  {t.browseRequests}
                </button>
              </div>
            )}

            {!offersLoading && offersList && offersList.length > 0 && (
              <div className="space-y-3">
                {offersList.map((offer: any) => {
                  const prop = offer.requests?.properties;
                  const buildingType = prop?.building_type;
                  const typeColor = buildingType === "commercial" ? "#F0A87F" : "#E58AA0";
                  const typeBg = buildingType === "commercial" ? "var(--commercial-soft)" : "var(--residential-soft)";
                  const typeLabel =
                    buildingType === "commercial"
                      ? isRTL ? "تجاري" : "Commercial"
                      : isRTL ? "سكني" : "Residential";

                  return (
                    <div
                      key={offer.id}
                      className="bg-card rounded-xl border shadow-sm p-4 space-y-3"
                      style={{ borderColor: "var(--border)" }}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Building2
                            className="w-4 h-4 flex-shrink-0"
                            style={{ color: typeColor }}
                          />
                          <span className="font-bold text-foreground truncate">
                            {prop?.name || "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span
                            className="text-xs font-semibold rounded-full px-2 py-0.5"
                            style={{ background: typeBg, color: typeColor }}
                          >
                            {typeLabel}
                          </span>
                          <StatusBadge status={offer.status} lang={lang} />
                        </div>
                      </div>

                      {/* Location */}
                      {prop?.city && (
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{prop.city}</span>
                        </div>
                      )}

                      {/* Date */}
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>{formatDate(offer.created_at)}</span>
                      </div>

                      {/* Notes */}
                      {offer.notes && (
                        <p className="text-sm text-muted-foreground bg-white/5 rounded-lg p-2">
                          {offer.notes}
                        </p>
                      )}

                      {/* View PDF */}
                      {offer.offer_file_url && (
                        <button
                          onClick={() =>
                            openSignedPdf("provider-offers", offer.offer_file_url)
                          }
                          className="flex items-center gap-1.5 text-xs font-semibold rounded-lg px-3 py-2 border"
                          style={{ borderColor: "var(--border)", color: "var(--provider)" }}
                        >
                          <FileText className="w-3.5 h-3.5" />
                          {t.viewFile}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
        </div>

      </div>
    </div>
  );
}
