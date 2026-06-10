import type React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle, Clock, Hourglass } from "lucide-react";

type Status = "pending" | "accepted" | "rejected" | "in_progress";

const statusConfig: Record<
  Status,
  { icon: React.ElementType; className: string; label: Record<"ar" | "en", string> }
> = {
  pending: {
    icon: Clock,
    className: "bg-amber-500/15 text-amber-300 border-amber-500/30",
    label: { ar: "قيد المراجعة", en: "Pending" },
  },
  accepted: {
    icon: CheckCircle2,
    className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
    label: { ar: "مقبول", en: "Accepted" },
  },
  rejected: {
    icon: XCircle,
    className: "bg-red-500/15 text-red-300 border-red-500/30",
    label: { ar: "مرفوض", en: "Rejected" },
  },
  in_progress: {
    icon: Hourglass,
    className: "bg-blue-500/15 text-blue-300 border-blue-500/30",
    label: { ar: "جاري التنفيذ", en: "In Progress" },
  },
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
