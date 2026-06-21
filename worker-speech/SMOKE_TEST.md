# Frontier Speech Worker Smoke Test

Run these commands from the Frontier project root.

## Build

```powershell
docker build -t frontier-speech ./worker-speech
```

## Start

```powershell
docker run -d --rm --name frontier-speech-test -p 8090:8090 `
  -e SPEECH_SHARED_SECRET=test-secret `
  frontier-speech
```

## Health

```powershell
curl.exe -s http://localhost:8090/health
```

Expected:

```json
{"ok":true,"service":"frontier-speech-worker","provider":"faster-whisper"}
```

## Missing Secret

```powershell
curl.exe -s -X POST http://localhost:8090/transcribe -F "file=@worker-speech/README.md"
```

Expected error code:

```json
{"error":{"code":"missing_secret","message":"Missing shared secret."}}
```

## Invalid File

```powershell
curl.exe -s -X POST http://localhost:8090/transcribe `
  -H "x-worker-secret: test-secret" `
  -F "file=@worker-speech/README.md;type=text/plain"
```

Expected error code:

```json
{"error":{"code":"invalid_file_type","message":"Only common audio uploads are supported."}}
```

## Generate A Tiny Local WAV

If no small audio file exists, generate a local WAV with ffmpeg inside the worker image:

```powershell
docker run --rm -v "${PWD}:/work" frontier-speech `
  ffmpeg -y -f lavfi -i "sine=frequency=440:duration=1" /work/worker-speech/smoke-tone.wav
```

This proves upload and decode plumbing, but it is not meaningful speech and may return `empty_result`.

For a meaningful transcription test, use a short speech WAV/MP3:

```powershell
curl.exe -s -X POST http://localhost:8090/transcribe `
  -H "x-worker-secret: test-secret" `
  -F "file=@path\to\speech.wav"
```

## Stop

```powershell
docker rm -f frontier-speech-test
```
