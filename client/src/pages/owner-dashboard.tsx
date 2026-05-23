import { useQuery } from "@tanstack/react-query";
import { Building2, FileText, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "wouter";
import { useLang } from "@/hooks/use-lang";
import { useAuthGuard } from "@/hooks/use-auth-guard";

export default function OwnerDashboard() {
  useAuthGuard("owner");
  const { lang } = useLang();
  const phone = localStorage.getItem("userPhone");
  const userName = localStorage.getItem("userName") || "";
  const today = new Date().toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  const { data: dashboardData, isLoading, isError } = useQuery({
    queryKey: ["owner-stats", phone],
    queryFn: async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) return { properties: [], requests: [] };
      const res = await fetch("/api/owner/stats", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return { properties: [], requests: [] };
      return res.json();
    },
    enabled: !!phone,
  });

  const properties = dashboardData?.properties || [];
  const requests = dashboardData?.requests || [];

  const t = {
    ar: {
      title: "لوحة التحكم",
      myProperties: "عقاراتي",
      myRequests: "طلبات الخدمة",
      addProperty: "إضافة عقار",
      createRequest: "طلب جديد",
      noProperties: "لا توجد عقارات",
      noRequests: "لا توجد طلبات",
      viewAll: "عرض الكل",
      edit: "تعديل",
      offers: "العروض",
      cleaning: "خدمات النظافة",
      maintenance: "خدمات الصيانة",
    },
    en: {
      title: "Dashboard",
      myProperties: "My Properties",
      myRequests: "Service Requests",
      addProperty: "Add Property",
      createRequest: "New Request",
      noProperties: "No properties",
      noRequests: "No requests",
      viewAll: "View All",
      edit: "Edit",
      offers: "Offers",
      cleaning: "Cleaning",
      maintenance: "Maintenance",
    },
  };

  const content = lang === "ar" ? t.ar : t.en;

  return (
    <div
      className="page-enter min-h-screen bg-[#F9F9FF]"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="bg-white border-b px-6 py-5">
        <h1 className="text-2xl font-extrabold text-gray-900">
          {lang === "ar"
            ? `مرحباً${userName ? `، ${userName}` : ""}`
            : `Welcome${userName ? `, ${userName}` : ""}`}
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">{today}</p>
      </div>

      {isError && <div className="text-center py-10 text-red-500">{lang === "ar" ? "حدث خطأ في تحميل البيانات" : "Failed to load data"}</div>}
      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* كرت العقارات */}
          <Card className="border-t-4 border-t-[#2E4A6B]">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {content.myProperties}
              </CardTitle>
              <Building2 className="w-5 h-5 text-[#2E4A6B]" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-9 w-12" /> : <div className="text-3xl font-bold">{properties.length}</div>}
            </CardContent>
          </Card>

          {/* كرت الطلبات */}
          <Card className="border-t-4 border-t-green-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {content.myRequests}
              </CardTitle>
              <FileText className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              {isLoading ? <Skeleton className="h-9 w-12" /> : <div className="text-3xl font-bold">{requests.length}</div>}
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Link href="/dashboard/owner/properties/new">
            <Button className="bg-[#2E4A6B] hover:bg-[#243A56]">
              <Plus className="w-4 h-4 me-2" />
              {content.addProperty}
            </Button>
          </Link>
          <Link href="/dashboard/owner/requests/new">
            <Button variant="outline" className="border-[#2E4A6B] text-[#2E4A6B]">
              {content.createRequest}
            </Button>
          </Link>
        </div>

        {/* قائمة العقارات الأخيرة */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-extrabold">{content.myProperties}</CardTitle>
            <Link href="/dashboard/owner/properties">
              <Button variant="ghost" size="sm">
                {content.viewAll}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                {content.noProperties}
              </p>
            ) : (
              <div className="space-y-3">
                {properties.slice(0, 3).map((p: any) => (
                  <div
                    key={p.id}
                    className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm"
                  >
                    <div>
                      <p className="font-bold">{p.name}</p>
                      <p className="text-xs text-gray-500">{p.city}</p>
                    </div>
                    <Link href={`/dashboard/owner/properties/${p.id}/edit`}>
                      <Button variant="ghost" size="sm" className="text-[#2E4A6B]">
                        {content.edit}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* قائمة الطلبات الأخيرة */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="font-extrabold">{content.myRequests}</CardTitle>
            <Link href="/dashboard/owner/requests">
              <Button variant="ghost" size="sm">
                {content.viewAll}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <p className="text-center text-gray-500 py-4">
                {content.noRequests}
              </p>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 3).map((r: any) => (
                  <div
                    key={r.id}
                    className="p-3 border rounded-lg flex justify-between items-center bg-white shadow-sm"
                  >
                    <div>
                      <p className="font-bold text-sm">
                        {r.service_category === "standard"
                          ? (lang === "ar" ? "نطاق الخدمات المطلوبة" : "Scope of Services")
                          : (r.service_category === "cleaning" ? content.cleaning : content.maintenance)}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(r.created_at).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US")}
                      </p>
                    </div>
                    <Link href={`/dashboard/owner/requests/${r.id}/offers`}>
                      <Button variant="ghost" size="sm" className="text-[#2E4A6B]">
                        {content.offers}
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
