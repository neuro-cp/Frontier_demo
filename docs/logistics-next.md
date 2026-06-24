# Logistics Foundation Next

## Goal

Prepare logistics for provider-backed routing without committing to a provider implementation in this sprint.

## Intended Flow

Client Save
-> Geocode Once
-> Store Latitude/Longitude
-> Cached Coordinates

Route Generation
-> OpenRouteService Matrix
-> Nearest Neighbor
-> Optimized Stop Order
-> Route Line Rendering
-> Google Maps Export

## Routing Providers

- `nearest_neighbor`: default no-cost deterministic ordering and fallback polyline.
- `openroute_service`: optional route geometry, distance, and duration enrichment.
- `google_traffic`: optional premium traffic-aware route, never called unless explicitly clicked and enabled.

## Implementation Notes

- Store coordinates on the client or address record after a successful geocode.
- Re-geocode only when the normalized address changes.
- Keep geocoding and matrix API keys server-side.
- Keep route plans workspace-scoped and RLS protected.
- Use cached coordinates for map rendering and route generation.
- Use a simple nearest-neighbor pass first, then preserve room for stronger optimization later.
- Render OpenRouteService route geometry when available.
- Fall back to a straight polyline through ordered stops when provider geometry is unavailable.
- Keep Google traffic-aware routing disabled by default and controlled by `ENABLE_GOOGLE_TRAFFIC_ROUTING`.
- Export to Google Maps as ordered stops, not as a stored Google route.
- Use public Nominatim only for low-volume development geocoding.
- Do not call Nominatim from browser components.
- Require `NOMINATIM_USER_AGENT` before outbound provider calls.
- Respect at least 1100ms between public Nominatim requests.
- Show OpenStreetMap attribution wherever geocoding is exposed.

## Environment

```env
OPENROUTE_SERVICE_API_KEY=
GOOGLE_ROUTES_API_KEY=
ENABLE_GOOGLE_TRAFFIC_ROUTING=false
GEOCODER_PROVIDER=nominatim
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
NOMINATIM_USER_AGENT=Frontier/0.1 (contact: your-email@example.com)
GEOCODE_CACHE_TTL_DAYS=30
GEOCODE_RATE_LIMIT_MS=1100
```

## Open Questions

- Whether coordinates belong directly on `clients` or in a separate `addresses` table.
- Whether route plans should snapshot addresses at creation time for historical accuracy.
- Whether traffic-aware routing is needed for MVP or should remain post-MVP.
- Whether job-level addresses should be added separately from client addresses.
- Whether fleet assignments should become first-class records or route metadata.
