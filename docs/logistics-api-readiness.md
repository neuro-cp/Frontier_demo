# Logistics API Readiness

The logistics module is ready for external provider insertion, but no paid APIs are called yet.

## Current Foundation

- Client addresses feed the map.
- Routes and stops persist in Supabase.
- Route writes are atomic through `public.upsert_route_with_stops`.
- `lib/logistics/providers.ts` defines provider boundaries for geocoding, distance matrix, route optimization, and Google Maps export.

## Future Provider Flow

1. Geocode client/job addresses.
2. Cache latitude/longitude.
3. Run distance matrix.
4. Optimize stop order.
5. Save route plan with total distance and duration.
6. Export to Google Maps.

## Still Missing

- Provider selection in settings.
- API key storage strategy.
- Traffic-aware routing.
- Route recalculation UI.
