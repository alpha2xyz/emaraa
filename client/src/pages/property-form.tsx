import { useState } from "react";
import { useLang } from "@/hooks/use-lang";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Building2,
  Home,
  Building,
  Store,
  ArrowLeft,
  Check,
} from "lucide-react";
import { useLocation } from "wouter";

const BUILDING_TYPES = [
  {
    id: "villa",
    icon: Home,
    color: "bg-blue-100 text-blue-600 border-blue-300",
  },
  {
    id: "apartment",
    icon: Building,
    color: "bg-green-100 text-green-600 border-green-300",
  },
  {
    id: "building",
    icon: Building2,
    color: "bg-purple-100 text-purple-600 border-purple-300",
  },
  {
    id: "commercial",
    icon: Store,
    color: "bg-orange-100 text-orange-600 border-orange-300",
  },
  {
    id: "mosque",
    icon: Building2,
    color: "bg-teal-100 text-teal-600 border-teal-300",
  },
  {
    id: "other",
    icon: Building2,
    color: "bg-gray-100 text-gray-600 border-gray-300",
  },
];

export default function PropertyForm() {
  const { lang } = useLang();
  const [, setLocation] = useLocation();
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "",
    otherType: "",
    floors: "1",
  });

  const content = {
    ar: {
      title: "إضافة عقار جديد",
      subtitle: "أضف تفاصيل العقار الخاص بك",
      nameLabel: "اسم العقار",
      namePlaceholder: "مثال: فيلا الرياض",
      addressLabel: "العنوان",
      addressPlaceholder: "الحي، المدينة",
      typeLabel: "نوع المبنى",
      otherTypeLabel: "حدد نوع المبنى",
      otherTypePlaceholder: "مثال: مدرسة، مستشفى...",
      floorsLabel: "عدد الطوابق",
      back: "رجوع",
      save: "حفظ العقار",
      types: {
        villa: "فيلا",
        apartment: "شقة",
        building: "عمارة سكنية",
        commercial: "تجاري",
        mosque: "مسجد",
        other: "أخرى",
      },
    },
    en: {
      title: "Add New Property",
      subtitle: "Enter your property details",
      nameLabel: "Property Name",
      namePlaceholder: "e.g., Riyadh Villa",
      addressLabel: "Address",
      addressPlaceholder: "District, City",
      typeLabel: "Building Type",
      otherTypeLabel: "Specify Building Type",
      otherTypePlaceholder: "e.g., School, Hospital...",
      floorsLabel: "Number of Floors",
      back: "Back",
      save: "Save Property",
      types: {
        villa: "Villa",
        apartment: "Apartment",
        building: "Residential Building",
        commercial: "Commercial",
        mosque: "Mosque",
        other: "Other",
      },
    },
  };

  const t = content[lang];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Send to backend
    console.log("Property data:", formData);
    setLocation("/properties");
  };

  return (
    <div
      className="container mx-auto p-6 max-w-3xl"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t.title}</CardTitle>
          <CardDescription>{t.subtitle}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Property Name */}
            <div className="space-y-2">
              <Label htmlFor="name">{t.nameLabel}</Label>
              <Input
                id="name"
                type="text"
                placeholder={t.namePlaceholder}
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">{t.addressLabel}</Label>
              <Input
                id="address"
                type="text"
                placeholder={t.addressPlaceholder}
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                required
              />
            </div>

            {/* Building Type */}
            <div className="space-y-3">
              <Label>{t.typeLabel}</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {BUILDING_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = formData.type === type.id;

                  return (
                    <div
                      key={type.id}
                      onClick={() =>
                        setFormData({ ...formData, type: type.id })
                      }
                      className={`
                        relative border-2 rounded-lg p-4 cursor-pointer transition-all
                        ${isSelected ? type.color + " border-2" : "border-gray-200 hover:border-gray-300"}
                      `}
                    >
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-primary text-white rounded-full p-1">
                          <Check className="h-3 w-3" />
                        </div>
                      )}
                      <div className="flex flex-col items-center gap-2">
                        <Icon className="h-8 w-8" />
                        <span className="text-sm font-medium text-center">
                          {t.types[type.id as keyof typeof t.types]}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Other Type (if selected) */}
            {formData.type === "other" && (
              <div className="space-y-2">
                <Label htmlFor="otherType">{t.otherTypeLabel}</Label>
                <Input
                  id="otherType"
                  type="text"
                  placeholder={t.otherTypePlaceholder}
                  value={formData.otherType}
                  onChange={(e) =>
                    setFormData({ ...formData, otherType: e.target.value })
                  }
                  required
                />
              </div>
            )}

            {/* Floors */}
            <div className="space-y-2">
              <Label htmlFor="floors">{t.floorsLabel}</Label>
              <Input
                id="floors"
                type="number"
                min="1"
                value={formData.floors}
                onChange={(e) =>
                  setFormData({ ...formData, floors: e.target.value })
                }
                required
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setLocation("/properties")}
                className="flex-1"
              >
                <ArrowLeft
                  className={`h-4 w-4 ${lang === "ar" ? "ml-2 rotate-180" : "mr-2"}`}
                />
                {t.back}
              </Button>
              <Button type="submit" className="flex-1">
                {t.save}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
