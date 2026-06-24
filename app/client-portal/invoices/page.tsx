import PortalSubpageShell from "@/components/PortalSubpageShell";
import ClientPortalDataList, { clientPortalFormatters } from "@/app/client-portal/ClientPortalDataList";

export default function ClientPortalInvoicesPage() {
  return (
    <PortalSubpageShell
      portalName="Client Portal"
      dashboardHref="/client-portal"
      title="Client Invoices"
      description="Customers will review open and paid invoices here. Payments are not implemented yet."
    >
      <ClientPortalDataList
        type="invoices"
        emptyText="No invoices are currently linked to this client portal access."
        columns={[
          { key: "invoice_number", label: "Invoice #" },
          { key: "status", label: "Status" },
          { key: "invoice_date", label: "Date", format: clientPortalFormatters.date },
          { key: "due_date", label: "Due", format: clientPortalFormatters.date },
          { key: "bill_to_name", label: "Bill To" },
        ]}
      />
    </PortalSubpageShell>
  );
}
