export type GeocodeInput = {
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  country?: string;
  fullAddress?: string;
};

export type GeocodeResult = {
  latitude: number;
  longitude: number;
  provider: "nominatim" | "geocodefarm";
  displayName?: string;
  raw?: unknown;
};

export type GeocodeErrorCode =
  | "missing_address"
  | "not_found"
  | "rate_limited"
  | "provider_error"
  | "config_error";

export class GeocodeProviderError extends Error {
  code: GeocodeErrorCode;

  constructor(code: GeocodeErrorCode, message: string) {
    super(message);
    this.name = "GeocodeProviderError";
    this.code = code;
  }
}
