import "server-only";

import type { LogisticsCoordinate } from "@/lib/logistics/providers";

export type OpenRouteMatrixResult = {
  distances: number[][];
  durations: number[][];
};

export type OpenRouteDirectionsResult = {
  path: Array<[number, number]>;
  distanceMeters: number | null;
  durationSeconds: number | null;
};

export async function getOpenRouteServiceMatrix(
  locations: LogisticsCoordinate[]
): Promise<OpenRouteMatrixResult> {
  const apiKey = process.env.OPENROUTE_SERVICE_API_KEY;
  if (!apiKey) {
    throw new Error("Route distance provider is not configured.");
  }

  const response = await fetch(
    "https://api.openrouteservice.org/v2/matrix/driving-car",
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        locations: locations.map((location) => [
          location.longitude,
          location.latitude,
        ]),
        metrics: ["distance", "duration"],
      }),
    }
  );

  if (response.status === 429) {
    throw new Error("Route distance provider is rate-limited. Try again shortly.");
  }

  if (!response.ok) {
    throw new Error("Route distance provider is temporarily unavailable.");
  }

  const data = (await response.json()) as OpenRouteMatrixResult;
  return {
    distances: data.distances ?? [],
    durations: data.durations ?? [],
  };
}

type OpenRouteDirectionsResponse = {
  features?: Array<{
    geometry?: {
      coordinates?: Array<[number, number]>;
    };
    properties?: {
      summary?: {
        distance?: number;
        duration?: number;
      };
    };
  }>;
};

export async function getOpenRouteServiceDirections(
  locations: LogisticsCoordinate[]
): Promise<OpenRouteDirectionsResult> {
  const apiKey = process.env.OPENROUTE_SERVICE_API_KEY;
  if (!apiKey) {
    throw new Error("Route provider is not configured.");
  }

  const response = await fetch(
    "https://api.openrouteservice.org/v2/directions/driving-car/geojson",
    {
      method: "POST",
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        coordinates: locations.map((location) => [
          location.longitude,
          location.latitude,
        ]),
      }),
    }
  );

  if (response.status === 429) {
    throw new Error("Route provider is rate-limited. Try again shortly.");
  }

  if (!response.ok) {
    throw new Error("Route provider is temporarily unavailable.");
  }

  const data = (await response.json()) as OpenRouteDirectionsResponse;
  const feature = data.features?.[0];
  return {
    path:
      feature?.geometry?.coordinates?.map(([longitude, latitude]) => [
        latitude,
        longitude,
      ]) ?? [],
    distanceMeters: feature?.properties?.summary?.distance ?? null,
    durationSeconds: feature?.properties?.summary?.duration ?? null,
  };
}
