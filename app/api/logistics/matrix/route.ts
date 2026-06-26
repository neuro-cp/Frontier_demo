import { NextRequest, NextResponse } from "next/server";

import { getOpenRouteServiceMatrix } from "@/lib/logistics/openRouteService";
import type { LogisticsCoordinate } from "@/lib/logistics/providers";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { canUseExternalRouting } from "@/lib/plans/capabilities";
import {
  canManageWorkspaceData,
  jsonError,
  managerRequiredError,
  planUpgradeError,
  requireWorkspaceAccess,
} from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";

type MatrixRequest = {
  workspaceId?: string;
  locations?: LogisticsCoordinate[];
};

function hasValidLocations(locations: unknown): locations is LogisticsCoordinate[] {
  return (
    Array.isArray(locations) &&
    locations.length >= 2 &&
    locations.every(
      (location) =>
        typeof location?.latitude === "number" &&
        typeof location?.longitude === "number"
    )
  );
}

export async function POST(request: NextRequest) {
  let body: MatrixRequest;
  try {
    body = (await request.json()) as MatrixRequest;
  } catch {
    return jsonError("Invalid matrix request.", 400);
  }

  if (!body.workspaceId) return jsonError("Workspace is required.", 400);
  if (!hasValidLocations(body.locations)) {
    return jsonError("At least two route locations are required.", 400);
  }
  if (body.locations.length > serviceLimits.matrix.maxLocations()) {
    return jsonError("Too many locations for route distance lookup.", 400);
  }

  const access = await requireWorkspaceAccess(body.workspaceId);
  if (!access.ok) return access.response;
  if (!canManageWorkspaceData(access.role)) return managerRequiredError("calculate route distances");
  if (!canUseExternalRouting(access.plan)) return planUpgradeError();

  try {
    checkUserAndWorkspaceDailyLimits({
      service: "route",
      userId: access.userId,
      workspaceId: access.workspaceId,
      userLimit: serviceLimits.route.maxRequestsPerUserPerDay(),
      workspaceLimit: serviceLimits.route.maxRequestsPerWorkspacePerDay(),
    });
    const matrix = await getOpenRouteServiceMatrix(body.locations);
    return NextResponse.json({ data: matrix });
  } catch (error) {
    return jsonError(
      error instanceof Error
        ? error.message
        : "Route distance provider is temporarily unavailable.",
      400
    );
  }
}
