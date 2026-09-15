/**
 * The operations & maintenance scope of work shown to owners and providers.
 *
 * This text used to be a "unified SOW", pasted identically into three files and
 * marked LOCKED in each. That made it one sentence in three places, which is how
 * wording drifts, and it meant the scope could not vary by building type.
 *
 * Abdallah's call 2026-09-15: residential buildings do not have escalators, so
 * promising to maintain them in a residential scope is a line a provider has to
 * price around for something that does not exist. Escalators are now named only
 * for commercial buildings. Everything else is unchanged from the locked text,
 * deliberately: the rest of the scope was agreed and is not being reopened here.
 *
 * Single source of truth. Do not paste this text into a page again.
 */

export type ScopeBuildingType = "residential" | "commercial";

/** Anything that is not explicitly commercial is treated as residential. */
function isCommercial(buildingType: string | null | undefined): boolean {
  return buildingType === "commercial";
}

export function scopePart1(buildingType: string | null | undefined, lang: string): string {
  const commercial = isCommercial(buildingType);

  if (lang === "ar") {
    const equipment = commercial
      ? "والمصاعد والسلالم المتحركة والكاميرات"
      : "والمصاعد والكاميرات";
    return (
      "نظافة دورية للمناطق المشتركة والمداخل والأسطح والخزانات وإدارة النفايات، " +
      "صيانة شاملة للإنارة والمضخات والتكييف المركزي (HVAC) " +
      equipment +
      " ومنظومة الإطفاء، رش مبيدات وبستنة عند الحاجة، طوارئ على مدار الساعة، " +
      "تسديد فواتير المرافق، مع توضيح آلية العمل في الإجازات والمناسبات الوطنية."
    );
  }

  const equipment = commercial ? "elevators, escalators, cameras" : "elevators, cameras";
  return (
    "Periodic cleaning of common areas, entrances, rooftops, tanks, and waste management; " +
    "comprehensive maintenance of lighting, pumps, central HVAC, " +
    equipment +
    ", and fire suppression systems; pest control and landscaping as needed; " +
    "24/7 emergency response; utility bill payments; with clarification of holiday and " +
    "national occasion work procedures."
  );
}

/** Unchanged by building type. */
export function scopePart2(lang: string): string {
  return lang === "ar"
    ? "متطلبات العرض: تفصيل الخدمات والسعر لكل وحدة وإجمالي العقد شاملاً الضريبة وشروط الدفع، لمدة سنة قابلة للتجديد."
    : "Proposal requirements: detailed services and per-unit pricing plus total contract amount including VAT and payment terms, for a one-year renewable term.";
}
