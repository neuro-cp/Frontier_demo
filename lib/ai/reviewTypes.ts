import type {
  AiSourceType,
  InterpretationWarning,
  SuggestedAction,
} from "@/lib/ai/types";

export type ReviewDraftStatus = "pending_review" | "approved" | "rejected";

export type ReviewDraft = {
  id: string;
  workspaceId: string;
  sourceType: AiSourceType;
  sourceId?: string;
  status: ReviewDraftStatus;
  confidence: number;
  warnings: InterpretationWarning[];
  actions: SuggestedAction[];
  createdAt: string;
};

export function createReviewDraft(input: {
  workspaceId: string;
  sourceType: AiSourceType;
  sourceId?: string;
  confidence: number;
  warnings: InterpretationWarning[];
  actions: SuggestedAction[];
}): ReviewDraft {
  return {
    id: crypto.randomUUID(),
    workspaceId: input.workspaceId,
    sourceType: input.sourceType,
    sourceId: input.sourceId,
    status: "pending_review",
    confidence: input.confidence,
    warnings: input.warnings,
    actions: input.actions,
    createdAt: new Date().toISOString(),
  };
}
