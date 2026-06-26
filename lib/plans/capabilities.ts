import type {
  PlanCapabilities,
  PlanCapability,
  PlanLimits,
  PlanTier,
} from "@/lib/plans/types";

export const DEFAULT_SIGNED_IN_PLAN: PlanTier = "free";

export const planCapabilities: Record<PlanTier, PlanCapabilities> = {
  visitor: { cloudStorage: false, ocr: false, speech: false, aiDrafts: false, logistics: false, externalRouting: false },
  free: { cloudStorage: false, ocr: false, speech: false, aiDrafts: false, logistics: false, externalRouting: false },
  basic: { cloudStorage: true, ocr: false, speech: false, aiDrafts: false, logistics: false, externalRouting: false },
  professional: { cloudStorage: true, ocr: true, speech: true, aiDrafts: true, logistics: true, externalRouting: true },
  business: { cloudStorage: true, ocr: true, speech: true, aiDrafts: true, logistics: true, externalRouting: true },
};

export const planLimits: Record<PlanTier, PlanLimits> = {
  visitor: {
    maxUsers: 0,
    maxClients: 0,
    maxJobs: 0,
    maxDocuments: 0,
    storageBytes: 0,
    ocrRequestsPerMonth: 0,
    speechMinutesPerMonth: 0,
    imageAnalysesPerMonth: 0,
    routeOptimizationsPerMonth: 0,
    aiReviewDraftsPerMonth: 0,
  },
  free: {
    maxUsers: 1,
    maxClients: 10,
    maxJobs: 25,
    maxDocuments: 0,
    storageBytes: 0,
    ocrRequestsPerMonth: 0,
    speechMinutesPerMonth: 0,
    imageAnalysesPerMonth: 0,
    routeOptimizationsPerMonth: 0,
    aiReviewDraftsPerMonth: 0,
  },
  basic: {
    maxUsers: 1,
    maxClients: 100,
    maxJobs: 250,
    maxDocuments: 50,
    storageBytes: 250 * 1024 * 1024,
    ocrRequestsPerMonth: 0,
    speechMinutesPerMonth: 0,
    imageAnalysesPerMonth: 0,
    routeOptimizationsPerMonth: 0,
    aiReviewDraftsPerMonth: 0,
  },
  professional: {
    maxUsers: 8,
    maxClients: 1000,
    maxJobs: 5000,
    maxDocuments: 1000,
    storageBytes: 10 * 1024 * 1024 * 1024,
    ocrRequestsPerMonth: 500,
    speechMinutesPerMonth: 500,
    imageAnalysesPerMonth: 500,
    routeOptimizationsPerMonth: 500,
    aiReviewDraftsPerMonth: 1000,
  },
  business: {
    maxUsers: 25,
    maxClients: 10000,
    maxJobs: 50000,
    maxDocuments: 10000,
    storageBytes: 100 * 1024 * 1024 * 1024,
    ocrRequestsPerMonth: 5000,
    speechMinutesPerMonth: 5000,
    imageAnalysesPerMonth: 5000,
    routeOptimizationsPerMonth: 5000,
    aiReviewDraftsPerMonth: 10000,
  },
};

export function normalizePlanTier(value?: string | null): PlanTier {
  const normalized = value?.trim().toLowerCase();
  if (normalized && normalized in planCapabilities) return normalized as PlanTier;
  return DEFAULT_SIGNED_IN_PLAN;
}

export function canUseCapability(plan: PlanTier, capability: PlanCapability) {
  return planCapabilities[plan][capability];
}

export function getPlanLimits(plan: PlanTier) {
  return planLimits[plan];
}

export const canUseCloudStorage = (plan: PlanTier) => canUseCapability(plan, "cloudStorage");
export const canUseOcr = (plan: PlanTier) => canUseCapability(plan, "ocr");
export const canUseSpeech = (plan: PlanTier) => canUseCapability(plan, "speech");
export const canUseAiDrafts = (plan: PlanTier) => canUseCapability(plan, "aiDrafts");
export const canUseLogistics = (plan: PlanTier) => canUseCapability(plan, "logistics");
export const canUseExternalRouting = (plan: PlanTier) => canUseCapability(plan, "externalRouting");
