import type { ReviewDraft } from "@/lib/ai/reviewTypes";
import type { AiSourceType, InterpretationResult } from "@/lib/ai/types";

export type AiProviderName = "openrouter" | "openai";

export type ProviderInterpretationInput = {
  workspaceId: string;
  sourceId?: string;
  sourceType: AiSourceType;
  text: string;
};

export type ProviderInterpretationOutput = {
  result: InterpretationResult;
  reviewDraft: ReviewDraft;
  provider: AiProviderName;
  model: string;
  usedFallback: boolean;
};

export type AiProviderRequest = {
  systemPrompt: string;
  userPrompt: string;
  model: string;
  timeoutMs?: number;
};

export type AiProviderClient = {
  name: AiProviderName;
  completeJson(request: AiProviderRequest): Promise<unknown>;
};

export type ProviderErrorCode =
  | "missing_config"
  | "provider_failed"
  | "timeout"
  | "invalid_json"
  | "invalid_interpretation";

export class AiProviderError extends Error {
  code: ProviderErrorCode;

  constructor(code: ProviderErrorCode, message: string) {
    super(message);
    this.name = "AiProviderError";
    this.code = code;
  }
}
