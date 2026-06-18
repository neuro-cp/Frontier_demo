# Supabase Environment Setup

Required local and deployment environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
SUPABASE_SERVICE_ROLE_KEY=your_server_only_service_role_key
```

Rules:

- `NEXT_PUBLIC_SUPABASE_URL` is browser-safe.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is browser-safe.
- `SUPABASE_SERVICE_ROLE_KEY` is server-only.
- Never prefix the service role key with `NEXT_PUBLIC_`.
- Never import service-role helpers into client components.

## Auth URLs

Supabase Authentication URL Configuration:

```text
Site URL:
https://frontier-demo.vercel.app

Redirect URLs:
http://localhost:3000/**
https://frontier-demo.vercel.app/**
```

## Promote Platform Admin

Use the commented helper in `supabase/migrations/0004_platform_admin_groundwork.sql`.

Replace only:

```sql
'replace-me@example.com'
```

with the confirmed auth user email, then run it in Supabase SQL Editor.

This is intentionally not exposed in the browser.

## Storage

The private document bucket is:

```text
workspace-documents
```

Intended object path:

```text
workspaceId/userId/timestamp-filename
```

File preview/download is deferred until explicit server-side storage access is implemented.
