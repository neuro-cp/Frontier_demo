import "server-only";

import { extractJsonObject } from "@/lib/ai/providers/jsonExtraction";
import {
  AiProviderError,
  type AiProviderClient,
  type AiProviderRequest,
} from "@/lib/ai/providers/types";

const OPENAI_URL = "https://api.openai.com/v1/chat/completions";

export function createOpenAiProvider(): AiProviderClient {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new AiProviderError("missing_config", "OpenAI is not configured.");
  }

  return {
    name: "openai",
    async completeText(request: AiProviderRequest) {
      const controller = new AbortController();
      const timeout = setTimeout(
        () => controller.abort(),
        request.timeoutMs ?? 20000
      );

      const userContent = request.imageDataUrl
        ? [
            { type: "text", text: request.userPrompt },
            { type: "image_url", image_url: { url: request.imageDataUrl } },
          ]
        : request.userPrompt;

      try {
        const response = await fetch(OPENAI_URL, {
          method: "POST",
          signal: controller.signal,
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: request.model,
            messages: [
              { role: "system", content: request.systemPrompt },
              { role: "user", content: userContent },
            ],
            response_format: { type: "json_object" },
            temperature: 0,
            max_tokens: request.maxTokens ?? (request.imageDataUrl ? 700 : 220),
          }),
        });

        if (!response.ok) {
          throw new AiProviderError("provider_failed", "OpenAI request failed.");
        }

        const data = (await response.json()) as {
          choices?: Array<{ message?: { content?: string } }>;
        };
        return data.choices?.[0]?.message?.content ?? "";
      } catch (error) {
        if (error instanceof AiProviderError) throw error;
        if (error instanceof Error && error.name === "AbortError") {
          throw new AiProviderError("timeout", "OpenAI request timed out.");
        }
        throw new AiProviderError("provider_failed", "OpenAI request failed.");
      } finally {
        clearTimeout(timeout);
      }
    },
    async completeJson(request: AiProviderRequest) {
      return extractJsonObject(await this.completeText(request));
    },
  };
}
