export interface Service {
  id: string;
  category: "cleaning" | "maintenance";
  name: { ar: string; en: string };
  description: { ar: string; en: string };
}

export const SERVICES: Service[] = [
  {
    id: "cleaning-regular",
    category: "cleaning",
    name: { ar: "تنظيف دوري", en: "Regular Cleaning" },
    description: { ar: "تنظيف شامل لجميع أرجاء المنزل بشكل دوري", en: "Comprehensive periodic cleaning of all areas" },
  },
  {
    id: "cleaning-deep",
    category: "cleaning",
    name: { ar: "تنظيف عميق", en: "Deep Cleaning" },
    description: { ar: "تنظيف مكثف وشامل يشمل جميع التفاصيل", en: "Intensive and thorough cleaning including all details" },
  },
  {
    id: "cleaning-windows",
    category: "cleaning",
    name: { ar: "تنظيف النوافذ", en: "Window Cleaning" },
    description: { ar: "تنظيف النوافذ والزجاج من الداخل والخارج", en: "Cleaning windows and glass from inside and outside" },
  },
  {
    id: "cleaning-carpet",
    category: "cleaning",
    name: { ar: "تنظيف السجاد", en: "Carpet Cleaning" },
    description: { ar: "تنظيف وتعقيم السجاد والموكيت", en: "Cleaning and sterilizing carpets and rugs" },
  },
  {
    id: "maintenance-plumbing",
    category: "maintenance",
    name: { ar: "أعمال السباكة", en: "Plumbing" },
    description: { ar: "إصلاح وصيانة أنظمة المياه والصرف", en: "Repair and maintenance of water and drainage systems" },
  },
  {
    id: "maintenance-electrical",
    category: "maintenance",
    name: { ar: "أعمال الكهرباء", en: "Electrical Work" },
    description: { ar: "إصلاح وصيانة الأنظمة الكهربائية", en: "Repair and maintenance of electrical systems" },
  },
  {
    id: "maintenance-ac",
    category: "maintenance",
    name: { ar: "صيانة المكيفات", en: "AC Maintenance" },
    description: { ar: "فحص وصيانة وإصلاح أجهزة التكييف", en: "Inspection, maintenance, and repair of air conditioning units" },
  },
  {
    id: "maintenance-painting",
    category: "maintenance",
    name: { ar: "أعمال الدهانات", en: "Painting" },
    description: { ar: "دهان وطلاء الجدران والأسقف", en: "Painting and coating walls and ceilings" },
  },
];

export function getServicesByCategory(category: string): Service[] {
  return SERVICES.filter((service) => service.category === category);
}

export async function getServices(): Promise<Service[]> {
  return SERVICES;
}

export async function getServiceById(id: string): Promise<Service | undefined> {
  return SERVICES.find((service) => service.id === id);
}
