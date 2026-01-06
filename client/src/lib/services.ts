export type ServiceTier = "basic" | "additional";
export type ServiceCategory = "cleaning" | "maintenance";
export type ServiceScope =
  | "daily"
  | "weekly"
  | "monthly"
  | "quarterly"
  | "semi-annual"
  | "annual";

export interface Service {
  id: string;
  category: ServiceCategory;
  tier: ServiceTier;
  name: {
    ar: string;
    en: string;
  };
  description: {
    ar: string;
    en: string;
  };
  scope: {
    ar: string;
    en: string;
  };
}

export const SERVICES: Service[] = [
  // ===== خدمات النظافة - أساسية =====
  {
    id: "clean-1",
    category: "cleaning",
    tier: "basic",
    name: {
      ar: "تنظيف المداخل والممرات",
      en: "Entrance & Corridor Cleaning",
    },
    description: {
      ar: "إزالة الأتربة والمخلفات ومسح الأرضيات لضمان مسارات نظيفة وآمنة.",
      en: "Remove dust and debris, mop floors to ensure clean and safe pathways.",
    },
    scope: {
      ar: "يومي",
      en: "Daily",
    },
  },
  {
    id: "clean-2",
    category: "cleaning",
    tier: "basic",
    name: {
      ar: "تنظيف الجدران والأسقف بالمناطق المشتركة",
      en: "Wall & Ceiling Cleaning in Common Areas",
    },
    description: {
      ar: "مسح الجدران والأبواب والحفاظ على المظهر العام.",
      en: "Wipe walls and doors to maintain overall appearance.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "clean-3",
    category: "cleaning",
    tier: "basic",
    name: {
      ar: "تنظيف الطرق الخارجية العامة",
      en: "Public Exterior Road Cleaning",
    },
    description: {
      ar: "تنظيف وصيانة الممرات والطرق الخارجية المحيطة بالمبنى.",
      en: "Clean and maintain pathways and exterior roads around the building.",
    },
    scope: {
      ar: "يومي",
      en: "Daily",
    },
  },
  {
    id: "clean-4",
    category: "cleaning",
    tier: "basic",
    name: {
      ar: "تنظيف المصاعد",
      en: "Elevator Cleaning",
    },
    description: {
      ar: "مسح الكابين والواجهات المعدنية وتنظيف نقاط اللمس.",
      en: "Wipe cabins, metal surfaces, and clean touchpoints.",
    },
    scope: {
      ar: "يومي",
      en: "Daily",
    },
  },
  {
    id: "clean-5",
    category: "cleaning",
    tier: "basic",
    name: {
      ar: "تنظيف الوحدات والأبراج والمناطق المشتركة",
      en: "Unit, Tower & Common Area Cleaning",
    },
    description: {
      ar: "إزالة الأتربة والإهتمام بمظهر العقار ككل.",
      en: "Remove dust and maintain overall property appearance.",
    },
    scope: {
      ar: "يومي",
      en: "Daily",
    },
  },
  {
    id: "clean-6",
    category: "cleaning",
    tier: "basic",
    name: {
      ar: "جمع ونقل النفايات من المناطق المشتركة",
      en: "Waste Collection from Common Areas",
    },
    description: {
      ar: "تفريغ الحاويات وتنسيق الأكياس والتخلص الآمن.",
      en: "Empty bins, organize bags, and ensure safe disposal.",
    },
    scope: {
      ar: "يومي",
      en: "Daily",
    },
  },
  {
    id: "clean-7",
    category: "cleaning",
    tier: "basic",
    name: {
      ar: "تنظيف دورات المياه",
      en: "Restroom Cleaning",
    },
    description: {
      ar: "غسل الواجهات الزجاجية/الرخامية/البلاستيكية والحفاظ على النظافة.",
      en: "Clean glass/marble/plastic surfaces and maintain hygiene.",
    },
    scope: {
      ar: "ربع سنوي / سنوي",
      en: "Quarterly / Annual",
    },
  },
  {
    id: "clean-8",
    category: "cleaning",
    tier: "basic",
    name: {
      ar: "تنظيف وتجديد الإضاءة والأبراج بالمناطق المشتركة",
      en: "Lighting & Tower Cleaning in Common Areas",
    },
    description: {
      ar: "تنظيف المصابيح والأبراج ومواقع الإضاءة.",
      en: "Clean lamps, towers, and lighting fixtures.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "clean-9",
    category: "cleaning",
    tier: "basic",
    name: {
      ar: "تنظيف المواقف والسطح وسطح السطح",
      en: "Parking, Roof & Surface Cleaning",
    },
    description: {
      ar: "كنس وغسيل الأرضيات وإزالة بقع الزيوت.",
      en: "Sweep and wash floors, remove oil stains.",
    },
    scope: {
      ar: "أسبوعي",
      en: "Weekly",
    },
  },

  // ===== خدمات النظافة - إضافية =====
  {
    id: "clean-add-1",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف وتجديد التكييفات الخارجية",
      en: "External AC Unit Cleaning",
    },
    description: {
      ar: "إزالة الأتربة من الوحدات الخارجية والمكيفات الجدارية وغيرها.",
      en: "Remove dust from external units and wall-mounted ACs.",
    },
    scope: {
      ar: "ربع سنوي / سنوي",
      en: "Quarterly / Annual",
    },
  },
  {
    id: "clean-add-2",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف المكتبات الخارجية وأماكن الجلوس",
      en: "External Furniture & Seating Area Cleaning",
    },
    description: {
      ar: "غسل الطاولات والكراسي في المناطق الخارجية.",
      en: "Wash tables and chairs in outdoor areas.",
    },
    scope: {
      ar: "سنوي",
      en: "Annual",
    },
  },
  {
    id: "clean-add-3",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف المسابح",
      en: "Pool Cleaning",
    },
    description: {
      ar: "إزالة الأوراق الطافية وتنظيف الجوانب وحافة المياه.",
      en: "Remove floating debris, clean sides and water edges.",
    },
    scope: {
      ar: "يومي",
      en: "Daily",
    },
  },
  {
    id: "clean-add-4",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف واجهات النوافذ والمسطحات الخارجية",
      en: "Window & Exterior Surface Cleaning",
    },
    description: {
      ar: "غسل النوافذ الزجاجية والواجهات الخارجية بأمان.",
      en: "Safely wash glass windows and exterior facades.",
    },
    scope: {
      ar: "يومي",
      en: "Daily",
    },
  },
  {
    id: "clean-add-5",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف الوحدات الإضاءية والتكييفات الخارجية",
      en: "Lighting & External AC Cleaning",
    },
    description: {
      ar: "تنظيف المصابيح والشبكات لتحسين جودة الهواء.",
      en: "Clean lamps and grilles to improve air quality.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "clean-add-6",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "صب سنود تنظيف الأنظمة الفنية والمحاري القابلة للمناطق المُرجَفة",
      en: "Specialized Technical System Cleaning",
    },
    description: {
      ar: "تنظيف غرف الكهرباء والميكانيكية.",
      en: "Clean electrical and mechanical rooms.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "clean-add-7",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف غرف التخزين والاتصالات",
      en: "Storage & Communication Room Cleaning",
    },
    description: {
      ar: "تنظيف غرف الكهرباء والاتصالات.",
      en: "Clean electrical and communication rooms.",
    },
    scope: {
      ar: "أسبوعي",
      en: "Weekly",
    },
  },
  {
    id: "clean-add-8",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف الأسطح الداخلية والطرق الداخلية",
      en: "Interior Surface & Road Cleaning",
    },
    description: {
      ar: "كنس وغسيل الممرات الداخلية والمناطق الخرسانية.",
      en: "Sweep and wash interior pathways and concrete areas.",
    },
    scope: {
      ar: "أسبوعي",
      en: "Weekly",
    },
  },
  {
    id: "clean-add-9",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف البرادات والمعدات الثابتة",
      en: "Cooler & Fixed Equipment Cleaning",
    },
    description: {
      ar: "تنظيف مُكيّفات ومعدات التبريد الثابتة.",
      en: "Clean fixed air conditioning and cooling equipment.",
    },
    scope: {
      ar: "سنوي",
      en: "Annual",
    },
  },
  {
    id: "clean-add-10",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف خزانات التخزين والمستودعات",
      en: "Tank & Storage Facility Cleaning",
    },
    description: {
      ar: "تنظيف خزانات المياه والمستودعات.",
      en: "Clean water tanks and storage facilities.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "clean-add-11",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "مكافحة الحشرات والقوارض",
      en: "Pest & Rodent Control",
    },
    description: {
      ar: "تطبيق المبيدات والمناوبة والتخلص منها.",
      en: "Apply pesticides, patrol, and eliminate pests.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "clean-add-12",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تشميع الأرضيات",
      en: "Floor Waxing",
    },
    description: {
      ar: "تلميع وتشميع أرضية الأحجار.",
      en: "Polish and wax stone floors.",
    },
    scope: {
      ar: "ربع سنوي / سنوي",
      en: "Quarterly / Annual",
    },
  },
  {
    id: "clean-add-13",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف مواقف السيارات",
      en: "Parking Lot Cleaning",
    },
    description: {
      ar: "غسل مكثف وإزالة بقع الزيوت وتنظيف العلامات الأرضية.",
      en: "Deep wash, remove oil stains, and clean floor markings.",
    },
    scope: {
      ar: "أسبوعي",
      en: "Weekly",
    },
  },
  {
    id: "clean-add-14",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف الحدائق",
      en: "Garden Cleaning",
    },
    description: {
      ar: "تنظيف الأوراق والمحافظة على ترتيب النباتات.",
      en: "Remove leaves and maintain plant arrangement.",
    },
    scope: {
      ar: "يومي",
      en: "Daily",
    },
  },
  {
    id: "clean-add-15",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف خزان المياه",
      en: "Water Tank Cleaning",
    },
    description: {
      ar: "تنظيف دقيق مختصر الغبار حول المعدات الحساسية.",
      en: "Detailed cleaning to remove dust around sensitive equipment.",
    },
    scope: {
      ar: "سنوي",
      en: "Annual",
    },
  },
  {
    id: "clean-add-16",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف فتحات تصريف مياه الأمطار",
      en: "Rainwater Drain Cleaning",
    },
    description: {
      ar: "إزالة الانسداد والأوراق والمخلفات لضمان التصريف الجيد لمياه الأمطار والمجاري الصحي.",
      en: "Remove blockage, leaves, and debris to ensure proper rainwater and sewage drainage.",
    },
    scope: {
      ar: "ربع سنوي / سنوي",
      en: "Quarterly / Annual",
    },
  },
  {
    id: "clean-add-17",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف الألواح الشمسية (PV)",
      en: "Solar Panel (PV) Cleaning",
    },
    description: {
      ar: "إزالة الغبار والأوساخ لتحسين إنتاجية الطاقة الشمسي.",
      en: "Remove dust and dirt to improve solar energy production.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "clean-add-18",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "صيانة الحدائق",
      en: "Garden Maintenance",
    },
    description: {
      ar: "الاعتناء بمناطق الأشجار وإعادة تدوير السماد للحفاظ على جودة التربة.",
      en: "Clean and take care of tree areas, recycle compost to maintain sand quality.",
    },
    scope: {
      ar: "يومي",
      en: "Daily",
    },
  },

  {
    id: "clean-add-19",
    category: "cleaning",
    tier: "additional",
    name: {
      ar: "تنظيف دورات المياه العامة",
      en: "Public Restroom Cleaning",
    },
    description: {
      ar: "تعقيم الأسطح وإعادة تعبئة المستهلكات لضمان النظافة الصحية.",
      en: "Sanitize surfaces and refill supplies to ensure sanitary cleanliness.",
    },
    scope: {
      ar: "يومي",
      en: "Daily",
    },
  },

  // ===== خدمات الصيانة - أساسية =====
  {
    id: "maint-1",
    category: "maintenance",
    tier: "basic",
    name: {
      ar: "صيانة المصاعد",
      en: "Elevator Maintenance",
    },
    description: {
      ar: "فحص الميكانيكا والكهرباء ومراقبة الأداء ومعايرة الأبواب والأجهزة السلامة.",
      en: "Inspect mechanics and electrical, monitor performance, calibrate doors and safety devices.",
    },
    scope: {
      ar: "شهري / سنوي",
      en: "Monthly / Annual",
    },
  },
  {
    id: "maint-2",
    category: "maintenance",
    tier: "basic",
    name: {
      ar: "صيانة أنظمة التكييف بالمناطق المشتركة",
      en: "AC System Maintenance in Common Areas",
    },
    description: {
      ar: "تنظيف الفلاتر وفحص الشحن وإصلاح الأعطال المحولة.",
      en: "Clean filters, check charge, and repair referred issues.",
    },
    scope: {
      ar: "شهري / ربع سنوي / سنوي",
      en: "Monthly / Quarterly / Annual",
    },
  },
  {
    id: "maint-3",
    category: "maintenance",
    tier: "basic",
    name: {
      ar: "صيانة ممتلكات المبنى (بوابات/خزانات/حواجز)",
      en: "Building Property Maintenance (Gates/Tanks/Barriers)",
    },
    description: {
      ar: "دهان وإصلاح وطلاء الأنابيب والخزانات وصيانة البوابات الأوتوماتيكية.",
      en: "Paint, repair, and coat pipes and tanks; maintain automatic gates.",
    },
    scope: {
      ar: "ربع سنوي / سنوي",
      en: "Quarterly / Annual",
    },
  },
  {
    id: "maint-4",
    category: "maintenance",
    tier: "basic",
    name: {
      ar: "صيانة إنارة الكهرباء الرئيسية والفرعية",
      en: "Main & Secondary Electrical Lighting Maintenance",
    },
    description: {
      ar: "تبديل اللمبات وفحص الجدارات والإشارات الخارجية.",
      en: "Replace bulbs, inspect wall lights and exterior signals.",
    },
    scope: {
      ar: "شهري / سنوي",
      en: "Monthly / Annual",
    },
  },
  {
    id: "maint-5",
    category: "maintenance",
    tier: "basic",
    name: {
      ar: "صيانة الأبواب بالمناطق المشتركة",
      en: "Door Maintenance in Common Areas",
    },
    description: {
      ar: "شد ا �براغيم وتحديث واصلاح الحشو ودهان الأسطح التالفة والبوابات.",
      en: "Tighten screws, update and repair seals, paint damaged surfaces and gates.",
    },
    scope: {
      ar: "ربع سنوي / سنوي",
      en: "Quarterly / Annual",
    },
  },
  {
    id: "maint-6",
    category: "maintenance",
    tier: "basic",
    name: {
      ar: "صيانة نظام إطفاء وإنذار ومكافحة الحريق",
      en: "Fire Alarm & Suppression System Maintenance",
    },
    description: {
      ar: "اختبار الحساسات والأبواب والمشتكات والإنارات والمراوح.",
      en: "Test sensors, doors, sprinklers, lights, and fans.",
    },
    scope: {
      ar: "ربع سنوي / سنوي",
      en: "Quarterly / Annual",
    },
  },
  {
    id: "maint-7",
    category: "maintenance",
    tier: "basic",
    name: {
      ar: "صيانة نظام السباكة (شبكات المياه والصرف)",
      en: "Plumbing System Maintenance (Water & Drainage)",
    },
    description: {
      ar: "معالجة التسربات وفحص الاستهلاك وتنظيف معدات الصرف.",
      en: "Fix leaks, inspect consumption, and clean drainage equipment.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "maint-8",
    category: "maintenance",
    tier: "basic",
    name: {
      ar: "صيانة خزانات المياه الأرضية والعليا",
      en: "Ground & Elevated Water Tank Maintenance",
    },
    description: {
      ar: "تنظيف تجويف ومعالجة جدران ومكافحة الرواسب وتحديث المرشحات.",
      en: "Clean interior, treat walls, prevent deposits, and update filters.",
    },
    scope: {
      ar: "أسبوعي / شهري",
      en: "Weekly / Monthly",
    },
  },
  {
    id: "maint-9",
    category: "maintenance",
    tier: "basic",
    name: {
      ar: "صيانة مولدات الكهرباء الاحتياطية",
      en: "Backup Generator Maintenance",
    },
    description: {
      ar: "تفقد محرك ومراقبة الإنذارات ومضخة المياه التبريد وتحديث الوجهات.",
      en: "Check motor, monitor alarms, cooling water pump, and update components.",
    },
    scope: {
      ar: "ربع سنوي / سنوي",
      en: "Quarterly / Annual",
    },
  },
  {
    id: "maint-10",
    category: "maintenance",
    tier: "basic",
    name: {
      ar: "صيانة نظام الأمن (CCTV، دخول، تحكم)",
      en: "Security System Maintenance (CCTV, Access, Control)",
    },
    description: {
      ar: "فحص الكاميرات والتخزين بالأجهزة الأمنية والواجهات.",
      en: "Inspect cameras, storage on security devices, and interfaces.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "maint-11",
    category: "maintenance",
    tier: "basic",
    name: {
      ar: "صيانة نظام إدارة المباني (BMS)",
      en: "Building Management System (BMS) Maintenance",
    },
    description: {
      ar: "مراقبة الإنذارات وضبط المواصر وتحديث الوجهات.",
      en: "Monitor alarms, calibrate parameters, and update components.",
    },
    scope: {
      ar: "ربع سنوي / سنوي",
      en: "Quarterly / Annual",
    },
  },
  {
    id: "maint-12",
    category: "maintenance",
    tier: "basic",
    name: {
      ar: "صيانة نظام الوصول والبوابات",
      en: "Access & Gate System Maintenance",
    },
    description: {
      ar: "فحص المكونات والتخزين بالأجهزة الأمنية والواجهات.",
      en: "Inspect components, storage on security devices, and interfaces.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "maint-13",
    category: "maintenance",
    tier: "basic",
    name: {
      ar: "صيانة نظام التبريد والحماية من الصواعق",
      en: "Cooling & Lightning Protection System Maintenance",
    },
    description: {
      ar: "فحص مقاومة التأريض وتحديث الموصلات والحم.",
      en: "Check grounding resistance and update conductors and connections.",
    },
    scope: {
      ar: "سنوي",
      en: "Annual",
    },
  },

  // ===== خدمات الصيانة - إضافية =====
  {
    id: "maint-add-1",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "معاينة حساسات وأنظمة قياس",
      en: "Sensor & Measurement System Inspection",
    },
    description: {
      ar: "ضبط القياسات لتجرية المضخط والتدفق والحرارة وقياسها.",
      en: "Calibrate measurements for pressure, flow, temperature gauging.",
    },
    scope: {
      ar: "ربع سنوي / سنوي",
      en: "Quarterly / Annual",
    },
  },
  {
    id: "maint-add-2",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "اختيار المواد تحت حمل كامل",
      en: "Full Load Material Testing",
    },
    description: {
      ar: "إجراء اختبارات الحمل على المعدات الكهربائية.",
      en: "Conduct load tests on electrical equipment.",
    },
    scope: {
      ar: "سنوي",
      en: "Annual",
    },
  },
  {
    id: "maint-add-3",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "تنظيف وصيانة المسابح (ملعات الفلتر والكيماويات)",
      en: "Pool Cleaning & Maintenance (Filter & Chemicals)",
    },
    description: {
      ar: "صيانة الفلاتر وضبط نسبة الكلور وإيوان والمساحي الكيماوي.",
      en: "Maintain filters, adjust chlorine levels, and chemical balance.",
    },
    scope: {
      ar: "أسبوعي / شهري",
      en: "Weekly / Monthly",
    },
  },
  {
    id: "maint-add-4",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "صيانة الحدائق ومعدات الري",
      en: "Garden & Irrigation Equipment Maintenance",
    },
    description: {
      ar: "إزالة السنوات والتأثير بالنباتات الجافة وصيانة الأرض وضح المياه.",
      en: "Remove weeds, trim dry plants, maintain ground and water pressure.",
    },
    scope: {
      ar: "أسبوعي / شهري",
      en: "Weekly / Monthly",
    },
  },
  {
    id: "maint-add-5",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "صيانة الوحدات الإذاعية والكابلات الخارجية",
      en: "Broadcasting Unit & External Cable Maintenance",
    },
    description: {
      ar: "تنظيف المعدات والتكييفات لتحسين جودة الهواء.",
      en: "Clean equipment and air conditioning to improve air quality.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "maint-add-6",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "صيانة غرف الحراس (RCD، بشبكات تبريد دفيق)",
      en: "Guard Room Maintenance (RCD, Fine Cooling Networks)",
    },
    description: {
      ar: "تنظيف المعدات والبطاريات وفحص الكربون المجهد والمزدوج CO وكواشف الدخان.",
      en: "Clean equipment and batteries, check carbon monoxide detectors and smoke alarms.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "maint-add-7",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "صيانة غرف النقوش (Manholes) والمجاري الأرضية",
      en: "Manhole & Ground Drainage Maintenance",
    },
    description: {
      ar: "رفع الردوبيات وفحص الأنظمة والوصلات لمنع التسرب.",
      en: "Remove sediments, inspect systems and connections to prevent leaks.",
    },
    scope: {
      ar: "نصف سنوي / سنوي",
      en: "Semi-Annual / Annual",
    },
  },
  {
    id: "maint-add-8",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "صيانة نظام الطاقة الشمسية (PV)",
      en: "Solar Power System (PV) Maintenance",
    },
    description: {
      ar: "فحص المواطير وتنصيب الملحقات ووحدة تنظيف الألواح.",
      en: "Inspect inverters, install accessories, and panel cleaning unit.",
    },
    scope: {
      ar: "ربع سنوي / سنوي",
      en: "Quarterly / Annual",
    },
  },
  {
    id: "maint-add-9",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "صيانة توفية مواقف السيارات",
      en: "Parking Lot Equipment Maintenance",
    },
    description: {
      ar: "فحص المراجع، مجاري الهواء وأجهزة قياس CO وكواشف الدخان.",
      en: "Inspect vents, air ducts, and CO gauges and smoke detectors.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "maint-add-10",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "صيانة شبكة مرمية الموجرديا(انخرازاخ/رايخ تربا)",
      en: "Hydroponic/Irrigation Network Maintenance (Hoses/Pipes)",
    },
    description: {
      ar: "إصلاح خلان العمل والأحذية الأرضية والمواقد.",
      en: "Repair leaks, ground hoses, and valves.",
    },
    scope: {
      ar: "شهري / ربع سنوي",
      en: "Monthly / Quarterly",
    },
  },
  {
    id: "maint-add-11",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "صيانة نظام الاتصالات الخاص (Intercom)",
      en: "Intercom System Maintenance",
    },
    description: {
      ar: "اختبار الاتصال والتبيل واستبدال المناطق.",
      en: "Test communication, switches, and replace areas.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "maint-add-12",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "صيانة وتفيير الحدائق",
      en: "Garden Maintenance & Landscaping",
    },
    description: {
      ar: "فحص الهواء والمياه والأصداغات ومخازن القياس والتنظيف.",
      en: "Inspect air, water, outlets, measuring storage, and cleaning.",
    },
    scope: {
      ar: "سنوي",
      en: "Annual",
    },
  },
  {
    id: "maint-add-13",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "صيانة خزان المياه",
      en: "Water Tank Maintenance",
    },
    description: {
      ar: "فحص المياه والبلطات والمياماومات ومخازن القياس والتنظيف.",
      en: "Inspect water, tiles, hoses, measuring storage, and cleaning.",
    },
    scope: {
      ar: "سنوي",
      en: "Annual",
    },
  },
  {
    id: "maint-add-14",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "صيانة وتصفيف قبل السطح (Roof Drains)",
      en: "Roof Drain Maintenance",
    },
    description: {
      ar: "فحص معدات الصناعة الجدولة وضبط المرشحات.",
      en: "Inspect scheduled manufacturing equipment and adjust filters.",
    },
    scope: {
      ar: "نصف سنوي / سنوي",
      en: "Semi-Annual / Annual",
    },
  },
  {
    id: "maint-add-15",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "صيانة ومعالجة المياه (المرحدة/المزليازو)",
      en: "Water Treatment Maintenance (Softened/Deionized)",
    },
    description: {
      ar: "صيانة شبكة مكافحة الجليزة (Wet/Dry) وتنصيبً.",
      en: "Maintain fire protection network (Wet/Dry) and install.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "maint-add-16",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "غسيل شبكات مكافحة الحريق (Wet/Dry) وشحصها",
      en: "Fire Network Flushing (Wet/Dry) & Testing",
    },
    description: {
      ar: "فحص الممرات بعد دفيقة الردوبيات.",
      en: "Inspect pathways after fine sediment removal.",
    },
    scope: {
      ar: "نصف سنوي / سنوي",
      en: "Semi-Annual / Annual",
    },
  },
  {
    id: "maint-add-17",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "اختبار إيارة الطوارئ وحرائق الدخان",
      en: "Emergency Lighting & Smoke Alarm Testing",
    },
    description: {
      ar: "اختبار الحسادات والإيارات وحدائت المكدات بمواقعات الميكانيكية.",
      en: "Test sensors, lights, and equipment gardens with mechanical locations.",
    },
    scope: {
      ar: "شهري",
      en: "Monthly",
    },
  },
  {
    id: "maint-add-18",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "فحص فواصل الوقود وإعادة سد قواصل البفوضات الملاصقة",
      en: "Fire Stop Inspection & Adjacent Junction Re-sealing",
    },
    description: {
      ar: "فحص وإغلاق لمنع انتشار الخافة المحتملة.",
      en: "Inspect and seal to prevent potential fire spread.",
    },
    scope: {
      ar: "سنوي",
      en: "Annual",
    },
  },
  {
    id: "maint-add-19",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "فحص ومراقبة السجلات السيطرة على المنظظر",
      en: "Control Record Monitoring & Inspection",
    },
    description: {
      ar: "أخذ عينات، تتبع دورية، ومراجعة السجلات الصيانة وتدريك المياه.",
      en: "Sample taking, periodic tracking, and maintenance record review and water circulation.",
    },
    scope: {
      ar: "شهري / ربع سنوي",
      en: "Monthly / Quarterly",
    },
  },
  {
    id: "maint-add-20",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "برمامجة مراقبة الهيدروديا(انمحراكراخ/رايخ تريا)",
      en: "Hydro Monitoring Programming (Irrigation/Pipes)",
    },
    description: {
      ar: "إعادة مولجودان الاعتمالات الأشبخة والمفاقد.",
      en: "Re-balance network operations and losses.",
    },
    scope: {
      ar: "سنوي",
      en: "Annual",
    },
  },
  {
    id: "maint-add-21",
    category: "maintenance",
    tier: "additional",
    name: {
      ar: "فحص وإعادة شد قواصل المواست الملاصقة الملحق",
      en: "Adjacent Junction Inspection & Re-tightening",
    },
    description: {
      ar: "فحص وإخزول السخوخ وإغعار.",
      en: "Inspect and seal openings and repairs.",
    },
    scope: {
      ar: "سنوي",
      en: "Annual",
    },
  },
];

export function getServicesByCategory(category: ServiceCategory): Service[] {
  return SERVICES.filter((s) => s.category === category);
}

export function getServiceById(id: string): Service | undefined {
  return SERVICES.find((s) => s.id === id);
}

export function getServiceText(service: Service, lang: "ar" | "en") {
  return {
    name: service.name[lang],
    description: service.description[lang],
    scope: service.scope[lang],
  };
}
