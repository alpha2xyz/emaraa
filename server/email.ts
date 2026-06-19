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

// Send an email via Zoho and record it in email_log (fire-and-forget log,
// mirrors the sendSms / sms_log pattern). Never throws — returns status.
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

// Branded RTL notification email — one heading, a short body, an optional CTA button.
// Mirrors the admin-report visual style (dark gradient header + white card).
export function notificationEmail(opts: {
  heading: string;
  body: string; // plain Arabic text; \n becomes <br>
  ctaLabel?: string;
  ctaUrl?: string;
}): string {
  const cyan = "#0DB8D3", blue = "#1B7FDC", deep = "#065B98", ink = "#0F2233", mut = "#5A6880";
  const bodyHtml = opts.body.replace(/\n/g, "<br>");
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
        ${cta}
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

// Combined "offer accepted + please transfer the 1% commission" email (Arabic RTL).
// Sent to the winning provider the moment the owner accepts their offer.
export function commissionEmail(opts: { priceTotal: number | null }): string {
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
        <div style="font-size:20px;font-weight:800;margin-top:8px;">مبروك! تم قبول عرضك 🎉</div>
      </div>
      <div style="background:#fff;border-radius:14px;padding:22px;margin-top:14px;border:1px solid #E3E9F0;">
        <div style="font-size:15px;line-height:1.9;color:${ink};">
          قام المالك بقبول عرضك على طلب الخدمة. بعد إتمام الصفقة وتوقيع العقد، يُرجى تحويل عمولة عِمارة البالغة <b dir="ltr" style="unicode-bidi:isolate">1%</b> من قيمة العرض إلى الحساب التالي.
        </div>
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

// 1-day-after feedback reminder email (Arabic RTL). CC: info@emaraa.app.
export function commissionReminderEmail(): string {
  return notificationEmail({
    heading: "نود سماع رأيك 💬",
    body:
      "نشكرك على إتمام صفقتك عبر منصة عِمارة!\n\n" +
      "سيتواصل معك فريق عِمارة قريبًا للاطلاع على تجربتك في عملية الخدمة، ومشاركة قصة نجاحك معنا.\n\n" +
      "رأيك يساعدنا على تحسين المنصة، ويُبرز قصتك كنموذج ملهم لمزودي الخدمة الآخرين. نتطلع للحديث معك!",
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
