import PortalSubpageShell from "@/components/PortalSubpageShell";
import EmployeePortalDataList from "@/app/employee-portal/EmployeePortalDataList";

export default function EmployeePortalRoutesPage() {
  return (
    <PortalSubpageShell
      portalName="Employee Portal"
      dashboardHref="/employee-portal"
      title="Employee Routes"
      description="Employees will view assigned daily routes and stop order here."
    >
      <EmployeePortalDataList
        type="routes"
        emptyText="No route assignments are available yet. Route assignment data will be added in a later sprint."
        columns={[
          { key: "name", label: "Route" },
          { key: "status", label: "Status" },
        ]}
      />
    </PortalSubpageShell>
  );
}
