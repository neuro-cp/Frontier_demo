import PortalSubpageShell from "@/components/PortalSubpageShell";

export default function ClientPortalMessagesPage() {
  return (
    <PortalSubpageShell
      portalName="Client Portal"
      dashboardHref="/client-portal"
      title="Client Messages"
      description="Customers will send and receive project messages here. Messaging is not implemented yet."
    />
  );
}
