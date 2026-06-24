import PortalSubpageShell from "@/components/PortalSubpageShell";

export default function EmployeePortalMaterialsPage() {
  return (
    <PortalSubpageShell
      portalName="Employee Portal"
      dashboardHref="/employee-portal"
      title="Employee Materials"
      description="Employees will log job materials, quantities, and usage notes here."
    />
  );
}
