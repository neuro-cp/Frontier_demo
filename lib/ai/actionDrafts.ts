import type { AiActionType, DraftPayload, SuggestedAction } from "@/lib/ai/types";

export const ALLOWED_AI_ACTION_TYPES = [
  "create_client",
  "update_client",
  "create_job",
  "update_job",
  "create_invoice",
  "update_invoice",
  "create_expense",
  "update_inventory",
  "create_material_allocation",
  "create_calendar_event",
] as const satisfies readonly AiActionType[];

export const DESTRUCTIVE_AI_ACTION_TYPES = [
  "delete_client",
  "delete_job",
  "delete_invoice",
  "delete_expense",
  "delete_inventory",
  "delete_calendar_event",
] as const;

export function isAllowedAiActionType(value: string): value is AiActionType {
  return ALLOWED_AI_ACTION_TYPES.includes(value as AiActionType);
}

export function createSuggestedAction<TPayload extends DraftPayload>(
  type: AiActionType,
  payload: TPayload,
  confidence: number
): SuggestedAction<TPayload> {
  return {
    type,
    payload,
    confidence,
  };
}
