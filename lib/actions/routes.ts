import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";
import type { RoutePlan } from "@/lib/db/routes";

export type RouteActionsRepository = {
  createRoute: (route: RoutePlan) => Promise<RoutePlan | null>;
  updateRoute: (route: RoutePlan) => Promise<RoutePlan | null>;
  deleteRoute: (routeId: string) => Promise<boolean>;
};

function validateRoute(route: RoutePlan) {
  return {
    ...route,
    workspaceId: requireText(route.workspaceId, "Workspace"),
    name: requireText(route.name, "Route name"),
  };
}

export async function createRoutePlan(
  repository: RouteActionsRepository,
  route: RoutePlan
): Promise<ActionResult<RoutePlan>> {
  try {
    const created = await repository.createRoute(validateRoute(route));
    return created ? ok(created) : fail("Unable to create route plan.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create route plan.");
  }
}

export async function updateRoutePlan(
  repository: RouteActionsRepository,
  route: RoutePlan
): Promise<ActionResult<RoutePlan>> {
  try {
    requireText(route.id, "Route");
    const updated = await repository.updateRoute(validateRoute(route));
    return updated ? ok(updated) : fail("Unable to update route plan.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update route plan.");
  }
}

export async function deleteRoutePlan(
  repository: RouteActionsRepository,
  routeId: string
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteRoute(requireText(routeId, "Route"));
    return deleted ? ok(true) : fail("Unable to delete route plan.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete route plan.");
  }
}
