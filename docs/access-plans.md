# Frontier Access Plans

Frontier separates local demo behavior from authenticated cloud services.

| Plan | Cloud storage | OCR | Speech | AI drafts | Logistics | External routing |
| --- | --- | --- | --- | --- | --- | --- |
| Visitor | No | No | No | No | No | No |
| Free | No | No | No | No | No | No |
| Basic | Yes | No | No | No | No | No |
| Professional | Yes | Yes | Yes | Yes | Yes | Yes |
| Business | Yes | Yes | Yes | Yes | Yes | Yes |

Until billing and a persisted workspace plan are implemented, signed-in workspaces use
`FRONTIER_DEFAULT_PLAN`. Its safe alpha fallback is `professional`, preserving existing
development workflows. Server routes remain authoritative; UI disabled states are only guidance.

Daily OCR, speech, AI-draft, geocode, and route limits use the existing in-process counter
foundation. Durable quota accounting should replace it when billing is introduced.
