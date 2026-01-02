import { useState } from "react";
import { useLang } from "@/hooks/use-lang";
import { SERVICES, getServiceText, getServicesByCategory } from "@/data/services";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function NewRequestPage() {
  const { lang, t } = useLang();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  // احصل على خدمات الصيانة والنظافة
  const maintenanceServices = getServicesByCategory('maintenance');
  const cleaningServices = getServicesByCategory('cleaning');

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev => 
      prev.includes(serviceId) 
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">
        {lang === 'ar' ? 'إنشاء طلب خدمة جديد' : 'Create New Service Request'}
      </h1>

      {/* قسم خدمات الصيانة */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 {lang === 'ar' ? 'خدمات الصيانة' : 'Maintenance Services'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {maintenanceServices.map(service => {
              const text = getServiceText(service, lang);
              const isSelected = selectedServices.includes(service.id);

              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{text.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{text.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{text.scope}</Badge>
                        <Badge variant="secondary">
                          {service.tier === 'basic' 
                            ? (lang === 'ar' ? 'أساسية' : 'Basic')
                            : (lang === 'ar' ? 'إضافية' : 'Additional')
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* قسم خدمات النظافة */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧹 {lang === 'ar' ? 'خدمات النظافة' : 'Cleaning Services'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cleaningServices.map(service => {
              const text = getServiceText(service, lang);
              const isSelected = selectedServices.includes(service.id);

              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all
                    ${isSelected ? 'border-primary bg-primary/5' : 'border-gray-200 hover:border-primary/50'}
                  `}
                >
                  <div className="flex items-start gap-3">
                    <Checkbox 
                      checked={isSelected}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{text.name}</h3>
                      <p className="text-sm text-gray-600 mb-2">{text.description}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline">{text.scope}</Badge>
                        <Badge variant="secondary">
                          {service.tier === 'basic' 
                            ? (lang === 'ar' ? 'أساسية' : 'Basic')
                            : (lang === 'ar' ? 'إضافية' : 'Additional')
                          }
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* زر الإرسال */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-gray-600">
          {lang === 'ar' 
            ? `تم اختيار ${selectedServices.length} خدمة`
            : `${selectedServices.length} services selected`
          }
        </p>
        <Button 
          size="lg"
          disabled={selectedServices.length === 0}
        >
          {lang === 'ar' ? 'إنشاء الطلب' : 'Create Request'}
        </Button>
      </div>
    </div>
  );
}
