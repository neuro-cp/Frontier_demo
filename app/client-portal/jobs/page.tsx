import PortalSubpageShell from "@/components/PortalSubpageShell";
import ClientPortalDataList, { clientPortalFormatters } from "@/app/client-portal/ClientPortalDataList";

export default function ClientPortalJobsPage() {
  return (
    <PortalSubpageShell
      portalName="Client Portal"
      dashboardHref="/client-portal"
      title="Client Jobs"
      description="Customers will view active, scheduled, and completed jobs here."
    >
      <ClientPortalDataList
        type="jobs"
        emptyText="No jobs are currently linked to this client portal access."
        columns={[
          { key: "name", label: "Job" },
          { key: "status", label: "Status" },
          { key: "scheduled_date", label: "Date", format: clientPortalFormatters.date },
          { key: "scheduled_time", label: "Time" },
          { key: "estimated_value_cents", label: "Estimate", format: clientPortalFormatters.moneyCents },
        ]}
      />
    </PortalSubpageShell>
  );
}
