export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import WorkspaceClient from "./WorkspaceClient";
import { ALL_TRANSACTIONS, DEMO_ASSET } from "@/lib/demo-data";

export default async function TransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const txn = ALL_TRANSACTIONS.find((t) => t.id === id);
  if (!txn) notFound();

  const unit = DEMO_ASSET.units.find((u) => u.id === txn.unitId);

  return (
    <AppShell>
      <WorkspaceClient transactionId={id} unitLabel={unit?.label ?? ""} />
    </AppShell>
  );
}
