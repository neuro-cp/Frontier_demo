import type { ClientRow } from "@/lib/clientTypes";

export type LogisticsLocation = {
  id: string;
  workspaceId: string;
  clientId: string;
  name: string;
  status: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  coordinateSource: "saved" | "temporary";
};

export type MissingCoordinateClient = {
  id: string;
  name: string;
};

function hasClientAddress(client: ClientRow) {
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

export function getMissingCoordinateClients(
  clients: ClientRow[]
): MissingCoordinateClient[] {
  return clients
    .filter(
      (client) =>
        typeof client.latitude !== "number" &&
        typeof client.longitude !== "number" &&
        !hasClientAddress(client)
    )
    .map((client) => ({
      id: client.id,
      name: client.name,
    }));
}
