import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import {
  Building2,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";

export default function ProviderDashboard() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();

  const content = {
    ar: {
      title: "لوحة التحكم - مزود الخدمة",
      welcome: "مرحباً",
      overview: "نظرة عامة",
      newRequests: "طلبات جديدة",
      activeContracts: "عقود نشطة",
      totalEarnings: "إجمالي الأرباح",
      completionRate: "معدل الإنجاز",
      recentRequests: "الطلبات الأخيرة",
      noRequests: "لا توجد طلبات حالياً",
      viewAll: "عرض الكل",
      property: "العقار",
      service: "الخدمة",
      status: "الحالة",
      pending: "قيد الانتظار",
      accepted: "مقبول",
      rejected: "مرفوض",
      completed: "مكتمل",
      viewDetails: "عرض التفاصيل",
      sendOffer: "إرسال عرض",
      sar: "ر.س",
    },
    en: {
      title: "Dashboard - Service Provider",
      welcome: "Welcome",
      overview: "Overview",
      newRequests: "New Requests",
      activeContracts: "Active Contracts",
      totalEarnings: "Total Earnings",
      completionRate: "Completion Rate",
      recentRequests: "Recent Requests",
      noRequests: "No requests at the moment",
      viewAll: "View All",
      property: "Property",
      service: "Service",
      status: "Status",
      pending: "Pending",
      accepted: "Accepted",
      rejected: "Rejected",
      completed: "Completed",
      viewDetails: "View Details",
      sendOffer: "Send Offer",
      sar: "SAR",
    },
  };

  const t = content[lang];

  // جلب بيانات المستخدم
  const { data: userData } = useQuery({
    queryKey: ["/api/provider/profile"],
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Not logged in");

      const { data: user, error } = await supabase
        .from("users")
        .select("id, name, phone")
        .eq("phone", phone)
        .single();

      if (error) throw error;

      // جلب بيانات المزود
      const { data: provider, error: providerError } = await supabase
        .from("providers")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (providerError) throw providerError;

      return { user, provider };
    },
  });

  // إحصائيات وهمية (مؤقتة - لحين إنشاء نظام الطلبات)
  const stats = {
    newRequests: 8,
    activeContracts: 12,
    totalEarnings: 45600,
    completionRate: 94,
  };

  // طلبات وهمية (مؤقتة)
  const recentRequests = [
    {
      id: 1,
      property: "برج الخليج",
      service: "خدمات النظافة",
      status: "pending",
      date: "2026-01-04",
    },
    {
      id: 2,
      property: "فيلا النخيل",
      service: "صيانة المصاعد",
      status: "pending",
      date: "2026-01-03",
    },
    {
      id: 3,
      property: "عمارة الواحة",
      service: "خدمات الأمن",
      status: "accepted",
      date: "2026-01-02",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "accepted":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return t.pending;
      case "accepted":
        return t.accepted;
      case "rejected":
        return t.rejected;
      case "completed":
        return t.completed;
      default:
        return status;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{t.title}</h1>
        <p className="text-gray-600">
          {t.welcome}, {userData?.user?.name || ""}!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* طلبات جديدة */}
        <Card className="border-l-4 border-l-yellow-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t.newRequests}
            </CardTitle>
            <Clock className="w-5 h-5 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.newRequests}
            </div>
          </CardContent>
        </Card>

        {/* عقود نشطة */}
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t.activeContracts}
            </CardTitle>
            <CheckCircle className="w-5 h-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.activeContracts}
            </div>
          </CardContent>
        </Card>

        {/* إجمالي الأرباح */}
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t.totalEarnings}
            </CardTitle>
            <DollarSign className="w-5 h-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.totalEarnings.toLocaleString()} {t.sar}
            </div>
          </CardContent>
        </Card>

        {/* معدل الإنجاز */}
        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              {t.completionRate}
            </CardTitle>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">
              {stats.completionRate}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Requests */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-bold">
            {t.recentRequests}
          </CardTitle>
          <Button variant="outline" size="sm">
            {t.viewAll}
          </Button>
        </CardHeader>
        <CardContent>
          {recentRequests.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p>{t.noRequests}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <Building2 className="w-5 h-5 text-gray-400" />
                      <h3 className="font-semibold text-gray-900">
                        {request.property}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          request.status,
                        )}`}
                      >
                        {getStatusText(request.status)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mr-8">
                      {request.service}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{request.date}</p>
                  </div>
                  <div className="flex gap-2">
                    {request.status === "pending" && (
                      <Button
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {t.sendOffer}
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      {t.viewDetails}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
