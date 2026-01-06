import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, FileText, Users, Plus, Globe } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useLang } from "@/hooks/use-lang";

export default function OwnerDashboard() {
  const { lang, toggleLang } = useLang();

  // جلب البيانات من API
  const { data: properties = [] } = useQuery({
    queryKey: ["/api/properties"],
  });

  const { data: requests = [] } = useQuery({
    queryKey: ["/api/requests"],
  });

  const { data: bids = [] } = useQuery({
    queryKey: ["/api/bids"],
  });

  // الترجمة
  const t = {
    ar: {
      title: "لوحة التحكم - مالك عقار",
      welcome: "مرحباً بك!",
      subtitle: "نظرة عامة على عقاراتك وطلباتك",
      myProperties: "عقاراتي",
      myRequests: "طلباتي",
      receivedBids: "العروض المستلمة",
      addProperty: "إضافة عقار",
      createRequest: "طلب خدمة جديد",
      viewAll: "عرض الكل",
      noProperties: "لا توجد عقارات بعد",
      noRequests: "لا توجد طلبات خدمة",
      noBids: "لا توجد عروض بعد",
      property: "عقار",
      request: "طلب",
      bid: "عرض",
    },
    en: {
      title: "Dashboard - Property Owner",
      welcome: "Welcome back!",
      subtitle: "Overview of your properties and requests",
      myProperties: "My Properties",
      myRequests: "My Requests",
      receivedBids: "Received Bids",
      addProperty: "Add Property",
      createRequest: "New Service Request",
      viewAll: "View All",
      noProperties: "No properties yet",
      noRequests: "No service requests",
      noBids: "No bids yet",
      property: "Property",
      request: "Request",
      bid: "Bid",
    },
  };

  const content = t[lang];

  return (
    <div className="min-h-screen bg-gray-50" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header مع زر اللغة */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{content.title}</h1>
            <p className="text-gray-600 mt-1">{content.subtitle}</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleLang}
            className="flex items-center gap-2"
          >
            <Globe className="w-4 h-4" />
            {lang === "ar" ? "English" : "العربية"}
          </Button>
        </div>
      </div>

      {/* المحتوى */}
      <div className="p-6 space-y-6">
        {/* الإحصائيات */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* عقاراتي */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {content.myProperties}
              </CardTitle>
              <Building2 className="w-5 h-5 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {properties.length}
              </div>
              <p className="text-xs text-gray-500 mt-2">{content.property}</p>
            </CardContent>
          </Card>

          {/* طلباتي */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {content.myRequests}
              </CardTitle>
              <FileText className="w-5 h-5 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {requests.length}
              </div>
              <p className="text-xs text-gray-500 mt-2">{content.request}</p>
            </CardContent>
          </Card>

          {/* العروض المستلمة */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                {content.receivedBids}
              </CardTitle>
              <Users className="w-5 h-5 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">
                {bids.length}
              </div>
              <p className="text-xs text-gray-500 mt-2">{content.bid}</p>
            </CardContent>
          </Card>
        </div>

        {/* أزرار سريعة */}
        <div className="flex gap-4">
          <Link href="/properties/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {content.addProperty}
            </Button>
          </Link>
          <Link href="/requests/new">
            <Button className="bg-green-600 hover:bg-green-700 text-white">
              <Plus className="w-4 h-4 mr-2" />
              {content.createRequest}
            </Button>
          </Link>
        </div>

        {/* العقارات */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{content.myProperties}</CardTitle>
            <Link href="/properties">
              <Button variant="ghost" size="sm">
                {content.viewAll}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {properties.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Building2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{content.noProperties}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {properties.slice(0, 3).map((property: any) => (
                  <div
                    key={property.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {property.name}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {property.address}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* طلبات الخدمة */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{content.myRequests}</CardTitle>
            <Link href="/requests">
              <Button variant="ghost" size="sm">
                {content.viewAll}
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>{content.noRequests}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {requests.slice(0, 3).map((request: any) => (
                  <div
                    key={request.id}
                    className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <h3 className="font-semibold text-gray-900">
                      {request.title}
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {request.category}
                    </p>
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
