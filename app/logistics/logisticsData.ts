import type { ClientRow } from "@/lib/clientTypes";
import type { ClientCalendarEvent } from "@/lib/db/calendarEvents";
import type { Job } from "@/lib/jobTypes";

export type LogisticsLocation = {
  id: string;
  workspaceId: string;
  clientId: string;
  jobId?: string;
  eventId?: string;
  sourceType: "client" | "job" | "event";
  name: string;
  status: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  coordinateSource: "saved" | "temporary";
  scheduledDate?: string;
  scheduledTime?: string;
};

export type MissingCoordinateClient = {
  id: string;
  name: string;
  hasAddress: boolean;
};

export function hasClientAddress(client: ClientRow) {
  return Boolean(
    client.address?.trim() ||
      client.city?.trim() ||
      client.state?.trim() ||
      client.zip?.trim()
  );
}

function getTemporaryCoordinates(index: number) {
  const baseLatitude = 42.6584;
  const baseLongitude = -83.1498;
  const row = Math.floor(index / 5);
  const column = index % 5;

  return {
    latitude: baseLatitude + (row - 1) * 0.012,
    longitude: baseLongitude + (column - 2) * 0.014,
  };
}

export function getClientFullAddress(location: LogisticsLocation) {
  return [location.address, location.city, location.state, location.zip]
    .filter(Boolean)
    .join(", ");
}

export function buildLogisticsLocations(
  clients: ClientRow[]
): LogisticsLocation[] {
  return clients
    .map((client, index) => {
      const hasSavedCoordinates =
        typeof client.latitude === "number" &&
        typeof client.longitude === "number";
      const fallbackCoordinates = hasClientAddress(client)
        ? getTemporaryCoordinates(index)
        : undefined;
      const latitude = hasSavedCoordinates
        ? client.latitude
        : fallbackCoordinates?.latitude;
      const longitude = hasSavedCoordinates
        ? client.longitude
        : fallbackCoordinates?.longitude;

      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return null;
      }

      return {
        id: client.id,
        workspaceId: client.workspaceId,
        clientId: client.id,
        sourceType: "client",
        name: client.name,
        status: client.status,
        address: client.address ?? "",
        city: client.city ?? "",
        state: client.state ?? "",
        zip: client.zip ?? "",
        latitude,
        longitude,
        coordinateSource: hasSavedCoordinates ? "saved" : "temporary",
      };
    })
    .filter((location): location is LogisticsLocation => Boolean(location));
}

function normalizeAddressKey(location: {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
}) {
  return [location.address, location.city, location.state, location.zip]
    .map((part) =>
      String(part ?? "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ")
    )
    .join("|");
}

function getStopKey(location: LogisticsLocation) {
  return `${location.clientId}|${normalizeAddressKey(location)}`;
}

export function buildJobLogisticsLocations(
  jobs: Job[],
  clients: ClientRow[]
): LogisticsLocation[] {
  const clientsById = new Map(clients.map((client) => [client.id, client]));

  return jobs.flatMap((job) => {
      if (!job.clientId) return [];
      const client = clientsById.get(job.clientId);
      if (!client) return [];

      const latitude = client.latitude;
      const longitude = client.longitude;
      if (typeof latitude !== "number" || typeof longitude !== "number") {
        return [];
      }

      return [{
        id: `job:${job.id}`,
        workspaceId: job.workspaceId,
        clientId: client.id,
        jobId: job.id,
        sourceType: "job" as const,
        name: `${job.name} - ${client.name}`,
        status: `${job.status}${job.date ? ` - ${job.date}` : ""}${
          job.time ? ` ${job.time}` : ""
        }`,
        address: client.address ?? "",
        city: client.city ?? "",
        state: client.state ?? "",
        zip: client.zip ?? "",
        latitude,
        longitude,
        coordinateSource: "saved" as const,
        scheduledDate: job.date,
        scheduledTime: job.time,
      }];
    });
}

export function buildClientEventLogisticsLocations(
  events: ClientCalendarEvent[],
  clients: ClientRow[]
): LogisticsLocation[] {
  const clientsById = new Map(clients.map((client) => [client.id, client]));

  return events.flatMap((event) => {
    const client = clientsById.get(event.clientId);
    if (!client) return [];

    const latitude = client.latitude;
    const longitude = client.longitude;
    if (typeof latitude !== "number" || typeof longitude !== "number") {
      return [];
    }

    return [{
      id: `event:${event.id}`,
      workspaceId: event.workspaceId,
      clientId: client.id,
      eventId: event.id,
      sourceType: "event" as const,
      name: `${event.title} - ${client.name}`,
      status: `${event.date}${event.time ? ` ${event.time}` : ""}`,
      address: client.address ?? "",
      city: client.city ?? "",
      state: client.state ?? "",
      zip: client.zip ?? "",
      latitude,
      longitude,
      coordinateSource: "saved" as const,
      scheduledDate: event.date,
      scheduledTime: event.time,
    }];
  });
}

export function dedupeLogisticsLocations(
  locations: LogisticsLocation[]
): LogisticsLocation[] {
  const priority = { job: 3, event: 2, client: 1 };
  const byStopKey = new Map<string, LogisticsLocation>();

  locations.forEach((location) => {
    const stopKey = getStopKey(location);
    const existing = byStopKey.get(stopKey);

    if (!existing || priority[location.sourceType] > priority[existing.sourceType]) {
      byStopKey.set(stopKey, location);
    }
  });

  return [...byStopKey.values()];
}

export function getMissingCoordinateClients(
  clients: ClientRow[]
): MissingCoordinateClient[] {
  return clients
    .filter(
      (client) =>
        typeof client.latitude !== "number" ||
        typeof client.longitude !== "number"
    )
    .map((client) => ({
      id: client.id,
      name: client.name,
      hasAddress: hasClientAddress(client),
    }));
}
