import PortalSubpageShell from "@/components/PortalSubpageShell";

export default function ClientPortalProfilePage() {
  return (
    <PortalSubpageShell
      portalName="Client Portal"
      dashboardHref="/client-portal"
      title="Client Profile"
      description="Contact details, portal preferences, and company communication settings will live here."
    >
      <div className="rounded-lg border border-dashed border-gray-300 p-4 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
        Profile editing is not implemented yet. Client portal access is currently managed by the contractor from the client record.
      </div>
    </PortalSubpageShell>
  );
}
