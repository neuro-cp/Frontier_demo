import PortalSubpageShell from "@/components/PortalSubpageShell";
import ClientPortalDataList, { clientPortalFormatters } from "@/app/client-portal/ClientPortalDataList";

export default function ClientPortalEstimatesPage() {
  return (
    <PortalSubpageShell
      portalName="Client Portal"
      dashboardHref="/client-portal"
      title="Client Estimates"
      description="Customers will view pending estimates and future approval flows here."
    >
      <ClientPortalDataList
        type="estimates"
        emptyText="No estimates are currently linked to this client portal access."
        columns={[
          { key: "estimate_number", label: "Estimate #" },
          { key: "status", label: "Status" },
          { key: "estimate_date", label: "Date", format: clientPortalFormatters.date },
          { key: "bill_to_name", label: "Bill To" },
        ]}
      />
    </PortalSubpageShell>
  );
}
