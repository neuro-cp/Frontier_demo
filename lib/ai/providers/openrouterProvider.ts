import "server-only";

import { extractJsonObject } from "@/lib/ai/providers/jsonExtraction";
import {
  AiProviderError,
  type AiProviderClient,
  type AiProviderRequest,
} from "@/lib/ai/providers/types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

export function createOpenRouterProvider(): AiProviderClient {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new AiProviderError("missing_config", "OpenRouter is not configured.");
  }

  return {
    name: "openrouter",
    async completeJson(request: AiProviderRequest) {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        request.timeoutMs ?? 20000
      );

      try {
        const response = await fetch(OPENROUTER_URL, {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "http://localhost",
            "X-Title": "Frontier AI Interpretation",
          },
          body: JSON.stringify({
            model: request.model,
            messages: [
              { role: "system", content: request.systemPrompt },
              { role: "user", content: request.userPrompt },
            ],
            response_format: { type: "json_object" },
            temperature: 0,
            max_tokens: 220,
          }),
        });

        if (!response.ok) {
          throw new AiProviderError("provider_failed", "OpenRouter request failed.");
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        return extractJsonObject(data.choices?.[0]?.message?.content ?? "");
      } catch (error) {
        if (error instanceof AiProviderError) throw error;
        if (error instanceof Error && error.name === "AbortError") {
          throw new AiProviderError("timeout", "OpenRouter request timed out.");
        }
        throw new AiProviderError("provider_failed", "OpenRouter request failed.");
      } finally {
        clearTimeout(timeout);
      }
    },
  };
}
