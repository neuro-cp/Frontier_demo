import PortalSubpageShell from "@/components/PortalSubpageShell";
import EmployeePortalDataList from "@/app/employee-portal/EmployeePortalDataList";

export default function EmployeePortalUpdatesPage() {
  return (
    <PortalSubpageShell
      portalName="Employee Portal"
      dashboardHref="/employee-portal"
      title="Employee Updates"
      description="Employees will submit job progress updates and field notes here."
    >
      <EmployeePortalDataList
        type="updates"
        emptyText="No employee updates are available yet. Update submission is not implemented in this foundation sprint."
        columns={[
          { key: "title", label: "Update" },
          { key: "status", label: "Status" },
        ]}
      />
    </PortalSubpageShell>
  );
}
