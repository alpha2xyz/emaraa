import { useEffect, useRef, useState } from "react";
import { FileSignature, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
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

// Signit's signing surface opens in a new tab; SADQ's opens embedded in-page — see
// openSigningSurface below for both. Signit was tried embedded first and doesn't work. SADQ was
// verified live 2026-09-23 to work fully embedded (contract render, signature draw/type, submit),
// so only SADQ gets the in-page modal for now. The card's polling is what brings the state back
// either way, so a signer who leaves the tab (Signit) still sees the result on return.
//
// Fast-follow worth revisiting once there is time to verify its API: @signitsa/signitsa-embedded,
// the vendor's own embed package, which may handle in-page embedding correctly where a raw
// iframe does not.
export type ContractSigningCardProps = {
  dealId: string | null;
  role: "owner" | "provider";
};

// Signing order is not guaranteed — owner and provider can each sign whenever they open their
// own link, SADQ does not enforce who goes first. So "is this signer done" can never be inferred
// from role + the aggregate signature_status; it has to come from that signatory's own status
// (server/esign/reconcile.ts's per_role, surfaced here as my_signatory_status).
function shouldAutoCloseSigningModal(status: SignatureStatus, mySignatoryStatus: string | null): boolean {
  if (status === "signed" || status === "rejected" || status === "expired" || status === "voided" || status === "failed") {
    return true;
  }
  return mySignatoryStatus === "signed";
}

const LABELS: Record<Exclude<SignatureStatus, null>, { ar: string; en: string }> = {
  preparing: { ar: "جاري تجهيز العقد", en: "Preparing the contract" },
  sent: { ar: "قيد التوقيع", en: "Awaiting signatures" },
  // Overridden below when it's specifically this signer's own turn (my_signatory_status still
  // pending while status is partially_signed) — otherwise this neutral text already covers both
  // "waiting on the other party" and "I'm not up yet" correctly regardless of who signs first.
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

export function ContractSigningCard({ dealId }: ContractSigningCardProps) {
  const { lang } = useLang();
  const [status, setStatus] = useState<SignatureStatus>(null);
  const [signedPdfPath, setSignedPdfPath] = useState<string | null>(null);
  const [rejectedReason, setRejectedReason] = useState<string | null>(null);
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [signingModalOpen, setSigningModalOpen] = useState(false);
  const [mySignatoryStatus, setMySignatoryStatus] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const prevCloseKeyRef = useRef<string>("");

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
          my_signatory_status: string | null;
        };
        if (cancelled) return;
        setStatus(body.signature_status);
        setSignedPdfPath(body.signed_pdf_path);
        setRejectedReason(body.signature_rejected_reason);
        setMySignatoryStatus(body.my_signatory_status);

        // Only close on a genuine transition into a closing condition, not on every tick that
        // happens to already be at one — otherwise reopening the modal from a state that already
        // qualifies (e.g. clicking "Sign now" again after already being done) gets slammed shut
        // by the very next poll.
        const closeKey = `${body.signature_status}|${body.my_signatory_status}`;
        if (
          closeKey !== prevCloseKeyRef.current &&
          shouldAutoCloseSigningModal(body.signature_status, body.my_signatory_status)
        ) {
          setSigningModalOpen(false);
          setSigningUrl(null);
        }
        prevCloseKeyRef.current = closeKey;

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

  const iAmDone = mySignatoryStatus === "signed";
  const label =
    status === "partially_signed" && !iAmDone
      ? { ar: "دورك للتوقيع", en: "Your turn to sign" }
      : (LABELS[status] ?? LABELS.sent);
  // Once my own signatory status is "signed", "Sign now" would just reopen my own
  // already-completed signing link — regardless of who signed first.
  const canSign = (status === "sent" || status === "partially_signed") && !iAmDone;

  const openSigningSurface = async () => {
    if (!dealId) return;
    try {
      const res = await fetch(`/api/deals/${dealId}/signing-link`, { headers: authHeaders() });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.url) return;
      if (body.vendor === "sadq") {
        setSigningUrl(body.url as string);
        setSigningModalOpen(true);
        return;
      }
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

      <Dialog
        open={signingModalOpen}
        onOpenChange={(open) => {
          setSigningModalOpen(open);
          if (!open) setSigningUrl(null);
        }}
      >
        <DialogContent className="max-w-2xl w-[85vw] h-[75vh] flex flex-col gap-0 p-0">
          <div className="p-4 border-b">
            <DialogTitle className="text-sm">
              {lang === "ar" ? "التوقيع الإلكتروني" : "Electronic Signature"}
            </DialogTitle>
          </div>
          {signingUrl && (
            <iframe
              src={signingUrl}
              className="w-full flex-1 border-0"
              title={lang === "ar" ? "التوقيع الإلكتروني" : "Electronic Signature"}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ContractSigningCard;
