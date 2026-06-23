import type { AiActionType, AiSourceType, DraftPayload, SuggestedAction } from "@/lib/ai/types";

export type AiFormTarget = "client" | "job" | "invoice" | "expense" | "material";

export type AiFormHydration = {
  workspaceId: string;
  reviewDraftId: string;
  sourceId?: string;
  sourceType: AiSourceType;
  target: AiFormTarget;
  actionType: AiActionType;
  payload: DraftPayload;
};

const STORAGE_KEY = "frontier-ai-form-hydration";

const ACTION_TARGETS: Partial<Record<AiActionType, AiFormTarget>> = {
  create_client: "client",
  create_job: "job",
  create_invoice: "invoice",
  create_expense: "expense",
  update_inventory: "material",
  create_material_allocation: "material",
};

export function getAiFormTarget(action: SuggestedAction) {
  return ACTION_TARGETS[action.type] ?? null;
}

export function saveAiFormHydration(
  draft: Pick<AiFormHydration, "workspaceId" | "reviewDraftId" | "sourceId" | "sourceType">,
  action: SuggestedAction
) {
  const target = getAiFormTarget(action);
  if (!target || typeof window === "undefined") return null;

  const hydration: AiFormHydration = {
    ...draft,
    target,
    actionType: action.type,
    payload: action.payload,
  };
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(hydration));
  return hydration;
}

export function consumeAiFormHydration(
  target: AiFormTarget,
  workspaceId: string
) {
  if (typeof window === "undefined") return null;

  const raw = window.sessionStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const hydration = JSON.parse(raw) as AiFormHydration;
    if (hydration.target !== target || hydration.workspaceId !== workspaceId) {
      return null;
    }
    window.sessionStorage.removeItem(STORAGE_KEY);
    return hydration;
  } catch {
    window.sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function payloadString(payload: DraftPayload, key: string) {
  const value = payload[key];
  return typeof value === "string" ? value : "";
}

export function payloadNumber(payload: DraftPayload, key: string) {
  const value = payload[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}
