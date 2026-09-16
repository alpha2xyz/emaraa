import { useEffect, useRef, useState } from "react";
import { FileSignature, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useLang } from "@/hooks/use-lang";
import { openSignedPdf } from "@/lib/storage";

type SignatureStatus =
  | "preparing"
  | "sent"
  | "partially_signed"
  | "signed"
  | "rejected"
  | "expired"
  | "voided"
  | "failed"
  | null;

// The signing surface opens in a new tab on Signit's own domain. An embedded iframe was tried
// first and does not work: see openSigningSurface below. The card's polling is what brings the
// state back, so the signer returning to this tab sees the result without doing anything.
//
// Fast-follow worth revisiting once there is time to verify its API: @signitsa/signitsa-embedded,
// the vendor's own embed package, which may handle in-page embedding correctly where a raw
// iframe does not.
export type ContractSigningCardProps = {
  dealId: string | null;
  role: "owner" | "provider";
};

const LABELS: Record<Exclude<SignatureStatus, null>, { ar: string; en: string }> = {
  preparing: { ar: "جاري تجهيز العقد", en: "Preparing the contract" },
  sent: { ar: "قيد التوقيع", en: "Awaiting signatures" },
  // Overridden per role below: partially_signed always means the owner has signed and the
  // provider has not, because the two signatories are created in that order.
  partially_signed: { ar: "بانتظار توقيع الطرف الآخر", en: "Waiting on the other party" },
  signed: { ar: "موقّع", en: "Signed" },
  rejected: { ar: "رُفض التوقيع", en: "Signing declined" },
  expired: { ar: "انتهت صلاحية الطلب", en: "Signing request expired" },
  voided: { ar: "أُلغي طلب التوقيع", en: "Signing request cancelled" },
  failed: { ar: "تعذّر إنشاء العقد", en: "Could not prepare the contract" },
};

function authHeaders(): Record<string, string> {
  const token = localStorage.getItem("sessionToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export function ContractSigningCard({ dealId, role }: ContractSigningCardProps) {
  const { lang } = useLang();
  const [status, setStatus] = useState<SignatureStatus>(null);
  const [signedPdfPath, setSignedPdfPath] = useState<string | null>(null);
  const [rejectedReason, setRejectedReason] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!dealId) return;

    let cancelled = false;
    const poll = async () => {
      try {
        const res = await fetch(`/api/deals/${dealId}/signature-status`, {
          headers: authHeaders(),
        });
        if (!res.ok || cancelled) return;
        const body = (await res.json()) as {
          signature_status: SignatureStatus;
          signed_pdf_path: string | null;
          signature_rejected_reason: string | null;
        };
        if (cancelled) return;
        setStatus(body.signature_status);
        setSignedPdfPath(body.signed_pdf_path);
        setRejectedReason(body.signature_rejected_reason);

        const terminal = new Set(["signed", "rejected", "expired", "voided", "failed", null]);
        if (terminal.has(body.signature_status) && pollRef.current) {
          clearInterval(pollRef.current);
          pollRef.current = null;
        }
      } catch {
        // A transient failure here just means the next poll tries again — never surface it.
      }
    };

    poll();
    pollRef.current = setInterval(poll, 6000);
    return () => {
      cancelled = true;
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [dealId]);

  if (!dealId || !status) return null;

  const label =
    status === "partially_signed"
      ? role === "provider"
        ? { ar: "دورك للتوقيع", en: "Your turn to sign" }
        : { ar: "بانتظار توقيع مزود الخدمة", en: "Waiting on the provider" }
      : (LABELS[status] ?? LABELS.sent);
  const canSign = status === "sent" || status === "partially_signed";

  const openSigningSurface = async () => {
    if (!dealId) return;
    try {
      const res = await fetch(`/api/deals/${dealId}/signing-link`, { headers: authHeaders() });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.url) return;
      // A new tab, not an embedded iframe. Verified 2026-09-16 against the sandbox: inside an
      // iframe the signing surface renders the contract and then accepts no input at all —
      // "بدء التوقيع" does nothing and the document will not scroll — so the contract could be
      // read and never signed. The same link works immediately at top level. Keeping the signer
      // on emaraa.app was the nicer design; a signature that cannot be completed is not a design.
      window.open(body.url as string, "_blank", "noopener,noreferrer");
    } catch {
      // Nothing to do — the button stays clickable and the user can try again.
    }
  };

  return (
    <>
      <Card
        className="border"
        style={{ background: "var(--provider-soft)", borderColor: "rgba(27,127,220,0.4)" }}
      >
        <CardContent className="p-3 flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            {status === "failed" || status === "rejected" ? (
              <AlertTriangle className="w-4 h-4 flex-shrink-0" style={{ color: "var(--err)" }} />
            ) : (
              <FileSignature className="w-4 h-4 flex-shrink-0" style={{ color: "var(--provider)" }} />
            )}
            <div>
              <p className="text-sm font-semibold" style={{ color: "var(--provider)" }}>
                {lang === "ar" ? label.ar : label.en}
              </p>
              {rejectedReason && (
                <p className="text-xs text-muted-foreground">{rejectedReason}</p>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {canSign && (
              <Button size="sm" onClick={openSigningSurface} className="gap-1.5">
                <FileSignature className="w-3.5 h-3.5" />
                {lang === "ar" ? "التوقيع الآن" : "Sign now"}
              </Button>
            )}
            {status === "signed" && signedPdfPath && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => openSignedPdf("contracts", signedPdfPath)}
                className="gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                {lang === "ar" ? "تنزيل العقد الموقّع" : "Download signed contract"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}

export default ContractSigningCard;
