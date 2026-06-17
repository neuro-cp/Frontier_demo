import { ClientRow } from "@/lib/frontierClients";

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
};

const demoCoordinatesByClientId: Record<
  string,
  { latitude: number; longitude: number }
> = {
  "1": { latitude: 42.6886, longitude: -83.1359 },
  "2": { latitude: 42.6658, longitude: -83.1141 },
  "3": { latitude: 42.6698, longitude: -83.1517 },
  "4": { latitude: 42.6518, longitude: -83.1436 },
  "5": { latitude: 42.6816, longitude: -83.1952 },
  "6": { latitude: 42.6417, longitude: -83.1508 },

  "7": { latitude: 42.6358, longitude: -83.1418 },
  "8": { latitude: 42.6802, longitude: -83.1348 },
  "9": { latitude: 42.6512, longitude: -83.1942 },
  "10": { latitude: 42.6807, longitude: -83.1496 },
  "11": { latitude: 42.6328, longitude: -83.1337 },

  "12": { latitude: 42.6611, longitude: -83.1249 },
  "13": { latitude: 42.6802, longitude: -83.1348 },
  "14": { latitude: 42.6816, longitude: -83.1952 },
  "15": { latitude: 42.6923, longitude: -83.1237 },
  "16": { latitude: 42.6525, longitude: -83.1946 },
};

export function getClientFullAddress(location: LogisticsLocation) {
  return [location.address, location.city, location.state, location.zip]
    .filter(Boolean)
    .join(", ");
}

export function buildLogisticsLocations(
  clients: ClientRow[]
): LogisticsLocation[] {
  return clients
    .map((client) => {
      const fallbackCoordinates = demoCoordinatesByClientId[client.id];

      const latitude = client.latitude ?? fallbackCoordinates?.latitude;
      const longitude = client.longitude ?? fallbackCoordinates?.longitude;

      if (!latitude || !longitude) return null;

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
      };
    })
    .filter((location): location is LogisticsLocation => Boolean(location));
}