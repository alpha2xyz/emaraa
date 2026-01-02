import { useState, useMemo } from "react";
import { useLang } from "@/hooks/use-lang";
import {
  SERVICES,
  getServiceText,
  getServicesByCategory,
} from "@/data/services";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Building2 } from "lucide-react";
import { useLocation } from "wouter";

const mockProperties = [
  { id: 1, name: { ar: "فيلا الرياض", en: "Riyadh Villa" } },
  { id: 2, name: { ar: "عمارة سكنية", en: "Residential Building" } },
];

export default function RequestForm() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const [selectedProperty, setSelectedProperty] = useState<number | null>(null);

  const basicServiceIds = useMemo(() => {
    return SERVICES.filter((s) => s.tier === "basic").map((s) => s.id);
  }, []);

  const [selectedServices, setSelectedServices] =
    useState<string[]>(basicServiceIds);

  const maintenanceServices = getServicesByCategory("maintenance");
  const cleaningServices = getServicesByCategory("cleaning");

  const content = {
    ar: {
      title: "طلب خدمة جديد",
      subtitle: "اختر العقار والخدمات المطلوبة",
      selectProperty: "اختر العقار",
      selectServices: "اختر الخدمات",
      maintenance: "خدمات الصيانة",
      cleaning: "خدمات النظافة",
      selectedCount: "خدمة محددة",
      selectedCountPlural: "خدمات محددة",
      noProperty: "يرجى اختيار عقار أولاً",
      noServices: "يرجى اختيار خدمة واحدة على الأقل",
      back: "رجوع",
      submit: "إنشاء الطلب",
      basic: "أساسية",
      additional: "إضافية",
    },
    en: {
      title: "New Service Request",
      subtitle: "Select property and required services",
      selectProperty: "Select Property",
      selectServices: "Select Services",
      maintenance: "Maintenance Services",
      cleaning: "Cleaning Services",
      selectedCount: "Service Selected",
      selectedCountPlural: "Services Selected",
      noProperty: "Please select a property first",
      noServices: "Please select at least one service",
      back: "Back",
      submit: "Create Request",
      basic: "Basic",
      additional: "Additional",
    },
  };

  const t = content[lang];
  const isRTL = lang === "ar";

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) {
      alert(t.noProperty);
      return;
    }
    if (selectedServices.length === 0) {
      alert(t.noServices);
      return;
    }
    console.log("Request data:", {
      propertyId: selectedProperty,
      services: selectedServices,
    });
    setLocation("/requests");
  };

  const getSelectedText = (count: number) => {
    return `${count} ${count === 1 ? t.selectedCount : t.selectedCountPlural}`;
  };

  return (
    <div
      className="container mx-auto p-6 max-w-5xl"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <Card>
        <CardHeader>
          <CardTitle
            className="text-3xl font-bold"
            style={{ textAlign: isRTL ? "right" : "left" }}
          >
            {t.title}
          </CardTitle>
          <CardDescription
            className="text-base"
            style={{ textAlign: isRTL ? "right" : "left" }}
          >
            {t.subtitle}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Select Property */}
            <div className="space-y-3">
              <Label
                className="text-xl font-bold block"
                style={{ textAlign: isRTL ? "right" : "left" }}
              >
                {t.selectProperty}
              </Label>
              <div className="grid md:grid-cols-2 gap-3">
                {mockProperties.map((property) => {
                  const isSelected = selectedProperty === property.id;
                  return (
                    <button
                      key={property.id}
                      type="button"
                      onClick={() => setSelectedProperty(property.id)}
                      className={`
                        border-2 rounded-lg p-4 transition-all
                        ${isSelected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}
                      `}
                      style={{ textAlign: isRTL ? "right" : "left" }}
                    >
                      <div
                        className={`flex items-center gap-3 ${isRTL ? "flex-row-reverse" : ""}`}
                      >
                        <Building2 className="h-5 w-5" />
                        <span className="font-semibold">
                          {property.name[lang]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Select Services */}
            <div className="space-y-4">
              <Label
                className="text-xl font-bold block"
                style={{ textAlign: isRTL ? "right" : "left" }}
              >
                {t.selectServices}
              </Label>

              {/* Cleaning Services - الآن أولاً */}
              <Card>
                <CardHeader>
                  <CardTitle
                    className={`text-xl font-bold flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <span>🧹</span>
                    <span>{t.cleaning}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {cleaningServices.map((service) => {
                      const text = getServiceText(service, lang);
                      const isSelected = selectedServices.includes(service.id);

                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleService(service.id)}
                          className={`
                            border rounded-lg p-3 transition-all
                            ${isSelected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}
                          `}
                          style={{ textAlign: isRTL ? "right" : "left" }}
                        >
                          <div
                            className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                          >
                            <div
                              className={`
                              w-5 h-5 border-2 rounded flex items-center justify-center shrink-0 mt-0.5
                              ${isSelected ? "bg-primary border-primary" : "border-gray-300"}
                            `}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm">{text.name}</p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {text.description}
                              </p>
                              <div
                                className={`flex gap-2 mt-2 flex-wrap ${isRTL ? "justify-end" : "justify-start"}`}
                              >
                                <Badge
                                  variant="outline"
                                  className="text-xs font-semibold"
                                >
                                  {text.scope}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-semibold"
                                >
                                  {service.tier === "basic"
                                    ? t.basic
                                    : t.additional}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Maintenance Services - الآن ثانياً */}
              <Card>
                <CardHeader>
                  <CardTitle
                    className={`text-xl font-bold flex items-center gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                  >
                    <span>🔧</span>
                    <span>{t.maintenance}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {maintenanceServices.map((service) => {
                      const text = getServiceText(service, lang);
                      const isSelected = selectedServices.includes(service.id);

                      return (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => toggleService(service.id)}
                          className={`
                            border rounded-lg p-3 transition-all
                            ${isSelected ? "border-primary bg-primary/5" : "border-gray-200 hover:border-gray-300"}
                          `}
                          style={{ textAlign: isRTL ? "right" : "left" }}
                        >
                          <div
                            className={`flex items-start gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
                          >
                            <div
                              className={`
                              w-5 h-5 border-2 rounded flex items-center justify-center shrink-0 mt-0.5
                              ${isSelected ? "bg-primary border-primary" : "border-gray-300"}
                            `}
                            >
                              {isSelected && (
                                <Check className="h-3 w-3 text-white" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-bold text-sm">{text.name}</p>
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {text.description}
                              </p>
                              <div
                                className={`flex gap-2 mt-2 flex-wrap ${isRTL ? "justify-end" : "justify-start"}`}
                              >
                                <Badge
                                  variant="outline"
                                  className="text-xs font-semibold"
                                >
                                  {text.scope}
                                </Badge>
                                <Badge
                                  variant="secondary"
                                  className="text-xs font-semibold"
                                >
                                  {service.tier === "basic"
                                    ? t.basic
                                    : t.additional}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary & Actions */}
            <div
              className={`flex items-center justify-between pt-4 border-t ${isRTL ? "flex-row-reverse" : ""}`}
            >
              <p className="text-sm font-semibold text-gray-700">
                {getSelectedText(selectedServices.length)}
              </p>
              <div className={`flex gap-3 ${isRTL ? "flex-row-reverse" : ""}`}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setLocation("/requests")}
                >
                  <ArrowLeft
                    className={`h-4 w-4 ${isRTL ? "ml-2 rotate-180" : "mr-2"}`}
                  />
                  {t.back}
                </Button>
                <Button
                  type="submit"
                  disabled={!selectedProperty || selectedServices.length === 0}
                >
                  {t.submit}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
