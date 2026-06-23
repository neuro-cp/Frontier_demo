import type { ReviewDraft } from "@/lib/ai/reviewTypes";
import type { AiSourceType, InterpretationResult } from "@/lib/ai/types";

export type AiProviderName = "openrouter" | "openai";
export type TextAiSourceType = Exclude<AiSourceType, "image">;

export type ProviderInterpretationInput = {
  workspaceId: string;
  sourceId?: string;
  sourceType: TextAiSourceType;
  text: string;
};

export type ProviderImageInterpretationInput = {
  workspaceId: string;
  sourceId?: string;
  imageDataUrl: string;
  mimeType: string;
  sourceLabel?: string;
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
  imageDataUrl?: string;
  timeoutMs?: number;
  maxTokens?: number;
};

export type AiProviderClient = {
  name: AiProviderName;
  completeText(request: AiProviderRequest): Promise<string>;
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
