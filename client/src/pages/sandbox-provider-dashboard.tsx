import { useState } from "react";
import {
  FileText,
  Clock,
  CheckCircle2,
  Send,
  Building2,
  MapPin,
  Calendar,
  User,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const MOCK_STATS = {
  availableRequests: 12,
  myOffers: 3,
  pendingReview: 2,
  accepted: 1,
};

const MOCK_OFFERS = [
  {
    id: "1",
    propertyName: "برج الياسمين",
    buildingType: "residential" as const,
    location: "الرياض · الملقا",
    amount: "45,000 ريال / سنة",
    status: "accepted" as const,
    submittedAt: "قُدِّم في ١٥ مايو ٢٠٢٦",
  },
  {
    id: "2",
    propertyName: "مجمع الأعمال المركزي",
    buildingType: "commercial" as const,
    location: "الرياض · العليا",
    amount: "62,000 ريال / سنة",
    status: "pending" as const,
    submittedAt: "قُدِّم في ٢٠ مايو ٢٠٢٦",
  },
  {
    id: "3",
    propertyName: "فيلا المروج",
    buildingType: "residential" as const,
    location: "الرياض · المروج",
    amount: "28,000 ريال / سنة",
    status: "rejected" as const,
    submittedAt: "قُدِّم في ٨ مايو ٢٠٢٦",
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Tab = "overview" | "offers";
type OfferStatus = "accepted" | "pending" | "rejected";
type BuildingType = "residential" | "commercial";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getStatusBadgeStyle(status: OfferStatus): React.CSSProperties {
  switch (status) {
    case "accepted":
      return { background: "#FDF0F2", color: "#7D3040" };
    case "pending":
      return { background: "#FDF3EF", color: "#C4694A" };
    case "rejected":
      return { background: "#F3F4F6", color: "#6B7280" };
  }
}

function getStatusLabel(status: OfferStatus): string {
  switch (status) {
    case "accepted":
      return "مقبول";
    case "pending":
      return "قيد المراجعة";
    case "rejected":
      return "مرفوض";
  }
}

function getBuildingTypeStyle(type: BuildingType): { color: string; bg: string; label: string } {
  if (type === "commercial") {
    return { color: "#C4694A", bg: "#FDF3EF", label: "تجاري" };
  }
  return { color: "#7D3040", bg: "#FDF0F2", label: "سكني" };
}

// ---------------------------------------------------------------------------
// Stat card
// ---------------------------------------------------------------------------

interface StatCardProps {
  label: string;
  count: number;
  color: string;
  bg: string;
  icon: React.ElementType;
}

function StatCard({ label, count, color, bg, icon: Icon }: StatCardProps) {
  return (
    <div
      className="bg-white rounded-xl border shadow-sm p-4"
      style={{ borderColor: "#DDE4EE", borderTop: `3px solid ${color}` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-2xl font-bold" style={{ color }}>
            {count}
          </p>
          <p className="text-sm text-gray-600 mt-0.5 leading-snug">{label}</p>
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
// Offer card
// ---------------------------------------------------------------------------

interface OfferCardProps {
  offer: (typeof MOCK_OFFERS)[number];
}

function OfferCard({ offer }: OfferCardProps) {
  const typeStyle = getBuildingTypeStyle(offer.buildingType);
  const statusStyle = getStatusBadgeStyle(offer.status);
  const statusLabel = getStatusLabel(offer.status);

  return (
    <div
      className="bg-white rounded-xl border shadow-sm p-4 space-y-3"
      style={{ borderColor: "#DDE4EE" }}
    >
      {/* Top row: property name + type tag */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <Building2 className="w-4 h-4 flex-shrink-0" style={{ color: typeStyle.color }} />
          <span className="font-bold text-gray-900 text-base">{offer.propertyName}</span>
        </div>
        <span
          className="text-xs font-semibold rounded-full px-2 py-0.5 flex-shrink-0"
          style={{ background: typeStyle.bg, color: typeStyle.color }}
        >
          {typeStyle.label}
        </span>
      </div>

      {/* Location */}
      <div className="flex items-center gap-1.5 text-sm text-gray-500">
        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{offer.location}</span>
      </div>

      {/* Amount */}
      <div className="flex items-center justify-between">
        <span className="text-base font-bold text-gray-900">{offer.amount}</span>
        <span
          className="text-xs font-bold rounded-full px-3 py-1"
          style={statusStyle}
        >
          {statusLabel}
        </span>
      </div>

      {/* Submitted date */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400 pt-1 border-t" style={{ borderColor: "#EEF2F7" }}>
        <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
        <span>{offer.submittedAt}</span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function SandboxProviderDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  return (
    <div className="min-h-screen" style={{ background: "#F9F9FF" }} dir="rtl">

      {/* ── Sandbox badge ── */}
      <div className="bg-red-500 text-white text-xs font-bold py-1 text-center tracking-wider">
        معاينة تجريبية — SANDBOX PREVIEW
      </div>

      {/* ── Emerald gradient header ── */}
      <div
        className="px-5 py-4 text-white"
        style={{ background: "linear-gradient(135deg, #0E7C66, #0a5e4e)" }}
      >
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          {/* Right: wordmark + role label */}
          <div>
            <p className="font-bold text-lg leading-none">عِمارة</p>
            <p className="text-xs mt-1" style={{ opacity: 0.8 }}>
              مزود خدمات
            </p>
          </div>

          {/* Left: company name + role chip */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">شركة النظافة المتكاملة</span>
            <span
              className="text-xs font-semibold rounded-full px-2 py-0.5"
              style={{ background: "white", color: "#0E7C66" }}
            >
              مزود
            </span>
          </div>
        </div>
      </div>

      {/* ── Tab bar ── */}
      <div style={{ background: "#0a5e4e" }}>
        <div className="max-w-2xl mx-auto flex">
          <button
            onClick={() => setActiveTab("overview")}
            className="flex-1 py-3 text-sm font-semibold transition-colors"
            style={
              activeTab === "overview"
                ? { background: "white", color: "#0E7C66", borderRadius: "0" }
                : { background: "transparent", color: "white", opacity: 0.75 }
            }
          >
            نظرة عامة
          </button>
          <button
            onClick={() => setActiveTab("offers")}
            className="flex-1 py-3 text-sm font-semibold transition-colors"
            style={
              activeTab === "offers"
                ? { background: "white", color: "#0E7C66", borderRadius: "0" }
                : { background: "transparent", color: "white", opacity: 0.75 }
            }
          >
            عروضي
          </button>
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 1 — نظرة عامة                                              */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "overview" && (
          <>
            {/* Section: الإحصائيات */}
            <section>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                الإحصائيات
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <StatCard
                  label="الطلبات المتاحة"
                  count={MOCK_STATS.availableRequests}
                  color="#0E7C66"
                  bg="#E8F5F2"
                  icon={FileText}
                />
                <StatCard
                  label="عروضي"
                  count={MOCK_STATS.myOffers}
                  color="#2E4A6B"
                  bg="#EEF2F7"
                  icon={Send}
                />
                <StatCard
                  label="قيد المراجعة"
                  count={MOCK_STATS.pendingReview}
                  color="#C4694A"
                  bg="#FDF3EF"
                  icon={Clock}
                />
                <StatCard
                  label="مقبول"
                  count={MOCK_STATS.accepted}
                  color="#7D3040"
                  bg="#FDF0F2"
                  icon={CheckCircle2}
                />
              </div>
            </section>

            {/* Section: حالة الملف الشخصي — approved state */}
            <section>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                حالة الملف الشخصي
              </h2>

              {/* Approved banner */}
              <div
                className="rounded-lg p-3 flex items-center gap-2"
                style={{ background: "#E8F5F2", border: "1px solid rgba(14,124,102,0.2)" }}
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: "#0E7C66" }} />
                <span className="text-sm font-medium" style={{ color: "#0E7C66" }}>
                  ✓ الملف الشخصي مكتمل ومعتمد
                </span>
              </div>

              {/* Pending approval banner (example state — shown below approved for preview) */}
              <div
                className="rounded-lg p-3 flex items-center gap-2 mt-2"
                style={{ background: "#FFFBEB", border: "1px solid rgba(234,179,8,0.3)" }}
              >
                <Clock className="w-4 h-4 flex-shrink-0 text-yellow-500" />
                <span className="text-sm font-medium text-yellow-700">
                  ⏳ ملفك الشخصي قيد المراجعة من قِبَل الإدارة
                </span>
              </div>

              {/* Label clarifying the two states are for preview */}
              <p className="text-xs text-gray-400 text-center mt-2">
                الحالتان أعلاه معروضتان للمعاينة التجريبية فقط
              </p>
            </section>

            {/* Section: الإجراءات السريعة */}
            <section>
              <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-3">
                الإجراءات السريعة
              </h2>
              <div className="flex gap-3">
                {/* Filled emerald button */}
                <Button
                  className="flex-1 text-sm font-semibold text-white"
                  style={{ background: "#0E7C66" }}
                >
                  <FileText className="w-4 h-4 ml-1.5" />
                  تصفح الطلبات
                </Button>

                {/* Outlined emerald button */}
                <Button
                  variant="outline"
                  className="flex-1 text-sm font-semibold"
                  style={{ borderColor: "#0E7C66", color: "#0E7C66" }}
                >
                  <User className="w-4 h-4 ml-1.5" />
                  تحديث الملف
                </Button>
              </div>
            </section>
          </>
        )}

        {/* ═══════════════════════════════════════════════════════════════ */}
        {/* TAB 2 — عروضي                                                  */}
        {/* ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "offers" && (
          <>
            <section>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-bold text-gray-500 uppercase tracking-widest">
                  عروضي المقدمة
                </h2>
                <span
                  className="text-xs font-semibold rounded-full px-2.5 py-0.5"
                  style={{ background: "#EEF2F7", color: "#2E4A6B" }}
                >
                  {MOCK_OFFERS.length} عروض
                </span>
              </div>

              <div className="space-y-4">
                {MOCK_OFFERS.map((offer) => (
                  <OfferCard key={offer.id} offer={offer} />
                ))}
              </div>
            </section>

            {/* Browse more CTA */}
            <div className="pt-2">
              <Button
                className="w-full text-sm font-semibold text-white"
                style={{ background: "#0E7C66" }}
              >
                <RefreshCw className="w-4 h-4 ml-1.5" />
                تصفح طلبات جديدة
              </Button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
