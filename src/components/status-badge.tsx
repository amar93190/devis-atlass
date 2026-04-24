import { QuoteStatus } from "@prisma/client";

const classes: Record<QuoteStatus, string> = {
  DRAFT: "bg-slate-200 text-slate-700",
  SENT: "bg-blue-100 text-blue-800",
  VALIDATED: "bg-emerald-100 text-emerald-800",
  CANCELLED: "bg-rose-100 text-rose-700",
};

const labels: Record<QuoteStatus, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  VALIDATED: "Validé",
  CANCELLED: "Annulé",
};

type StatusBadgeProps = {
  status: QuoteStatus;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${classes[status]}`}>
      {labels[status]}
    </span>
  );
}
