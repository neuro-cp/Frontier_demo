# Portal Architecture

Portal foundations are implemented. This document records the current boundary and the next expansion points.

## Employee Portal

Employees should authenticate normally, then route into a workforce view based on workspace membership and role.

Current employee capabilities include assigned jobs, assigned job materials, assigned job photos, profile/assignment history, field updates, completion notes, completion percentage, and material usage logging. Assignment management is handled by Owners/Managers from Settings > Employees.

Future employee capabilities include schedule editing, route plan assignment, document/photo upload, richer job notes, update review workflows, and time tracking.

## Customer Portal

Customers should authenticate separately from employees and connect to a business workspace by invite or verified customer relationship.

Current customer capabilities include invite-based access, scoped jobs, scoped estimates, scoped invoices, scoped documents, estimate approval/rejection, invoice payment, receipts, payment history, and client portal message submission.

Future customer capabilities include profile editing, workspace-side message replies, document upload, estimate revision workflows, and payment method expansion.

## Operations Messaging

The messaging substrate is stored in `workspace_conversations` and `workspace_messages`.

- Client portal users can create and read non-internal messages scoped to their active `client_portal_access`.
- Workspace Owners and Managers can preview portal message data from their active workspace.
- Internal-only employee notes are supported at the schema level through `is_internal`.
- External delivery providers are intentionally not connected yet.

## Notifications

Notifications are stored in `workspace_notifications`.

Current event producers:

- client portal message submitted
- employee job update submitted

Future event producers:

- estimate approved/rejected
- invoice paid
- document uploaded
- AI review draft created

## RLS Needs

- Employee access should be workspace-scoped and role-limited.
- Customer access should be relationship-scoped, not workspace-wide.
- Platform admin must remain separate from workspace owner.
- Owner/Manager portal preview is for operational inspection only and must not replace external client scoping.
