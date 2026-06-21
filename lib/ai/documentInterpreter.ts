import { createSuggestedAction } from "@/lib/ai/actionDrafts";
import { createReviewDraft, type ReviewDraft } from "@/lib/ai/reviewTypes";
import {
  validateInterpretationResult,
  type AiValidationHooks,
} from "@/lib/ai/validators";
import type { InterpretationInput, InterpretationResult } from "@/lib/ai/types";

export type DocumentInterpretationInput = Omit<
  InterpretationInput,
  "sourceType"
> & {
  documentId?: string;
};

function extractCurrency(text: string) {
  const match = text.match(/\$?\b(\d{1,6}(?:,\d{3})*(?:\.\d{2})?)\b/);
  if (!match) return undefined;
  return Number(match[1].replace(/,/g, ""));
}

function extractVendor(text: string) {
  const firstUsefulLine = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 2 && !/invoice|receipt/i.test(line));
  return firstUsefulLine;
}

export async function interpretDocument(
  input: DocumentInterpretationInput,
  hooks: AiValidationHooks = {}
): Promise<{ result: InterpretationResult; reviewDraft: ReviewDraft }> {
  const amount = extractCurrency(input.text);
  const vendor = extractVendor(input.text);
  const warnings = [];

  const actions = amount
    ? [
        createSuggestedAction(
          "create_expense",
          {
            amount,
            vendor: vendor ?? "Unknown vendor",
            documentId: input.documentId ?? input.sourceId ?? "",
            notes: "Mock OCR interpretation draft. Requires human review.",
          },
          vendor ? 0.72 : 0.61
        ),
      ]
    : [];

  if (!amount) {
    warnings.push({
      code: "missing_required_field" as const,
      message: "No expense amount was detected in the OCR text.",
      path: "actions.create_expense.payload.amount",
    });
  }

  const result: InterpretationResult = {
    sourceType: "ocr",
    sourceId: input.documentId ?? input.sourceId,
    workspaceId: input.workspaceId,
    confidence: actions.length ? 0.68 : 0.35,
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
