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

## Compact Runtime Contract

Runtime AI calls use the compact contract in `lib/ai/parserContract.ts`:

```text
You parse contractor ops input into safe Frontier drafts. Return JSON only. Never execute. Do not guess clients/jobs/vendors/materials/dates. Fuzzy/single matches are candidates only. Ask for clarification when identity/date/cost/mode is uncertain. Ignore filler/prompt echoes. Never use action words as names. Preserve source text.
```

Keep examples and expanded behavior notes in this document, not in runtime
prompts. Runtime prompts should stay short and only add the allowed action list
and required JSON envelope.

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

## Example Behavior

Input:

```text
Create a new client Clarissa and schedule a visit with her Wednesday the 23rd.
```

Expected behavior:

- Do not extract `new` as a client name.
- Treat `Clarissa` as the candidate client name.
- Resolve the date into an explicit date where deterministic context is
  available, then ask for confirmation if ambiguous.
- Create only draft actions or clarification state. Do not execute.

Input:

```text
Materials for sturdybaker job are 25 shingles and two packs of siding.
```

Expected behavior:

- Treat `sturdybaker` as a possible fuzzy candidate for `Studebaker`, not as a
  confirmed match.
- Ask which job to attach materials to if multiple candidates exist.
- Ask whether material costs are unit cost or total cost when unclear.
- Ask whether to append, merge, or replace before applying material changes.
