// The one vendor-specific surface in the e-signature build (_work/esign-workflow-spec-v1.md §3).
// Everything else in the app depends only on this interface; swapping vendors means writing a
// new file that implements it, not touching the workflow, schema, or UI.

export type SignatoryRole = "owner" | "provider";

export type Signatory = {
  role: SignatoryRole;
  fullName: string;
  contactEmail: string;
  // The exact text on the contract's own signature line this signatory's fields anchor to.
  // Anchor tags, never x/y coordinates — a fixed coordinate silently drifts whenever the
  // template's layout changes; an anchor tag fails loudly if the text it expects is gone.
  anchorTag: string;
  // Signit's anchor_tag search takes a page number (the API schema marks it required even
  // though its own description says omitting it searches every page — treated here as required
  // to avoid relying on undocumented fallback behavior). This is a layout fact about the
  // rendered PDF, not a business fact, so contract-template.ts owns the actual number and must
  // be re-checked whenever that template's page count changes (see the 2026-09-13 pilot note:
  // the signature boxes moved from page 1 to page 2 when the contract grew to three pages).
  anchorPage: number;
};

export type CreateSignatureRequestInput = {
  dealId: string;
  title: string;
  pdfBuffer: Buffer;
  signatories: Signatory[];
};

export type CreateSignatureRequestResult = {
  requestId: string;
  // role -> vendor signatory id, since getSigningLink needs the per-role id and there is no
  // vendor-side place to stamp our own dealId onto the request (custom_fields is confirmed
  // broken in Signit's sandbox — see _work/signit-api-integration-brief-v1.md).
  signatoryIds: Record<SignatoryRole, string>;
};

export type SigningLinkResult = {
  url: string;
  expiresAt: string | null; // vendor does not always document an expiry; null when unknown
};

export type SignatoryStatus = {
  role: SignatoryRole;
  signatoryId: string;
  status: "pending" | "signed" | "rejected" | "transferred";
  rejectedReason: string | null;
};

export type SignatureRequestStatus = {
  state: "sent" | "partially_signed" | "signed" | "rejected" | "expired" | "voided" | "failed";
  perSignatory: SignatoryStatus[];
};

export type DownloadedFile = {
  bytes: Buffer;
};

export type WebhookVerification = {
  valid: boolean;
  event: unknown;
};

export interface SignatureAdapter {
  createSignatureRequest(input: CreateSignatureRequestInput): Promise<CreateSignatureRequestResult>;
  getSigningLink(requestId: string, signatoryId: string): Promise<SigningLinkResult>;
  getStatus(requestId: string): Promise<SignatureRequestStatus>;
  downloadSealed(requestId: string): Promise<DownloadedFile>;
  voidRequest(requestId: string, reason: string): Promise<void>;
  // Not called anywhere yet — Signit's sandbox events:read scope is broken, so webhooks are
  // unimplemented and the build relies on client-driven polling instead (see reconcile.ts).
  // Kept on the interface so a real implementation slots in later without a new interface.
  verifyWebhook(headers: Record<string, string>, rawBody: Buffer): Promise<WebhookVerification>;
}
