import "server-only";

import { AiProviderError } from "@/lib/ai/providers/types";

function extractFirstBalancedObject(text: string) {
  const start = text.indexOf("{");
  if (start < 0) return "";

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let index = start; index < text.length; index += 1) {
    const char = text[index];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === '"') {
        inString = false;
      }
      continue;
    }

    if (char === '"') {
      inString = true;
      continue;
    }
    if (char === "{") depth += 1;
    if (char === "}") {
      depth -= 1;
      if (depth === 0) return text.slice(start, index + 1);
    }
  }

  return "";
}

function preview(value: string, limit = 1200) {
  return value.length > limit ? `${value.slice(0, limit)}...<truncated>` : value;
}

function parseErrorPosition(error: unknown) {
  if (!(error instanceof Error)) return null;
  const match = error.message.match(/position\s+(\d+)/i);
  return match ? Number(match[1]) : null;
}

function contextAt(value: string, position: number | null) {
  if (position === null || !Number.isFinite(position)) return "";
  const start = Math.max(0, position - 160);
  const end = Math.min(value.length, position + 160);
  return value.slice(start, end);
}

export function extractJsonObject(text: string): unknown {
  const trimmed = text.trim();
  if (!trimmed) {
    throw new AiProviderError("invalid_json", "AI provider returned an empty response.");
  }

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
  const candidate = fenced?.[1]?.trim() ?? trimmed;
  const jsonObject = extractFirstBalancedObject(candidate);
  if (!jsonObject) {
    throw new AiProviderError("invalid_json", "AI provider did not return JSON.");
  }

  try {
    return JSON.parse(jsonObject);
  } catch (error) {
    const position = parseErrorPosition(error);
    console.error("AI provider returned malformed JSON.", {
      rawResponsePreview: preview(trimmed),
      extractedJsonPreview: preview(jsonObject),
      parseFailureContext: contextAt(jsonObject, position),
    });
    throw new AiProviderError(
      "invalid_json",
      "AI provider returned malformed JSON. Try again or use OCR/manual text."
    );
  }
}
