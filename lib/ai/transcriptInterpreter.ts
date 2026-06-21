import { createSuggestedAction } from "@/lib/ai/actionDrafts";
import { createReviewDraft, type ReviewDraft } from "@/lib/ai/reviewTypes";
import {
  validateInterpretationResult,
  type AiValidationHooks,
} from "@/lib/ai/validators";
import type { InterpretationInput, InterpretationResult } from "@/lib/ai/types";

export type TranscriptInterpretationInput = Omit<
  InterpretationInput,
  "sourceType"
> & {
  transcriptId?: string;
};

function findQuotedOrNamedClient(text: string) {
  const quoted = text.match(/["']([^"']{2,80})["']/);
  if (quoted) return quoted[1].trim();

  const createClient = text.match(/create (?:a )?client(?: named| called)? ([A-Za-z0-9 .'-]{2,80})/i);
  if (createClient) return createClient[1].trim().replace(/[.?!]$/, "");

  return undefined;
}

function findCalendarTitle(text: string) {
  const schedule = text.match(/(?:schedule|book|create) (?:an? )?(?:event|appointment|visit|job) (?:for )?([A-Za-z0-9 .'-]{2,80})/i);
  return schedule?.[1]?.trim().replace(/[.?!]$/, "");
}

export async function interpretTranscript(
  input: TranscriptInterpretationInput,
  hooks: AiValidationHooks = {}
): Promise<{ result: InterpretationResult; reviewDraft: ReviewDraft }> {
  const clientName = findQuotedOrNamedClient(input.text);
  const calendarTitle = findCalendarTitle(input.text);
  const actions = [];
  const warnings = [];

  if (clientName) {
    actions.push(
      createSuggestedAction(
        "create_client",
        {
          name: clientName,
          notes: "Mock speech interpretation draft. Requires human review.",
        },
        0.74
      )
    );
  }

  if (calendarTitle && /tomorrow|today|\d{4}-\d{2}-\d{2}/i.test(input.text)) {
    actions.push(
      createSuggestedAction(
        "create_calendar_event",
        {
          title: calendarTitle,
          date: input.text.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? "tomorrow",
          notes: "Mock speech interpretation draft. Normalize date before approval.",
        },
        0.66
      )
    );
  }

  if (!actions.length) {
    warnings.push({
      code: "unsupported_intent" as const,
      message: "Transcript did not match a supported draft action.",
    });
  }

  const result: InterpretationResult = {
    sourceType: "transcript",
    sourceId: input.transcriptId ?? input.sourceId,
    workspaceId: input.workspaceId,
    confidence: actions.length ? 0.7 : 0.3,
    warnings,
    actions,
  };

  const validation = await validateInterpretationResult(result, hooks);
  const resultWithValidation = {
    ...result,
    warnings: validation.warnings,
  };

  return {
    result: resultWithValidation,
    reviewDraft: createReviewDraft(resultWithValidation),
  };
}
