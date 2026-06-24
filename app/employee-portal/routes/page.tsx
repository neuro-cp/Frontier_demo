import PortalSubpageShell from "@/components/PortalSubpageShell";

export default function EmployeePortalRoutesPage() {
  return (
    <PortalSubpageShell
      portalName="Employee Portal"
      dashboardHref="/employee-portal"
      title="Employee Routes"
      description="Employees will view assigned daily routes and stop order here."
    />
  );
}
