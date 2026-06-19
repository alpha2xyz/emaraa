/**
 * One-off: send a sample of every OWNER notification email to info@emaraa.app
 * so the rendered design can be reviewed. Uses the SAME subjects + template as
 * server/routes.ts (request created / new offer / offer accepted).
 *
 * Run:  npx tsx --env-file=.env script/send-owner-preview.ts
 */
import { createClient } from "@supabase/supabase-js";
import { sendEmail, notificationEmail } from "../server/email.js";

const TO = "info@emaraa.app";
const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const sampleLines = [
  "العقار: برج الياسمين",
  "نوع العقار: سكني",
  "المدينة: الرياض",
  "عدد الوحدات: 12",
  "ملاحظاتك للمزودين: نحتاج تنظيف أسبوعي للمناطق المشتركة وصيانة المصاعد.",
].join("\n");

const emails = [
  {
    kind: "owner_request_created",
    subject: "تم استلام طلبك — عِمارة",
    heading: "تم استلام طلب الخدمة",
    body: `استلمنا طلبك بنجاح وهو الآن متاح للمزودين المعتمدين في مدينتك.\n\nتفاصيل الطلب:\n${sampleLines}\n\nراجِع التفاصيل أعلاه — وإذا نسيت إضافة أي ملاحظة مهمة للمزودين، يمكنك تعديل طلبك من لوحة التحكم قبل وصول العروض.\n\nسنُعلمك فور وصول أول عرض.`,
    ctaLabel: "مراجعة طلبي وتعديله",
    ctaUrl: "https://emaraa.app",
  },
  {
    kind: "owner_new_offer",
    subject: "لديك عرض جديد — عِمارة",
    heading: "وصلك عرض جديد على طلبك",
    body: "قدّم أحد المزودين عرضاً على طلب الخدمة الخاص بك. سجّل دخولك لمراجعة العرض وملف الشركة واتخاذ قرارك.",
    ctaLabel: "مراجعة العرض",
    ctaUrl: "https://emaraa.app",
  },
  {
    kind: "owner_offer_accepted",
    subject: "تم قبول العرض — عِمارة",
    heading: "تم قبول العرض بنجاح",
    body: "لقد قبلت عرض المزود على طلبك. يمكنك الآن مراجعة ملف العرض الكامل وبيانات التواصل مع المزود من لوحة التحكم لإتمام الخطوات التالية.",
    ctaLabel: "عرض التفاصيل",
    ctaUrl: "https://emaraa.app",
  },
];

async function main() {
  for (const e of emails) {
    const html = notificationEmail({ heading: e.heading, body: e.body, ctaLabel: e.ctaLabel, ctaUrl: e.ctaUrl });
    const r = await sendEmail(db, { to: TO, subject: `[معاينة] ${e.subject}`, html, kind: `preview_${e.kind}` });
    console.log(`${e.kind.padEnd(22)} -> ${r.status}${r.error ? "  (" + r.error + ")" : ""}`);
  }
  console.log(`\nDone. ${emails.length} owner preview emails sent to ${TO}.`);
}

main().catch((err) => {
  console.error("Failed:", err?.message ?? err);
  process.exit(1);
});
