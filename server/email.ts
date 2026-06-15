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
  opts: { to?: string; subject: string; html: string; kind?: string },
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
