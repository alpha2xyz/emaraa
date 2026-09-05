import nodemailer from "nodemailer";
import type { SupabaseClient } from "@supabase/supabase-js";

// Zoho SMTP — info@emaraa.app mailbox, app-specific password.
const ZOHO_USER = process.env.ZOHO_SMTP_USER ?? "";
const ZOHO_PASS = process.env.ZOHO_SMTP_PASS ?? "";
const REPORT_TO = process.env.ADMIN_REPORT_TO ?? "info@emaraa.app";

let transporter: nodemailer.Transporter | null = null;
function getTransport() {
  if (!transporter) {
    // Zoho Saudi data center (mailbox is on zoho.sa — see project CLAUDE.md).
    transporter = nodemailer.createTransport({
      host: "smtppro.zoho.sa",
      port: 465,
      secure: true,
      auth: { user: ZOHO_USER, pass: ZOHO_PASS },
    });
  }
  return transporter;
}

// Send an email via Zoho and record it in email_log (fire-and-forget log).
// Never throws — returns status.
export async function sendEmail(
  supabaseAdmin: SupabaseClient,
  opts: { to?: string; cc?: string; subject: string; html: string; kind?: string },
): Promise<{ status: string; error: string | null }> {
  const to = opts.to ?? REPORT_TO;
  let status = "sent";
  let errorText: string | null = null;

  if (!ZOHO_USER || !ZOHO_PASS) {
    status = "skipped_no_credentials";
  } else {
    try {
      await getTransport().sendMail({
        from: `"عِمارة Emaraa" <${ZOHO_USER}>`,
        to,
        ...(opts.cc ? { cc: opts.cc } : {}),
        subject: opts.subject,
        html: opts.html,
      });
    } catch (err: any) {
      status = "failed";
      errorText = (err?.message ?? "smtp error").slice(0, 300);
    }
  }

  // Await the log insert — on Vercel the lambda freezes the moment the response
  // is sent, so a fire-and-forget insert would be lost. The report's "since last
  // report" cutoff depends on this row persisting, so it must complete first.
  try {
    await supabaseAdmin
      .from("email_log")
      .insert([{ to_email: to, subject: opts.subject, kind: opts.kind ?? null, status, error: errorText }]);
  } catch {
    // never let logging failure break the send result
  }

  if (status !== "sent" && process.env.NODE_ENV !== "production") {
    console.error(`[sendEmail] ${status} to ${to}: ${errorText ?? ""}`);
  }
  return { status, error: errorText };
}

const nf = (n: number) => Number(n || 0).toLocaleString("en-US");

const FRONTEND_URL = process.env.FRONTEND_URL ?? "https://emaraa.app";

// Contact card — the name + phone of the other party, shown after an offer is accepted.
// The phone is force-isolated LTR: Saudi numbers are Western digits inside an RTL line,
// which reorders visually without it.
export function contactCardHtml(opts: {
  title: string;
  name?: string | null;
  phone?: string | null;
}): string {
  const deep = "#065B98", ink = "#0F2233", mut = "#5A6880";
  if (!opts.phone && !opts.name) return "";
  const row = (label: string, value: string, ltr = false) =>
    value
      ? `<tr>
           <td style="padding:6px 0;font-size:13px;color:${mut};white-space:nowrap;">${label}</td>
           <td style="padding:6px 0 6px 12px;font-size:14px;font-weight:700;color:${ink};">${
             ltr ? `<span dir="ltr" style="unicode-bidi:isolate">${value}</span>` : value
           }</td>
         </tr>`
      : "";
  return `
    <div style="background:#F7FAFC;border:1px solid #E3E9F0;border-radius:12px;padding:16px;margin:16px 0;">
      <div style="font-size:13px;font-weight:700;color:${deep};margin-bottom:8px;">${opts.title}</div>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${row("الاسم", opts.name ?? "")}
        ${row("الجوال", opts.phone ?? "", true)}
      </table>
    </div>`;
}

// Branded RTL notification email — one heading, a short body, an optional CTA button,
// and an optional contact card (body is plain text, so contact details cannot ride in it).
// Mirrors the admin-report visual style (dark gradient header + white card).
export function notificationEmail(opts: {
  heading: string;
  body: string; // plain Arabic text; \n becomes <br>
  ctaLabel?: string;
  ctaUrl?: string;
  contact?: { title: string; name?: string | null; phone?: string | null };
}): string {
  const cyan = "#0DB8D3", blue = "#1B7FDC", deep = "#065B98", ink = "#0F2233", mut = "#5A6880";
  const bodyHtml = opts.body.replace(/\n/g, "<br>");
  const contact = opts.contact ? contactCardHtml(opts.contact) : "";
  const cta =
    opts.ctaLabel && opts.ctaUrl
      ? `<div style="margin-top:20px;">
           <a href="${opts.ctaUrl}" style="display:inline-block;background:${blue};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:10px;">${opts.ctaLabel}</a>
         </div>`
      : "";
  return `
  <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#F0F3F7;padding:24px;color:${ink};">
    <div style="max-width:520px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,${deep},${blue} 70%,${cyan});border-radius:16px;padding:24px;color:#fff;">
        <div style="font-size:12px;opacity:.85;letter-spacing:1px;">عِمارة Emaraa</div>
        <div style="font-size:20px;font-weight:800;margin-top:8px;">${opts.heading}</div>
      </div>
      <div style="background:#fff;border-radius:14px;padding:22px;margin-top:14px;border:1px solid #E3E9F0;">
        <div style="font-size:15px;line-height:1.9;color:${ink};">${bodyHtml}</div>
        ${contact}
        ${cta}
      </div>
      <div style="text-align:center;color:${mut};font-size:11px;margin-top:18px;">
        إشعار تلقائي من منصة عِمارة · <a href="${FRONTEND_URL}" style="color:${mut};">emaraa.app</a>
      </div>
    </div>
  </div>`;
}

// ───────────────────────────────────────────────────────────────────────────
// Admin: new offer landed — with a ready-to-send WhatsApp message for the owner
// ───────────────────────────────────────────────────────────────────────────
// Owners register with phone only (email is optional — PRODUCT-FACTS §2.1), so most
// owners cannot be emailed when an offer arrives. This email gives Abdallah the full
// context plus a one-tap WhatsApp link, so the owner still gets told.

// Saudi mobiles are stored as 05XXXXXXXX (see the OTP route's /^05\d{8}$/ check).
// wa.me needs the international form with no plus and no leading zero: 9665XXXXXXXX.
export function waNumber(phone: string | null | undefined): string | null {
  const digits = String(phone ?? "").replace(/\D/g, "");
  if (/^05\d{8}$/.test(digits)) return "966" + digits.slice(1);
  if (/^9665\d{8}$/.test(digits)) return digits;
  return null;
}

// The message Abdallah sends the owner. Owner voice (BRAND-VOICE §5): plain benefit,
// control, reassurance. Light colloquial is allowed in WhatsApp scripts (§6).
// No em dash, Western digits, founder name عبدالله الفرائضي.
export function ownerOfferWhatsappText(opts: {
  ownerName?: string | null;
  propertyName?: string | null;
}): string {
  // First name only. Full names read stiff in a WhatsApp opener, and stored names are
  // often Latin script ("السلام عليكم Mohammed Alshehri"), which reads worse. Taking the
  // first token works for both scripts without inventing a transliteration.
  const firstName = String(opts.ownerName ?? "").trim().split(/\s+/)[0];
  const greet = firstName ? `السلام عليكم ${firstName}` : "السلام عليكم";
  const prop = opts.propertyName ? ` الخاص بعقار ${opts.propertyName}` : "";
  return [
    `${greet}، معك عبدالله الفرائضي من منصة عِمارة.`,
    "",
    `وصلك عرض جديد على طلب الخدمة${prop}.`,
    "تقدر تراجع السعر وتفاصيل العرض من لوحة التحكم: https://emaraa.app",
    "",
    "رقمك ما يظهر لأي مزوّد إلا بعد ما تقبل عرضه. القرار بيدك.",
    "وأي استفسار راسلني هنا مباشرة.",
  ].join("\n");
}

export function adminOfferEmail(opts: {
  companyName?: string | null;
  priceTotal?: number | null;
  offerNotes?: string | null;
  propertyName?: string | null;
  buildingType?: string | null;
  city?: string | null;
  unitsCount?: number | string | null;
  ownerName?: string | null;
  ownerPhone?: string | null;
  ownerEmail?: string | null;
  isReOffer?: boolean;
}): string {
  const cyan = "#0DB8D3", blue = "#1B7FDC", deep = "#065B98", ink = "#0F2233", mut = "#5A6880";
  const dash = (v: any) => (v === 0 || v ? String(v) : "—");

  const waText = ownerOfferWhatsappText({
    ownerName: opts.ownerName,
    propertyName: opts.propertyName,
  });
  const wa = waNumber(opts.ownerPhone);
  const waHref = wa ? `https://wa.me/${wa}?text=${encodeURIComponent(waText)}` : null;

  const row = (label: string, value: string) => `
    <tr>
      <td style="padding:8px 0;font-size:13px;color:${mut};white-space:nowrap;vertical-align:top;">${label}</td>
      <td style="padding:8px 0 8px 12px;font-size:14px;font-weight:700;color:${ink};">${value}</td>
    </tr>`;

  const priceBox = `
    <div style="background:linear-gradient(135deg,${deep},${blue});border-radius:12px;padding:16px;margin:16px 0;color:#fff;text-align:center;">
      <div style="font-size:12px;opacity:.85;">قيمة العرض</div>
      <div style="font-size:28px;font-weight:800;margin-top:6px;">${
        opts.priceTotal ? `${nf(Number(opts.priceTotal))} <span style="font-size:15px;">ر.س</span>` : "غير محدّدة"
      }</div>
    </div>`;

  // Owner contact status. States only what is certain: whether an address is on file.
  // The owner's own "new offer" email is now sent server-side in the same handler, but
  // an SMTP failure would still make "the owner was notified" a false claim — and that
  // is exactly the case where skipping the WhatsApp leaves the owner in the dark. So
  // the copy always asks for the WhatsApp, and the block below is always shown.
  const contactNote = opts.ownerEmail
    ? `<div style="background:#F7FAFC;border:1px solid #E3E9F0;border-radius:10px;padding:12px;font-size:13px;color:${mut};line-height:1.7;">
         بريد المالك مسجّل: <span dir="ltr" style="unicode-bidi:isolate">${opts.ownerEmail}</span>. أرسِل رسالة الواتساب أدناه للتأكد من وصول الخبر.
       </div>`
    : `<div style="background:#FFF7ED;border:1px solid #FED7AA;border-radius:10px;padding:12px;font-size:13px;color:#9A3412;line-height:1.7;">
         <b>لا يوجد بريد مسجّل لهذا المالك</b> ولم يصله أي إشعار تلقائي. الواتساب هو القناة الوحيدة للوصول إليه.
       </div>`;

  const waBlock = `
    <div style="background:#fff;border-radius:14px;padding:20px;margin-top:14px;border:1px solid #E3E9F0;">
      <div style="font-size:13px;font-weight:700;color:${deep};margin-bottom:10px;">رسالة الواتساب الجاهزة للمالك</div>
      ${contactNote}
      <div style="background:#F7FAFC;border:1px dashed #C7D3E0;border-radius:10px;padding:14px;margin-top:12px;font-size:14px;line-height:1.9;color:${ink};white-space:pre-wrap;">${waText}</div>
      ${
        waHref
          ? `<div style="margin-top:14px;">
               <a href="${waHref}" style="display:inline-block;background:#25D366;color:#0B3D22;text-decoration:none;font-weight:800;font-size:14px;padding:12px 26px;border-radius:10px;">فتح واتساب مع الرسالة جاهزة</a>
               <div style="font-size:11px;color:${mut};margin-top:8px;">إن لم تفتح الرسالة تلقائيًّا، انسخ النص أعلاه يدويًّا.</div>
             </div>`
          : `<div style="font-size:12px;color:#9A3412;margin-top:12px;">رقم الجوال غير صالح للربط المباشر (${dash(opts.ownerPhone)}) — انسخ النص وأرسله يدويًّا.</div>`
      }
    </div>`;

  return `
  <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#F0F3F7;padding:24px;color:${ink};">
    <div style="max-width:560px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,${deep},${blue} 70%,${cyan});border-radius:16px;padding:24px;color:#fff;">
        <div style="font-size:12px;opacity:.85;letter-spacing:1px;">عِمارة — إشعار إداري</div>
        <div style="font-size:20px;font-weight:800;margin-top:8px;">
          ${opts.isReOffer ? "عرض مُعاد على طلب خدمة" : "عرض جديد على طلب خدمة"}
        </div>
      </div>

      <div style="background:#fff;border-radius:14px;padding:20px;margin-top:14px;border:1px solid #E3E9F0;">
        <div style="font-size:13px;font-weight:700;color:${deep};margin-bottom:6px;">تفاصيل العرض</div>
        ${priceBox}
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          ${row("المزوّد", dash(opts.companyName))}
          ${row("ملاحظات المزوّد", opts.offerNotes ? opts.offerNotes : "(بدون ملاحظات)")}
        </table>
      </div>

      <div style="background:#fff;border-radius:14px;padding:20px;margin-top:14px;border:1px solid #E3E9F0;">
        <div style="font-size:13px;font-weight:700;color:${deep};margin-bottom:6px;">المالك والعقار</div>
        <table cellpadding="0" cellspacing="0" style="width:100%;">
          ${row("المالك", dash(opts.ownerName))}
          ${row("الجوال", `<span dir="ltr" style="unicode-bidi:isolate">${dash(opts.ownerPhone)}</span>`)}
          ${row("العقار", dash(opts.propertyName))}
          ${row("نوع العقار", dash(opts.buildingType))}
          ${row("المدينة", dash(opts.city))}
          ${row("عدد الوحدات", dash(opts.unitsCount))}
        </table>
      </div>

      ${waBlock}

      <div style="margin-top:16px;text-align:center;">
        <a href="${FRONTEND_URL}/admin" style="display:inline-block;background:${blue};color:#fff;text-decoration:none;font-weight:700;font-size:14px;padding:12px 26px;border-radius:10px;">فتح لوحة الإدارة</a>
      </div>

      <div style="text-align:center;color:${mut};font-size:11px;margin-top:18px;">
        إشعار تلقائي من منصة عِمارة · <a href="${FRONTEND_URL}" style="color:${mut};">emaraa.app</a>
      </div>
    </div>
  </div>`;
}

// ───────────────────────────────────────────────────────────────────────────
// 1% Commission Workflow
// ───────────────────────────────────────────────────────────────────────────
// The "transfer the 1% commission" email is INERT until COMMISSION_BANK_IBAN is set.
// Bank details + QR image arrive in a later prompt — until then the accept handler
// sends only the existing plain congrats email and never starts the reminder chain.
export const COMMISSION_RATE = 0.01;
const BANK_NAME = process.env.COMMISSION_BANK_NAME ?? "";
const BANK_ACCOUNT_NAME = process.env.COMMISSION_BANK_ACCOUNT_NAME ?? "";
const BANK_IBAN = process.env.COMMISSION_BANK_IBAN ?? "";
const BANK_QR_URL = process.env.COMMISSION_QR_URL ?? ""; // hosted https PNG — NOT base64 (clients strip it)

// True once bank details exist — gates the whole commission email chain.
export function commissionConfigReady(): boolean {
  return !!BANK_IBAN;
}

// 1% commission-transfer ask (Arabic RTL). Sent by the day-21 pass of
// /api/cron/commission-reminder, not at accept-time — owners take 1-2 weeks to
// consult co-owners before a contract exists, so asking for money on day 0 was premature.
export function commissionEmail(opts: {
  priceTotal: number | null;
  ownerName?: string | null;
  ownerPhone?: string | null;
}): string {
  const cyan = "#0DB8D3", blue = "#1B7FDC", deep = "#065B98", ink = "#0F2233", mut = "#5A6880";
  const price = Number(opts.priceTotal || 0);
  const commission = price * COMMISSION_RATE;

  const row = (label: string, value: string) =>
    value
      ? `<tr>
           <td style="padding:8px 0;font-size:13px;color:${mut};white-space:nowrap;">${label}</td>
           <td style="padding:8px 0;font-size:14px;font-weight:700;color:${ink};text-align:left;direction:ltr;">${value}</td>
         </tr>`
      : "";

  const contactBox = contactCardHtml({
    title: "بيانات التواصل مع المالك",
    name: opts.ownerName,
    phone: opts.ownerPhone,
  });

  const amountBox = `
    <div style="background:linear-gradient(135deg,${deep},${blue});border-radius:12px;padding:18px;margin:16px 0;color:#fff;text-align:center;">
      <div style="font-size:12px;opacity:.85;">عمولة عِمارة (<span dir="ltr" style="unicode-bidi:isolate">1%</span> من قيمة العرض)</div>
      <div style="font-size:30px;font-weight:800;margin-top:6px;">${nf(commission)} <span style="font-size:16px;">ر.س</span></div>
      ${price ? `<div style="font-size:11px;opacity:.8;margin-top:4px;">قيمة العرض: ${nf(price)} ر.س</div>` : ""}
    </div>`;

  const bankBox = `
    <div style="background:#F7FAFC;border:1px solid #E3E9F0;border-radius:12px;padding:16px;margin:16px 0;">
      <div style="font-size:13px;font-weight:700;color:${deep};margin-bottom:8px;">بيانات التحويل البنكي</div>
      <table cellpadding="0" cellspacing="0" style="width:100%;">
        ${row("اسم البنك", BANK_NAME)}
        ${row("اسم الحساب", BANK_ACCOUNT_NAME)}
        ${row("الآيبان (IBAN)", BANK_IBAN)}
      </table>
    </div>`;

  const qrBox = BANK_QR_URL
    ? `<div style="text-align:center;margin:16px 0;">
         <div style="font-size:12px;color:${mut};margin-bottom:8px;">امسح رمز QR للتحويل السريع</div>
         <img src="${BANK_QR_URL}" alt="QR" width="160" height="160" style="border-radius:12px;border:1px solid #E3E9F0;" />
       </div>`
    : "";

  return `
  <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#F0F3F7;padding:24px;color:${ink};">
    <div style="max-width:520px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,${deep},${blue} 70%,${cyan});border-radius:16px;padding:24px;color:#fff;">
        <div style="font-size:12px;opacity:.85;letter-spacing:1px;">عِمارة Emaraa</div>
        <div style="font-size:20px;font-weight:800;margin-top:8px;">متابعة عرضك المقبول</div>
      </div>
      <div style="background:#fff;border-radius:14px;padding:22px;margin-top:14px;border:1px solid #E3E9F0;">
        <div style="font-size:15px;line-height:1.9;color:${ink};">
          قبل 3 أسابيع قبِل المالك عرضك على طلب الخدمة. إذا كنت أتممت توقيع العقد معه، يُرجى تحويل عمولة عِمارة البالغة <b dir="ltr" style="unicode-bidi:isolate">1%</b> من قيمة العرض إلى الحساب أدناه. وإذا لم تكتمل الصفقة بعد أو احتجت أي مساعدة، راسلنا على info@emaraa.app.
        </div>
        ${contactBox}
        ${amountBox}
        ${bankBox}
        ${qrBox}
        <div style="font-size:13px;line-height:1.8;color:${mut};">
          بعد التحويل، يرجى الاحتفاظ بإيصال العملية. سيتواصل معك فريق عِمارة لتأكيد استلام العمولة ومتابعة الخطوات التالية.
        </div>
      </div>
      <div style="text-align:center;color:${mut};font-size:11px;margin-top:18px;">
        إشعار تلقائي من منصة عِمارة · <a href="${FRONTEND_URL}" style="color:${mut};">emaraa.app</a>
      </div>
    </div>
  </div>`;
}

// Day-7 check-in email (Arabic RTL). Sent by the day-7 pass of
// /api/cron/commission-reminder — a light nudge, not a post-deal survey, since the
// deal is often still mid-negotiation at this point (owners take 1-2 weeks to
// consult co-owners). CC: info@emaraa.app.
export function commissionReminderEmail(): string {
  return notificationEmail({
    heading: "نتابع معك",
    body:
      "قبِل المالك عرضك على طلب الخدمة قبل أسبوع. نتمنى أن تسير المحادثات معه بشكل جيد.\n\n" +
      "إذا احتجت أي مساعدة أو كان لديك استفسار، فريق عِمارة جاهز على info@emaraa.app في أي وقت.",
    ctaLabel: "زيارة عِمارة",
    ctaUrl: FRONTEND_URL,
  });
}

// Build the admin activity report: deltas since the last successful report + running totals.
export async function buildAdminReport(
  supabaseAdmin: SupabaseClient,
): Promise<{ subject: string; html: string }> {
  // "since" = timestamp of the last successfully-sent admin report (null on first run).
  const { data: last } = await supabaseAdmin
    .from("email_log")
    .select("created_at")
    .eq("kind", "admin_report")
    .eq("status", "sent")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  const since: string | null = last?.created_at ?? null;

  const newOwnersQ = supabaseAdmin
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", "owner");
  const newProvidersQ = supabaseAdmin
    .from("users")
    .select("id", { count: "exact", head: true })
    .eq("role", "provider");
  if (since) {
    newOwnersQ.gt("created_at", since);
    newProvidersQ.gt("created_at", since);
  }

  const [ownersTot, providersTot, approvedProv, properties, requests, closed, newOwners, newProviders] =
    await Promise.all([
      supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("role", "owner"),
      supabaseAdmin.from("users").select("id", { count: "exact", head: true }).eq("role", "provider"),
      supabaseAdmin.from("providers").select("id", { count: "exact", head: true }).eq("approved", true),
      supabaseAdmin.from("properties").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("requests").select("id", { count: "exact", head: true }),
      supabaseAdmin.from("deals").select("contract_value").eq("status", "closed"),
      newOwnersQ,
      newProvidersQ,
    ]);

  const totOwners = ownersTot.count ?? 0;
  const totProviders = providersTot.count ?? 0;
  const pending = Math.max(0, totProviders - (approvedProv.count ?? 0));
  const gmv = (closed.data ?? []).reduce((s: number, d: any) => s + (Number(d.contract_value) || 0), 0);
  const dOwners = newOwners.count ?? 0;
  const dProviders = newProviders.count ?? 0;

  const now = new Date();
  const dateStr = now.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  const periodStr = since
    ? `منذ آخر تقرير (${new Date(since).toLocaleDateString("en-GB", { day: "2-digit", month: "short" })})`
    : "أول تقرير — منذ البداية";

  const subject = `تقرير عِمارة — ${dateStr} · +${dOwners} مالك / +${dProviders} مزود`;

  const cyan = "#0DB8D3", blue = "#1B7FDC", deep = "#065B98", ink = "#0F2233", mut = "#5A6880";
  const stat = (label: string, value: string, color: string) => `
    <td style="padding:14px 10px;text-align:center;background:#fff;border:1px solid #E3E9F0;border-radius:12px;">
      <div style="font-size:26px;font-weight:800;color:${color};line-height:1;">${value}</div>
      <div style="font-size:11px;color:${mut};margin-top:6px;">${label}</div>
    </td><td style="width:10px;"></td>`;

  const html = `
  <div dir="rtl" style="font-family:Tahoma,Arial,sans-serif;background:#F0F3F7;padding:24px;color:${ink};">
    <div style="max-width:560px;margin:0 auto;">
      <div style="background:linear-gradient(135deg,${deep},${blue} 70%,${cyan});border-radius:16px;padding:26px 24px;color:#fff;">
        <div style="font-size:12px;opacity:.85;letter-spacing:1px;">عِمارة — تقرير لوحة الإدارة</div>
        <div style="font-size:22px;font-weight:800;margin-top:6px;">${dateStr}</div>
        <div style="font-size:12px;opacity:.85;margin-top:4px;">${periodStr}</div>
      </div>

      <div style="background:#fff;border-radius:14px;padding:18px 18px 6px;margin-top:14px;border:1px solid #E3E9F0;">
        <div style="font-size:13px;font-weight:700;color:${deep};margin-bottom:12px;">الجديد في هذه الفترة</div>
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;"><tr>
          ${stat("ملاك جدد", "+" + nf(dOwners), cyan)}
          ${stat("مزودون جدد", "+" + nf(dProviders), blue)}
          ${stat("بانتظار الموافقة", nf(pending), "#B45309")}
        </tr></table>
      </div>

      <div style="background:#fff;border-radius:14px;padding:18px 18px 6px;margin-top:14px;border:1px solid #E3E9F0;">
        <div style="font-size:13px;font-weight:700;color:${deep};margin-bottom:12px;">الإجمالي حتى الآن</div>
        <table cellpadding="0" cellspacing="0" style="width:100%;border-collapse:separate;"><tr>
          ${stat("إجمالي الملاك", nf(totOwners), ink)}
          ${stat("إجمالي المزودين", nf(totProviders), ink)}
          ${stat("العقارات", nf(properties.count ?? 0), ink)}
        </tr><tr><td colspan="6" style="height:10px;"></td></tr><tr>
          ${stat("الطلبات", nf(requests.count ?? 0), ink)}
          ${stat("الصفقات المؤكدة", nf((closed.data ?? []).length), "#15803D")}
          ${stat("GMV (ر.س)", nf(gmv), "#15803D")}
        </tr></table>
      </div>

      <div style="text-align:center;color:${mut};font-size:11px;margin-top:18px;">
        تقرير تلقائي من منصة عِمارة · ${dateStr}
      </div>
    </div>
  </div>`;

  return { subject, html };
}
