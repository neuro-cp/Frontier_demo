import "server-only";

import type { LogisticsCoordinate } from "@/lib/logistics/providers";

export type OpenRouteMatrixResult = {
  distances: number[][];
  durations: number[][];
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
