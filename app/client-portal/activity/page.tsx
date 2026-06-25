import PortalSubpageShell from "@/components/PortalSubpageShell";
import ClientPortalDataList from "@/app/client-portal/ClientPortalDataList";

export default function ClientPortalActivityPage() {
  return (
    <PortalSubpageShell
      portalName="Client Portal"
      dashboardHref="/client-portal"
      title="Client Activity"
      description="Recent client-facing operational records. Timeline events will expand as messaging, estimates, invoices, and document events mature."
    >
      <div className="space-y-6">
        <ClientPortalDataList
          type="estimates"
          emptyText="No estimate activity yet."
          columns={[
            { key: "estimate_number", label: "Estimate" },
            { key: "status", label: "Status" },
            { key: "estimate_date", label: "Date" },
          ]}
        />
        <ClientPortalDataList
          type="invoices"
          emptyText="No invoice activity yet."
          columns={[
            { key: "invoice_number", label: "Invoice" },
            { key: "status", label: "Status" },
            { key: "invoice_date", label: "Date" },
          ]}
        />
      </div>
    </PortalSubpageShell>
  );
}
