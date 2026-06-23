import type { PlanCapabilities, PlanCapability, PlanTier } from "@/lib/plans/types";

export const DEFAULT_SIGNED_IN_PLAN: PlanTier = "professional";

export const planCapabilities: Record<PlanTier, PlanCapabilities> = {
  visitor: { cloudStorage: false, ocr: false, speech: false, aiDrafts: false, logistics: false, externalRouting: false },
  free: { cloudStorage: false, ocr: false, speech: false, aiDrafts: false, logistics: false, externalRouting: false },
  basic: { cloudStorage: true, ocr: false, speech: false, aiDrafts: false, logistics: false, externalRouting: false },
  professional: { cloudStorage: true, ocr: true, speech: true, aiDrafts: true, logistics: true, externalRouting: true },
  business: { cloudStorage: true, ocr: true, speech: true, aiDrafts: true, logistics: true, externalRouting: true },
};

export function normalizePlanTier(value?: string | null): PlanTier {
  const normalized = value?.trim().toLowerCase();
  if (normalized && normalized in planCapabilities) return normalized as PlanTier;
  return DEFAULT_SIGNED_IN_PLAN;
}

export function canUseCapability(plan: PlanTier, capability: PlanCapability) {
  return planCapabilities[plan][capability];
}

export const canUseCloudStorage = (plan: PlanTier) => canUseCapability(plan, "cloudStorage");
export const canUseOcr = (plan: PlanTier) => canUseCapability(plan, "ocr");
export const canUseSpeech = (plan: PlanTier) => canUseCapability(plan, "speech");
export const canUseAiDrafts = (plan: PlanTier) => canUseCapability(plan, "aiDrafts");
export const canUseLogistics = (plan: PlanTier) => canUseCapability(plan, "logistics");
export const canUseExternalRouting = (plan: PlanTier) => canUseCapability(plan, "externalRouting");
