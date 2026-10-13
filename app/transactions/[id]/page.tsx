import AppShell from "@/components/AppShell";
import WorkspaceClient from "./WorkspaceClient";

// WorkspaceClient reads from DemoContext, so we don't 404 here — new
// transactions created in the wizard live in client-side state only.
export default async function TransactionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (
    <AppShell>
      <WorkspaceClient transactionId={id} />
    </AppShell>
  );
}
