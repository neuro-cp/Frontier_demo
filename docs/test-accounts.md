# Frontier QA Test Accounts

These accounts are temporary dev-only accounts for manual workflow testing. Remove them before production or closed beta use.

## Accounts

All three accounts use the temporary password `.` if Supabase Auth accepts it:

- Business owner/operator: `bus@t.com`
- Employee: `emp@t.com`
- Customer/client portal user: `cus@t.com`

The password is intentionally weak for local/dev QA only. Do not use it for real users.

## Seed

Run from the repo root with service-role environment variables available:

```powershell
node scripts/seed-test-accounts.mjs
```

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

The scripts automatically read `.env.local` when it exists.

The seed creates or updates:

- `Frontier QA Test Workspace`
- free workspace billing status
- business account as workspace `Owner`
- employee account as active workspace `Employee`
- `QA Test Customer`
- `QA Test Job`
- `QA Test Invoice`
- active employee job assignment
- active client portal access for the customer account

## Remove

Run from the repo root:

```powershell
node scripts/remove-test-accounts.mjs
```

The cleanup script removes only the users carrying the seed metadata:

- `qa_seed: true`
- `seed_name: frontier_test_accounts`

It also deletes the exact QA workspace created by the seeded business account, which cascades the linked QA client, job, invoice, portal access, and assignment data.
