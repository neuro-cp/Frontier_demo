# Frontier Storage Strategy

Frontier uses document metadata separately from document bytes. Metadata lives in `public.documents`; file bytes should live in the private Supabase Storage bucket named `workspace-documents`.

## Path Convention

Storage paths should use:

```text
workspaceId/entityType/entityId/file.ext
```

Examples:

```text
workspace123/client/client456/file.pdf
workspace123/job/job789/photo.jpg
workspace123/invoice/invoice111/document.pdf
```

The workspace id must be the first path segment so storage RLS can isolate files by workspace membership.

## Local-Only Storage Model

Signed-out mode should remain metadata-only. The browser can record file name, MIME type, size, notes, and local client/job links, but it should not pretend that file bytes are durable. This keeps demo/local usage lightweight and avoids browser-only file persistence traps.

## Cloud Storage Add-On Model

Signed-in workspaces should upload bytes to `workspace-documents`, then write a `documents` row with:

- `workspace_id`
- `uploaded_by`
- `client_id`, `job_id`, or `invoice_id`
- `file_name`
- `mime_type`
- `size_bytes`
- `storage_bucket`
- `storage_path`
- `status`

Downloads and previews should use short-lived signed URLs or server routes. Public buckets should not be used for customer documents.

## AI Document Tier Model

AI/OCR should be a later layer on top of durable storage:

1. Upload file bytes.
2. Write document metadata.
3. Create an `ai_jobs` row linked to the document.
4. Extract text or structured data.
5. Present extracted data for human review.
6. Only then create or update clients, jobs, invoices, expenses, or calendar items.

AI should never be the first persistence layer. It should consume stored documents and produce reviewable suggestions.
