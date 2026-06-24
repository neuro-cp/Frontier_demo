import PortalSubpageShell from "@/components/PortalSubpageShell";
import ClientPortalDataList, { clientPortalFormatters } from "@/app/client-portal/ClientPortalDataList";

export default function ClientPortalDocumentsPage() {
  return (
    <PortalSubpageShell
      portalName="Client Portal"
      dashboardHref="/client-portal"
      title="Client Documents"
      description="Customers will view shared documents here. Uploads are not implemented in the portal yet."
    >
      <ClientPortalDataList
        type="documents"
        emptyText="No documents are currently linked to this client portal access."
        columns={[
          { key: "name", label: "Name" },
          { key: "detected_type", label: "Type" },
          { key: "extraction_status", label: "Status" },
          { key: "file_name", label: "File" },
          { key: "size_bytes", label: "Size", format: clientPortalFormatters.bytes },
          { key: "created_at", label: "Uploaded", format: clientPortalFormatters.date },
        ]}
      />
    </PortalSubpageShell>
  );
}
