export type LogisticsCoordinate = {
  latitude: number;
  longitude: number;
};

export type GeocodeRequest = {
  workspaceId: string;
  address: string;
};

export type GeocodeResult = LogisticsCoordinate & {
  formattedAddress?: string;
  providerPlaceId?: string;
};

export type DistanceMatrixRequest = {
  workspaceId: string;
  origins: LogisticsCoordinate[];
  destinations: LogisticsCoordinate[];
};

export type DistanceMatrixResult = {
  distanceMeters: number;
  durationSeconds: number;
};

export type RouteOptimizationRequest = {
  workspaceId: string;
  stops: Array<LogisticsCoordinate & { id: string }>;
};

export type RouteOptimizationResult = {
  orderedStopIds: string[];
  totalDistanceMeters?: number;
  totalDurationSeconds?: number;
};

export type LogisticsProviders = {
  geocode: (request: GeocodeRequest) => Promise<GeocodeResult>;
  distanceMatrix: (request: DistanceMatrixRequest) => Promise<DistanceMatrixResult[][]>;
  optimizeRoute: (request: RouteOptimizationRequest) => Promise<RouteOptimizationResult>;
};

export function buildGoogleMapsDirectionsUrl(
  stops: Array<{ addressSnapshot?: string; latitude?: number | null; longitude?: number | null }>
) {
  const waypoints = stops
    .map((stop) => {
      if (stop.latitude != null && stop.longitude != null) {
        return `${stop.latitude},${stop.longitude}`;
      }
      return stop.addressSnapshot?.trim() ?? "";
    })
    .filter(Boolean);

  if (waypoints.length === 0) return "";

  const [origin, ...rest] = waypoints;
  const destination = rest.pop() ?? origin;
  const params = new URLSearchParams({
    api: "1",
    origin,
    destination,
  });

  if (rest.length > 0) {
    params.set("waypoints", rest.join("|"));
  }

  return `https://www.google.com/maps/dir/?${params.toString()}`;
}
