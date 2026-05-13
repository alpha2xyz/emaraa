import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Hourglass } from "lucide-react";

type Status = "pending" | "accepted" | "rejected" | "in_progress";

const statusConfig: Record<Status, { icon: React.ElementType; className: string; label: Record<"ar" | "en", string> }> = {
  pending:     { icon: Clock,        className: "bg-amber-100 text-amber-800 border-amber-200",  label: { ar: "قيد المراجعة",   en: "Pending" } },
  accepted:    { icon: CheckCircle2, className: "bg-green-100 text-green-800 border-green-200",  label: { ar: "مقبول",          en: "Accepted" } },
  rejected:    { icon: XCircle,      className: "bg-red-100 text-red-800 border-red-200",        label: { ar: "مرفوض",         en: "Rejected" } },
  in_progress: { icon: Hourglass,    className: "bg-blue-100 text-blue-800 border-blue-200",     label: { ar: "جاري التنفيذ",   en: "In Progress" } },
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
