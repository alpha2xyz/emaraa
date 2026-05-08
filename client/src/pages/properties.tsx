import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Building2,
  MapPin,
  Plus,
  Edit,
  Trash2,
  ExternalLink,
  Home,
  Briefcase,
  Building,
} from "lucide-react";
import { useLang } from "@/hooks/use-lang";
import { supabase } from "../lib/supabase";
import { useToast } from "@/hooks/use-toast";

export default function Properties() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const content = {
    ar: {
      title: "عقاراتي",
      subtitle: "إدارة العقارات والمباني",
      addNew: "إضافة عقار جديد",
      noProperties: "لا توجد عقارات",
      noPropertiesDesc: "ابدأ بإضافة عقارك الأول",
      edit: "تعديل",
      delete: "حذف",
      viewMap: "عرض الموقع",
      units: "وحدة",
      residential: "سكني",
      commercial: "تجاري",
      mixed: "مختلط",
      deleteTitle: "تأكيد الحذف",
      deleteDesc:
        "هل أنت متأكد من حذف هذا العقار؟ لا يمكن التراجع عن هذا الإجراء.",
      cancel: "إلغاء",
      confirmDelete: "نعم، احذف",
      deleteSuccess: "تم حذف العقار بنجاح",
      deleteError: "حدث خطأ أثناء الحذف",
    },
    en: {
      title: "My Properties",
      subtitle: "Manage properties and buildings",
      addNew: "Add New Property",
      noProperties: "No Properties",
      noPropertiesDesc: "Start by adding your first property",
      edit: "Edit",
      delete: "Delete",
      viewMap: "View Location",
      units: "units",
      residential: "Residential",
      commercial: "Commercial",
      mixed: "Mixed",
      deleteTitle: "Confirm Deletion",
      deleteDesc:
        "Are you sure you want to delete this property? This action cannot be undone.",
      cancel: "Cancel",
      confirmDelete: "Yes, Delete",
      deleteSuccess: "Property deleted successfully",
      deleteError: "Error occurred while deleting",
    },
  };

  const t = content[lang];

  // جلب العقارات
  const { data: properties = [], isLoading } = useQuery({
    queryKey: ["/api/properties"],
    queryFn: async () => {
      const phone = localStorage.getItem("userPhone");
      if (!phone) throw new Error("Please login first");

      // جلب user_id
      const { data: user } = await supabase
        .from("users")
        .select("id")
        .eq("phone", phone)
        .single();

      if (!user) throw new Error("User not found");

      // جلب العقارات
      const { data, error } = await supabase
        .from("properties")
        .select("*")
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });

  // حذف عقار
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("properties").delete().eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/properties"] });
      toast({
        title: t.deleteSuccess,
        variant: "default",
      });
      setDeleteId(null);
    },
    onError: (error) => {
      if (import.meta.env.DEV) console.error("Delete error:", error);
      toast({
        title: t.deleteError,
        variant: "destructive",
      });
    },
  });

  const getBuildingTypeIcon = (type: string) => {
    switch (type) {
      case "residential":
        return <Home className="w-5 h-5 text-blue-600" />;
      case "commercial":
        return <Briefcase className="w-5 h-5 text-green-600" />;
      case "mixed":
        return <Building className="w-5 h-5 text-purple-600" />;
      default:
        return <Building2 className="w-5 h-5 text-gray-600" />;
    }
  };

  const getBuildingTypeText = (type: string) => {
    switch (type) {
      case "residential":
        return t.residential;
      case "commercial":
        return t.commercial;
      case "mixed":
        return t.mixed;
      default:
        return type;
    }
  };

  return (
    <div
      className="page-enter min-h-screen bg-[#F9F9FF] p-4 sm:p-6"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Building2 className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
              {t.title}
            </h1>
            <p className="text-gray-600 mt-2">{t.subtitle}</p>
          </div>
          <Link href="/dashboard/owner/properties/new">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Plus className="w-5 h-5 me-2" />
              {t.addNew}
            </Button>
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1,2,3].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        )}

        {/* Empty State */}
        {!isLoading && properties.length === 0 && (
          <Card className="text-center py-14">
            <CardContent className="flex flex-col items-center">
              <div className="relative mb-6">
                <div className="w-28 h-28 bg-blue-50 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 80 80" fill="none" className="w-16 h-16">
                    <rect x="10" y="30" width="60" height="42" rx="4" fill="#DBEAFE"/>
                    <rect x="22" y="15" width="36" height="55" rx="3" fill="#BFDBFE"/>
                    <rect x="28" y="35" width="10" height="10" rx="1.5" fill="#93C5FD"/>
                    <rect x="42" y="35" width="10" height="10" rx="1.5" fill="#93C5FD"/>
                    <rect x="28" y="50" width="10" height="10" rx="1.5" fill="#93C5FD"/>
                    <rect x="42" y="50" width="10" height="10" rx="1.5" fill="#93C5FD"/>
                    <rect x="32" y="62" width="16" height="10" rx="2" fill="#93C5FD"/>
                    <polygon points="22,16 40,4 58,16" fill="#EFF6FF"/>
                  </svg>
                </div>
                <div className="absolute -right-1 -bottom-1 w-7 h-7 bg-blue-100 rounded-full" />
                <div className="absolute -left-2 top-3 w-5 h-5 bg-blue-100 rounded-full" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-1">{t.noProperties}</h3>
              <p className="text-gray-400 text-sm mb-6">{t.noPropertiesDesc}</p>
              <Link href="/dashboard/owner/properties/new">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="w-5 h-5 me-2" />
                  {t.addNew}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Properties Grid */}
        {!isLoading && properties.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map((property: any) => (
              <Card
                key={property.id}
                className="hover:shadow-lg transition-shadow"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      {getBuildingTypeIcon(property.building_type)}
                      <CardTitle className="text-lg line-clamp-1">
                        {property.name}
                      </CardTitle>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mt-2">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {getBuildingTypeText(property.building_type)}
                    </span>
                    {property.units_count && (
                      <span className="text-xs text-gray-500">
                        {property.units_count} {t.units}
                      </span>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Address */}
                  <div className="flex items-start gap-2 text-sm text-gray-700">
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-gray-500" />
                    <div>
                      <p className="line-clamp-1">{property.address}</p>
                      <p className="text-gray-500 text-xs">{property.city}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-3 border-t">
                    <Link
                      href={`/dashboard/owner/properties/${property.id}/edit`}
                      className="flex-1"
                    >
                      <Button variant="outline" className="w-full" size="sm">
                        <Edit className="w-4 h-4 me-2" />
                        {t.edit}
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => setDeleteId(property.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {property.map_url && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(property.map_url, "_blank")}
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t.deleteTitle}</AlertDialogTitle>
              <AlertDialogDescription>{t.deleteDesc}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{t.cancel}</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => deleteId && deleteMutation.mutate(deleteId)}
                className="bg-red-600 hover:bg-red-700"
              >
                {t.confirmDelete}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </div>
  );
}
