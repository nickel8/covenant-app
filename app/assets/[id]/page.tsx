export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import AssetClient from "./AssetClient";
import { ALL_ASSETS, ALL_TRANSACTIONS } from "@/lib/demo-data";

export default async function AssetPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const asset = ALL_ASSETS.find((a) => a.id === id);
  if (!asset) notFound();

  const transactions = ALL_TRANSACTIONS.filter((t) => t.assetId === id);

  return (
    <AppShell>
      <AssetClient asset={asset} transactions={transactions} />
    </AppShell>
  );
}
