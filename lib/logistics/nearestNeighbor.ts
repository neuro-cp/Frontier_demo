import type { LogisticsCoordinate } from "@/lib/logistics/providers";

export type OptimizableStop = LogisticsCoordinate & {
  id: string;
};

function distanceMeters(a: LogisticsCoordinate, b: LogisticsCoordinate) {
  const earthRadiusMeters = 6371000;
  const toRadians = (value: number) => (value * Math.PI) / 180;
  const dLat = toRadians(b.latitude - a.latitude);
  const dLon = toRadians(b.longitude - a.longitude);
  const lat1 = toRadians(a.latitude);
  const lat2 = toRadians(b.latitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * earthRadiusMeters * Math.asin(Math.sqrt(h));
}

export function orderStopsNearestNeighbor(stops: OptimizableStop[]) {
  if (stops.length <= 2) return stops;

  const [first, ...remaining] = stops;
  const ordered = [first];
  let current = first;
  const unvisited = [...remaining];

  while (unvisited.length > 0) {
    let nearestIndex = 0;
    let nearestDistance = Number.POSITIVE_INFINITY;

    unvisited.forEach((candidate, index) => {
      const distance = distanceMeters(current, candidate);
      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    });

    const [nearest] = unvisited.splice(nearestIndex, 1);
    ordered.push(nearest);
    current = nearest;
  }

  return ordered;
}
