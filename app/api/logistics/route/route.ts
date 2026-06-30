import { NextRequest, NextResponse } from "next/server";

import { buildGoogleMapsDirectionsUrl, type LogisticsCoordinate } from "@/lib/logistics/providers";
import {
  buildRouteForProvider,
  getGoogleTrafficStatus,
  normalizeRoutingProvider,
  RoutingProviderError,
} from "@/lib/logistics/routingProviders";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { canUseLogistics } from "@/lib/plans/capabilities";
import { featureDisabledMessage, featureFlags } from "@/lib/services/featureFlags";
import {
  canManageWorkspaceData,
  jsonError,
  managerRequiredError,
  planUpgradeError,
  requireWorkspaceAccess,
} from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";

type RouteStopInput = LogisticsCoordinate & {
  id: string;
  addressSnapshot?: string;
};

type RouteRequest = {
  workspaceId?: string;
  stops?: RouteStopInput[];
  origin?: LogisticsCoordinate & {
    id?: string;
    label?: string;
  };
  provider?: unknown;
};

function hasValidStops(stops: unknown): stops is RouteStopInput[] {
  return (
    Array.isArray(stops) &&
    stops.length >= 1 &&
    stops.every(
      (stop) =>
        typeof stop?.id === "string" &&
        typeof stop.latitude === "number" &&
        typeof stop.longitude === "number"
    )
  );
}

function hasValidOrigin(origin: RouteRequest["origin"]) {
  return (
    !origin ||
    (typeof origin.latitude === "number" && typeof origin.longitude === "number")
  );
}

export async function GET() {
  const traffic = getGoogleTrafficStatus();
  return NextResponse.json({
    data: {
      providers: {
        nearest_neighbor: {
          available: true,
          label: "Nearest-neighbor routing",
        },
        openroute_service: {
          available: Boolean(process.env.OPENROUTE_SERVICE_API_KEY?.trim()),
          label: "OpenRouteService route geometry",
        },
        google_traffic: {
          available: traffic.available,
          enabled: traffic.enabled,
          configured: traffic.configured,
          label: "Google traffic-aware routing",
          message: traffic.message,
        },
      },
    },
  });
}

export async function POST(request: NextRequest) {
  let body: RouteRequest;
  try {
    body = (await request.json()) as RouteRequest;
  } catch {
    return jsonError("Invalid route request.", 400);
  }

  if (!body.workspaceId) return jsonError("Workspace is required.", 400);
  if (!featureFlags.routing()) return jsonError(featureDisabledMessage("Routing"), 503);
  if (!hasValidStops(body.stops) || (!body.origin && body.stops.length < 2)) {
    return jsonError("At least two route stops are required.", 400);
  }
  if (!hasValidOrigin(body.origin)) return jsonError("Route origin is invalid.", 400);
  if (body.stops.length > serviceLimits.route.absoluteMaxStops()) {
    return jsonError("Route has too many stops.", 400);
  }
  if (body.stops.length > serviceLimits.route.maxStops()) {
    return jsonError("Too many route stops. Reduce stop count.", 400);
  }

  const access = await requireWorkspaceAccess(body.workspaceId);
  if (!access.ok) return access.response;
  if (!canManageWorkspaceData(access.role)) return managerRequiredError("optimize routes");
  if (!canUseLogistics(access.plan)) return planUpgradeError();

  checkUserAndWorkspaceDailyLimits({
    service: "route",
    userId: access.userId,
    workspaceId: access.workspaceId,
    userLimit: serviceLimits.route.maxRequestsPerUserPerDay(),
    workspaceLimit: serviceLimits.route.maxRequestsPerWorkspacePerDay(),
  });

  const provider = normalizeRoutingProvider(body.provider);
  let routeResult;
  try {
    routeResult = await buildRouteForProvider(provider, body.stops, body.origin);
  } catch (error) {
    if (error instanceof RoutingProviderError) {
      return jsonError(error.message, error.status);
    }
    return jsonError("Route provider is temporarily unavailable.", 400);
  }

  const googleMapsStops = body.origin
    ? [
        {
          latitude: body.origin.latitude,
          longitude: body.origin.longitude,
          addressSnapshot: body.origin.label,
        },
        ...routeResult.orderedStops,
        {
          latitude: body.origin.latitude,
          longitude: body.origin.longitude,
          addressSnapshot: body.origin.label,
        },
      ]
    : routeResult.orderedStops;
  const googleMapsUrl = buildGoogleMapsDirectionsUrl(googleMapsStops);
  if (googleMapsUrl.length > serviceLimits.googleMaps.maxUrlLength) {
    return jsonError("Too many route stops for Google Maps export. Reduce stop count.", 400);
  }

  return NextResponse.json({
    data: {
      orderedStopIds: routeResult.orderedStops.map((stop) => stop.id),
      googleMapsUrl,
      routeProvider: routeResult.routeProvider,
      routePath: routeResult.routePath,
      legDurationSeconds: routeResult.legDurationSeconds,
      totalDistanceMeters: routeResult.totalDistanceMeters,
      totalDurationSeconds: routeResult.totalDurationSeconds,
      startsAtOrigin: routeResult.startsAtOrigin,
      returnsToOrigin: routeResult.returnsToOrigin,
      legDurationSource: routeResult.legDurationSource,
      warning: routeResult.warning,
    },
  });
}
