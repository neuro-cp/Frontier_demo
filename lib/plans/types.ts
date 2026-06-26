export const planTiers = [
  "visitor",
  "free",
  "basic",
  "professional",
  "business",
] as const;

export type PlanTier = (typeof planTiers)[number];

export type PlanCapabilities = {
  cloudStorage: boolean;
  ocr: boolean;
  speech: boolean;
  aiDrafts: boolean;
  logistics: boolean;
  externalRouting: boolean;
};

export type PlanCapability = keyof PlanCapabilities;

export type PlanLimits = {
  maxUsers: number;
  maxClients: number;
  maxJobs: number;
  maxDocuments: number;
  storageBytes: number;
  ocrRequestsPerMonth: number;
  speechMinutesPerMonth: number;
  imageAnalysesPerMonth: number;
  routeOptimizationsPerMonth: number;
  aiReviewDraftsPerMonth: number;
};
