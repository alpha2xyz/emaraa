import { useQuery } from "@tanstack/react-query";
import {
  Building2,
  FileText,
  Plus,
  Globe,
  LayoutDashboard,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";

export default function OwnerDashboard() {
  const { lang, toggleLang } = useLang();
  const phone = localStorage.getItem("userPhone");

  // 1. جلب العقارات والطلبات بناءً على المستخدم
  const { data: dashboardData, isLoading } = useQuery({
    queryKey: ["owner-stats", phone],
    queryFn: async () => {
      if (!phone) return { properties: [], requests: [] };

      const { data: userData } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

      if (!userData) return { properties: [], requests: [] };

      // جلب العقارات
      const { data: props } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", userData.id);

      // جلب الطلبات (تأكد أن اسم الجدول هو requests وعمود المالك هو owner_id)
      const { data: reqs } = await supabase
        .from("requests")
        .select("*")
        .eq("owner_id", userData.id);

      return { properties: props || [], requests: reqs || [] };
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
    },
  };

  const content = lang === "ar" ? t.ar : t.en;

  return (
    <div
      className="min-h-screen bg-gray-50"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <LayoutDashboard className="w-6 h-6 text-blue-600" />
          <h1 className="text-2xl font-bold">{content.title}</h1>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={toggleLang}
          className="gap-2"
        >
          <Globe className="w-4 h-4" />
          {lang === "ar" ? "English" : "العربية"}
        </Button>
      </div>

      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* كرت العقارات */}
          <Card className="border-t-4 border-t-blue-600">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {content.myProperties}
              </CardTitle>
              <Building2 className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{properties.length}</div>
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
              <div className="text-3xl font-bold">{requests.length}</div>
            </CardContent>
          </Card>
        </div>

        <div className="flex gap-4">
          <Link href="/dashboard/owner/properties/new">
            <Button className="bg-blue-600">
              <Plus className="w-4 h-4 ml-2" />
              {content.addProperty}
            </Button>
          </Link>
          <Link href="/dashboard/owner/requests/new">
            <Button variant="outline" className="border-blue-600 text-blue-600">
              {content.createRequest}
            </Button>
          </Link>
        </div>

        {/* قائمة العقارات الأخيرة */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{content.myProperties}</CardTitle>
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
                    <Link href={`/properties/edit/${p.id}`}>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-600"
                      >
                        تعديل
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
