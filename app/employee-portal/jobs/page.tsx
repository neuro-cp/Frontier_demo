import PortalSubpageShell from "@/components/PortalSubpageShell";
import EmployeePortalDataList, { employeePortalFormatters } from "@/app/employee-portal/EmployeePortalDataList";

export default function EmployeePortalJobsPage() {
  return (
    <PortalSubpageShell
      portalName="Employee Portal"
      dashboardHref="/employee-portal"
      title="Employee Jobs"
      description="Employees will view assigned jobs, status, and job details here."
    >
      <EmployeePortalDataList
        type="jobs"
        emptyText="No jobs are assigned to you yet."
        columns={[
          { key: "name", label: "Job" },
          { key: "status", label: "Status" },
          { key: "client_name_snapshot", label: "Client" },
          { key: "scheduled_date", label: "Date", format: employeePortalFormatters.date },
          { key: "scheduled_time", label: "Time" },
          { key: "estimated_value_cents", label: "Estimate", format: employeePortalFormatters.moneyCents },
        ]}
      />
    </PortalSubpageShell>
  );
}
