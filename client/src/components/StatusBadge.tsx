import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Loader2 } from "lucide-react";

type Status = "pending" | "accepted" | "rejected" | "in_progress";

const statusConfig: Record<Status, { icon: React.ElementType; className: string; label: Record<"ar" | "en", string> }> = {
  pending:     { icon: Clock,        className: "bg-orange-50 text-orange-700 border-orange-300",   label: { ar: "قيد المراجعة",  en: "Pending" } },
  accepted:    { icon: CheckCircle2, className: "bg-green-50 text-green-700 border-green-300",      label: { ar: "مقبول",         en: "Accepted" } },
  rejected:    { icon: XCircle,      className: "bg-red-50 text-red-700 border-red-300",            label: { ar: "مرفوض",        en: "Rejected" } },
  in_progress: { icon: Loader2,      className: "bg-blue-50 text-blue-700 border-blue-300",         label: { ar: "جاري التنفيذ",  en: "In Progress" } },
};

export function StatusBadge({ status, lang = "ar" }: { status: string; lang?: "ar" | "en" }) {
  const cfg = statusConfig[status as Status] ?? statusConfig.pending;
  const Icon = cfg.icon;
  return (
    <Badge className={`gap-1 border ${cfg.className}`}>
      <Icon className="h-3 w-3" />
      {cfg.label[lang]}
    </Badge>
  );
}
