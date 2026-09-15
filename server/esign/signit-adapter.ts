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

// Ground truth for every shape below: the 2026-09-13 sandbox pilot
// (_work/signit-api-integration-brief-v1.md), cross-checked against
// Resources/signit-api-openapi-2026-09-13.yaml. Endpoints not exercised in the pilot are not
// used here even where the spec documents them (e.g. custom_fields, document_type, tags — all
// confirmed broken in the sandbox).

const SIGNIT_API_BASE = process.env.SIGNIT_API_BASE ?? "";
const SIGNIT_CLIENT_ID = process.env.SIGNIT_CLIENT_ID ?? "";
const SIGNIT_CLIENT_SECRET = process.env.SIGNIT_CLIENT_SECRET ?? "";

// email for the demo build (fictitious seeded identities can't Nafath-verify as themselves);
// nafath is the reserved value for the real production step, once legal review clears §9 and
// ESIGN_ENABLED is allowed on production. See server/app.ts's boot guard.
const VERIFICATION_METHOD = process.env.ESIGN_VERIFICATION_METHOD ?? "email";

let cachedToken: { accessToken: string; expiresAt: number } | null = null;

async function getAccessToken(): Promise<string> {
  if (cachedToken && cachedToken.expiresAt > Date.now() + 30_000) {
    return cachedToken.accessToken;
  }
  const basic = Buffer.from(`${SIGNIT_CLIENT_ID}:${SIGNIT_CLIENT_SECRET}`).toString("base64");
  const res = await fetch(`${SIGNIT_API_BASE}/oauth/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    // Scope names are plural on the API even though the sandbox portal UI writes them singular
    // — using the portal's spelling returns 422 (pilot finding #1).
    body: "grant_type=client_credentials&scope=signature-requests:read signature-requests:write",
  });
  if (!res.ok) {
    throw new Error(`Signit token request failed: ${res.status} ${await res.text()}`);
  }
  const json = (await res.json()) as { access_token: string; expires_in: number };
  cachedToken = { accessToken: json.access_token, expiresAt: Date.now() + json.expires_in * 1000 };
  return cachedToken.accessToken;
}

async function signitFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${SIGNIT_API_BASE}${path}`, { ...init, headers });
  if (!res.ok) {
    throw new Error(`Signit ${init.method ?? "GET"} ${path} failed: ${res.status} ${await res.text()}`);
  }
  return res;
}

async function uploadDocument(pdfBuffer: Buffer): Promise<string> {
  // A fresh upload every call — the pilot found a reused document_name 404s with no explanation
  // (pilot finding #4). Never cache or reuse a document_name across signature requests.
  const form = new FormData();
  form.append("document", new Blob([pdfBuffer], { type: "application/pdf" }), "contract.pdf");
  const res = await signitFetch("/documents", { method: "POST", body: form });
  const json = (await res.json()) as { document_name: string };
  return json.document_name;
}

function buildVerificationMethod(email: string): Record<string, unknown> {
  if (VERIFICATION_METHOD === "nafath") return { nafath: true };
  // Per the OpenAPI schema, verification_method.email is the signer's email address itself
  // (a string), not a boolean flag — unlike nafath, which is boolean. Confirmed against
  // Resources/signit-api-openapi-2026-09-13.yaml, not assumed from the narrative brief.
  return { email };
}

export const signitAdapter: SignatureAdapter = {
  async createSignatureRequest(input: CreateSignatureRequestInput): Promise<CreateSignatureRequestResult> {
    const documentName = await uploadDocument(input.pdfBuffer);

    const signatoriesPayload = input.signatories.map((s) => ({
      full_name: s.fullName,
      order: s.role === "owner" ? 0 : 1, // owner signs first — matches the contract's own signature table order
      verification_method: buildVerificationMethod(s.contactEmail),
      notification_method: { email: s.contactEmail },
      fields: [
        {
          position: {
            anchor_tag: s.anchorTag,
            page: s.anchorPage,
            ignore_if_not_present: false,
          },
          properties: { required: true },
          placeholder: s.role === "owner" ? "توقيع المالك" : "توقيع مقدم الخدمة",
          kind: "signature" as const,
          // No `appearance` here: Signit rejects it on anything but text_field kind
          // ("apperance should only associated with text_fields"), confirmed 2026-09-15.
        },
      ],
    }));

    const res = await signitFetch("/signature-requests/embedded", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        document_name: documentName,
        signature_request: {
          title: `عقد عِمارة — ${input.dealId}`,
          signatories: signatoriesPayload,
          settings: {
            signing_settings: {
              // Defaults to false, which would force the identity gate (Nafath/email) before the
              // signer has even seen the contract — wrong order for a real contract value.
              signatory_allowed_to_review_before_authenticate: true,
            },
          },
        },
      }),
    });
    // The create response is only { id, created_date } (confirmed against the OpenAPI spec —
    // no signatories array, unlike GET /signature-requests/{id}). A follow-up GET is required
    // to learn each signatory's vendor-assigned id, matching the pilot's own two-call sequence
    // (create, then status).
    const created = (await res.json()) as { id: string };
    const statusRes = await signitFetch(`/signature-requests/${created.id}`);
    const statusJson = (await statusRes.json()) as {
      signatories: { id: string; order: number }[];
    };

    const signatoryIds = {} as Record<SignatoryRole, string>;
    for (const s of input.signatories) {
      const order = s.role === "owner" ? 0 : 1;
      const match = statusJson.signatories.find((r) => r.order === order);
      if (match) signatoryIds[s.role] = match.id;
    }
    return { requestId: created.id, signatoryIds };
  },

  async getSigningLink(requestId: string, signatoryId: string): Promise<SigningLinkResult> {
    const res = await signitFetch(
      `/signature-requests/${requestId}/signatories/${signatoryId}/signing-link`,
    );
    const json = (await res.json()) as { url: string };
    // No expiry is documented for this link — treated as session-lived, not cached beyond the request.
    return { url: json.url, expiresAt: null };
  },

  async getStatus(requestId: string): Promise<SignatureRequestStatus> {
    const res = await signitFetch(`/signature-requests/${requestId}`);
    const json = (await res.json()) as {
      status: "IN-PROGRESS" | "COMPLETED" | "VOIDED" | "EXPIRED" | "DECLINED" | "DRAFT";
      signatories: { id: string; status: "SIGNED" | "REJECTED" | "TRANSFERED" | null; order: number }[];
    };

    const perSignatory = json.signatories.map((s) => ({
      role: (s.order === 0 ? "owner" : "provider") as SignatoryRole,
      signatoryId: s.id,
      status: (s.status === "SIGNED"
        ? "signed"
        : s.status === "REJECTED"
          ? "rejected"
          : s.status === "TRANSFERED"
            ? "transferred"
            : "pending") as "pending" | "signed" | "rejected" | "transferred",
      rejectedReason: null, // Signit's status payload doesn't carry a reason string; audit trail would.
    }));

    const anySigned = perSignatory.some((s) => s.status === "signed");
    const anyRejected = perSignatory.some((s) => s.status === "rejected");

    let state: SignatureRequestStatus["state"];
    if (json.status === "COMPLETED") state = "signed";
    else if (json.status === "VOIDED") state = "voided";
    else if (json.status === "EXPIRED") state = "expired";
    else if (json.status === "DECLINED" || anyRejected) state = "rejected";
    else if (anySigned) state = "partially_signed";
    else state = "sent";

    return { state, perSignatory };
  },

  async downloadSealed(requestId: string): Promise<DownloadedFile> {
    const linkRes = await signitFetch(`/signature-requests/${requestId}/files?file_type=sealed`);
    const { url } = (await linkRes.json()) as { url: string };
    // This URL is a pre-signed download link (10-minute expiry), not itself a Signit API call —
    // no bearer token needed or accepted here.
    const fileRes = await fetch(url);
    if (!fileRes.ok) throw new Error(`Signit sealed-file download failed: ${fileRes.status}`);
    return { bytes: Buffer.from(await fileRes.arrayBuffer()) };
  },

  async voidRequest(requestId: string): Promise<void> {
    await signitFetch(`/signature-requests/${requestId}/void`, { method: "PUT" });
  },

  async verifyWebhook(): Promise<WebhookVerification> {
    // Not implemented: Signit's sandbox events:read scope is broken (pilot finding #2), so
    // webhooks were never exercised and this build relies on client-driven polling instead
    // (server/esign/reconcile.ts). Fast-follow once Signit fixes the scope — see
    // _work/esign-workflow-spec-v1.md §7 build-order step 6.
    throw new Error("signitAdapter.verifyWebhook is not implemented — webhooks are not wired up yet");
  },
};
