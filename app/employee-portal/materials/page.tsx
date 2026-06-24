import PortalSubpageShell from "@/components/PortalSubpageShell";
import EmployeePortalDataList from "@/app/employee-portal/EmployeePortalDataList";

export default function EmployeePortalMaterialsPage() {
  return (
    <PortalSubpageShell
      portalName="Employee Portal"
      dashboardHref="/employee-portal"
      title="Employee Materials"
      description="Employees will log job materials, quantities, and usage notes here."
    >
      <EmployeePortalDataList
        type="materials"
        emptyText="No material lines are linked to your assigned jobs yet."
        columns={[
          { key: "name", label: "Material" },
          { key: "quantity", label: "Quantity" },
          { key: "job_id", label: "Job ID" },
        ]}
      />
    </PortalSubpageShell>
  );
}
