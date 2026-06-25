import PortalSubpageShell from "@/components/PortalSubpageShell";
import ClientPortalInvoicesList from "@/app/client-portal/ClientPortalInvoicesList";

export default function ClientPortalInvoicesPage() {
  return (
    <PortalSubpageShell
      portalName="Client Portal"
      dashboardHref="/client-portal"
      title="Client Invoices"
      description="Review linked invoices and pay open balances through Stripe test-mode checkout."
    >
      <ClientPortalInvoicesList />
    </PortalSubpageShell>
  );
}
