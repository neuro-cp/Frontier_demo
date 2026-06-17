"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
export type RoutePlan = { id: string; workspaceId: string; name: string; googleMapsUrl?: string; stops: RouteStop[] };
export type RouteStop = { id?: string; clientId: string; stopOrder: number; latitude: number | null; longitude: number | null; addressSnapshot: string };
type DbRouteStop = { id: string; client_id: string | null; stop_order: number; latitude: number | null; longitude: number | null; address_snapshot: string | null };
type DbRoute = { id: string; workspace_id: string; name: string; google_maps_url: string | null; route_plan_stops?: DbRouteStop[] };
export function createRoutesRepository({ isSignedIn, supabase }: { isSignedIn: boolean; supabase: SupabaseClient | null }) {
  const useDb = isSignedIn && supabase;
  return {
    async getRoutes(workspaceId: string) {
      if (!useDb) return [] as RoutePlan[];
      const { data, error } = await supabase.from("route_plans").select("*, route_plan_stops(*)").eq("workspace_id", workspaceId).order("created_at", { ascending: false });
      if (error) return console.error("Unable to load routes.", error), [];
      return ((data ?? []) as DbRoute[]).map((r) => ({ id: r.id, workspaceId: r.workspace_id, name: r.name, googleMapsUrl: r.google_maps_url ?? undefined, stops: (r.route_plan_stops ?? []).map((s) => ({ id: s.id, clientId: s.client_id ?? "", stopOrder: s.stop_order, latitude: s.latitude, longitude: s.longitude, addressSnapshot: s.address_snapshot ?? "" })) }));
    },
    async createRoute(route: RoutePlan) {
      if (!useDb) return route;
      const { error } = await supabase.from("route_plans").insert({ id: route.id, workspace_id: route.workspaceId, name: route.name, google_maps_url: route.googleMapsUrl ?? null });
      if (error) return console.error("Unable to create route.", error), null;
      if (route.stops.length) await supabase.from("route_plan_stops").insert(route.stops.map((s) => ({ workspace_id: route.workspaceId, route_plan_id: route.id, client_id: s.clientId || null, stop_order: s.stopOrder, latitude: s.latitude, longitude: s.longitude, address_snapshot: s.addressSnapshot })));
      return route;
    },
    async updateRoute(route: RoutePlan) {
      if (!useDb) return route;
      await supabase.from("route_plan_stops").delete().eq("route_plan_id", route.id);
      await supabase.from("route_plans").update({ name: route.name, google_maps_url: route.googleMapsUrl ?? null }).eq("id", route.id);
      if (route.stops.length) await supabase.from("route_plan_stops").insert(route.stops.map((s) => ({ workspace_id: route.workspaceId, route_plan_id: route.id, client_id: s.clientId || null, stop_order: s.stopOrder, latitude: s.latitude, longitude: s.longitude, address_snapshot: s.addressSnapshot })));
      return route;
    },
    async deleteRoute(id: string) {
      if (!useDb) return true;
      const { error } = await supabase.from("route_plans").delete().eq("id", id);
      if (error) return console.error("Unable to delete route.", error), false;
      return true;
    },
  };
}
