import PortalSubpageShell from "@/components/PortalSubpageShell";

export default function EmployeePortalTimePage() {
  return (
    <PortalSubpageShell
      portalName="Employee Portal"
      dashboardHref="/employee-portal"
      title="Time Tracking"
      description="Employees will clock in, clock out, and review time entries here."
    />
  );
}
