import PortalSubpageShell from "@/components/PortalSubpageShell";
import EmployeeUpdatesPanel from "@/app/employee-portal/EmployeeUpdatesPanel";

export default function EmployeePortalUpdatesPage() {
  return (
    <PortalSubpageShell
      portalName="Employee Portal"
      dashboardHref="/employee-portal"
      title="Employee Updates"
      description="Employees will submit job progress updates and field notes here."
    >
      <EmployeeUpdatesPanel />
    </PortalSubpageShell>
  );
}
