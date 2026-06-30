import { NextRequest, NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import {
  jsonError,
  requireWorkspaceAccess,
} from "@/lib/services/routeProtection";

const freshnessTables = [
  "clients",
  "jobs",
  "invoices",
  "expenses",
  "inventory_items",
  "documents",
  "client_calendar_events",
  "route_plans",
  "estimates",
  "material_catalog_items",
  "material_vendor_skus",
  "workspace_settings",
] as const;

type FreshnessTable = (typeof freshnessTables)[number];

type FreshnessRow = {
  updated_at: string | null;
};

async function getLatestUpdatedAt(
  serviceClient: SupabaseClient,
  table: FreshnessTable,
  workspaceId: string
) {
  const { data, error } = await serviceClient
    .from(table)
    .select("updated_at")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data as FreshnessRow | null)?.updated_at ?? null;
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? "";
  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;

  try {
    const tableUpdatedAtEntries = await Promise.all(
      freshnessTables.map(async (table) => [
        table,
        await getLatestUpdatedAt(access.serviceClient, table, access.workspaceId),
      ] as const)
    );
    const tableUpdatedAt = Object.fromEntries(tableUpdatedAtEntries);
    const serverUpdatedAt =
      tableUpdatedAtEntries
        .map(([, updatedAt]) => updatedAt)
        .filter((updatedAt): updatedAt is string => Boolean(updatedAt))
        .sort()
        .at(-1) ?? null;

    return NextResponse.json({
      workspaceId: access.workspaceId,
      serverUpdatedAt,
      tableUpdatedAt,
    });
  } catch {
    return jsonError("Unable to check workspace freshness.", 500);
  }
}
