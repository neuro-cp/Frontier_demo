import "server-only";

import { buildAddressQuery } from "@/lib/geocoding/address";
import {
  GeocodeProviderError,
  type GeocodeInput,
  type GeocodeResult,
} from "@/lib/geocoding/types";
import { nominatimThrottle } from "@/lib/rateLimit/globalThrottle";

type NominatimResult = {
  lat?: string;
  lon?: string;
  display_name?: string;
};

export async function geocodeWithNominatim(input: GeocodeInput): Promise<GeocodeResult> {
  const baseUrl = process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org";
  const userAgent = process.env.NOMINATIM_USER_AGENT;
  const query = buildAddressQuery(input);

  if (!userAgent) {
    throw new GeocodeProviderError(
      "config_error",
      "Geocoding provider is not configured."
    );
  }

  if (!query) {
    throw new GeocodeProviderError("missing_address", "Missing address fields.");
  }

  const url = new URL("/search", baseUrl);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", "1");
  url.searchParams.set("addressdetails", "1");

  const response = await nominatimThrottle.enqueue(() =>
    fetch(url, {
      headers: {
        "User-Agent": userAgent,
      },
    })
  );

  if (response.status === 429) {
    throw new GeocodeProviderError(
      "rate_limited",
      "Geocoding is rate-limited. Try again shortly."
    );
  }

  if (!response.ok) {
    throw new GeocodeProviderError(
      "provider_error",
      "Geocoding provider is temporarily unavailable."
    );
  }

  const results = (await response.json()) as NominatimResult[];
  const first = results[0];
  const latitude = Number(first?.lat);
  const longitude = Number(first?.lon);

  if (!first || !Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new GeocodeProviderError("not_found", "Address could not be geocoded.");
  }

  return {
    latitude,
    longitude,
    provider: "nominatim",
    displayName: first.display_name,
    raw: first,
  };
}
