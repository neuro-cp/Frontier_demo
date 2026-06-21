# AI Provider Layer

The AI provider layer is server-only glue between Frontier's interpretation contracts and external model providers.

## Current Status

- Primary provider is selected by `AI_PROVIDER`.
- Primary text model is selected by `AI_MODEL_TEXT`.
- Vision model is reserved through `AI_MODEL_VISION`.
- Fallback provider is selected by `AI_FALLBACK_PROVIDER`.
- Fallback model is selected by `AI_MODEL_FALLBACK`.
- OpenRouter and OpenAI adapters exist.
- Provider output must be JSON.
- Provider output is validated through the existing interpretation validators.
- No UI integration exists.
- No Supabase writes occur.
- No actions are executed.

## Exported Entry Points

- `interpretDocumentWithAI()`
- `interpretTranscriptWithAI()`
- `interpretImageWithAI()`

Image interpretation is currently a placeholder. It exists so the future vision path has a stable import target without enabling image interpretation yet.

## Safety Rules

- Providers run server-side only.
- API keys are read from `process.env`.
- Secrets are never exposed to the browser.
- Delete/destructive actions are not allowed.
- Invalid JSON is rejected.
- Invalid draft actions are rejected.
- Primary provider failure falls back to the configured fallback provider when available.

## Next Steps

1. Add OCR-result-to-AI server route.
2. Add transcript-to-AI server route.
3. Persist review drafts.
4. Build review queue UI.
5. Execute only user-approved drafts through the shared Frontier action layer.
