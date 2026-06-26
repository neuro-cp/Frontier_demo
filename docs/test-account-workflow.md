# Test Account Workflow

Use two accounts for manual QA:

- Contractor/admin account: `thompsonrelay@proton.com`
- Modifiable account: `thomp3ns@gmail.com`

Do not create a third account unless a test specifically requires simultaneous client and employee sessions at the same time.

## Client Portal Testing

1. Sign in as the contractor/admin account.
2. Open a client detail page.
3. Create a client portal invite for the modifiable account.
4. Copy the invite link.
5. Sign in separately as the modifiable account.
6. Open the invite link and accept it.
7. Confirm `/client-portal` loads.
8. Confirm only that linked client's jobs, invoices, estimates, and documents are visible.
9. Revoke access from the contractor/admin account.
10. Refresh the modifiable account.
11. Expected result: client portal pages are blocked.

## Employee Portal Testing

1. Sign in as the contractor/admin account.
2. Add or update the modifiable account as an active `Employee` workspace member.
3. Assign that employee to one or more jobs.
4. Sign in as the modifiable account.
5. Open `/employee-portal`.
6. Confirm assigned jobs/materials/photos are visible.
7. Confirm unrelated jobs are hidden.
8. Remove the assignment or set membership inactive when testing is complete.
9. Expected result: employee portal blocks or shows no assigned records.

## Switching the Modifiable Account

The same modifiable account can be used for client and employee testing, but clean up one role before testing the other:

- To switch from Client to Employee: revoke `client_portal_access`, then add workspace member role `Employee`.
- To switch from Employee to Client: remove or inactive employee membership/assignments, then send a client portal invite.

## Owner/Manager Preview

Owner/Manager client portal preview depends on the active workspace context. If preview fails:

- confirm the active workspace is a real workspace, not the create-workspace placeholder;
- confirm the account is Owner or Manager in that workspace;
- confirm the URL has the intended workspace context;
- confirm client portal access was not revoked for the external user being tested.
