# AI Interpretation Layer

Frontier's AI interpretation layer is a contract boundary between extraction workers and human-approved business actions.

## Current Status

- OCR worker is frozen and can produce text.
- Speech worker is frozen and can produce transcripts.
- This layer converts text into structured review drafts.
- This layer does not call AI providers yet.
- This layer does not write to Supabase.
- This layer does not execute Frontier actions.
- This layer does not create autonomous actions.

## Flow

```text
OCR Worker
  -> AI Interpretation Layer
  -> Review Draft
  -> User Approval
  -> Shared Frontier Action Layer

Speech Worker
  -> AI Interpretation Layer
  -> Review Draft
  -> User Approval
  -> Shared Frontier Action Layer
```

## Allowed Draft Actions

- `create_client`
- `update_client`
- `create_job`
- `update_job`
- `create_invoice`
- `update_invoice`
- `create_expense`
- `update_inventory`
- `create_calendar_event`

Delete and destructive actions are intentionally excluded.

## Validation Responsibilities

- Required field validation.
- Payload shape validation.
- Confidence threshold warnings.
- Duplicate protection hooks.
- Workspace ownership hooks.
- Future permission hooks.

Hooks are intentionally passive. They return warnings and do not mutate data.

## Provider Strategy

Future model providers should satisfy the `InterpretationProvider` contract in `lib/ai/types.ts`.

Provider implementation must remain behind this boundary. Do not hardcode OpenAI, OpenRouter, Anthropic, or any other model provider into UI flows.

## Next Phases

1. Finalize review draft persistence schema.
2. Add a server-only provider adapter.
3. Add OCR result -> interpretation route.
4. Add transcript -> interpretation route.
5. Build review UI.
6. On approval, map accepted drafts into the shared Frontier action layer.
