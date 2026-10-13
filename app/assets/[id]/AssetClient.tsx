"use client";

import { useState } from "react";
import Link from "next/link";
import type { Asset, Transaction } from "@/lib/types";
import StatusChip from "@/components/StatusChip";
import Button from "@/components/Button";

const STAGE_LABELS = [
  "HoT signed",
  "Solicitors",
  "Covenant check",
  "Draft lease",
  "Negotiation",
  "Signing",
  "Fit-out access",
];

function StageBar({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex gap-0.5 items-center">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full flex-1 ${
            i < current ? "bg-brand" : i === current ? "bg-brand opacity-40" : "bg-border"
          }`}
        />
      ))}
    </div>
  );
}

interface Props {
  asset: Asset;
  transactions: Transaction[];
}

export default function AssetClient({ asset, transactions }: Props) {
  const [newTxnOpen, setNewTxnOpen] = useState(false);

  return (
    <div className="flex-1 px-5 py-6 max-w-5xl mx-auto w-full">
      {/* Asset header */}
      <div className="mb-6">
        <p className="font-mono text-[11px] tracking-[0.06em] text-muted uppercase mb-1">Commercial asset</p>
        <h1 className="font-display text-[32px] leading-tight text-ink">{asset.name}</h1>
        <p className="text-muted text-[14px]">{asset.address}, {asset.city} {asset.postcode}</p>
      </div>

      {/* Units table */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[15px]">Units</h2>
        </div>
        <div className="border border-border rounded-lg overflow-hidden bg-surface">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="border-b border-border bg-sunk">
                <th className="text-left px-4 py-2.5 font-medium text-muted font-mono text-[11px] tracking-[0.06em] uppercase">Unit</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted font-mono text-[11px] tracking-[0.06em] uppercase">Size</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted font-mono text-[11px] tracking-[0.06em] uppercase">Tenant / Status</th>
                <th className="px-4 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {asset.units.map((unit, i) => (
                <tr key={unit.id} className={i < asset.units.length - 1 ? "border-b border-border" : ""}>
                  <td className="px-4 py-3 font-medium">{unit.label}</td>
                  <td className="px-4 py-3 text-muted">{unit.sizeSqFt.toLocaleString()} sq ft</td>
                  <td className="px-4 py-3">
                    {unit.tenant ? (
                      <span>{unit.tenant}</span>
                    ) : (
                      <StatusChip status={unit.status} />
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {unit.status === "vacant" && (
                      <Button variant="ghost" size="sm" onClick={() => setNewTxnOpen(true)}>
                        Start lease →
                      </Button>
                    )}
                    {unit.status === "leased" && (
                      <StatusChip status="leased" />
                    )}
                    {unit.status === "under-offer" && (
                      <StatusChip status="under-offer" />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Transactions */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-[15px]">Transactions</h2>
          <div className="relative">
            <Button variant="primary" size="sm" onClick={() => setNewTxnOpen(true)}>
              + New transaction
            </Button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="border border-border rounded-lg bg-surface px-6 py-10 text-center text-muted text-[13px]">
            No transactions yet. Start one above.
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden bg-surface divide-y divide-border">
            {transactions.map((txn) => {
              const currentMilestone = txn.milestones[txn.currentStage - 1];
              return (
                <Link
                  key={txn.id}
                  href={`/transactions/${txn.id}`}
                  className="flex items-center gap-4 px-4 py-3.5 hover:bg-sunk transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-[13px]">{txn.counterparty}</span>
                      <span className="font-mono text-[11px] text-muted">·</span>
                      <span className="font-mono text-[11px] text-muted capitalize">{txn.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-32">
                        <StageBar current={txn.currentStage - 1} total={txn.milestones.length} />
                      </div>
                      <span className="font-mono text-[11px] text-muted">
                        Stage {txn.currentStage} / {txn.milestones.length} — {currentMilestone?.label}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusChip status={txn.status} />
                    <span className="text-muted text-[13px]">→</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* New transaction stub modal */}
      {newTxnOpen && (
        <div
          className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
          onClick={() => setNewTxnOpen(false)}
        >
          <div
            className="bg-surface rounded-xl border border-border shadow-lg p-6 w-full max-w-sm mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-[22px] mb-1">New transaction</h2>
            <p className="text-muted text-[13px] mb-5">What type of transaction?</p>
            <div className="flex flex-col gap-2">
              <Link
                href="/transactions/new?type=lease"
                className="flex items-center justify-between px-4 py-3 border border-border rounded-lg hover:bg-sunk transition-colors"
              >
                <span className="font-medium text-[14px]">Lease</span>
                <span className="text-muted text-[13px]">→</span>
              </Link>
              <Link
                href="/transactions/new?type=acquire"
                className="flex items-center justify-between px-4 py-3 border border-border rounded-lg hover:bg-sunk transition-colors"
              >
                <span className="font-medium text-[14px]">Acquire</span>
                <span className="text-muted text-[13px]">→</span>
              </Link>
              <Link
                href="/transactions/new?type=sell"
                className="flex items-center justify-between px-4 py-3 border border-border rounded-lg hover:bg-sunk transition-colors"
              >
                <span className="font-medium text-[14px]">Sell</span>
                <span className="text-muted text-[13px]">→</span>
              </Link>
            </div>
            <button
              onClick={() => setNewTxnOpen(false)}
              className="mt-4 text-muted text-[13px] hover:text-ink transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
