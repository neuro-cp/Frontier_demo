# Frontier Speech Worker

Standalone speech-to-text service for Frontier. This worker is intentionally isolated from the main Frontier app.

## Features

- FastAPI HTTP service.
- `GET /health`.
- `POST /transcribe` audio upload.
- Faster-Whisper transcription.
- Shared-secret request header support.
- Clean JSON error responses.
- CPU-only by default.
- Docker Desktop and Cloud Run compatible.
- No Supabase, database, or Frontier app access.

## Environment Variables

| Name | Required | Default | Description |
| --- | --- | --- | --- |
| `PORT` | No | `8090` | HTTP port used by local Docker/Cloud Run. |
| `SPEECH_SHARED_SECRET` | No | empty | If set, requests to `POST /transcribe` must include the matching secret. |
| `SPEECH_SECRET_HEADER` | No | `x-worker-secret` | Header name used for the shared secret. |
| `SPEECH_MAX_UPLOAD_MB` | No | `25` | Max accepted audio upload size. |
| `SPEECH_TIMEOUT_SECONDS` | No | `180` | Max transcription runtime per request. |
| `WHISPER_MODEL_SIZE` | No | `tiny` | Faster-Whisper model size. Use `tiny` for local CPU smoke tests. |
| `WHISPER_DEVICE` | No | `cpu` | Faster-Whisper device. |
| `WHISPER_COMPUTE_TYPE` | No | `int8` | Faster-Whisper compute type. |

## Docker Build

From the Frontier project root:

```powershell
docker build -t frontier-speech ./worker-speech
```

## Docker Run

```powershell
docker run -d --rm --name frontier-speech-test -p 8090:8090 `
  -e SPEECH_SHARED_SECRET=test-secret `
  frontier-speech
```

Health check:

```powershell
curl.exe -s http://localhost:8090/health
```

Transcription request:

```powershell
curl.exe -s -X POST http://localhost:8090/transcribe `
  -H "x-worker-secret: test-secret" `
  -F "file=@sample.wav"
```

Stop the test container:

```powershell
docker rm -f frontier-speech-test
```

## API

### `GET /health`

Returns:

```json
{
  "ok": true,
  "service": "frontier-speech-worker",
  "provider": "faster-whisper"
}
```

### `POST /transcribe`

Accepts multipart form upload field:

- `file`: common audio file such as WAV, MP3, M4A, OGG, FLAC, WebM, or MP4 audio.

Returns:

```json
{
  "provider": "faster-whisper",
  "status": "transcribed",
  "language": "en",
  "durationSeconds": 1.2,
  "text": "...",
  "segments": [
    {
      "start": 0,
      "end": 1.2,
      "text": "..."
    }
  ]
}
```

Errors use this shape:

```json
{
  "error": {
    "code": "invalid_file_type",
    "message": "Only common audio uploads are supported."
  }
}
```

Current error codes:

- `missing_secret`
- `invalid_secret`
- `file_too_large`
- `timeout`
- `transcription_failed`
- `invalid_file_type`
- `empty_result`
- `invalid_request`
- `request_failed`

## Notes

- This worker does not deploy itself.
- This worker does not call Supabase.
- This worker does not create Frontier records.
- This worker does not perform AI command interpretation.
- See `SMOKE_TEST.md` for lightweight manual checks.
