# Image Activation

Image analysis now uses the same review-first pattern as OCR and speech.

## Flow

1. User uploads a supported image document.
2. Frontier normalizes the image before storage and analysis.
3. User explicitly runs image analysis.
4. The server records image lifecycle state on the source document.
5. The AI provider returns structured action drafts.
6. Frontier creates an `ai_review_drafts` row linked to the source document.
7. The Review Queue shows source attribution, status, confidence, warnings, and action drafts.
8. Nothing executes until a user approves and explicitly executes the draft.

## Lifecycle

Image lifecycle fields live on `documents`:

- `image_analysis_status`
- `image_analysis_queued_at`
- `image_analysis_started_at`
- `image_analysis_completed_at`
- `image_analysis_failed_at`
- `image_analysis_error`
- `image_analysis_retry_count`
- `image_analysis_provider`
- `image_analysis_model`
- `image_analysis_confidence`
- `image_analysis_summary`
- `image_review_draft_id`

Statuses are:

- `queued`
- `processing`
- `completed`
- `failed`

## Safety Boundary

- Image analysis is server-side.
- Workspace access is checked before analysis.
- Plan and quota checks remain in the route.
- Provider output creates review drafts only.
- No image draft executes automatically.
- Enhanced OpenAI retry remains explicit and one-time.

## Remaining Work

- Browser validation with representative business images.
- Better secure image preview in Review Queue.
- Final OCR/image/audio extraction quality pass before beta.
- Security hardening around provider timeouts, worker/provider outages, and rate limits.
