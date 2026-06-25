# Portal Architecture

Portal foundations are implemented. This document records the current boundary and the next expansion points.

## Employee Portal

Employees should authenticate normally, then route into a workforce view based on workspace membership and role.

Current employee capabilities include assigned jobs, assigned job materials, assigned job photos, profile/assignment history, and read-only portal pages. Assignment management is handled by Owners/Managers from Settings > Employees.

Future employee capabilities include schedule editing, route plan assignment, document/photo upload, job notes, status updates, and time tracking.

## Customer Portal

Customers should authenticate separately from employees and connect to a business workspace by invite or verified customer relationship.

Current customer capabilities include invite-based access, scoped jobs, scoped estimates, scoped invoices, scoped documents, estimate approval/rejection, invoice payment, receipts, and payment history.

Future customer capabilities include profile editing, messages, document upload, estimate revision workflows, and payment method expansion.

## RLS Needs

- Employee access should be workspace-scoped and role-limited.
- Customer access should be relationship-scoped, not workspace-wide.
- Platform admin must remain separate from workspace owner.
