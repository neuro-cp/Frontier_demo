# AI Interpretation Layer

Frontier's AI interpretation layer is a contract boundary between extraction workers and human-approved business actions.

## Current Status

- OCR worker is frozen and can produce text.
- Speech worker is frozen and can produce transcripts.
- Image analysis is frozen and can create image review drafts.
- Provider integration exists behind server-only abstractions.
- Persisted review drafts exist in Supabase.
- Review drafts can be edited, duplicated, archived, approved, rejected, marked needs changes, and explicitly executed.
- This layer does not create autonomous actions.

## Flow

```text
OCR Worker
  -> AI Interpretation Layer
  -> Review Draft
  -> User Approval
  -> Explicit Execute
  -> Shared Frontier Action Layer

Speech Worker
  -> AI Interpretation Layer
  -> Review Draft
  -> User Approval
  -> Explicit Execute
  -> Shared Frontier Action Layer

Image Analysis
  -> AI Interpretation Layer
  -> Review Draft
  -> User Approval
  -> Explicit Execute
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

1. Connect secure source preview hydration for OCR text, transcripts, and images.
2. Run OCR activation against the completed review queue.
3. Run speech activation against the completed review queue.
4. Run image activation against the completed review queue.
5. Expand duplicate/conflict detection from passive warnings into stronger pre-approval checks.
