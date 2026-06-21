import type { GeocodeResult } from "@/lib/geocoding/types";

type CacheEntry = {
  result: GeocodeResult;
  expiresAt: number;
};

const geocodeCache = new Map<string, CacheEntry>();

function getTtlMs() {
  const days = Number(process.env.GEOCODE_CACHE_TTL_DAYS ?? "30");
  const normalizedDays = Number.isFinite(days) && days > 0 ? days : 30;
  return normalizedDays * 24 * 60 * 60 * 1000;
}

export function getCachedGeocode(cacheKey: string) {
  const cached = geocodeCache.get(cacheKey);
  if (!cached) return null;
  if (cached.expiresAt < Date.now()) {
    geocodeCache.delete(cacheKey);
    return null;
  }
  return cached.result;
}

export function setCachedGeocode(cacheKey: string, result: GeocodeResult) {
  geocodeCache.set(cacheKey, {
    result,
    expiresAt: Date.now() + getTtlMs(),
  });
}
