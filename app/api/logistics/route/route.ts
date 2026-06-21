import { NextRequest, NextResponse } from "next/server";

import { orderStopsNearestNeighbor } from "@/lib/logistics/nearestNeighbor";
import { buildGoogleMapsDirectionsUrl, type LogisticsCoordinate } from "@/lib/logistics/providers";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { jsonError, requireWorkspaceAccess } from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";

type RouteStopInput = LogisticsCoordinate & {
  id: string;
  addressSnapshot?: string;
};

type RouteRequest = {
  workspaceId?: string;
  stops?: RouteStopInput[];
};

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

  return NextResponse.json({
    data: {
      orderedStopIds: orderedStops.map((stop) => stop.id),
      googleMapsUrl,
    },
  });
}
