"use client";
import type { SupabaseClient } from "@supabase/supabase-js";
type Setter<T> = (value: T | ((current: T) => T)) => void;
export type ClientCalendarEvent = { id: string; workspaceId: string; clientId: string; clientName: string; title: string; date: string };
type DbEvent = { id: string; workspace_id: string; client_id: string | null; client_name_snapshot: string | null; title: string; event_date: string };
const dbToEvent = (e: DbEvent): ClientCalendarEvent => ({ id: e.id, workspaceId: e.workspace_id, clientId: e.client_id ?? "", clientName: e.client_name_snapshot ?? "", title: e.title, date: e.event_date });
export function createCalendarEventsRepository({ isSignedIn, supabase, localEvents, setLocalEvents }: { isSignedIn: boolean; supabase: SupabaseClient | null; localEvents: ClientCalendarEvent[]; setLocalEvents: Setter<ClientCalendarEvent[]> }) {
  const useDb = isSignedIn && supabase;
  return {
    async getEvents(workspaceId: string) {
      if (!useDb) return localEvents.filter((e) => e.workspaceId === workspaceId);
      const { data, error } = await supabase.from("client_calendar_events").select("*").eq("workspace_id", workspaceId).order("event_date");
      if (error) return console.error("Unable to load events.", error), [];
      return ((data ?? []) as DbEvent[]).map(dbToEvent);
    },
    async createEvent(event: ClientCalendarEvent) {
      if (!useDb) return setLocalEvents((c) => [...c, event]), event;
      const { data, error } = await supabase.from("client_calendar_events").insert({ id: event.id, workspace_id: event.workspaceId, client_id: event.clientId || null, client_name_snapshot: event.clientName, title: event.title, event_date: event.date }).select("*").single();
      if (error) return console.error("Unable to create event.", error), null;
      return dbToEvent(data as DbEvent);
    },
    async updateEvent(event: ClientCalendarEvent) {
      if (!useDb) return setLocalEvents((c) => c.map((e) => e.id === event.id ? event : e)), event;
      const { data, error } = await supabase.from("client_calendar_events").update({ client_id: event.clientId || null, client_name_snapshot: event.clientName, title: event.title, event_date: event.date }).eq("id", event.id).select("*").single();
      if (error) return console.error("Unable to update event.", error), null;
      return dbToEvent(data as DbEvent);
    },
    async deleteEvent(id: string) {
      if (!useDb) return setLocalEvents((c) => c.filter((e) => e.id !== id)), true;
      const { error } = await supabase.from("client_calendar_events").delete().eq("id", id);
      if (error) return console.error("Unable to delete event.", error), false;
      return true;
    },
  };
}
