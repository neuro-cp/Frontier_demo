import "server-only";

import { createReviewDraft } from "@/lib/ai/reviewTypes";
import type { InterpretationResult, SuggestedAction } from "@/lib/ai/types";
import { validateInterpretationResult } from "@/lib/ai/validators";
import { createOpenAiProvider } from "@/lib/ai/providers/openaiProvider";
import { createOpenRouterProvider } from "@/lib/ai/providers/openrouterProvider";
import {
  buildImageAnalysisUserPrompt,
  buildInterpretationUserPrompt,
  AI_JSON_SYSTEM_PROMPT,
} from "@/lib/ai/providers/systemPrompts";
import {
  AiProviderError,
  type AiProviderClient,
  type AiProviderName,
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

function toActions(value: unknown): SuggestedAction[] {
  if (!Array.isArray(value)) return [];
  return value.filter((action): action is SuggestedAction => {
    return (
      typeof action === "object" &&
      action !== null &&
      typeof (action as SuggestedAction).type === "string" &&
      typeof (action as SuggestedAction).confidence === "number" &&
      typeof (action as SuggestedAction).payload === "object" &&
      (action as SuggestedAction).payload !== null
    );
  });
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
  const raw = (await provider.completeJson({
    model,
    systemPrompt: AI_JSON_SYSTEM_PROMPT,
    userPrompt: buildImageAnalysisUserPrompt({
      mimeType: input.mimeType,
      sourceLabel: input.sourceLabel,
    }),
    imageDataUrl: input.imageDataUrl,
    timeoutMs: 30000,
  })) as {
    confidence?: unknown;
    warnings?: unknown;
    actions?: unknown;
  };

  const result: InterpretationResult = {
    sourceType: "image",
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
      "AI provider returned an invalid image interpretation."
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

export async function interpretImageWithAI(input: ProviderImageInterpretationInput) {
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
