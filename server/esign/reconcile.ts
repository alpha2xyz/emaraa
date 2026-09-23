import type { SupabaseClient } from "@supabase/supabase-js";
import { adapterFor } from "./adapter.js";
import { enqueueEmails, drainOutbox } from "../outbox.js";
import { notificationEmail } from "../email.js";

// No webhook receiver yet, on either vendor: Signit's sandbox events:read scope is broken (see
// signit-adapter.ts), and SADQ's webhooks are registerable but nothing receives them yet — only
// the signature check is implemented, in sadqAdapter.verifyWebhook.
// This is the state-writing mechanism instead: called from
// GET /api/deals/:id/signature-status, which the client polls while a signature is in flight.
// _work/esign-workflow-spec-v1.md §5 is explicit that this is an acceptable substitute, not a
// shortcut: "if webhooks are unavailable at launch, poll getStatus on a schedule instead."

export type ReconcileResult = {
  signature_status: string | null;
  signed_pdf_path: string | null;
  signature_rejected_reason: string | null;
  // role -> that signatory's own status, from the vendor's per-signatory breakdown. Signing
  // order is not guaranteed (owner and provider can each sign whenever they open their link),
  // so "who still needs to sign" must come from this, never inferred from signature_status +
  // role alone. null when we didn't call the vendor this poll (signing not started yet, or
  // already at a terminal state where per-signatory detail no longer matters).
  per_role: Partial<Record<"owner" | "provider", string>> | null;
};

const TERMINAL_STATES = new Set(["signed", "rejected", "expired", "voided", "failed"]);

export async function reconcilePendingSignature(
  supabaseAdmin: SupabaseClient,
  dealId: string,
): Promise<ReconcileResult> {
  const { data: dealRow, error } = await supabaseAdmin
    .from("deals")
    .select(
      "id, signature_status, signature_request_id, signature_provider, signature_signatory_ids, " +
        "signed_pdf_path, signature_rejected_reason, " +
        "providers!deals_provider_fk(email), owner:users!deals_owner_fk(name, email)",
    )
    .eq("id", dealId)
    .maybeSingle();
  // Cast once here: supabase-js's type inference for aliased embeds (owner:users!...) via a raw
  // select string resolves to an error type, matching the `as any` already used at every other
  // embedded-select call site in server/routes.ts (e.g. the commission cron).
  const deal = dealRow as any;

  if (error || !deal) {
    return { signature_status: null, signed_pdf_path: null, signature_rejected_reason: null, per_role: null };
  }

  // Nothing to poll: signing never started, or already reached a terminal state.
  if (!deal.signature_status || TERMINAL_STATES.has(deal.signature_status) || !deal.signature_request_id) {
    return {
      signature_status: deal.signature_status,
      signed_pdf_path: deal.signed_pdf_path,
      signature_rejected_reason: deal.signature_rejected_reason,
      per_role: null,
    };
  }

  // The vendor that created this request, not the currently-selected one — a deal raised on
  // Signit must keep polling Signit after ESIGN_VENDOR flips. See server/esign/adapter.ts.
  const vendorName = (deal.signature_provider as string | null) ?? "signit";
  const adapter = await adapterFor(vendorName);

  // The stored role -> vendor-id map. Signit ignores it; SADQ cannot read its own status payload
  // safely without it (see the comment on SignatureAdapter.getStatus).
  const vendorStatus = await adapter.getStatus(
    deal.signature_request_id,
    (deal.signature_signatory_ids as Record<string, string> | null) ?? undefined,
  );

  await supabaseAdmin.from("signature_events").insert({
    deal_id: dealId,
    provider: vendorName,
    event_type: "status_poll",
    payload: vendorStatus as unknown as Record<string, unknown>,
  });

  const perRole: Partial<Record<"owner" | "provider", string>> = {};
  for (const s of vendorStatus.perSignatory) perRole[s.role] = s.status;

  if (vendorStatus.state === deal.signature_status) {
    // No transition — nothing else to do.
    return {
      signature_status: deal.signature_status,
      signed_pdf_path: deal.signed_pdf_path,
      signature_rejected_reason: deal.signature_rejected_reason,
      per_role: perRole,
    };
  }

  const rejectedSignatory = vendorStatus.perSignatory.find((s) => s.status === "rejected");

  if (vendorStatus.state === "signed") {
    const sealed = await adapter.downloadSealed(deal.signature_request_id);
    const sealedPath = `${dealId}/sealed-${Date.now()}.pdf`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("contracts")
      .upload(sealedPath, sealed.bytes, { contentType: "application/pdf" });

    if (uploadError) {
      await supabaseAdmin.from("signature_events").insert({
        deal_id: dealId,
        provider: vendorName,
        event_type: "failed",
        payload: { reason: "sealed_pdf_upload_failed", message: uploadError.message },
      });
      return {
        signature_status: deal.signature_status,
        signed_pdf_path: deal.signed_pdf_path,
        signature_rejected_reason: deal.signature_rejected_reason,
        per_role: perRole,
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

    return { signature_status: "signed", signed_pdf_path: sealedPath, signature_rejected_reason: null, per_role: perRole };
  }

  // Every other transition (sent -> partially_signed, or -> rejected/expired/voided/failed) is a
  // plain status write — no file, no notification, per the design spec's failure-path table.
  // SADQ's status payload carries the rejecting party's own words in rejectReason; Signit's does
  // not, so that path still falls back to the generic sentence.
  const reason = rejectedSignatory
    ? (rejectedSignatory.rejectedReason?.trim() || "رفض أحد الطرفين التوقيع")
    : null;
  await supabaseAdmin
    .from("deals")
    .update({
      signature_status: vendorStatus.state,
      signature_rejected_reason: reason,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dealId);

  return {
    signature_status: vendorStatus.state,
    signed_pdf_path: deal.signed_pdf_path,
    signature_rejected_reason: reason,
    per_role: perRole,
  };
}
