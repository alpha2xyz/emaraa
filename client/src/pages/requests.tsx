import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { FileText, Plus, Edit, Building2, Calendar, Eye, Trash2 } from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function Requests() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [checkingOffers, setCheckingOffers] = useState(false);

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
      deleteConfirm: "هل أنت متأكد من حذف هذا الطلب؟",
      deleteSuccess: "تم حذف الطلب بنجاح",
      deleteError: "حدث خطأ أثناء الحذف",
      deleteBlocked: "لا يمكن حذف هذا العنصر — تم تقديم عروض عليه",
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
      deleteConfirm: "Are you sure you want to delete this request?",
      deleteSuccess: "Request deleted successfully",
      deleteError: "An error occurred while deleting",
      deleteBlocked: "Cannot delete — offers have been submitted on this item",
    },
  };

  const t = content[lang];

  const handleDeleteClick = async (requestId: string) => {
    setCheckingOffers(true);
    try {
      const { data: offers } = await supabase
        .from("provider_offers")
        .select("id")
        .eq("request_id", requestId)
        .limit(1);
      if (offers && offers.length > 0) {
        toast({ title: t.deleteBlocked, variant: "destructive" });
        return;
      }
      setDeleteId(requestId);
    } finally {
      setCheckingOffers(false);
    }
  };

  const { data: requests, isLoading, isError } = useQuery({
    queryKey: ["/api/requests"],
    queryFn: async () => {
      const token = localStorage.getItem("sessionToken");
      if (!token) throw new Error("Not logged in");
      const res = await fetch("/api/requests", { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) throw new Error("Failed to load");
      return res.json();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (requestId: string) => {
      const token = localStorage.getItem("sessionToken");
      const res = await fetch(`/api/requests/${requestId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Failed to delete");
    },
    onSuccess: () => {
      setDeleteId(null);
      queryClient.invalidateQueries({ queryKey: ["/api/requests"] });
      toast({ title: t.deleteSuccess });
    },
    onError: () => {
      setDeleteId(null);
      toast({ title: t.deleteError, variant: "destructive" });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-gray-900 border-yellow-300";
      case "in_progress":
        return "bg-blue-100 text-gray-900 border-blue-300";
      case "completed":
        return "bg-green-100 text-gray-900 border-green-300";
      case "cancelled":
        return "bg-red-100 text-gray-900 border-red-300";
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

  if (isLoading) {
    return (
      <div className="page-enter min-h-screen bg-[#F9F9FF] p-4 sm:p-6" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="max-w-6xl mx-auto space-y-4">
          <Skeleton className="h-10 w-48 mb-6" />
          {[1,2,3].map(i => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="page-enter min-h-screen bg-[#F9F9FF] p-4 sm:p-6" dir={lang === "ar" ? "rtl" : "ltr"}>
        <div className="text-center py-10 text-red-500">{lang === "ar" ? "حدث خطأ في تحميل البيانات" : "Failed to load data"}</div>
      </div>
    );
  }

  return (
    <>
    <div className="page-enter min-h-screen bg-[#F9F9FF] p-4 sm:p-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
            <FileText className="w-7 h-7 sm:w-8 sm:h-8 text-[#2E4A6B]" />
            {t.title}
          </h1>
          <Button
            onClick={() => setLocation("/dashboard/owner/requests/new")}
            className="bg-[#2E4A6B] hover:bg-[#243A56]"
          >
            <Plus className="w-4 h-4 me-2" />
            {t.newRequest}
          </Button>
        </div>

        {/* Requests List */}
        {!requests || requests.length === 0 ? (
          <Card className="text-center py-14">
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 bg-[#FDF3EF] rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16">
                    <rect x="12" y="8" width="56" height="64" rx="5" fill="#FEF3C7"/>
                    <rect x="20" y="18" width="40" height="5" rx="2.5" fill="#FCD34D"/>
                    <rect x="20" y="29" width="30" height="5" rx="2.5" fill="#FCD34D"/>
                    <rect x="20" y="40" width="35" height="5" rx="2.5" fill="#FCD34D"/>
                    <rect x="20" y="51" width="24" height="5" rx="2.5" fill="#FCD34D"/>
                    <circle cx="57" cy="57" r="14" fill="#F59E0B"/>
                    <rect x="54" y="48" width="6" height="6" rx="1" fill="white"/>
                    <rect x="54" y="56" width="6" height="7" rx="1" fill="white"/>
                  </svg>
                </div>
                <div className="absolute -right-1 -bottom-1 w-7 h-7 bg-[#F8DDD4] rounded-full" />
                <div className="absolute -left-2 top-3 w-5 h-5 bg-[#F8DDD4] rounded-full" />
              </div>
              <h2 className="text-xl font-bold mb-1 text-gray-800">{t.noRequests}</h2>
              <p className="text-gray-400 text-sm mb-6">{t.createFirst}</p>
              <Button onClick={() => setLocation("/dashboard/owner/requests/new")}>
                <Plus className="w-4 h-4 me-2" />
                {t.newRequest}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request: any) => {
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
                            <Building2 className="w-5 h-5 text-[#2E4A6B]" />
                            <span className="font-semibold">{t.property}:</span>
                            <span>{request.properties?.name || (lang === "ar" ? "غير محدد" : "N/A")}</span>
                          </div>

                          {/* Date */}
                          <div className="flex items-center gap-2 text-gray-600">
                            <Calendar className="w-5 h-5" />
                            <span>{formatDate(request.created_at)}</span>
                          </div>

                          {/* Scope Label */}
                          <div className="flex items-center gap-2 text-gray-600">
                            <FileText className="w-5 h-5" />
                            <span className="text-sm font-medium">
                              {lang === "ar" ? "نطاق الخدمات المطلوبة" : "Scope of Services Required"}
                            </span>
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
                          className="bg-[#2E4A6B] hover:bg-[#243A56]"
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
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 hover:text-red-700 hover:border-red-300"
                          onClick={() => handleDeleteClick(request.id)}
                          disabled={deleteMutation.isPending || checkingOffers}
                        >
                          <Trash2 className="w-4 h-4 me-2" />
                          {lang === "ar" ? "حذف" : "Delete"}
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

    <AlertDialog open={!!deleteId} onOpenChange={(open) => { if (!open) setDeleteId(null); }}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{lang === "ar" ? "تأكيد الحذف" : "Confirm Delete"}</AlertDialogTitle>
          <AlertDialogDescription>{t.deleteConfirm}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>{lang === "ar" ? "إلغاء" : "Cancel"}</AlertDialogCancel>
          <AlertDialogAction
            className="bg-red-600 hover:bg-red-700"
            onClick={() => deleteId && deleteMutation.mutate(deleteId)}
          >
            {lang === "ar" ? "حذف" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
    </>
  );
}
