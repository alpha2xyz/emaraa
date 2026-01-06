import { Home, Building, Building2, Church, HelpCircle } from "lucide-react";

export type PropertyType = {
  id: string;
  name: {
    ar: string;
    en: string;
  };
  IconComponent: any;
};

export const PROPERTY_TYPES: PropertyType[] = [
  {
    id: "residential_building",
    name: {
      ar: "عِمارة سكنية",
      en: "Residential Building",
    },
    IconComponent: Building2,
  },
  {
    id: "villa",
    name: {
      ar: "فيلا",
      en: "Villa",
    },
    IconComponent: Home,
  },
  {
    id: "commercial_building",
    name: {
      ar: "عِمارة تجارية",
      en: "Commercial Building",
    },
    IconComponent: Building,
  },
  {
    id: "mosque",
    name: {
      ar: "مسجد",
      en: "Mosque",
    },
    IconComponent: Church,
  },
  {
    id: "other",
    name: {
      ar: "أخرى",
      en: "Other",
    },
    IconComponent: HelpCircle,
  },
];

export const getPropertyTypeName = (
  typeId: string,
  lang: "ar" | "en",
): string => {
  const type = PROPERTY_TYPES.find((t) => t.id === typeId);
  return type ? type.name[lang] : typeId;
};

export const getPropertyTypeIcon = (typeId: string) => {
  const type = PROPERTY_TYPES.find((t) => t.id === typeId);
  return type ? type.IconComponent : HelpCircle;
};
