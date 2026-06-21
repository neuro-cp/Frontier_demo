import { isAllowedAiActionType } from "@/lib/ai/actionDrafts";
import {
  ACTION_PAYLOAD_SCHEMAS,
  CONFIDENCE_THRESHOLDS,
  type PayloadFieldType,
} from "@/lib/ai/schemas";
import type {
  DraftPayload,
  InterpretationResult,
  InterpretationWarning,
  SuggestedAction,
} from "@/lib/ai/types";

export type AiValidationHooks = {
  checkDuplicate?: (action: SuggestedAction) => Promise<InterpretationWarning[]>;
  checkWorkspaceOwnership?: (
    workspaceId: string,
    action: SuggestedAction
  ) => Promise<InterpretationWarning[]>;
  checkPermission?: (action: SuggestedAction) => Promise<InterpretationWarning[]>;
};

export type AiValidationResult = {
  ok: boolean;
  warnings: InterpretationWarning[];
};

function isRecord(value: unknown): value is DraftPayload {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function matchesFieldType(value: unknown, type: PayloadFieldType) {
  if (value === undefined || value === null) return true;
  if (type === "array") return Array.isArray(value);
  if (type === "object") return typeof value === "object" && !Array.isArray(value);
  if (type === "number" || type === "currency") {
    return typeof value === "number" && Number.isFinite(value);
  }
  if (type === "boolean") return typeof value === "boolean";
  if (type === "string" || type === "date") return typeof value === "string";
  return false;
}

export function validateSuggestedAction(action: SuggestedAction): AiValidationResult {
  const warnings: InterpretationWarning[] = [];

  if (!isAllowedAiActionType(action.type)) {
    warnings.push({
      code: "unsupported_intent",
      message: `Unsupported action type: ${action.type}.`,
      path: "type",
    });
  }

  if (action.confidence < CONFIDENCE_THRESHOLDS.suggestedAction) {
    warnings.push({
      code: "low_confidence",
      message: "Suggested action confidence is below the review threshold.",
      path: "confidence",
    });
  }

  if (!isRecord(action.payload)) {
    warnings.push({
      code: "invalid_payload",
      message: "Suggested action payload must be an object.",
      path: "payload",
    });
    return { ok: false, warnings };
  }

  const schema = ACTION_PAYLOAD_SCHEMAS[action.type];
  for (const field of schema.requiredFields) {
    const value = action.payload[field];
    if (value === undefined || value === null || value === "") {
      warnings.push({
        code: "missing_required_field",
        message: `${field} is required for ${action.type}.`,
        path: `payload.${field}`,
      });
    }
  }

  for (const [field, fieldSchema] of Object.entries(schema.fields)) {
    if (!matchesFieldType(action.payload[field], fieldSchema.type)) {
      warnings.push({
        code: "invalid_payload",
        message: `${field} must be ${fieldSchema.type}.`,
        path: `payload.${field}`,
      });
    }
  }

  return {
    ok: !warnings.some(
      (warning) =>
        warning.code === "missing_required_field" ||
        warning.code === "invalid_payload" ||
        warning.code === "unsupported_intent"
    ),
    warnings,
  };
}

export async function validateInterpretationResult(
  result: InterpretationResult,
  hooks: AiValidationHooks = {}
): Promise<AiValidationResult> {
  const warnings: InterpretationWarning[] = [...result.warnings];

  if (!result.workspaceId) {
    warnings.push({
      code: "workspace_unverified",
      message: "Workspace id is required before review.",
      path: "workspaceId",
    });
  }

  if (result.confidence < CONFIDENCE_THRESHOLDS.reviewDraft) {
    warnings.push({
      code: "low_confidence",
      message: "Overall interpretation confidence is low.",
      path: "confidence",
    });
  }

  for (const action of result.actions) {
    const validation = validateSuggestedAction(action);
    warnings.push(...validation.warnings);
    if (hooks.checkDuplicate) warnings.push(...(await hooks.checkDuplicate(action)));
    if (hooks.checkWorkspaceOwnership) {
      warnings.push(
        ...(await hooks.checkWorkspaceOwnership(result.workspaceId, action))
      );
    }
    if (hooks.checkPermission) warnings.push(...(await hooks.checkPermission(action)));
  }

  return {
    ok: !warnings.some(
      (warning) =>
        warning.code === "missing_required_field" ||
        warning.code === "invalid_payload" ||
        warning.code === "unsupported_intent"
    ),
    warnings,
  };
}
