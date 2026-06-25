import PortalSubpageShell from "@/components/PortalSubpageShell";
import ClientPortalMessagesPanel from "@/app/client-portal/ClientPortalMessagesPanel";

export default function ClientPortalMessagesPage() {
  return (
    <PortalSubpageShell
      portalName="Client Portal"
      dashboardHref="/client-portal"
      title="Client Messages"
      description="Send and review client portal messages. External email and SMS delivery are not connected yet."
    >
      <ClientPortalMessagesPanel />
    </PortalSubpageShell>
  );
}
