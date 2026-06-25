import EmployeePortalDataList, { employeePortalFormatters } from "@/app/employee-portal/EmployeePortalDataList";
import PortalSubpageShell from "@/components/PortalSubpageShell";

export default function EmployeePortalProfilePage() {
  return (
    <PortalSubpageShell
      portalName="Employee Portal"
      dashboardHref="/employee-portal"
      title="Employee Profile"
      description="Review active employee portal access and assignment history. Profile editing is not implemented yet."
    >
      <EmployeePortalDataList
        type="assignments"
        emptyText="No assignment history is available yet."
        columns={[
          { key: "job_id", label: "Job ID" },
          { key: "status", label: "Assignment Status" },
          { key: "notes", label: "Notes" },
          { key: "created_at", label: "Assigned", format: employeePortalFormatters.date },
        ]}
      />
    </PortalSubpageShell>
  );
}
