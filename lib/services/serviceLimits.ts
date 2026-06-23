import "server-only";

import { readPositiveInt } from "@/lib/rateLimit/policy";

export const serviceLimits = {
  ocr: {
    maxRequestsPerUserPerDay: () => readPositiveInt("OCR_MAX_REQUESTS_PER_USER_PER_DAY", 20),
    maxRequestsPerWorkspacePerDay: () => readPositiveInt("OCR_MAX_REQUESTS_PER_WORKSPACE_PER_DAY", 100),
  },
  speech: {
    maxRequestsPerUserPerDay: () => readPositiveInt("SPEECH_MAX_REQUESTS_PER_USER_PER_DAY", 20),
    maxRequestsPerWorkspacePerDay: () => readPositiveInt("SPEECH_MAX_REQUESTS_PER_WORKSPACE_PER_DAY", 100),
  },
  aiDrafts: {
    maxRequestsPerUserPerDay: () => readPositiveInt("AI_MAX_REQUESTS_PER_USER_PER_DAY", 50),
    maxRequestsPerWorkspacePerDay: () => readPositiveInt("AI_MAX_REQUESTS_PER_WORKSPACE_PER_DAY", 200),
  },
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
