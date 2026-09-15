import type { SupabaseClient } from "@supabase/supabase-js";
import { signitAdapter } from "./signit-adapter.js";
import { enqueueEmails, drainOutbox } from "../outbox.js";
import { notificationEmail } from "../email.js";

// No webhook receiver yet (Signit's sandbox events:read scope is broken — see
// signit-adapter.ts). This is the state-writing mechanism instead: called from
// GET /api/deals/:id/signature-status, which the client polls while a signature is in flight.
// _work/esign-workflow-spec-v1.md §5 is explicit that this is an acceptable substitute, not a
// shortcut: "if webhooks are unavailable at launch, poll getStatus on a schedule instead."

export type ReconcileResult = {
  signature_status: string | null;
  signed_pdf_path: string | null;
  signature_rejected_reason: string | null;
};

const TERMINAL_STATES = new Set(["signed", "rejected", "expired", "voided", "failed"]);

export async function reconcilePendingSignature(
  supabaseAdmin: SupabaseClient,
  dealId: string,
): Promise<ReconcileResult> {
  const { data: dealRow, error } = await supabaseAdmin
    .from("deals")
    .select(
      "id, signature_status, signature_request_id, signed_pdf_path, signature_rejected_reason, " +
        "providers!deals_provider_fk(email), owner:users!deals_owner_fk(name, email)",
    )
    .eq("id", dealId)
    .maybeSingle();
  // Cast once here: supabase-js's type inference for aliased embeds (owner:users!...) via a raw
  // select string resolves to an error type, matching the `as any` already used at every other
  // embedded-select call site in server/routes.ts (e.g. the commission cron).
  const deal = dealRow as any;

  if (error || !deal) {
    return { signature_status: null, signed_pdf_path: null, signature_rejected_reason: null };
  }

  // Nothing to poll: signing never started, or already reached a terminal state.
  if (!deal.signature_status || TERMINAL_STATES.has(deal.signature_status) || !deal.signature_request_id) {
    return {
      signature_status: deal.signature_status,
      signed_pdf_path: deal.signed_pdf_path,
      signature_rejected_reason: deal.signature_rejected_reason,
    };
  }

  const vendorStatus = await signitAdapter.getStatus(deal.signature_request_id);

  await supabaseAdmin.from("signature_events").insert({
    deal_id: dealId,
    provider: "signit",
    event_type: "status_poll",
    payload: vendorStatus as unknown as Record<string, unknown>,
  });

  if (vendorStatus.state === deal.signature_status) {
    // No transition — nothing else to do.
    return {
      signature_status: deal.signature_status,
      signed_pdf_path: deal.signed_pdf_path,
      signature_rejected_reason: deal.signature_rejected_reason,
    };
  }

  const rejectedSignatory = vendorStatus.perSignatory.find((s) => s.status === "rejected");

  if (vendorStatus.state === "signed") {
    const sealed = await signitAdapter.downloadSealed(deal.signature_request_id);
    const sealedPath = `${dealId}/sealed-${Date.now()}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("contracts")
      .upload(sealedPath, sealed.bytes, { contentType: "application/pdf" });

    if (uploadError) {
      await supabaseAdmin.from("signature_events").insert({
        deal_id: dealId,
        provider: "signit",
        event_type: "failed",
        payload: { reason: "sealed_pdf_upload_failed", message: uploadError.message },
      });
      return {
        signature_status: deal.signature_status,
        signed_pdf_path: deal.signed_pdf_path,
        signature_rejected_reason: deal.signature_rejected_reason,
      };
    }

    const now = new Date().toISOString();
    await supabaseAdmin
      .from("deals")
      .update({
        signature_status: "signed",
        signed_pdf_path: sealedPath,
        signed_at: now,
        status: "closed",
        updated_at: now,
      })
      .eq("id", dealId);

    const providerEmail = (deal.providers as any)?.email as string | null;
    const owner = deal.owner as any;
    const recipients = [providerEmail, owner?.email].filter((e): e is string => !!e);
    if (recipients.length > 0) {
      const ids = await enqueueEmails(
        supabaseAdmin,
        recipients.map((to_email) => ({
          to_email,
          subject: "تم توقيع العقد — عِمارة",
          html: notificationEmail({
            heading: "تم توقيع العقد من الطرفين",
            body: "وقّع كل من المالك ومقدم الخدمة على العقد إلكترونياً، ويمكن تنزيل النسخة الموقّعة من لوحة التحكم.",
            ctaLabel: "فتح لوحة التحكم",
            ctaUrl: "https://emaraa.app",
          }),
          kind: "contract_signed",
        })),
      );
      await drainOutbox(supabaseAdmin, { ids });
    }

    return { signature_status: "signed", signed_pdf_path: sealedPath, signature_rejected_reason: null };
  }

  // Every other transition (sent -> partially_signed, or -> rejected/expired/voided/failed) is a
  // plain status write — no file, no notification, per the design spec's failure-path table.
  const reason = rejectedSignatory ? "رفض أحد الطرفين التوقيع" : null;
  await supabaseAdmin
    .from("deals")
    .update({
      signature_status: vendorStatus.state,
      signature_rejected_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealId);

  return { signature_status: vendorStatus.state, signed_pdf_path: deal.signed_pdf_path, signature_rejected_reason: reason };
}
