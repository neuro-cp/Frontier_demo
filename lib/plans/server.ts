import "server-only";

import { normalizePlanTier } from "@/lib/plans/capabilities";

export function resolveWorkspacePlan() {
  return normalizePlanTier(process.env.FRONTIER_DEFAULT_PLAN);
}
