# Frontier AI Model Contract

Use this document as context when evaluating or changing Frontier AI prompts.

## Safety Boundary

AI output is an editable proposal. It never mutates Frontier records directly.

```text
OCR / speech / image / manual text
  -> interpretation
  -> editable review draft
  -> existing Frontier form or material allocation draft
  -> explicit user save
```

Approval and execution remain separate actions. Delete actions are forbidden.

## Supported Draft Intents

- `create_client`
- `update_client`
- `create_job`
- `update_job`
- `create_invoice`
- `update_invoice`
- `create_expense`
- `update_inventory`
- `create_material_allocation`
- `create_calendar_event`

Interpret receipts as expense drafts. Interpret vendor quotes as inventory drafts.
Interpret material lists and sticky notes as material allocation drafts.

## Material Allocation Contract

```json
{
  "type": "create_material_allocation",
  "confidence": 0.82,
  "payload": {
    "jobId": "optional-existing-job-id",
    "jobName": "optional-job-label",
    "mode": "Append",
    "materials": [
      { "name": "Mulch", "quantity": 3, "notes": "cubic yards" }
    ]
  }
}
```

Valid modes are `Append`, `Merge`, and `Replace`. The user must select or create
a job and explicitly save. Saving creates draft allocations only; it does not
change job materials or inventory quantities.

## Source Retention

OCR drafts retain their source document ID. Material allocations retain both
the source document ID and review draft ID. Review Queue links back to source
documents.

## Validation Expectations

- Return JSON only.
- Never invent record IDs.
- Use warnings when fields are uncertain.
- Material names must be non-empty.
- Material quantities must be positive numbers.
- Keep payloads minimal and workspace-neutral; the server verifies ownership.
