import PortalSubpageShell from "@/components/PortalSubpageShell";

export default function EmployeePortalJobsPage() {
  return (
    <PortalSubpageShell
      portalName="Employee Portal"
      dashboardHref="/employee-portal"
      title="Employee Jobs"
      description="Employees will view assigned jobs, status, and job details here."
    />
  );
}
