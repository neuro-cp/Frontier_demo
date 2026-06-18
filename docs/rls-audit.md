# RLS Audit

| Table | Current Access | Risk | Recommended Future State |
|---|---|---|---|
| `profiles` | Owner can read/insert/update own profile | Low | Keep self-scoped; add admin support reads only through server routes |
| `workspaces` | Members can read/update; Owners can delete | Medium | Owner-only destructive actions; consider Manager update limits |
| `workspace_members` | Members can view; Managers can invite/manage/remove | Medium | Prevent Managers from removing last Owner; audit role changes |
| `workspace_settings` | Members can read/insert/update; Owners can delete | Medium | Owner/Manager update, Owner delete |
| `clients` | Members can read/insert/update; Owner/Manager delete | Medium | Employee/member update limits; customer relationship scope later |
| `jobs` | Members can read/insert/update; Owner/Manager delete | Medium | Employees limited to assigned jobs and safe status updates |
| `job_materials` | Members can read/insert/update; Owner/Manager delete | Medium | Tie writes to job permissions |
| `invoices` | Members can read/insert/update; Owner/Manager delete | High | Limit invoice create/update to Owner/Manager; customer read own invoices only |
| `invoice_line_items` | Members can read/insert/update; Owner/Manager delete | High | Tie writes to invoice permissions |
| `inventory_items` | Members can read/insert/update; Owner/Manager delete | Medium | Managers manage inventory; employees consume/request only |
| `client_calendar_events` | Members can read/insert/update; Owner/Manager delete | Medium | Employees read assigned schedule; Managers manage |
| `documents` | Members can read/insert/update; Owner/Manager delete | High | Employees upload/read assigned docs; customers read own docs only |
| `storage.objects` | Workspace members read/upload/update; Owner/Manager delete document objects | High | Add server-side signed URL workflows for portal users |
| `ai_jobs` | Members can read/insert/update; Owner/Manager delete | Medium | Server job runner should own processing updates |
| `route_plans` | Members can read/insert/update; Owner/Manager delete | Medium | Employees read assigned route only |
| `route_plan_stops` | Members can read/insert/update; Owner/Manager delete | Medium | Tie stop visibility to route assignment |
| `platform_admins` | Platform admins can read | Low | Keep creation SQL/admin-only |
| `admin_audit_logs` | Platform admins can read | Low | Continue logging all support inspection actions |

## Privilege Escalation Notes

- Workspace Owner is not Platform Admin.
- Platform Admin can inspect through audited server routes, but normal client-side RLS does not grant cross-workspace access.
- Employee/member destructive deletes are now blocked at RLS for core business tables.
- Create/update policies remain intentionally broad to avoid breaking the current app; tighten these in a later role-workflow sprint.
