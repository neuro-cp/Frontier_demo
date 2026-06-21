# Voice MVP Next

## Goal

Add voice input through the existing action layer while keeping command execution deterministic and reviewable.

## Intended Flow

Record Audio
-> Transcribe with Faster-Whisper
-> Parse Deterministic Command
-> Preview Intended Action
-> Confirm
-> Execute Through Action Layer

## Implementation Notes

- Use Faster-Whisper for transcription when voice work begins.
- Keep transcription and parsing server-side where provider/runtime constraints require it.
- Route all resulting mutations through the existing action layer.
- Start with deterministic command parsing for known commands.
- Add optional AI interpretation later, after deterministic commands are reliable.
- Require confirmation for destructive or high-impact actions.

## Early Command Targets

- Create client.
- Create job.
- Add job note.
- Schedule job.
- Create invoice draft.
- Add expense.

## Safety Rules

- Never execute a destructive voice command without explicit confirmation.
- Show the parsed command before execution.
- Preserve an audit trail for accepted commands.
