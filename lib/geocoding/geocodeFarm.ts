import "server-only";

import { buildAddressQuery } from "@/lib/geocoding/address";
import {
  GeocodeProviderError,
  type GeocodeInput,
  type GeocodeResult,
} from "@/lib/geocoding/types";
import { checkDailyLimit } from "@/lib/rateLimit/dailyCounters";
import { serviceLimits } from "@/lib/services/serviceLimits";

type GeocodeFarmResponse = {
  geocoding_results?: {
    status?: {
      code?: number | string;
      message?: string;
    };
    results?: Array<{
      formatted_address?: string;
      coordinates?: {
        lat?: string | number;
        lon?: string | number;
        lng?: string | number;
      };
    }>;
  };
};

function mapStatus(status: number) {
  if (status === 401 || status === 402) {
    return new GeocodeProviderError(
      "config_error",
      "Fallback geocoding provider is not available."
    );
  }
  if (status === 404) {
    return new GeocodeProviderError("not_found", "Address could not be geocoded.");
  }
  if (status === 429) {
    return new GeocodeProviderError(
      "rate_limited",
      "Geocoding is rate-limited. Try again shortly."
    );
  }
  return new GeocodeProviderError(
    "provider_error",
    "Geocoding provider is temporarily unavailable."
  );
}

export async function geocodeWithGeocodeFarm(input: GeocodeInput): Promise<GeocodeResult> {
  const apiKey = process.env.GEOCODEFARM_API_KEY;
  const baseUrl = process.env.GEOCODEFARM_BASE_URL || "https://www.geocode.farm/v3/json";
  const query = buildAddressQuery(input);

  if (!serviceLimits.geocodeFarm.enabled() || !apiKey) {
    throw new GeocodeProviderError(
      "config_error",
      "Fallback geocoding provider is not configured."
    );
  }

  if (!query) {
    throw new GeocodeProviderError("missing_address", "Missing address fields.");
  }

  checkDailyLimit(
    "geocodefarm:global",
    serviceLimits.geocodeFarm.maxRequestsPerDay(),
    "Fallback geocoding daily limit reached. Try again tomorrow."
  );

  const url = new URL("forward", baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
  url.searchParams.set("addr", query);
  url.searchParams.set("key", apiKey);

  const response = await fetch(url);
  if (!response.ok) throw mapStatus(response.status);

  const data = (await response.json()) as GeocodeFarmResponse;
  const result = data.geocoding_results?.results?.[0];
  const latitude = Number(result?.coordinates?.lat);
  const longitude = Number(result?.coordinates?.lon ?? result?.coordinates?.lng);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new GeocodeProviderError("not_found", "Address could not be geocoded.");
  }

  return {
    latitude,
    longitude,
    provider: "geocodefarm",
    displayName: result?.formatted_address,
  };
}
