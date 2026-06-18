# Portal Architecture

Portals are not implemented yet. This is the recommended foundation.

## Employee Portal

Employees should authenticate normally, then route into a workforce view based on workspace membership and role.

Future employee capabilities include assigned jobs, schedule, route plan, document/photo upload, job notes, and status updates.

## Customer Portal

Customers should authenticate separately from employees and connect to a business workspace by invite or verified customer relationship.

Future customer capabilities include own jobs, invoices, documents, messages, and payment links.

## RLS Needs

- Employee access should be workspace-scoped and role-limited.
- Customer access should be relationship-scoped, not workspace-wide.
- Platform admin must remain separate from workspace owner.
