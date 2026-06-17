/**
 * One-off: send a sample of every provider notification email to info@emaraa.app
 * so the rendered design can be reviewed in a real inbox.
 *
 * Run:  npx tsx --env-file=.env script/send-preview-emails.ts
 *
 * Uses the SAME subjects + notificationEmail template as server/routes.ts.
 * Subjects are prefixed with [معاينة] so they're obvious test sends.
 */
import { createClient } from "@supabase/supabase-js";
import { sendEmail, notificationEmail } from "../server/email.js";

const TO = "info@emaraa.app";
const db = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

const emails = [
  {
    kind: "provider_welcome",
    subject: "أهلاً بك في عِمارة",
    heading: "أهلاً بك، شركة الاختبار للصيانة",
    body: "شكراً لتسجيلك كمزود خدمة في عِمارة. تم استلام ملف شركتك ومستنداتك، وهي الآن قيد المراجعة من فريقنا. سنُرسل لك بريداً فور قبول حسابك لتتمكن من تقديم عروضك على طلبات الخدمة.",
    ctaLabel: "عرض لوحة التحكم",
    ctaUrl: "https://emaraa.app",
  },
  {
    kind: "provider_approved",
    subject: "تم قبول حسابك — عِمارة",
    heading: "تهانينا! تم قبول حسابك",
    body: "تم قبول حساب مزود الخدمة الخاص بك في عِمارة. يمكنك الآن تقديم عروضك على طلبات الخدمة.",
    ctaLabel: "تصفّح الطلبات",
    ctaUrl: "https://emaraa.app",
  },
  {
    kind: "new_request",
    subject: "طلب خدمة جديد في الرياض — عِمارة",
    heading: "طلب خدمة جديد في الرياض",
    body: "تم نشر طلب خدمة جديد في الرياض. سجّل دخولك على عِمارة لتقديم عرضك قبل المزودين الآخرين.",
    ctaLabel: "تقديم عرض الآن",
    ctaUrl: "https://emaraa.app",
  },
  {
    kind: "offer_submitted",
    subject: "تم إرسال عرضك — عِمارة",
    heading: "تم إرسال عرضك بنجاح",
    body: "وصلنا عرضك على طلب الخدمة. سنُعلمك فور قبوله من قِبل المالك.",
    ctaLabel: "عرض لوحة التحكم",
    ctaUrl: "https://emaraa.app",
  },
  {
    kind: "offer_accepted",
    subject: "تم قبول عرضك — عِمارة",
    heading: "مبروك! تم قبول عرضك",
    body: "قام المالك بقبول عرضك على طلب الخدمة. سجّل دخولك لمتابعة تفاصيل الصفقة والخطوات التالية.",
    ctaLabel: "عرض الصفقة",
    ctaUrl: "https://emaraa.app",
  },
];

async function main() {
  for (const e of emails) {
    const html = notificationEmail({
      heading: e.heading,
      body: e.body,
      ctaLabel: e.ctaLabel,
      ctaUrl: e.ctaUrl,
    });
    const r = await sendEmail(db, {
      to: TO,
      subject: `[معاينة] ${e.subject}`,
      html,
      kind: `preview_${e.kind}`,
    });
    console.log(`${e.kind.padEnd(20)} -> ${r.status}${r.error ? "  (" + r.error + ")" : ""}`);
  }
  console.log(`\nDone. ${emails.length} preview emails sent to ${TO}.`);
}

main().catch((err) => {
  console.error("Failed:", err?.message ?? err);
  process.exit(1);
});
