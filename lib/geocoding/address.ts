import type { GeocodeInput } from "@/lib/geocoding/types";

export function normalizeAddressPart(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");
}

export function buildAddressCacheKey(input: GeocodeInput) {
  const parts = [
    input.street ?? input.fullAddress,
    input.city,
    input.state,
    input.zip,
    input.country ?? "us",
  ].map(normalizeAddressPart);

  return parts.join("|");
}

export function buildAddressQuery(input: GeocodeInput) {
  if (input.fullAddress?.trim()) {
    return input.fullAddress.trim().replace(/\s+/g, " ");
  }

  return [input.street, input.city, input.state, input.zip, input.country ?? "US"]
    .map((part) => String(part ?? "").trim())
    .filter(Boolean)
    .join(", ")
    .replace(/\s+/g, " ");
}
