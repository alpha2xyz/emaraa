import { useState } from "react";
import {
  Building2,
  Send,
  Filter,
  Search,
  MapPin,
  Calendar,
  ExternalLink,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

// ---------------------------------------------------------------------------
// Unified SOW — same text for both building types
// ---------------------------------------------------------------------------

const UNIFIED_SCOPE =
  "نظافة دورية للمناطق المشتركة والمداخل والأسطح والخزانات وإدارة النفايات، صيانة شاملة للإنارة والمضخات والتكييف المركزي (HVAC) والمصاعد والسلالم المتحركة والكاميرات ومنظومة الإطفاء، رش مبيدات وبستنة عند الحاجة، طوارئ على مدار الساعة، تسديد فواتير المرافق.";

// ---------------------------------------------------------------------------
// Static mock data
// ---------------------------------------------------------------------------

const MOCK_REQUESTS = [
  {
    id: "1",
    created_at: "2026-05-20T09:00:00",
    description: "المبنى يحتاج إلى عناية خاصة بالمصعد والتكييف",
    properties: {
      id: "p1",
      name: "برج الياسمين",
      city: "الرياض",
      address: "الملقا",
      building_type: "residential",
      map_url: "https://maps.google.com/",
      units_count: 24,
    },
  },
  {
    id: "2",
    created_at: "2026-05-22T14:00:00",
    description: null,
    properties: {
      id: "p2",
      name: "مجمع الأعمال الذهبي",
      city: "الرياض",
      address: "العليا",
      building_type: "commercial",
      map_url: "https://maps.google.com/",
      units_count: 12,
    },
  },
  {
    id: "3",
    created_at: "2026-05-25T11:00:00",
    description: "يرجى الاهتمام بنظافة المسبح وملاعب الأطفال",
    properties: {
      id: "p3",
      name: "فيلات النرجس",
      city: "الرياض",
      address: "النرجس",
      building_type: "residential",
      map_url: "https://maps.google.com/",
      units_count: 8,
    },
  },
  {
    id: "4",
    created_at: "2026-05-26T10:00:00",
    description: null,
    properties: {
      id: "p4",
      name: "برج النخيل التجاري",
      city: "الرياض",
      address: "حطين",
      building_type: "commercial",
      map_url: "https://maps.google.com/",
      units_count: 30,
    },
  },
  {
    id: "5",
    created_at: "2026-05-27T08:30:00",
    description: "العقار قديم نسبياً — يحتاج صيانة مكثفة للسباكة والكهرباء",
    properties: {
      id: "p5",
      name: "عمارة الروضة",
      city: "الرياض",
      address: "الروضة",
      building_type: "residential",
      map_url: "https://maps.google.com/",
      units_count: 16,
    },
  },
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function SandboxProviderRequests() {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const filteredRequests = MOCK_REQUESTS.filter((request) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      request.properties.name.toLowerCase().includes(searchLower) ||
      request.properties.address.toLowerCase().includes(searchLower) ||
      (request.description?.toLowerCase().includes(searchLower) ?? false);
    const matchesType =
      typeFilter === "all" || request.properties.building_type === typeFilter;
    return matchesSearch && matchesType;
  });

  const hasActiveFilters = searchQuery || typeFilter !== "all";

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const clearFilters = () => {
    setSearchQuery("");
    setTypeFilter("all");
  };

  return (
    <div className="min-h-screen bg-[#F9F9FF]" dir="rtl">
      {/* ── Sandbox badge ── */}
      <div
        className="text-center text-xs font-semibold py-1.5 tracking-wider"
        style={{ background: "#7D3040", color: "white" }}
      >
        معاينة تجريبية — SANDBOX PREVIEW
      </div>

      {/* ── Page header ── */}
      <div
        className="px-6 pt-8 pb-7 text-white"
        style={{
          background: "linear-gradient(135deg, #0E7C66 0%, #0a5e4e 100%)",
        }}
      >
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <span className="text-xl font-bold tracking-wide">عِمارة</span>
          </div>
          <h1 className="text-2xl font-bold mb-1">الطلبات المتاحة</h1>
          <p className="text-sm" style={{ opacity: 0.78 }}>
            تصفح جميع الطلبات المتاحة وقدم عروضك
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* ── Search & Filter card ── */}
        <Card className="rounded-xl shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base font-bold">
              <Filter className="h-4 w-4" />
              البحث والفلترة
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="بحث عن طلب..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-9"
              />
            </div>

            {/* Building type filter pills */}
            <div>
              <p className="text-xs text-gray-500 mb-2 font-medium">النوع</p>
              <div className="flex flex-wrap gap-2">
                {(["all", "residential", "commercial"] as const).map((type) => {
                  const label =
                    type === "all" ? "الكل" : type === "residential" ? "سكني" : "تجاري";
                  const activeColor =
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
                          ? activeColor
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
                  إعادة تعيين
                </Button>
                <span className="text-sm text-gray-500">
                  {filteredRequests.length} نتيجة
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Request cards ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((request) => {
            const isCommercial = request.properties.building_type === "commercial";
            const typeColor = isCommercial ? "#C4694A" : "#7D3040";
            const typeBg = isCommercial ? "#FDF3EF" : "#FDF0F2";
            const typeBorder = isCommercial ? "#EDB99F" : "#F0C5CF";
            const typeLabel = isCommercial ? "تجاري" : "سكني";

            return (
              <Card
                key={request.id}
                className="rounded-xl shadow-sm hover:shadow-md transition-shadow border"
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
                            {request.properties.city} · {request.properties.address}
                            {request.properties.units_count
                              ? ` · ${request.properties.units_count} وحدة`
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
                      <Building2 className="h-4 w-4 flex-shrink-0" style={{ color: typeColor }} />
                      <span className="font-bold text-gray-900">{request.properties.name}</span>
                    </div>

                    {/* ── Unified scope excerpt ── */}
                    <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                      {UNIFIED_SCOPE}
                    </p>

                    {/* ── Owner notes ── */}
                    {request.description && (
                      <div
                        className="rounded-lg px-3 py-2.5 text-xs text-gray-600 leading-relaxed"
                        style={{ background: "#F9F9FF", border: "1px solid #DDE4EE" }}
                      >
                        <span className="font-semibold text-gray-700 block mb-1">
                          ملاحظات المالك:
                        </span>
                        {request.description}
                      </div>
                    )}

                    {/* ── Map button ── */}
                    {request.properties.map_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => window.open(request.properties.map_url, "_blank")}
                      >
                        <ExternalLink className="h-3 w-3 ml-1" />
                        عرض الموقع على الخريطة
                      </Button>
                    )}

                    {/* ── Submit offer button ── */}
                    {request.id === "2" ? (
                      <Button
                        className="w-full text-sm font-semibold"
                        style={{ background: "#E8F5F2", color: "#0E7C66", border: "1px solid #A8D8CF" }}
                        variant="outline"
                        disabled
                      >
                        <CheckCircle2 className="h-4 w-4 ml-2 text-[#0E7C66]" />
                        تم تقديم العرض
                      </Button>
                    ) : (
                      <Button
                        className="w-full text-sm font-semibold text-white"
                        style={{ background: "#0E7C66" }}
                      >
                        <Send className="h-4 w-4 ml-2" />
                        تقديم عرض
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
