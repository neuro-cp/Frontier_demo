import "server-only";

import { readPositiveInt } from "@/lib/rateLimit/policy";

export const serviceLimits = {
  geocode: {
    maxRequestsPerUserPerDay: () =>
      readPositiveInt("GEOCODE_MAX_REQUESTS_PER_USER_PER_DAY", 25),
    maxRequestsPerWorkspacePerDay: () =>
      readPositiveInt("GEOCODE_MAX_REQUESTS_PER_WORKSPACE_PER_DAY", 100),
    maxBatchSize: () => readPositiveInt("GEOCODE_MAX_BATCH_SIZE", 10),
  },
  geocodeFarm: {
    enabled: () => process.env.GEOCODEFARM_ENABLED === "true",
    maxRequestsPerDay: () => readPositiveInt("GEOCODEFARM_MAX_REQUESTS_PER_DAY", 200),
  },
  route: {
    maxStops: () => readPositiveInt("ROUTE_MAX_STOPS", 25),
    absoluteMaxStops: () => readPositiveInt("ROUTE_ABSOLUTE_MAX_STOPS", 50),
    maxRequestsPerUserPerDay: () =>
      readPositiveInt("ROUTE_MAX_REQUESTS_PER_USER_PER_DAY", 50),
    maxRequestsPerWorkspacePerDay: () =>
      readPositiveInt("ROUTE_MAX_REQUESTS_PER_WORKSPACE_PER_DAY", 200),
  },
  matrix: {
    maxLocations: () => readPositiveInt("MATRIX_MAX_LOCATIONS", 25),
  },
  googleMaps: {
    maxUrlLength: 2048,
  },
};
