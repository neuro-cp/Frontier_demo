import PortalSubpageShell from "@/components/PortalSubpageShell";
import EmployeePortalDataList, { employeePortalFormatters } from "@/app/employee-portal/EmployeePortalDataList";

export default function EmployeePortalPhotosPage() {
  return (
    <PortalSubpageShell
      portalName="Employee Portal"
      dashboardHref="/employee-portal"
      title="Jobsite Photos"
      description="Employees will review jobsite photos attached to assigned jobs here. Uploads are not implemented in the portal yet."
    >
      <EmployeePortalDataList
        type="photos"
        emptyText="No photos are attached to your assigned jobs yet."
        columns={[
          { key: "name", label: "Name" },
          { key: "file_name", label: "File" },
          { key: "mime_type", label: "Type" },
          { key: "size_bytes", label: "Size", format: employeePortalFormatters.bytes },
          { key: "created_at", label: "Uploaded", format: employeePortalFormatters.date },
        ]}
      />
    </PortalSubpageShell>
  );
}
