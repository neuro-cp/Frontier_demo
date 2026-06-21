# Service Compliance

## Scope

This audit covers Frontier logistics integrations:

- Public Nominatim geocoding.
- OpenStreetMap raster tiles.
- OpenRouteService matrix requests.
- Optional GeocodeFarm fallback geocoding.
- Google Maps URL export.
- Supabase-backed API route protection.

## Reference Policies

- Nominatim usage policy: https://operations.osmfoundation.org/policies/nominatim/
- OpenStreetMap tile usage policy: https://operations.osmfoundation.org/policies/tiles/
- OpenRouteService restrictions: https://openrouteservice.org/restrictions/
- Google Maps URLs: https://developers.google.com/maps/documentation/urls/get-started

## Implemented Safeguards

### Nominatim

- Nominatim is called from server-only code.
- Browser components call `/api/geocode`, not the provider directly.
- `NOMINATIM_USER_AGENT` is required before outbound Nominatim calls.
- All outbound Nominatim calls pass through a single in-process FIFO throttle.
- The throttle enforces at least `GEOCODE_RATE_LIMIT_MS`, with a hard minimum of 1100ms.
- The throttle has a bounded queue of 5 requests and a max wait of 10 seconds.
- Successful geocode results are cached in memory.
- Saved client coordinates prevent repeat provider calls for the same client.
- Logistics exposes explicit user-triggered geocoding only.
- No autocomplete, typing-time geocoding, page-load geocoding, or bulk geocoding is implemented.
- OpenStreetMap geocoding attribution is visible on the Logistics page.

### OpenStreetMap Tiles

- Tiles use HTTPS.
- Attribution is visible through the Leaflet tile attribution control.
- Tile URL is configurable through `NEXT_PUBLIC_OSM_TILE_URL`.
- Frontier does not implement tile scraping, prefetching, offline tile download, or tile archives.

### OpenRouteService

- API key stays server-side.
- Matrix requests go through `/api/logistics/matrix`.
- Requests validate workspace access before provider use.
- `MATRIX_MAX_LOCATIONS` blocks oversized matrix requests before provider invocation.
- Route daily user/workspace counters limit abuse.
- Missing config, 429s, provider failures, and oversized requests return clean messages.

### GeocodeFarm Fallback

- Fallback is server-side only.
- Fallback is disabled unless `GEOCODEFARM_ENABLED=true`.
- API key is never exposed to browser code.
- Global daily fallback counter limits usage through `GEOCODEFARM_MAX_REQUESTS_PER_DAY`.
- Provider status errors are mapped to clean user-facing messages.

### Google Maps Export

- Export is a URL handoff only, not a routing provider.
- URLs include `api=1`.
- Export remains user initiated.
- URLs over 2048 characters are blocked with a clean message.

### Supabase Protection

- Logistics routes require a signed-in user.
- API routes verify active workspace membership server-side.
- Workspace membership checks use bounded `.limit(1)` queries.
- Provider routes do not trust browser-provided workspace ids without validation.

## Remaining Risks

- In-memory geocode cache resets on server restart.
- In-memory counters and throttles are per process, not distributed.
- Multiple deployed instances could exceed global provider limits unless Redis, Supabase advisory locks, or a single queue worker is added.
- Public Nominatim should remain development and low-volume only.
- GeocodeFarm fallback has not been browser-QA tested against a live provider response in this sprint.
- OpenRouteService totals are not yet persisted into saved route plans automatically.

## Future Scaling Requirements

- Replace in-memory geocode cache with a Supabase-backed `geocode_cache` table.
- Replace in-memory daily counters with Redis or a database-backed rate limiter.
- Replace in-process Nominatim throttle with a distributed queue or single geocoding worker.
- Add durable provider request logs for operations review.
- Move from public Nominatim to a hosted provider or self-hosted Nominatim before broad commercial traffic.
- Consider a commercial tile provider before broad customer usage.

## Distributed Rate Limiter Requirements

Production rate limiting should provide:

- Atomic per-user daily counters.
- Atomic per-workspace daily counters.
- Global per-provider counters.
- FIFO provider queues with bounded length.
- Per-provider cooldowns.
- Provider failure circuit breakers.
- Operator-visible metrics and alerts.
