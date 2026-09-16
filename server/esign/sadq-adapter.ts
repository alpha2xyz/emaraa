import type {
  CreateSignatureRequestInput,
  CreateSignatureRequestResult,
  DownloadedFile,
  SignatoryRole,
  SignatureAdapter,
  SignatureRequestStatus,
  SigningLinkResult,
  WebhookVerification,
} from "./types.js";
import { fieldBoxFromAnchor, locateAnchors } from "./anchor-locator.js";

// Ground truth for every shape below: the 2026-09-16 sandbox pilot, written up in
// _work/sadq-api-integration-brief-v1.md and cross-checked against
// Resources/sadq-api-openapi-2026-09-16.json. Where the published docs and the live sandbox
// disagree the sandbox wins, and the disagreements are called out inline — there are several.
//
// Shape of the integration, in SADQ's vocabulary:
//   envelope  = the signing request. Its id is what the webhook calls RequestId. We keep it in
//               deals.signature_request_id.
//   document  = the PDF inside the envelope. Its id is only needed to raise invitations and to
//               download the sealed file, and both are reachable from the envelope, so it is not
//               stored on the deal.
//   destination = a signatory. Its id is what we store per role in deals.signature_signatory_ids.

const SADQ_API_BASE = process.env.SADQ_API_BASE ?? "";
const SADQ_ACCOUNT_ID = process.env.SADQ_ACCOUNT_ID ?? "";
const SADQ_ACCOUNT_SECRET = process.env.SADQ_ACCOUNT_SECRET ?? "";
const SADQ_USERNAME = process.env.SADQ_USERNAME ?? "";
const SADQ_PASSWORD = process.env.SADQ_PASSWORD ?? "";

// SADQ's authenticationType decides the identity gate in front of the signing surface. Verified
// 2026-09-16: 0 = no gate (the signer opens the contract straight away) and 1 = Nafath, despite
// the published docs listing 1 as OTP and 7 as Nafath. 0 for the demo build, for the same reason
// ESIGN_VERIFICATION_METHOD defaults to email on Signit — seeded demo identities cannot
// Nafath-verify as themselves, and the sandbox account carries nafathBalance 0 anyway. Nafath is
// the production value, once legal review clears the template's §9 and ESIGN_ENABLED is allowed
// on production. See server/app.ts's boot guard.
const AUTHENTICATION_TYPE = Number(process.env.SADQ_AUTHENTICATION_TYPE ?? "0");

// Shared secret SADQ echoes back on webhook deliveries (configured on the webhook itself via
// POST /api/v1/webhooks/bulk). Only used by verifyWebhook; no receiver route is wired up yet.
const SADQ_WEBHOOK_TOKEN = process.env.SADQ_WEBHOOK_TOKEN ?? "";
const SADQ_WEBHOOK_HEADER = (process.env.SADQ_WEBHOOK_HEADER ?? "authorization").toLowerCase();

// The signature box drawn on the contract, in PDF points. Its position comes from the anchor tag
// (see anchor-locator.ts); only the size is a constant, chosen to match the signature cell.
const FIELD_WIDTH_PT = 150;
const FIELD_HEIGHT_PT = 42;

// Arabic. SADQ's invitationLanguage is 0 = Arabic, 1 = English — the inverse of the ?lang= query
// parameter on its own signing links, which is not a typo here.
const INVITATION_LANGUAGE_AR = 0;

type SadqEnvelope = { status: string; envelopeId: string; signatories: SadqSignatory[]; documentId: string | null };
type SadqSignatory = {
  id: string;
  status: string | null;
  fullName: string | null;
  email: string | null;
  signOrder: number | null;
  lastActionDate: string | null;
  signingUrl: string | null;
  // Never observed populated: the status payload omits the key entirely on a pending or signed
  // signatory, and no rejection has been run through the sandbox. The webhook payload documents it
  // PascalCase as RejectReason, so both spellings are read rather than one being guessed at.
  rejectReason?: string | null;
  RejectReason?: string | null;
};

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.accessToken;
  }
  // Basic auth carries the account credentials AND the same pair is repeated in the form body.
  // Both are required — dropping either returns 401 (pilot finding #1). grant_type is the literal
  // string "integration", not a standard OAuth grant.
  const basic = Buffer.from(`${SADQ_ACCOUNT_ID}:${SADQ_ACCOUNT_SECRET}`).toString("base64");
  const res = await fetch(`${SADQ_API_BASE}/Authentication/Authority/Token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "integration",
      username: SADQ_USERNAME,
      password: SADQ_PASSWORD,
      accountId: SADQ_ACCOUNT_ID,
      accountSecret: SADQ_ACCOUNT_SECRET,
    }).toString(),
  });
  if (!res.ok) {
    throw new Error(`Sadq token request failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token?: string; expires_in?: number; errorMessage?: string };
  if (!json.access_token) {
    throw new Error(`Sadq token request returned no access_token: ${json.errorMessage ?? "unknown error"}`);
  }
  cachedToken = {
    accessToken: json.access_token,
    expiresAt: Date.now() + (json.expires_in ?? 3600) * 1000,
  };
  return cachedToken.accessToken;
}

type SadqEnvelopeResponse<T> = {
  data: T | null;
  errorCode: number;
  message: string | null;
  stateValidationErrors: Record<string, unknown> | null;
};

/**
 * Every SADQ endpoint answers 200 even when the call failed — the real result is in `errorCode`,
 * and a validation failure comes back as 200 + errorCode 8 with the offending fields in
 * `stateValidationErrors` (pilot finding #2). Checking res.ok alone would treat those as success.
 */
async function sadqCall<T>(path: string, init: RequestInit = {}): Promise<T | null> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  if (init.body && !headers.has("Content-Type")) headers.set("Content-Type", "application/json");

  const res = await fetch(`${SADQ_API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    throw new Error(`Sadq ${init.method ?? "GET"} ${path} failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as SadqEnvelopeResponse<T>;
  if (json.errorCode !== 0) {
    const detail = json.stateValidationErrors
      ? JSON.stringify(json.stateValidationErrors).slice(0, 400)
      : (json.message ?? "");
    throw new Error(`Sadq ${init.method ?? "GET"} ${path} returned errorCode ${json.errorCode}: ${detail}`);
  }
  return json.data ?? null;
}

/**
 * For the endpoints that return a payload. A 200 + errorCode 0 + `data: null` is what an id the
 * account does not own comes back as (pilot finding #3) — success-shaped nothing, which has to be
 * treated as an error. The action endpoints (cancel, complete) legitimately answer without a `data`
 * key at all, so they use sadqCall directly.
 */
async function sadqJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const data = await sadqCall<T>(path, init);
  if (data == null) {
    throw new Error(`Sadq ${init.method ?? "GET"} ${path} returned no data`);
  }
  return data;
}

async function getEnvelope(requestId: string): Promise<SadqEnvelope> {
  const data = await sadqJson<{
    id: string;
    status: string;
    signatories: SadqSignatory[];
    documents: { id: string; isSigned: boolean }[] | null;
  }>(`/api/v1/envelopes/${encodeURIComponent(requestId)}/status`);

  return {
    envelopeId: data.id,
    status: data.status,
    signatories: data.signatories ?? [],
    documentId: data.documents?.[0]?.id ?? null,
  };
}

function mapSignatoryStatus(status: string | null): "pending" | "signed" | "rejected" | "transferred" {
  switch ((status ?? "").toUpperCase()) {
    case "SIGNED":
      return "signed";
    case "REJECTED":
    case "DECLINED":
      return "rejected";
    case "TRANSFERED":
    case "TRANSFERRED":
      return "transferred";
    default:
      return "pending";
  }
}

export const sadqAdapter: SignatureAdapter = {
  async createSignatureRequest(input: CreateSignatureRequestInput): Promise<CreateSignatureRequestResult> {
    // Anchor search first: if the template drifted, fail before creating anything on SADQ's side
    // rather than leaving a half-built envelope behind.
    const anchors = await locateAnchors(
      input.pdfBuffer,
      input.signatories.map((s) => s.anchorTag),
    );

    // referenceNumber is our own id stamped onto the envelope. Signit had no working equivalent
    // (its custom_fields are broken), so this is a genuine gain here: the webhook payload and
    // GET /api/v1/envelopes/reference/{referenceNumber}/status both carry it, which means a
    // signature can always be traced back to its deal without a local lookup.
    const envelope = await sadqJson<{ documentId: string; envelopeId: string; referenceNumber: string }>(
      "/api/v1/envelopes/initiate-base64",
      {
        method: "POST",
        body: JSON.stringify({
          referenceNumber: input.dealId,
          // `File`, singular, with no fileId. The published example shows `files` and an empty
          // `fileId`; both are wrong — `files` fails "File is required field" and an empty fileId
          // fails GUID binding (pilot finding #2).
          File: {
            file: input.pdfBuffer.toString("base64"),
            fileName: "contract.pdf",
          },
        }),
      },
    );

    const destinations = input.signatories.map((s) => {
      const box = fieldBoxFromAnchor(anchors[s.anchorTag], FIELD_WIDTH_PT, FIELD_HEIGHT_PT);
      return {
        destinationName: s.fullName,
        destinationEmail: s.contactEmail,
        // owner signs first — matches the contract's own signature table order, and Signit's
        // order 0 / order 1 convention, which the rest of this build already assumes.
        signeOrder: s.role === "owner" ? 0 : 1,
        destinationType: 1,
        authenticationType: AUTHENTICATION_TYPE,
        invitationLanguage: INVITATION_LANGUAGE_AR,
        signatories: [
          {
            type: "Signature",
            text: "",
            isRequired: true,
            pageNumber: box.page,
            positionX: box.x,
            positionY: box.y,
            signatureWidth: box.width,
            signatureHigh: box.height,
          },
        ],
      };
    });

    // v3 rather than v1/v2: it is the only version that returns the signing link in the response.
    const invited = await sadqJson<{ id: string; signeOrder: number; invitationLink: string | null }[]>(
      "/api/v3/invitations/send",
      {
        method: "POST",
        body: JSON.stringify({
          documentId: envelope.documentId,
          destinations,
          invitationSubject: input.title,
          invitationMessage: "دعوة لتوقيع عقد الخدمة عبر منصة عِمارة.",
          // The parties sign inside emaraa.app; SADQ's own email invitation would be a second,
          // unbranded route into the same document.
          sendUserInvitation: false,
        }),
      },
    );

    // The response is not returned in the order the destinations were sent (pilot finding #5), so
    // match on signeOrder rather than array position.
    const signatoryIds = {} as Record<SignatoryRole, string>;
    for (const s of input.signatories) {
      const order = s.role === "owner" ? 0 : 1;
      const match = invited.find((i) => i.signeOrder === order);
      if (match) signatoryIds[s.role] = match.id;
    }

    return { requestId: envelope.envelopeId, signatoryIds };
  },

  async getSigningLink(requestId: string, signatoryId: string): Promise<SigningLinkResult> {
    const envelope = await getEnvelope(requestId);
    const signatory = envelope.signatories.find((s) => s.id === signatoryId);
    if (!signatory?.signingUrl) {
      // SADQ returns an empty signingUrl for a signatory who has already signed, been cancelled,
      // or was never invited — none of which should send the party to a broken page.
      throw new Error(`Sadq has no active signing link for signatory ${signatoryId}`);
    }
    // A fresh short link is minted on every status call, so it is never cached. No expiry is
    // documented for it.
    return { url: signatory.signingUrl, expiresAt: null };
  },

  async getStatus(
    requestId: string,
    signatoryIds?: Partial<Record<SignatoryRole, string>>,
  ): Promise<SignatureRequestStatus> {
    if (!signatoryIds?.owner || !signatoryIds?.provider) {
      // Deliberately fatal. SADQ adds the API account itself to every envelope as a third
      // signatory, already SIGNED and carrying signing order 0 — the same order as the owner —
      // and its email is the account's own, which is also the fallback address used for an owner
      // with no email on file. Neither order nor email can separate it from a real party, so
      // without the stored id map there is no safe way to read this payload, and guessing would
      // mean closing a deal on a signature nobody made.
      throw new Error("sadqAdapter.getStatus requires the deal's stored signatory ids");
    }

    const envelope = await getEnvelope(requestId);
    const byId = new Map(envelope.signatories.map((s) => [s.id, s]));

    const perSignatory = (["owner", "provider"] as SignatoryRole[]).map((role) => {
      const id = signatoryIds[role]!;
      const s = byId.get(id);
      return {
        role,
        signatoryId: id,
        status: mapSignatoryStatus(s?.status ?? null),
        rejectedReason: s?.rejectReason ?? s?.RejectReason ?? null,
      };
    });

    const anySigned = perSignatory.some((s) => s.status === "signed");
    const allSigned = perSignatory.every((s) => s.status === "signed");
    const anyRejected = perSignatory.some((s) => s.status === "rejected");
    const envelopeStatus = envelope.status.toUpperCase();

    let state: SignatureRequestStatus["state"];
    if (anyRejected || envelopeStatus === "REJECTED" || envelopeStatus === "DECLINED") state = "rejected";
    else if (envelopeStatus === "VOIDED" || envelopeStatus === "CANCELLED") state = "voided";
    else if (envelopeStatus === "EXPIRED") state = "expired";
    // "Completed" is SADQ's envelope-level done, but it counts its own auto-added signatory too.
    // Both of our parties having signed is the condition that closes a deal, so require it as
    // well — a Completed envelope where one real party is still PENDING must not read as signed.
    else if (allSigned && envelopeStatus === "COMPLETED") state = "signed";
    else if (anySigned || allSigned) state = "partially_signed";
    else state = "sent";

    return { state, perSignatory };
  },

  async downloadSealed(requestId: string): Promise<DownloadedFile> {
    const envelope = await getEnvelope(requestId);
    if (!envelope.documentId) {
      throw new Error(`Sadq envelope ${requestId} has no document to download`);
    }
    // Three endpoints return the finished file. /signed hands back a ZIP (application/zip) rather
    // than a PDF, and /documents/{id} returns whichever version currently exists, signed or not.
    // /completed/base64 is the only one that is both a PDF and unambiguous about being the
    // completed one (pilot finding #7).
    const file = await sadqJson<{ file: string; fileName: string; contentType: string }>(
      `/api/v1/documents/${encodeURIComponent(envelope.documentId)}/completed/base64`,
    );
    const bytes = Buffer.from(file.file, "base64");
    if (bytes.subarray(0, 4).toString("latin1") !== "%PDF") {
      throw new Error("Sadq returned a sealed file that is not a PDF");
    }
    return { bytes };
  },

  async voidRequest(requestId: string): Promise<void> {
    // The envelope id goes in the URL and again in the body, spelled `envelopId` — SADQ's own
    // spelling, not a typo here. No reason field exists; ours is recorded in signature_events.
    // sadqCall, not sadqJson: a successful cancel answers with no `data` key at all.
    await sadqCall<unknown>(`/api/v1/envelopes/${encodeURIComponent(requestId)}/cancel`, {
      method: "POST",
      body: JSON.stringify({ envelopId: requestId }),
    });
  },

  async verifyWebhook(headers: Record<string, string>, rawBody: Buffer): Promise<WebhookVerification> {
    // Implementable here, unlike on Signit: SADQ webhooks are registered with a headerToken it
    // echoes back on every delivery. No receiver route is wired up yet — state is still written by
    // the poller in reconcile.ts, per _work/esign-workflow-spec-v1.md §5 — but the check itself
    // belongs with the vendor, not with the route that will eventually call it.
    if (!SADQ_WEBHOOK_TOKEN) return { valid: false, event: null };

    const presented = headers[SADQ_WEBHOOK_HEADER] ?? headers[SADQ_WEBHOOK_HEADER.toLowerCase()] ?? "";
    const { timingSafeEqual } = await import("node:crypto");
    const a = Buffer.from(presented);
    const b = Buffer.from(SADQ_WEBHOOK_TOKEN);
    const valid = a.length === b.length && timingSafeEqual(a, b);
    if (!valid) return { valid: false, event: null };

    try {
      return { valid: true, event: JSON.parse(rawBody.toString("utf8")) };
    } catch {
      return { valid: false, event: null };
    }
  },
};
