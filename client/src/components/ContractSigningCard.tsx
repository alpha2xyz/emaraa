import { useEffect, useRef, useState } from "react";
import { FileSignature, Download, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

// Demo build (2026-09-15): plain iframe pointed at Signit's own signing-link URL, not the
// @signitsa/signitsa-embedded npm package. The package adds live in-page events and
// white-labeling on top of the same iframe — real polish, not required for "the signer never
// leaves emaraa.app", which a plain iframe already satisfies. This card's own polling covers
// the state transitions the package's events would otherwise drive. Fast-follow, not a gap in
// this build: swap the iframe body for the package once there's time to verify its API.
export type ContractSigningCardProps = {
  dealId: string | null;
  role: "owner" | "provider";
};

const LABELS: Record<Exclude<SignatureStatus, null>, { ar: string; en: string }> = {
  preparing: { ar: "جاري تجهيز العقد", en: "Preparing the contract" },
  sent: { ar: "قيد التوقيع", en: "Awaiting signatures" },
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
  const [signingUrl, setSigningUrl] = useState<string | null>(null);
  const [signDialogOpen, setSignDialogOpen] = useState(false);
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

  const label = LABELS[status] ?? LABELS.sent;
  const canSign = status === "sent" || status === "partially_signed";

  const openSigningDialog = async () => {
    if (!dealId) return;
    try {
      const res = await fetch(`/api/deals/${dealId}/signing-link`, { headers: authHeaders() });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body?.url) return;
      setSigningUrl(body.url as string);
      setSignDialogOpen(true);
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
              <Button size="sm" onClick={openSigningDialog} className="gap-1.5">
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

      <Dialog open={signDialogOpen} onOpenChange={setSignDialogOpen}>
        <DialogContent className="max-w-3xl h-[85vh] p-0 overflow-hidden flex flex-col gap-0">
          <DialogHeader className="p-4 pb-3 shrink-0">
            <DialogTitle>{lang === "ar" ? "توقيع العقد" : "Sign the contract"}</DialogTitle>
          </DialogHeader>
          {signingUrl && (
            // flex-1, not h-full: DialogContent is a grid by default, where h-full resolves
            // against a content-sized row and leaves the signing surface short with dead space
            // above it.
            <iframe
              src={signingUrl}
              title="Signit"
              className="w-full flex-1 border-0 bg-white"
              // Signit's own signing surface handles Nafath/email verification and file access
              // inside its own origin; this only grants what that flow needs.
              sandbox="allow-scripts allow-forms allow-same-origin allow-popups allow-top-navigation-by-user-activation"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ContractSigningCard;
