import "server-only";

import { getOpenRouteServiceDirections } from "@/lib/logistics/openRouteService";
import { orderStopsNearestNeighbor } from "@/lib/logistics/nearestNeighbor";
import type { LogisticsCoordinate } from "@/lib/logistics/providers";

export type RoutingProviderName =
  | "nearest_neighbor"
  | "openroute_service"
  | "google_traffic";

export type RoutingStop = LogisticsCoordinate & {
  id: string;
  addressSnapshot?: string;
};

export type RoutingResult = {
  orderedStops: RoutingStop[];
  routeProvider: RoutingProviderName;
  routePath: Array<[number, number]>;
  legDurationSeconds: number[];
  totalDistanceMeters: number;
  totalDurationSeconds: number;
  warning?: string;
};

export class RoutingProviderError extends Error {
  constructor(
    public code: "disabled" | "unconfigured" | "provider_failed",
    message: string,
    public status = 400
  ) {
    super(message);
  }
}

export function normalizeRoutingProvider(value: unknown): RoutingProviderName {
  return value === "openroute_service" || value === "google_traffic"
    ? value
    : "nearest_neighbor";
}

export function getGoogleTrafficStatus() {
  const enabled = process.env.ENABLE_GOOGLE_TRAFFIC_ROUTING === "true";
  const configured = Boolean(process.env.GOOGLE_ROUTES_API_KEY?.trim());
  return {
    enabled,
    configured,
    available: enabled && configured,
    message: !enabled
      ? "Traffic-aware routing is disabled for this workspace/environment."
      : !configured
        ? "Traffic-aware routing is not configured."
        : "",
  };
}

function distanceMeters(a: LogisticsCoordinate, b: LogisticsCoordinate) {
  const earthRadiusMeters = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(h));
}

function buildFallbackSummary(stops: RoutingStop[]) {
  const legDistancesMeters = stops.slice(1).map((stop, index) =>
    distanceMeters(stops[index], stop)
  );
  const totalDistanceMeters = legDistancesMeters.reduce(
    (total, distance) => total + distance,
    0
  );

  return {
    routePath: stops.map(
      (stop) => [stop.latitude, stop.longitude] as [number, number]
    ),
    legDurationSeconds: legDistancesMeters.map((distance) =>
      Math.round(distance / 13.4)
    ),
    totalDistanceMeters,
    totalDurationSeconds: Math.round(totalDistanceMeters / 13.4),
  };
}

function decodeGooglePolyline(encoded: string) {
  const points: Array<[number, number]> = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let result = 0;
    let shift = 0;
    let byte = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lat += result & 1 ? ~(result >> 1) : result >> 1;

    result = 0;
    shift = 0;
    do {
      byte = encoded.charCodeAt(index++) - 63;
      result |= (byte & 0x1f) << shift;
      shift += 5;
    } while (byte >= 0x20);
    lng += result & 1 ? ~(result >> 1) : result >> 1;

    points.push([lat / 1e5, lng / 1e5]);
  }

  return points;
}

type GoogleRouteResponse = {
  routes?: Array<{
    distanceMeters?: number;
    duration?: string;
    polyline?: {
      encodedPolyline?: string;
    };
  }>;
};

function parseGoogleDurationSeconds(duration?: string) {
  if (!duration) return null;
  const seconds = Number(duration.replace(/s$/, ""));
  return Number.isFinite(seconds) ? seconds : null;
}

export async function buildNearestNeighborRoute(
  stops: RoutingStop[]
): Promise<RoutingResult> {
  const orderedStops = orderStopsNearestNeighbor(stops);
  return {
    orderedStops,
    routeProvider: "nearest_neighbor",
    ...buildFallbackSummary(orderedStops),
  };
}

export async function buildOpenRouteServiceRoute(stops: RoutingStop[]) {
  const fallback = await buildNearestNeighborRoute(stops);

  try {
    const directions = await getOpenRouteServiceDirections(fallback.orderedStops);
    if (directions.path.length < 2) return fallback;
    return {
      ...fallback,
      routeProvider: "openroute_service" as const,
      routePath: directions.path,
      legDurationSeconds:
        directions.legDurationSeconds.length === fallback.legDurationSeconds.length
          ? directions.legDurationSeconds
          : fallback.legDurationSeconds,
      totalDistanceMeters:
        directions.distanceMeters ?? fallback.totalDistanceMeters,
      totalDurationSeconds:
        directions.durationSeconds ?? fallback.totalDurationSeconds,
    };
  } catch {
    return {
      ...fallback,
      warning: "OpenRouteService unavailable. Used nearest-neighbor fallback.",
    };
  }
}

export async function buildGoogleTrafficRoute(stops: RoutingStop[]) {
  const status = getGoogleTrafficStatus();
  if (!status.enabled) {
    throw new RoutingProviderError("disabled", status.message, 400);
  }
  if (!status.configured) {
    throw new RoutingProviderError("unconfigured", status.message, 400);
  }

  const fallback = await buildNearestNeighborRoute(stops);
  const [origin, ...rest] = fallback.orderedStops;
  const destination = rest.pop();
  if (!destination) return fallback;

  const response = await fetch(
    "https://routes.googleapis.com/directions/v2:computeRoutes",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": process.env.GOOGLE_ROUTES_API_KEY ?? "",
        "X-Goog-FieldMask":
          "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
      },
      body: JSON.stringify({
        origin: {
          location: {
            latLng: { latitude: origin.latitude, longitude: origin.longitude },
          },
        },
        destination: {
          location: {
            latLng: {
              latitude: destination.latitude,
              longitude: destination.longitude,
            },
          },
        },
        intermediates: rest.map((stop) => ({
          location: {
            latLng: { latitude: stop.latitude, longitude: stop.longitude },
          },
        })),
        travelMode: "DRIVE",
        routingPreference: "TRAFFIC_AWARE",
        computeAlternativeRoutes: false,
      }),
    }
  );

  if (!response.ok) {
    throw new RoutingProviderError(
      "provider_failed",
      "Traffic-aware routing provider is temporarily unavailable.",
      400
    );
  }

  const data = (await response.json()) as GoogleRouteResponse;
  const route = data.routes?.[0];
  const encodedPolyline = route?.polyline?.encodedPolyline;
  return {
    ...fallback,
    routeProvider: "google_traffic" as const,
    routePath: encodedPolyline
      ? decodeGooglePolyline(encodedPolyline)
      : fallback.routePath,
    legDurationSeconds: fallback.legDurationSeconds,
    totalDistanceMeters: route?.distanceMeters ?? fallback.totalDistanceMeters,
    totalDurationSeconds:
      parseGoogleDurationSeconds(route?.duration) ??
      fallback.totalDurationSeconds,
  };
}

export async function buildRouteForProvider(
  provider: RoutingProviderName,
  stops: RoutingStop[]
) {
  if (provider === "google_traffic") return buildGoogleTrafficRoute(stops);
  if (provider === "openroute_service") return buildOpenRouteServiceRoute(stops);
  return buildNearestNeighborRoute(stops);
}
