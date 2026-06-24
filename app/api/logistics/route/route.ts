import { NextRequest, NextResponse } from "next/server";

import { getOpenRouteServiceDirections } from "@/lib/logistics/openRouteService";
import { orderStopsNearestNeighbor } from "@/lib/logistics/nearestNeighbor";
import { buildGoogleMapsDirectionsUrl, type LogisticsCoordinate } from "@/lib/logistics/providers";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { canUseLogistics } from "@/lib/plans/capabilities";
import { jsonError, planUpgradeError, requireWorkspaceAccess } from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";

type RouteStopInput = LogisticsCoordinate & {
  id: string;
  addressSnapshot?: string;
};

type RouteRequest = {
  workspaceId?: string;
  stops?: RouteStopInput[];
};

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

function buildFallbackRouteSummary(stops: RouteStopInput[]) {
  const totalDistanceMeters = stops.slice(1).reduce((total, stop, index) => {
    return total + distanceMeters(stops[index], stop);
  }, 0);

  return {
    path: stops.map((stop) => [stop.latitude, stop.longitude] as [number, number]),
    totalDistanceMeters,
    // Conservative local-driving estimate for fallback only.
    totalDurationSeconds: Math.round(totalDistanceMeters / 13.4),
  };
}

function hasValidStops(stops: unknown): stops is RouteStopInput[] {
  return (
    Array.isArray(stops) &&
    stops.length >= 2 &&
    stops.every(
      (stop) =>
        typeof stop?.id === "string" &&
        typeof stop.latitude === "number" &&
        typeof stop.longitude === "number"
    )
  );
}

export async function POST(request: NextRequest) {
  let body: RouteRequest;
  try {
    body = (await request.json()) as RouteRequest;
  } catch {
    return jsonError("Invalid route request.", 400);
  }

  if (!body.workspaceId) return jsonError("Workspace is required.", 400);
  if (!hasValidStops(body.stops)) {
    return jsonError("At least two route stops are required.", 400);
  }
  if (body.stops.length > serviceLimits.route.absoluteMaxStops()) {
    return jsonError("Route has too many stops.", 400);
  }
  if (body.stops.length > serviceLimits.route.maxStops()) {
    return jsonError("Too many route stops. Reduce stop count.", 400);
  }

  const access = await requireWorkspaceAccess(body.workspaceId);
  if (!access.ok) return access.response;
  if (!canUseLogistics(access.plan)) return planUpgradeError();

  checkUserAndWorkspaceDailyLimits({
    service: "route",
    userId: access.userId,
    workspaceId: access.workspaceId,
    userLimit: serviceLimits.route.maxRequestsPerUserPerDay(),
    workspaceLimit: serviceLimits.route.maxRequestsPerWorkspacePerDay(),
  });

  const orderedStops = orderStopsNearestNeighbor(body.stops);
  const googleMapsUrl = buildGoogleMapsDirectionsUrl(orderedStops);
  if (googleMapsUrl.length > serviceLimits.googleMaps.maxUrlLength) {
    return jsonError("Too many route stops for Google Maps export. Reduce stop count.", 400);
  }

  const fallbackSummary = buildFallbackRouteSummary(orderedStops);
  let routeSummary = fallbackSummary;
  let routeProvider: "openrouteservice" | "fallback" = "fallback";

  try {
    const directions = await getOpenRouteServiceDirections(orderedStops);
    if (directions.path.length >= 2) {
      routeSummary = {
        path: directions.path,
        totalDistanceMeters:
          directions.distanceMeters ?? fallbackSummary.totalDistanceMeters,
        totalDurationSeconds:
          directions.durationSeconds ?? fallbackSummary.totalDurationSeconds,
      };
      routeProvider = "openrouteservice";
    }
  } catch {
    routeSummary = fallbackSummary;
  }

  return NextResponse.json({
    data: {
      orderedStopIds: orderedStops.map((stop) => stop.id),
      googleMapsUrl,
      routeProvider,
      routePath: routeSummary.path,
      totalDistanceMeters: routeSummary.totalDistanceMeters,
      totalDurationSeconds: routeSummary.totalDurationSeconds,
    },
  });
}
