import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";
import type { ClientCalendarEvent } from "@/lib/db/calendarEvents";

export type CalendarActionsRepository = {
  createEvent: (event: ClientCalendarEvent) => Promise<ClientCalendarEvent | null>;
  updateEvent: (event: ClientCalendarEvent) => Promise<ClientCalendarEvent | null>;
  deleteEvent: (eventId: string) => Promise<boolean>;
};

function validateCalendarEvent(event: ClientCalendarEvent) {
  return {
    ...event,
    workspaceId: requireText(event.workspaceId, "Workspace"),
    title: requireText(event.title, "Event title"),
    date: requireText(event.date, "Event date"),
  };
}

export async function createCalendarEvent(
  repository: CalendarActionsRepository,
  event: ClientCalendarEvent
): Promise<ActionResult<ClientCalendarEvent>> {
  try {
    const created = await repository.createEvent(validateCalendarEvent(event));
    return created ? ok(created) : fail("Unable to create calendar event.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create calendar event.");
  }
}

export async function updateCalendarEvent(
  repository: CalendarActionsRepository,
  event: ClientCalendarEvent
): Promise<ActionResult<ClientCalendarEvent>> {
  try {
    requireText(event.id, "Calendar event");
    const updated = await repository.updateEvent(validateCalendarEvent(event));
    return updated ? ok(updated) : fail("Unable to update calendar event.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update calendar event.");
  }
}

export async function deleteCalendarEvent(
  repository: CalendarActionsRepository,
  eventId: string
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteEvent(requireText(eventId, "Calendar event"));
    return deleted ? ok(true) : fail("Unable to delete calendar event.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete calendar event.");
  }
}
