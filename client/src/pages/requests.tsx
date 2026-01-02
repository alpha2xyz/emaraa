import { useState } from "react";
import { useLang } from "@/hooks/use-lang";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Plus, Building2, Calendar, Eye } from "lucide-react";
import { Link } from "wouter";

// بيانات تجريبية
const mockRequests = [
  {
    id: 1,
    propertyName: { ar: "فيلا الرياض", en: "Riyadh Villa" },
    services: [
      { ar: "تنظيف المداخل والممرات", en: "Entrance & Corridor Cleaning" },
      { ar: "فحص الميكانيك والكهرباء", en: "Mechanical & Electrical Inspection" }
    ],
    status: "pending",
    date: "2025-12-27",
  },
  {
    id: 2,
    propertyName: { ar: "عمارة سكنية", en: "Residential Building" },
    services: [
      { ar: "صيانة المولدات الاحتياطية", en: "Backup Generator Maintenance" }
    ],
    status: "in-progress",
    date: "2025-12-25",
  },
];

export default function Requests() {
  const { lang } = useLang();
  const [requests] = useState(mockRequests);

  const content = {
    ar: {
      title: "طلبات الخدمة",
      addNew: "طلب خدمة جديد",
      noRequests: "لا توجد طلبات",
      noRequestsDesc: "ابدأ بإنشاء طلب خدمة جديد",
      property: "العقار",
      services: "الخدمات",
      service: "خدمة",
      servicesCount: "خدمات",
      date: "التاريخ",
      status: "الحالة",
      viewDetails: "عرض التفاصيل",
      statuses: {
        pending: "قيد الانتظار",
        "in-progress": "جاري التنفيذ",
        completed: "مكتمل",
        cancelled: "ملغي",
      }
    },
    en: {
      title: "Service Requests",
      addNew: "New Service Request",
      noRequests: "No Requests Found",
      noRequestsDesc: "Start by creating a new service request",
      property: "Property",
      services: "Services",
      service: "Service",
      servicesCount: "Services",
      date: "Date",
      status: "Status",
      viewDetails: "View Details",
      statuses: {
        pending: "Pending",
        "in-progress": "In Progress",
        completed: "Completed",
        cancelled: "Cancelled",
      }
    }
  };

  const t = content[lang];

  const getStatusColor = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
      "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
      completed: "bg-green-100 text-green-800 border-green-300",
      cancelled: "bg-red-100 text-red-800 border-red-300",
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getServicesText = (count: number) => {
    return `${count} ${count === 1 ? t.service : t.servicesCount}`;
  };

  return (
    <div className="container mx-auto p-6" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <Link href="/requests/new">
          <Button size="lg">
            <Plus className={lang === 'ar' ? 'ml-2' : 'mr-2'} />
            {t.addNew}
          </Button>
        </Link>
      </div>

      {/* Requests List */}
      {requests.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t.noRequests}</h3>
            <p className="text-gray-600 mb-6">{t.noRequestsDesc}</p>
            <Link href="/requests/new">
              <Button>
                <Plus className={lang === 'ar' ? 'ml-2' : 'mr-2'} />
                {t.addNew}
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {requests.map((request) => (
            <Card key={request.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {t.property}: {request.propertyName[lang]}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                        <Calendar className="h-4 w-4" />
                        {request.date}
                      </div>
                    </div>
                  </div>
                  <Badge className={getStatusColor(request.status)}>
                    {t.statuses[request.status as keyof typeof t.statuses]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {/* Services */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-700">
                        {getServicesText(request.services.length)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {request.services.map((service, idx) => (
                        <Badge key={idx} variant="outline">
                          {service[lang]}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t">
                    <Button variant="outline" size="sm" className="w-full">
                      <Eye className={`h-4 w-4 ${lang === 'ar' ? 'ml-2' : 'mr-2'}`} />
                      {t.viewDetails}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
