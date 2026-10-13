import type { MilestoneStatus } from "@/lib/types";

const CONFIG: Record<
  MilestoneStatus | "vacant" | "leased" | "under-offer" | "in-progress" | "stalled",
  { label: string; className: string }
> = {
  complete:      { label: "Complete",      className: "bg-ok-bg text-ok" },
  "in-progress": { label: "In progress",   className: "bg-brand-soft text-brand" },
  pending:       { label: "Pending",       className: "bg-sunk text-muted" },
  late:          { label: "Late",          className: "bg-late-bg text-late" },
  stalled:       { label: "Stalled",       className: "bg-risk-bg text-risk" },
  vacant:        { label: "Vacant",        className: "bg-sunk text-muted" },
  leased:        { label: "Leased",        className: "bg-ok-bg text-ok" },
  "under-offer": { label: "Under offer",   className: "bg-risk-bg text-risk" },
};

export default function StatusChip({ status }: { status: keyof typeof CONFIG }) {
  const cfg = CONFIG[status] ?? CONFIG["pending"];
  return (
    <span
      className={`inline-flex items-center font-mono text-[11px] tracking-[0.06em] px-2 py-0.5 rounded ${cfg.className}`}
    >
      {cfg.label}
    </span>
  );
}
