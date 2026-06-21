import "server-only";

import { AiProviderError } from "@/lib/ai/providers/types";

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new AiProviderError("invalid_json", "AI provider returned an empty response.");
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start < 0 || end < start) {
    throw new AiProviderError("invalid_json", "AI provider did not return JSON.");
  }

  try {
    return JSON.parse(candidate.slice(start, end + 1));
  } catch (error) {
    throw new AiProviderError(
      "invalid_json",
      error instanceof Error ? error.message : "AI provider JSON parsing failed."
    );
  }
}
