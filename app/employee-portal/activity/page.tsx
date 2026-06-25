import EmployeePortalDataList from "@/app/employee-portal/EmployeePortalDataList";
import PortalSubpageShell from "@/components/PortalSubpageShell";

export default function EmployeePortalActivityPage() {
  return (
    <PortalSubpageShell
      portalName="Employee Portal"
      dashboardHref="/employee-portal"
      title="Employee Activity"
      description="Assigned job and submitted field update activity for the employee portal."
    >
      <div className="space-y-6">
        <EmployeePortalDataList
          type="jobs"
          emptyText="No assigned job activity yet."
          columns={[
            { key: "name", label: "Job" },
            { key: "status", label: "Status" },
            { key: "scheduled_date", label: "Scheduled" },
          ]}
        />
        <EmployeePortalDataList
          type="updates"
          emptyText="No submitted updates yet."
          columns={[
            { key: "update_type", label: "Type" },
            { key: "body", label: "Update" },
            { key: "created_at", label: "Submitted" },
          ]}
        />
      </div>
    </PortalSubpageShell>
  );
}
