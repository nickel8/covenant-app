"use client";

import { useState } from "react";
import Link from "next/link";
import { useDemo } from "@/lib/demo-context";
import type { ActivityEvent, PartyRole } from "@/lib/types";
import StatusChip from "@/components/StatusChip";
import Button from "@/components/Button";

// ── Helpers ───────────────────────────────────────────────

function fmtDate(iso: string) {
  return new Date(iso + "T00:00:00").toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function fmtTimestamp(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ROLE_LABELS: Record<PartyRole, string> = {
  landlord: "Landlord",
  tenant: "Tenant",
  "landlord-solicitor": "Landlord's solicitor",
  "tenant-solicitor": "Tenant's solicitor",
  agent: "Agent",
};

const RACI_TITLE = {
  R: "Responsible",
  A: "Accountable",
  C: "Consulted",
  I: "Informed",
};

// ── Stage progress bar ────────────────────────────────────

function StageProgressBar({ current, labels }: { current: number; labels: string[] }) {
  return (
    <div className="border-b border-border bg-surface px-5 py-3">
      <div className="max-w-5xl mx-auto">
        <div className="flex gap-1 mb-1.5">
          {labels.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-colors ${
                i < current
                  ? "bg-brand"
                  : i === current - 1
                  ? "bg-brand opacity-60"
                  : "bg-border"
              }`}
            />
          ))}
        </div>
        <div className="flex justify-between">
          <span className="font-mono text-[11px] text-muted tracking-[0.06em]">
            Stage {current} of {labels.length} — {labels[current - 1]}
          </span>
          <span className="font-mono text-[11px] text-muted tracking-[0.06em]">
            {labels.length - current} remaining
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Milestones tab ────────────────────────────────────────

function MilestonesTab({
  transactionId,
  milestones,
  onChase,
  onDateAccepted,
  pendingDetect,
}: {
  transactionId: string;
  milestones: ReturnType<typeof useDemo>["transactions"][0]["milestones"];
  onChase: (milestoneId: string, label: string) => void;
  onDateAccepted: () => void;
  pendingDetect: ActivityEvent | undefined;
}) {
  const { updateMilestoneDate } = useDemo();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState("");

  function startEdit(milestoneId: string, currentDate: string) {
    setEditingId(milestoneId);
    setEditDate(currentDate);
  }

  function saveEdit(milestoneId: string) {
    if (editDate) updateMilestoneDate(transactionId, milestoneId, editDate);
    setEditingId(null);
  }

  return (
    <div className="flex flex-col gap-3">
      {/* AI date detection card */}
      {pendingDetect && (
        <div className="border border-accent/30 bg-brand-soft rounded-lg px-4 py-3 flex items-start gap-3">
          <div className="mt-0.5 shrink-0">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#2F5FB3" strokeWidth="1.5" />
              <path d="M8 5v4M8 11v.5" stroke="#2F5FB3" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-ink">{pendingDetect.text}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (pendingDetect.milestoneId && pendingDetect.detectedDate) {
                  updateMilestoneDate(transactionId, pendingDetect.milestoneId, pendingDetect.detectedDate);
                }
                onDateAccepted();
              }}
            >
              Accept date
            </Button>
            <Button variant="ghost" size="sm" onClick={onDateAccepted}>
              Dismiss
            </Button>
          </div>
        </div>
      )}

      {/* Milestones table */}
      <div className="border border-border rounded-lg overflow-hidden bg-surface">
        <table className="w-full text-[13px]">
          <thead>
            <tr className="border-b border-border bg-sunk">
              <th className="text-left px-4 py-2.5 font-mono text-[11px] tracking-[0.06em] text-muted uppercase">Milestone</th>
              <th className="text-left px-4 py-2.5 font-mono text-[11px] tracking-[0.06em] text-muted uppercase">Target date</th>
              <th className="text-left px-4 py-2.5 font-mono text-[11px] tracking-[0.06em] text-muted uppercase hidden sm:table-cell">Owner</th>
              <th className="text-left px-4 py-2.5 font-mono text-[11px] tracking-[0.06em] text-muted uppercase">Status</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {milestones.map((m, i) => (
              <tr key={m.id} className={i < milestones.length - 1 ? "border-b border-border" : ""}>
                <td className="px-4 py-3">
                  <span className="font-medium">{m.label}</span>
                  {m.notes && (
                    <p className="text-muted text-[12px] mt-0.5">{m.notes}</p>
                  )}
                </td>
                <td className="px-4 py-3">
                  {editingId === m.id ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="date"
                        value={editDate}
                        onChange={(e) => setEditDate(e.target.value)}
                        className="border border-border rounded px-2 py-1 text-[12px] font-mono"
                        autoFocus
                      />
                      <button
                        onClick={() => saveEdit(m.id)}
                        className="text-brand text-[12px] font-medium hover:underline"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="text-muted text-[12px] hover:text-ink"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => m.status !== "complete" && startEdit(m.id, m.targetDate)}
                      className={`font-mono text-[12px] tracking-[0.04em] ${
                        m.status !== "complete" ? "hover:text-brand cursor-pointer" : "cursor-default"
                      } ${m.status === "late" ? "text-late" : "text-muted"}`}
                    >
                      {fmtDate(m.targetDate)}
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-muted hidden sm:table-cell">
                  {ROLE_LABELS[m.owner]}
                </td>
                <td className="px-4 py-3">
                  <StatusChip status={m.status} />
                </td>
                <td className="px-4 py-3 text-right">
                  {m.status === "late" && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onChase(m.id, m.label)}
                    >
                      Chase
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Activity feed ─────────────────────────────────────────

const ACTIVITY_ICONS: Record<ActivityEvent["type"], string> = {
  created:    "○",
  milestone:  "✓",
  chase:      "↗",
  email:      "✉",
  "ai-detect": "◈",
  note:       "·",
};

function ActivityFeed({
  events,
  dismissed,
}: {
  events: ActivityEvent[];
  dismissed: Set<string>;
}) {
  const visible = [...events]
    .reverse()
    .filter((e) => !(e.type === "ai-detect" && dismissed.has(e.id)));

  return (
    <div className="flex flex-col">
      {visible.map((event) => (
        <div key={event.id} className="flex gap-3 py-3 border-b border-border last:border-0">
          <div
            className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-mono mt-0.5
              ${event.type === "ai-detect" ? "bg-brand-soft text-accent" :
                event.type === "milestone" ? "bg-ok-bg text-ok" :
                event.type === "chase" ? "bg-risk-bg text-risk" :
                "bg-sunk text-muted"}`}
          >
            {ACTIVITY_ICONS[event.type]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[13px] text-ink leading-snug">{event.text}</p>
            <p className="font-mono text-[11px] text-muted mt-0.5 tracking-[0.04em]">
              {event.actor && <>{event.actor} · </>}
              {fmtTimestamp(event.timestamp)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Terms tab ─────────────────────────────────────────────

function TermsTab({ terms }: { terms: ReturnType<typeof useDemo>["transactions"][0]["terms"] }) {
  const rows: [string, string][] = [
    ["Type", terms.leaseType],
    ["Term", terms.term],
    ["Commencement", fmtDate(terms.commencementDate)],
    ["Rent", terms.rent],
    ["Rent review", terms.rentReview],
    ...(terms.breakClause ? [["Break clause", terms.breakClause] as [string, string]] : []),
    ["Covenant check", terms.covenantCheck ? "Required" : "Not required"],
  ];

  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface">
      <table className="w-full text-[13px]">
        <tbody>
          {rows.map(([label, value], i) => (
            <tr key={label} className={i < rows.length - 1 ? "border-b border-border" : ""}>
              <td className="px-4 py-3 font-mono text-[11px] tracking-[0.06em] text-muted uppercase w-44">
                {label}
              </td>
              <td className="px-4 py-3 text-ink">{value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── RACI tab ──────────────────────────────────────────────

const ALL_ROLES: PartyRole[] = ["landlord", "tenant", "landlord-solicitor", "tenant-solicitor", "agent"];

function RaciTab({ milestones }: { milestones: ReturnType<typeof useDemo>["transactions"][0]["milestones"] }) {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-surface overflow-x-auto">
      <table className="w-full text-[12px] min-w-[600px]">
        <thead>
          <tr className="border-b border-border bg-sunk">
            <th className="text-left px-4 py-2.5 font-mono text-[11px] tracking-[0.06em] text-muted uppercase w-48">Milestone</th>
            {ALL_ROLES.map((role) => (
              <th key={role} className="px-3 py-2.5 font-mono text-[11px] tracking-[0.06em] text-muted uppercase text-center">
                {ROLE_LABELS[role].split(" ")[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {milestones.map((m, i) => (
            <tr key={m.id} className={i < milestones.length - 1 ? "border-b border-border" : ""}>
              <td className="px-4 py-2.5 font-medium leading-snug">{m.label}</td>
              {ALL_ROLES.map((role) => {
                const r = m.raci[role];
                return (
                  <td key={role} className="px-3 py-2.5 text-center">
                    {r && (
                      <span
                        title={RACI_TITLE[r]}
                        className={`inline-flex w-6 h-6 items-center justify-center rounded font-mono text-[11px] font-medium
                          ${r === "R" ? "bg-brand text-white" :
                            r === "A" ? "bg-brand-soft text-brand" :
                            r === "C" ? "bg-sunk text-ink" :
                            "text-muted"}`}
                      >
                        {r}
                      </span>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Parties panel ─────────────────────────────────────────

function PartiesPanel({ parties }: { parties: ReturnType<typeof useDemo>["transactions"][0]["parties"] }) {
  return (
    <div className="flex flex-col gap-3">
      {parties.map((p) => (
        <div key={p.id} className="border border-border rounded-lg bg-surface px-4 py-3">
          <p className="font-mono text-[11px] tracking-[0.06em] text-muted uppercase mb-1">
            {ROLE_LABELS[p.role]}
          </p>
          <p className="font-medium text-[14px]">{p.name}</p>
          <p className="text-[13px] text-muted">{p.contact}</p>
          {p.email && (
            <p className="font-mono text-[11px] text-muted mt-1 tracking-[0.04em]">{p.email}</p>
          )}
        </div>
      ))}
    </div>
  );
}

// ── Main workspace ────────────────────────────────────────

type Tab = "overview" | "terms" | "raci";

export default function WorkspaceClient({
  transactionId,
  unitLabel,
}: {
  transactionId: string;
  unitLabel: string;
}) {
  const { getTransaction, addActivity } = useDemo();
  const txn = getTransaction(transactionId);

  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [dismissedDetects, setDismissedDetects] = useState<Set<string>>(new Set());

  if (!txn) return <div className="p-8 text-muted">Transaction not found.</div>;

  const pendingDetect = txn.activity.find(
    (e) => e.type === "ai-detect" && !dismissedDetects.has(e.id)
  );

  function handleChase(milestoneId: string, milestoneLabel: string) {
    const milestone = txn!.milestones.find((m) => m.id === milestoneId);
    const partyRole = milestone?.owner;
    const party = txn!.parties.find((p) => p.role === partyRole);
    const partyName = party?.contact ?? ROLE_LABELS[partyRole ?? "tenant"];

    addActivity(transactionId, {
      id: `chase-${Date.now()}`,
      timestamp: new Date().toISOString(),
      type: "chase",
      text: `Chased ${partyName} re: ${milestoneLabel}.`,
      actor: "Sam Reid",
    });
  }

  function handleDetectDismiss() {
    if (pendingDetect) {
      setDismissedDetects((prev) => new Set([...prev, pendingDetect.id]));
    }
  }

  function handleDateAccepted() {
    if (pendingDetect?.detectedDate) {
      addActivity(transactionId, {
        id: `accept-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: "milestone",
        text: `Milestone date updated to ${fmtDate(pendingDetect.detectedDate)} from Priya Sharma's email.`,
        actor: "Sam Reid",
      });
    }
    handleDetectDismiss();
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "terms", label: "Terms" },
    { id: "raci", label: "RACI" },
  ];

  return (
    <div className="flex-1 flex flex-col">
      {/* Transaction header */}
      <div className="border-b border-border bg-surface px-5 pt-5 pb-0">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Link href="/assets/asset-1" className="font-mono text-[11px] text-muted hover:text-ink tracking-[0.06em] uppercase">
                  12 Mill Lane
                </Link>
                <span className="text-muted">›</span>
                <span className="font-mono text-[11px] text-muted tracking-[0.06em] uppercase">{unitLabel}</span>
              </div>
              <h1 className="font-display text-[28px] leading-tight">
                {txn.counterparty}
              </h1>
              <p className="text-muted text-[13px] capitalize">{txn.type} · {txn.terms.term}</p>
            </div>
            <StatusChip status={txn.status} />
          </div>

          {/* Tabs */}
          <div className="flex gap-5 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`pb-3 text-[14px] font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-brand text-brand"
                    : "border-transparent text-muted hover:text-ink"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stage bar */}
      <StageProgressBar
        current={txn.currentStage}
        labels={txn.milestones.map((m) => m.label)}
      />

      {/* Body: main content + sidebar */}
      <div className="flex-1 max-w-5xl mx-auto w-full px-5 py-6">
        <div className="flex gap-6">
          {/* Main column */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            {activeTab === "overview" && (
              <MilestonesTab
                transactionId={transactionId}
                milestones={txn.milestones}
                onChase={handleChase}
                onDateAccepted={handleDateAccepted}
                pendingDetect={pendingDetect}
              />
            )}
            {activeTab === "terms" && <TermsTab terms={txn.terms} />}
            {activeTab === "raci" && <RaciTab milestones={txn.milestones} />}

            {/* Activity feed (always shown below) */}
            {activeTab === "overview" && (
              <div>
                <h2 className="font-semibold text-[14px] mb-3">Activity</h2>
                <div className="border border-border rounded-lg bg-surface px-4">
                  <ActivityFeed events={txn.activity} dismissed={dismissedDetects} />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="w-60 shrink-0 hidden lg:block">
            <h2 className="font-semibold text-[14px] mb-3">Parties</h2>
            <PartiesPanel parties={txn.parties} />
          </div>
        </div>
      </div>
    </div>
  );
}
