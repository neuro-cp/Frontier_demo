import { NextRequest, NextResponse } from "next/server";

import { GeocodeProviderError, type GeocodeInput } from "@/lib/geocoding/types";
import { geocodeAddress } from "@/lib/geocoding/provider";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { canUseExternalRouting } from "@/lib/plans/capabilities";
import {
  canManageWorkspaceData,
  jsonError,
  managerRequiredError,
  planUpgradeError,
  requireWorkspaceAccess,
} from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";

type GeocodeRequest = {
  workspaceId?: string;
  clientId?: string;
  address?: GeocodeInput;
};

function cleanGeocodeError(error: unknown) {
  if (error instanceof RateLimitError) return error.message;
  if (error instanceof GeocodeProviderError) return error.message;
  return "Address could not be geocoded.";
}

export async function POST(request: NextRequest) {
  let body: GeocodeRequest;
  try {
    body = (await request.json()) as GeocodeRequest;
  } catch {
    return jsonError("Invalid geocode request.", 400);
  }

  const access = await requireWorkspaceAccess(body.workspaceId);
  if (!access.ok) return access.response;
  if (!canManageWorkspaceData(access.role)) return managerRequiredError("geocode addresses");
  if (!canUseExternalRouting(access.plan)) return planUpgradeError();

  const { serviceClient, userId, workspaceId } = access;

  try {
    if (body.clientId) {
      const { data: client, error } = await serviceClient
        .from("clients")
        .select("id, workspace_id, address, city, state, zip, latitude, longitude")
        .eq("id", body.clientId)
        .eq("workspace_id", workspaceId)
        .maybeSingle();

      if (error || !client) return jsonError("Client not found.", 404);

      if (typeof client.latitude === "number" && typeof client.longitude === "number") {
        return NextResponse.json({
          data: {
            clientId: client.id,
            latitude: client.latitude,
            longitude: client.longitude,
            cached: true,
          },
        });
      }

      checkUserAndWorkspaceDailyLimits({
        service: "geocode",
        userId,
        workspaceId,
        userLimit: serviceLimits.geocode.maxRequestsPerUserPerDay(),
        workspaceLimit: serviceLimits.geocode.maxRequestsPerWorkspacePerDay(),
      });

      const result = await geocodeAddress({
        street: client.address ?? "",
        city: client.city ?? "",
        state: client.state ?? "",
        zip: client.zip ?? "",
        country: "US",
      });

      const { error: updateError } = await serviceClient
        .from("clients")
        .update({
          latitude: result.latitude,
          longitude: result.longitude,
        })
        .eq("id", client.id)
        .eq("workspace_id", workspaceId);

      if (updateError) throw updateError;

      return NextResponse.json({
        data: {
          clientId: client.id,
          latitude: result.latitude,
          longitude: result.longitude,
          displayName: result.displayName,
          provider: result.provider,
          cached: false,
        },
      });
    }

    if (!body.address) return jsonError("Missing address fields.", 400);
    checkUserAndWorkspaceDailyLimits({
      service: "geocode",
      userId,
      workspaceId,
      userLimit: serviceLimits.geocode.maxRequestsPerUserPerDay(),
      workspaceLimit: serviceLimits.geocode.maxRequestsPerWorkspacePerDay(),
    });

    const result = await geocodeAddress(body.address);
    return NextResponse.json({
      data: {
        latitude: result.latitude,
        longitude: result.longitude,
        displayName: result.displayName,
        provider: result.provider,
      },
    });
  } catch (error) {
    return jsonError(
      cleanGeocodeError(error),
      error instanceof RateLimitError ? error.status : 400
    );
  }
}
