import { useState } from "react";
import { useLang } from "@/hooks/use-lang";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, MapPin, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "wouter";

// بيانات تجريبية
const mockProperties = [
  {
    id: 1,
    name: { ar: "فيلا المروج", en: "Al-Muroj Villa" },
    address: { ar: "حي النسيم، الرياض", en: "Al Nakheel, Riyadh" },
    type: "villa",
    floors: 2,
    images: 3,
  },
  {
    id: 2,
    name: { ar: "عمارة سكنية", en: "Residential Building" },
    address: { ar: "حي الملقا، الرياض", en: "Al Malqa, Riyadh" },
    type: "apartment",
    floors: 5,
    images: 8,
  },
];

export default function Properties() {
  const { lang } = useLang();
  const [properties] = useState(mockProperties);

  const content = {
    ar: {
      title: "عقاراتي",
      addNew: "إضافة عقار جديد",
      noProperties: "لا توجد عقارات مسجلة",
      noPropertiesDesc: "ابدأ بإضافة عقارك الأول",
      floors: "طابق",
      floorsPlural: "طوابق",
      images: "صورة",
      imagesPlural: "صور",
      edit: "تعديل",
      delete: "حذف",
      types: {
        villa: "فيلا",
        apartment: "شقة",
        building: "عمارة",
        commercial: "تجاري",
        mosque: "مسجد",
        other: "أخرى",
      },
    },
    en: {
      title: "My Properties",
      addNew: "Add New Property",
      noProperties: "No Properties Found",
      noPropertiesDesc: "Start by adding your first property",
      floors: "Floor",
      floorsPlural: "Floors",
      images: "Image",
      imagesPlural: "Images",
      edit: "Edit",
      delete: "Delete",
      types: {
        villa: "Villa",
        apartment: "Apartment",
        building: "Building",
        commercial: "Commercial",
        mosque: "Mosque",
        other: "Other",
      },
    },
  };

  const t = content[lang];

  const getFloorText = (count: number) => {
    return `${count} ${count === 1 ? t.floors : t.floorsPlural}`;
  };

  const getImageText = (count: number) => {
    return `${count} ${count === 1 ? t.images : t.imagesPlural}`;
  };

  return (
    <div className="container mx-auto p-6" dir={lang === "ar" ? "rtl" : "ltr"}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">{t.title}</h1>
        <Link href="/properties/new">
          <Button size="lg">
            <Plus className={lang === "ar" ? "ml-2" : "mr-2"} />
            {t.addNew}
          </Button>
        </Link>
      </div>

      {/* Properties Grid */}
      {properties.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Building2 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold mb-2">{t.noProperties}</h3>
            <p className="text-gray-600 mb-6">{t.noPropertiesDesc}</p>
            <Link href="/properties/new">
              <Button>
                <Plus className={lang === "ar" ? "ml-2" : "mr-2"} />
                {t.addNew}
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <Card
              key={property.id}
              className="hover:shadow-lg transition-shadow"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-primary" />
                    <CardTitle className="text-xl">
                      {property.name[lang]}
                    </CardTitle>
                  </div>
                  <Badge variant="secondary">
                    {t.types[property.type as keyof typeof t.types]}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Address */}
                  <div className="flex items-start gap-2 text-gray-600">
                    <MapPin className="h-4 w-4 mt-1 shrink-0" />
                    <span className="text-sm">{property.address[lang]}</span>
                  </div>

                  {/* Details */}
                  <div className="flex gap-4 text-sm text-gray-600">
                    <span>🏢 {getFloorText(property.floors)}</span>
                    <span>📷 {getImageText(property.images)}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Edit
                        className={`h-4 w-4 ${lang === "ar" ? "ml-2" : "mr-2"}`}
                      />
                      {t.edit}
                    </Button>
                    <Button variant="destructive" size="sm" className="flex-1">
                      <Trash2
                        className={`h-4 w-4 ${lang === "ar" ? "ml-2" : "mr-2"}`}
                      />
                      {t.delete}
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
