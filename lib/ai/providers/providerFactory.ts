import "server-only";

import { createReviewDraft } from "@/lib/ai/reviewTypes";
import type { InterpretationResult } from "@/lib/ai/types";
import {
  validateInterpretationResult,
  validateSuggestedAction,
} from "@/lib/ai/validators";
import { createOpenAiProvider } from "@/lib/ai/providers/openaiProvider";
import { createOpenRouterProvider } from "@/lib/ai/providers/openrouterProvider";
import {
  buildImageAnalysisUserPrompt,
  buildInterpretationUserPrompt,
  AI_JSON_SYSTEM_PROMPT,
  IMAGE_EMPTY_ACTION_REASK_SYSTEM_PROMPT,
  IMAGE_ANALYSIS_JSON_SYSTEM_PROMPT,
  IMAGE_JSON_REPAIR_SYSTEM_PROMPT,
} from "@/lib/ai/providers/systemPrompts";
import { extractJsonObject } from "@/lib/ai/providers/jsonExtraction";
import {
  getGemini25ActionDiagnostics as normalizedActionDiagnostics,
  normalizeGemini25Actions as toActions,
  rawGemini25ActionArray as rawActionArray,
} from "@/lib/ai/providers/normalizers/gemini25Normalizer";
import {
  AiProviderError,
  type AiProviderClient,
  type AiProviderName,
  type ProviderImageInterpretationOptions,
  type ProviderImageInterpretationInput,
  type ProviderInterpretationInput,
  type ProviderInterpretationOutput,
  type TextAiSourceType,
} from "@/lib/ai/providers/types";

function normalizeProviderName(value: string | undefined): AiProviderName | undefined {
  const normalized = value?.trim().toLowerCase();
  if (normalized === "openrouter" || normalized === "openai") return normalized;
  return undefined;
}

function createProvider(name: AiProviderName): AiProviderClient {
  if (name === "openrouter") return createOpenRouterProvider();
  return createOpenAiProvider();
}

function getPrimaryConfig() {
  const provider = normalizeProviderName(process.env.AI_PROVIDER);
  const model = process.env.AI_MODEL_TEXT?.trim();
  if (!provider || !model) {
    throw new AiProviderError("missing_config", "Primary AI provider is not configured.");
  }
  return { provider, model };
}

function getFallbackConfig() {
  const provider = normalizeProviderName(process.env.AI_FALLBACK_PROVIDER);
  const model = process.env.AI_MODEL_FALLBACK?.trim();
  if (!provider || !model) return undefined;
  return { provider, model };
}

function getVisionConfig() {
  const provider = normalizeProviderName(process.env.AI_PROVIDER);
  const model = process.env.AI_MODEL_VISION?.trim();
  if (!provider || !model) {
    throw new AiProviderError("missing_config", "Vision AI provider is not configured.");
  }
  return { provider, model };
}

function getOpenAiVisionConfig() {
  const model =
    process.env.OPENAI_MODEL_VISION?.trim() ||
    process.env.AI_MODEL_VISION_OPENAI?.trim() ||
    process.env.AI_MODEL_FALLBACK?.trim();
  if (!model) {
    throw new AiProviderError("missing_config", "OpenAI vision model is not configured.");
  }
  return { provider: "openai" as const, model };
}

function shouldLogImageDebug() {
  return process.env.NODE_ENV !== "production" || process.env.AI_IMAGE_DEBUG_LOGS === "1";
}

function toWarnings(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((warning) => {
      if (typeof warning === "string") {
        return { code: "needs_human_review" as const, message: warning };
      }
      if (
        typeof warning === "object" &&
        warning !== null &&
        typeof (warning as { message?: unknown }).message === "string"
      ) {
        return {
          code: "needs_human_review" as const,
          message: (warning as { message: string }).message,
        };
      }
      return undefined;
    })
    .filter((warning): warning is { code: "needs_human_review"; message: string } =>
      Boolean(warning)
    );
}

function safeImageInterpretation(input: ProviderImageInterpretationInput): InterpretationResult {
  return {
    sourceType: "image",
    sourceId: input.sourceId,
    workspaceId: input.workspaceId,
    confidence: 0.2,
    warnings: [
      {
        code: "needs_human_review",
        message: "Image provider returned unstructured output. Review image manually.",
      },
    ],
    actions: [],
  };
}

function detectDocumentKind(raw: { actions?: unknown; warnings?: unknown }) {
  const text = JSON.stringify(raw).toLowerCase();
  if (text.includes("invoice") || text.includes("bill to") || text.includes("total due")) return "invoice";
  if (text.includes("receipt") || text.includes("purchase") || text.includes("paid")) return "receipt";
  if (text.includes("material")) return "materials";
  if (text.includes("job") || text.includes("site")) return "job";
  return "unknown";
}

function logImageInterpretationDebug(input: {
  phase: string;
  raw: { actions?: unknown; warnings?: unknown; confidence?: unknown };
  result: InterpretationResult;
  validationWarnings?: unknown[];
  reasonActionsEmptied?: string;
}) {
  if (!shouldLogImageDebug()) return;
  const actionDiagnostics = normalizedActionDiagnostics(rawActionArray(input.raw));
  const materialActions = input.result.actions.filter(
    (action) => action.type === "create_material_allocation"
  );
  const materialRows = materialActions.flatMap((action) => {
    const rows = (action.payload as Record<string, unknown>).materials;
    return Array.isArray(rows) ? rows : [];
  });
  console.info("Image interpretation debug. " + JSON.stringify({
    phase: input.phase,
    detectedDocumentKind: detectDocumentKind(input.raw),
    detectedMaterialRows: JSON.stringify(input.raw).match(/material_description|unit_price|total_value|materials/gi)?.length ?? 0,
    normalizedMaterialCount: materialRows.length,
    finalAllocationPayload: materialActions[0]?.payload ?? null,
    rawActionTypes: actionDiagnostics.rawActionTypes,
    normalizedActionTypes: actionDiagnostics.normalizedActionTypes,
    rejectedActions: actionDiagnostics.rejectedActions,
    chosenActionTypes: input.result.actions.map((action) => action.type),
    actionCount: input.result.actions.length,
    finalWarnings: input.result.warnings,
    validationWarnings: input.validationWarnings ?? [],
    reasonActionsEmptied: input.reasonActionsEmptied ?? "",
  }));
}

function withEmptyImageActionWarning(
  result: InterpretationResult,
  reason: string
): InterpretationResult {
  if (result.actions.length) return result;

  return {
    ...result,
    confidence: Math.min(result.confidence, 0.2),
    warnings: [
      ...result.warnings,
      {
        code: "needs_human_review",
        message:
          reason ||
          "Image analysis produced no supported action draft. Review the image manually or retry with a clearer photo.",
      },
    ],
  };
}

function rawToInterpretationResult(
  raw: { confidence?: unknown; warnings?: unknown; actions?: unknown },
  input: ProviderImageInterpretationInput
): InterpretationResult {
  return {
    sourceType: "image",
    sourceId: input.sourceId,
    workspaceId: input.workspaceId,
    confidence:
      typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
        ? raw.confidence
        : 0.5,
    warnings: toWarnings(raw.warnings),
    actions: toActions(rawActionArray(raw)),
  };
}

async function repairImageJson(
  rawText: string,
  input: ProviderImageInterpretationInput
) {
  const fallback = getFallbackConfig() ?? getPrimaryConfig();
  const repairProvider = createProvider(fallback.provider);
  const repaired = (await repairProvider.completeJson({
    model: fallback.model,
    systemPrompt: IMAGE_JSON_REPAIR_SYSTEM_PROMPT,
    userPrompt: `Image source: ${input.sourceLabel || "uploaded image"}\nRaw provider output:\n${rawText.slice(0, 4000)}`,
    maxTokens: 350,
  })) as {
    confidence?: unknown;
    warnings?: unknown;
    actions?: unknown;
  };
  return repaired;
}

async function reaskImageForActions(
  provider: AiProviderClient,
  model: string,
  input: ProviderImageInterpretationInput
) {
  const rawText = await provider.completeText({
    model,
    systemPrompt: IMAGE_EMPTY_ACTION_REASK_SYSTEM_PROMPT,
    userPrompt: buildImageAnalysisUserPrompt({
      mimeType: input.mimeType,
      sourceLabel: input.sourceLabel,
    }),
    imageDataUrl: input.imageDataUrl,
    timeoutMs: 30000,
    maxTokens: 900,
  });
  return extractJsonObject(rawText) as {
    confidence?: unknown;
    warnings?: unknown;
    actions?: unknown;
  };
}

async function runProvider(
  provider: AiProviderClient,
  model: string,
  input: ProviderInterpretationInput,
  usedFallback: boolean
): Promise<ProviderInterpretationOutput> {
  const raw = (await provider.completeJson({
    model,
    systemPrompt: AI_JSON_SYSTEM_PROMPT,
    userPrompt: buildInterpretationUserPrompt({
      sourceType: input.sourceType,
      text: input.text,
    }),
  })) as {
    confidence?: unknown;
    warnings?: unknown;
    actions?: unknown;
  };

  const result: InterpretationResult = {
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    workspaceId: input.workspaceId,
    confidence:
      typeof raw.confidence === "number" && Number.isFinite(raw.confidence)
        ? raw.confidence
        : 0.5,
    warnings: toWarnings(raw.warnings),
    actions: toActions(raw.actions),
  };

  const validation = await validateInterpretationResult(result);
  const validatedResult = {
    ...result,
    warnings: validation.warnings,
  };

  if (!validation.ok) {
    throw new AiProviderError(
      "invalid_interpretation",
      "AI provider returned an invalid interpretation."
    );
  }

  return {
    result: validatedResult,
    reviewDraft: createReviewDraft(validatedResult),
    provider: provider.name,
    model,
    usedFallback,
  };
}

async function runImageProvider(
  provider: AiProviderClient,
  model: string,
  input: ProviderImageInterpretationInput,
  usedFallback: boolean
): Promise<ProviderInterpretationOutput> {
  const rawText = await provider.completeText({
    model,
    systemPrompt: IMAGE_ANALYSIS_JSON_SYSTEM_PROMPT,
    userPrompt: buildImageAnalysisUserPrompt({
      mimeType: input.mimeType,
      sourceLabel: input.sourceLabel,
    }),
    imageDataUrl: input.imageDataUrl,
    timeoutMs: 30000,
    maxTokens: 700,
  });

  if (shouldLogImageDebug()) {
    console.info("Image provider raw response preview. " + JSON.stringify({
      provider: provider.name,
      model,
      mimeType: input.mimeType,
      sourceLabel: input.sourceLabel,
      preview: rawText.slice(0, 1200),
    }));
  }

  let raw: { confidence?: unknown; warnings?: unknown; actions?: unknown };
  try {
    raw = extractJsonObject(rawText) as {
      confidence?: unknown;
      warnings?: unknown;
      actions?: unknown;
    };
    if (shouldLogImageDebug()) {
      console.info("Image provider extracted JSON preview. " + JSON.stringify({
        provider: provider.name,
        model,
        preview: JSON.stringify(raw).slice(0, 1200),
      }));
    }
  } catch (error) {
    console.warn("Image provider returned unstructured output; attempting JSON repair.", {
      provider: provider.name,
      model,
      message: error instanceof Error ? error.message : "Unknown parse error",
    });
    try {
      raw = await repairImageJson(rawText, input);
    } catch (repairError) {
      console.warn("Image JSON repair failed; creating safe image draft.", {
        message: repairError instanceof Error ? repairError.message : "Unknown repair error",
      });
      const safeResult = safeImageInterpretation(input);
      return {
        result: safeResult,
        reviewDraft: createReviewDraft(safeResult),
        provider: provider.name,
        model,
        usedFallback,
      };
    }
  }

  const result = rawToInterpretationResult(raw, input);

  if (!result.actions.length) {
    logImageInterpretationDebug({
      phase: "empty-primary",
      raw,
      result,
      reasonActionsEmptied: "provider returned no usable actions",
    });
    try {
      raw = await reaskImageForActions(provider, model, input);
    } catch (reaskError) {
      console.warn("Image action re-ask failed.", {
        message: reaskError instanceof Error ? reaskError.message : "Unknown re-ask failure",
      });
    }
  }

  const finalResult = rawToInterpretationResult(raw, input);
  const guardedResult = withEmptyImageActionWarning(
    finalResult,
    "Image analysis produced no supported action draft. The provider returned no usable actions or only unsupported actions."
  );
  const perActionValidation = guardedResult.actions.map((action) => ({
    type: action.type,
    ...validateSuggestedAction(action),
  }));
  const validation = await validateInterpretationResult(guardedResult);
  const validatedResult = {
    ...guardedResult,
    warnings: validation.warnings,
  };
  logImageInterpretationDebug({
    phase: "validated",
    raw,
    result: validatedResult,
    validationWarnings: [
      ...validation.warnings,
      ...perActionValidation.map((item) => ({
        actionType: item.type,
        ok: item.ok,
        warnings: item.warnings,
      })),
    ],
    reasonActionsEmptied:
      finalResult.actions.length && !validatedResult.actions.length
        ? "validation removed actions"
        : !finalResult.actions.length
          ? "provider returned no usable actions"
          : "",
  });

  return {
    result: validatedResult,
    reviewDraft: createReviewDraft(validatedResult),
    provider: provider.name,
    model,
    usedFallback,
  };
}

async function interpretWithConfiguredProvider(
  sourceType: TextAiSourceType,
  input: Omit<ProviderInterpretationInput, "sourceType">
) {
  const primary = getPrimaryConfig();
  const fallback = getFallbackConfig();

  try {
    return await runProvider(
      createProvider(primary.provider),
      primary.model,
      { ...input, sourceType },
      false
    );
  } catch (error) {
    if (!fallback) throw error;
    return runProvider(
      createProvider(fallback.provider),
      fallback.model,
      { ...input, sourceType },
      true
    );
  }
}

export async function interpretDocumentWithAI(
  input: Omit<ProviderInterpretationInput, "sourceType">
) {
  return interpretWithConfiguredProvider("ocr", input);
}

export async function interpretTranscriptWithAI(
  input: Omit<ProviderInterpretationInput, "sourceType">
) {
  return interpretWithConfiguredProvider("transcript", input);
}

export async function interpretImageWithAI(
  input: ProviderImageInterpretationInput,
  options: ProviderImageInterpretationOptions = {}
) {
  if (options.forceProvider === "openai") {
    const openai = getOpenAiVisionConfig();
    return runImageProvider(createProvider(openai.provider), openai.model, input, false);
  }

  const primary = getVisionConfig();
  const fallback = getFallbackConfig();

  try {
    return await runImageProvider(
      createProvider(primary.provider),
      primary.model,
      input,
      false
    );
  } catch (error) {
    if (!fallback) throw error;
    return runImageProvider(
      createProvider(fallback.provider),
      fallback.model,
      input,
      true
    );
  }
}
