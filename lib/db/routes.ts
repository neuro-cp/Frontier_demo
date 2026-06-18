"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
import { assertUuid, isUuid } from "@/lib/db/ids";
export type RoutePlan = { id: string; workspaceId: string; name: string; googleMapsUrl?: string; totalDistanceMeters?: number | null; totalDurationSeconds?: number | null; notes?: string; stops: RouteStop[] };
export type RouteStop = { id?: string; clientId: string; stopOrder: number; latitude: number | null; longitude: number | null; addressSnapshot: string };
type DbRouteStop = { id: string; client_id: string | null; stop_order: number; latitude: number | null; longitude: number | null; address_snapshot: string | null };
type DbRoute = { id: string; workspace_id: string; name: string; google_maps_url: string | null; total_distance_meters: number | null; total_duration_seconds: number | null; notes: string | null; route_plan_stops?: DbRouteStop[] };
export function createRoutesRepository({ isSignedIn, supabase }: { isSignedIn: boolean; supabase: SupabaseClient | null }) {
  const useDb = isSignedIn && supabase;
  function dbToRoute(r: DbRoute): RoutePlan {
    return { id: r.id, workspaceId: r.workspace_id, name: r.name, googleMapsUrl: r.google_maps_url ?? undefined, totalDistanceMeters: r.total_distance_meters, totalDurationSeconds: r.total_duration_seconds, notes: r.notes ?? "", stops: (r.route_plan_stops ?? []).map((s) => ({ id: s.id, clientId: s.client_id ?? "", stopOrder: s.stop_order, latitude: s.latitude, longitude: s.longitude, addressSnapshot: s.address_snapshot ?? "" })) };
  }
  async function saveRouteWithStops(route: RoutePlan) {
    if (!useDb) return route;
    const { error } = await supabase.rpc("upsert_route_with_stops", {
      route_payload: {
        id: route.id,
        workspace_id: route.workspaceId,
        name: route.name,
        google_maps_url: route.googleMapsUrl ?? null,
        total_distance_meters: route.totalDistanceMeters ?? null,
        total_duration_seconds: route.totalDurationSeconds ?? null,
        notes: route.notes ?? null,
      },
      stops_payload: route.stops.map((s) => ({
        id: s.id ?? "",
        client_id: s.clientId || "",
        stop_order: s.stopOrder,
        latitude: s.latitude,
        longitude: s.longitude,
        address_snapshot: s.addressSnapshot,
      })),
    });
    if (error) throw new Error(error.message || "Unable to save route.");
    return route;
  }
  return {
    async getRoutes(workspaceId: string) {
      if (!useDb) return [] as RoutePlan[];
      if (!isUuid(workspaceId)) return [];
      const { data, error } = await supabase.from("route_plans").select("*, route_plan_stops(*)").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
      if (error) throw new Error(error.message || "Unable to load routes.");
      return ((data ?? []) as DbRoute[]).map(dbToRoute);
    },
    async createRoute(route: RoutePlan) {
      if (!useDb) return route;
      assertUuid(route.workspaceId, "Workspace");
      return saveRouteWithStops(route);
    },
    async updateRoute(route: RoutePlan) {
      if (!useDb) return route;
      assertUuid(route.workspaceId, "Workspace");
      assertUuid(route.id, "Route");
      return saveRouteWithStops(route);
    },
    async deleteRoute(id: string) {
      if (!useDb) return true;
      if (!isUuid(id)) return true;
      const { error } = await supabase.from("route_plans").delete().eq("id", id);
      if (error) throw new Error(error.message || "Unable to delete route.");
      return true;
    },
  };
}
