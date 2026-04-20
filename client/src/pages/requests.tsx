import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Edit, Building2, Calendar, Eye } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";
import { getServicesByCategory } from "@/lib/services";

export default function Requests() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();

  const content = {
    ar: {
      title: "طلبات الخدمة",
      newRequest: "طلب خدمة جديد",
      property: "العقار",
      services: "خدمات",
      service: "خدمة",
      date: "التاريخ",
      viewDetails: "عرض التفاصيل",
      noRequests: "لا توجد طلبات حالياً",
      createFirst: "أنشئ طلبك الأول",
      pending: "قيد الانتظار",
      in_progress: "جاري التنفيذ",
      completed: "مكتمل",
      cancelled: "ملغي",
    },
    en: {
      title: "Service Requests",
      newRequest: "New Request",
      property: "Property",
      services: "services",
      service: "service",
      date: "Date",
      viewDetails: "View Details",
      noRequests: "No requests yet",
      createFirst: "Create your first request",
      pending: "Pending",
      in_progress: "In Progress",
      completed: "Completed",
      cancelled: "Cancelled",
    },
  };

  const t = content[lang];

  // جلب طلبات المستخدم
  const { data: requests, isLoading } = useQuery({
    queryKey: ["/api/requests"],
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Not logged in");

      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

      if (!user) throw new Error("User not found");

      const { data, error } = await supabase
        .from("requests")
        .select(
          `
          *,
          properties (
            id,
            name,
            city
          )
        `,
        )
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "in_progress":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return t.pending;
      case "in_progress":
        return t.in_progress;
      case "completed":
        return t.completed;
      case "cancelled":
        return t.cancelled;
      default:
        return status;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // Get service names
  const getServiceNames = (serviceIds: string[], category: string) => {
    const services = getServicesByCategory(category);
    return serviceIds
      .map((id) => {
        const service = services.find((s) => s.id === id);
        return service ? service.name[lang] : "";
      })
      .filter(Boolean);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
            {t.title}
          </h1>
          <Button
            onClick={() => setLocation("/dashboard/owner/requests/new")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 me-2" />
            {t.newRequest}
          </Button>
        </div>

        {/* Requests List */}
        {!requests || requests.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h2 className="text-xl font-bold mb-2 text-gray-900">
                {t.noRequests}
              </h2>
              <p className="text-gray-600 mb-4">{t.createFirst}</p>
              <Button
                onClick={() => setLocation("/dashboard/owner/requests/new")}
              >
                <Plus className="w-4 h-4 me-2" />
                {t.newRequest}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => {
              const serviceNames = getServiceNames(
                request.service_ids,
                request.service_category,
              );

              return (
                <Card
                  key={request.id}
                  className="hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                      {/* Left Section */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-3">
                          <Badge className={getStatusColor(request.status)}>
                            {getStatusText(request.status)}
                          </Badge>
                        </div>

                        <div className="space-y-2">
                          {/* Property */}
                          <div className="flex items-center gap-2 text-gray-900">
                            <Building2 className="w-5 h-5 text-blue-600" />
                            <span className="font-semibold">{t.property}:</span>
                            <span>{request.properties?.name || "N/A"}</span>
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-5 h-5" />
                            <span>{formatDate(request.created_at)}</span>
                          </div>

                          {/* Services Count */}
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="w-5 h-5" />
                            <span>
                              {serviceNames.length}{" "}
                              {serviceNames.length === 1
                                ? t.service
                                : t.services}
                            </span>
                          </div>

                          {/* Service Names Preview */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {serviceNames.slice(0, 2).map((name, index) => (
                              <span
                                key={index}
                                className="text-sm text-gray-700"
                              >
                                {name}
                                {index < Math.min(1, serviceNames.length - 1) &&
                                  ","}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          onClick={() =>
                            setLocation(
                              `/dashboard/owner/requests/${request.id}/offers`,
                            )
                          }
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4 me-2" />
                          {lang === "ar" ? "عرض العروض" : "View Offers"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setLocation(
                              `/dashboard/owner/requests/${request.id}/edit`,
                            )
                          }
                        >
                          <Edit className="w-4 h-4 me-2" />
                          {lang === "ar" ? "تعديل" : "Edit"}
                        </Button>
                      </div>
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
