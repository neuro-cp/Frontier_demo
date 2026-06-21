import "server-only";

import { buildAddressCacheKey } from "@/lib/geocoding/address";
import { getCachedGeocode, setCachedGeocode } from "@/lib/geocoding/cache";
import { geocodeWithGeocodeFarm } from "@/lib/geocoding/geocodeFarm";
import { geocodeWithNominatim } from "@/lib/geocoding/nominatim";
import {
  GeocodeProviderError,
  type GeocodeInput,
  type GeocodeResult,
} from "@/lib/geocoding/types";

export async function geocodeAddress(input: GeocodeInput): Promise<GeocodeResult> {
  const provider = process.env.GEOCODER_PROVIDER || "nominatim";
  if (provider !== "nominatim") {
    throw new GeocodeProviderError(
      "config_error",
      "Configured geocoding provider is not supported yet."
    );
  }

  const cacheKey = buildAddressCacheKey(input);
  const cached = getCachedGeocode(cacheKey);
  if (cached) return cached;

  let result: GeocodeResult;
  try {
    result = await geocodeWithNominatim(input);
  } catch (error) {
    if (!process.env.GEOCODEFARM_ENABLED || process.env.GEOCODEFARM_ENABLED !== "true") {
      throw error;
    }
    result = await geocodeWithGeocodeFarm(input);
  }
  setCachedGeocode(cacheKey, result);
  return result;
}
