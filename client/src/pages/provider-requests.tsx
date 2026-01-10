import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";
import { SERVICES } from "@/lib/services";

export default function ProviderRequests() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();

  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const content = {
    ar: {
      title: "الطلبات المتاحة",
      subtitle: "تصفح جميع الطلبات المتاحة وقدم عروضك",
      search: "بحث عن طلب...",
      filterCity: "تصفية حسب المدينة",
      filterCategory: "تصفية حسب الفئة",
      all: "الكل",
      property: "العقار",
      city: "المدينة",
      category: "الفئة",
      services: "الخدمات المطلوبة",
      description: "الوصف",
      date: "تاريخ الإنشاء",
      submitOffer: "تقديم عرض",
      noRequests: "لا توجد طلبات متاحة",
      noResults: "لا توجد نتائج للبحث",
      cleaning: "خدمات النظافة",
      maintenance: "خدمات الصيانة",
      loading: "جاري التحميل...",
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
      filterCategory: "Filter by Category",
      all: "All",
      property: "Property",
      city: "City",
      category: "Category",
      services: "Requested Services",
      description: "Description",
      date: "Created Date",
      submitOffer: "Submit Offer",
      noRequests: "No requests available",
      noResults: "No results found",
      cleaning: "Cleaning Services",
      maintenance: "Maintenance Services",
      loading: "Loading...",
      clearFilters: "Clear Filters",
      results: "results",
      completeProfile: "Complete Your Company Profile First",
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

  // جلب كل الطلبات المتاحة
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

  // التحقق من اكتمال الملف الشخصي
  const isProfileComplete =
    providerData?.provider?.company_name && providerData?.provider?.city;

  // فلترة الطلبات
  const filteredRequests = requests?.filter((request: any) => {
    // فلترة البحث
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      request.properties?.name?.toLowerCase().includes(searchLower) ||
      request.properties?.city?.toLowerCase().includes(searchLower) ||
      request.description?.toLowerCase().includes(searchLower);

    // فلترة المدينة
    const matchesCity =
      cityFilter === "all" || request.properties?.city === cityFilter;

    // فلترة الفئة
    const matchesCategory =
      categoryFilter === "all" || request.service_category === categoryFilter;

    return matchesSearch && matchesCity && matchesCategory;
  });

  // استخراج المدن المتاحة
  const availableCities = Array.from(
    new Set(requests?.map((r: any) => r.properties?.city).filter(Boolean)),
  );

  const getCategoryName = (category: string) => {
    return category === "cleaning" ? t.cleaning : t.maintenance;
  };

  const getServiceNames = (serviceIds: string[]) => {
    if (!serviceIds || serviceIds.length === 0) return "";

    return serviceIds
      .map((id) => {
        const service = SERVICES.find((s) => s.id === id);
        return service ? service.name[lang] : "";
      })
      .filter(Boolean)
      .join(", ");
  };

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
    setCategoryFilter("all");
  };

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
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {lang === "ar" ? "البحث والفلترة" : "Search & Filter"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t.search}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* City Filter */}
            <Select value={cityFilter} onValueChange={setCityFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t.filterCity} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                {availableCities.map((city: string) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Category Filter */}
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder={t.filterCategory} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t.all}</SelectItem>
                <SelectItem value="cleaning">{t.cleaning}</SelectItem>
                <SelectItem value="maintenance">{t.maintenance}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Clear Filters Button */}
          {(searchQuery ||
            cityFilter !== "all" ||
            categoryFilter !== "all") && (
            <div className="mt-4 flex items-center gap-2">
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
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">{t.loading}</p>
        </div>
      ) : !filteredRequests || filteredRequests.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertCircle className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {searchQuery || cityFilter !== "all" || categoryFilter !== "all"
                  ? t.noResults
                  : t.noRequests}
              </h3>
              {(searchQuery ||
                cityFilter !== "all" ||
                categoryFilter !== "all") && (
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
                        {getCategoryName(request.service_category)}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(request.created_at)}</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="gap-1">
                      <MapPin className="h-3 w-3" />
                      {request.properties?.city}
                    </Badge>
                  </div>

                  {/* Property Info */}
                  <div className="flex items-center gap-2 text-sm">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">
                      {request.properties?.name}
                    </span>
                  </div>

                  {/* Services */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {t.services}:
                    </p>
                    <p className="text-sm line-clamp-2">
                      {getServiceNames(request.service_ids)}
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
                  <Button
                    className="w-full"
                    onClick={() =>
                      setLocation(
                        `/dashboard/provider/requests/${request.id}/offer`,
                      )
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
    </div>
  );
}
