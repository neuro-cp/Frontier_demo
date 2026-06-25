# Speech Activation

Speech activation connects uploaded or recorded audio to the completed Review Queue.

## Current Flow

```text
Audio upload or microphone recording
  -> POST /api/speech/transcribe
  -> speech_transcripts lifecycle row
  -> Faster-Whisper worker
  -> transcript persistence
  -> AI transcript interpretation
  -> ai_review_drafts
  -> human review
  -> explicit execute
```

## Lifecycle

`speech_transcripts.status` supports:

- `queued`
- `processing`
- `completed`
- `failed`

The table also stores retry count, timestamps, worker provider, language, duration, segments, transcript text, error text, and linked review draft ID.

## Review Queue Integration

Review drafts created from speech use `sourceType = transcript` and `sourceId = speech_transcripts.id`.

The Review Queue hydrates transcript source previews from `speech_transcripts` instead of duplicating the transcript into the visible draft card.

## Safety

- Transcription does not execute actions.
- Draft creation does not execute actions.
- Voice assistant transcription persists source text but does not create a duplicate automatic review draft.
- File upload and microphone recording can create linked review drafts.
- Execution still requires explicit approval and final execute.

## Remaining Speech Work

- Runtime validation with one short real audio sample.
- Optional transcript list/history UI if needed.
- Better confidence scoring if the worker provides it later.
- Worker outage and timeout resilience testing.
