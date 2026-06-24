import PortalSubpageShell from "@/components/PortalSubpageShell";
import ClientPortalEstimatesList from "@/app/client-portal/ClientPortalEstimatesList";

export default function ClientPortalEstimatesPage() {
  return (
    <PortalSubpageShell
      portalName="Client Portal"
      dashboardHref="/client-portal"
      title="Client Estimates"
      description="Review estimates linked to your client portal access and explicitly approve or reject them."
    >
      <ClientPortalEstimatesList />
    </PortalSubpageShell>
  );
}
