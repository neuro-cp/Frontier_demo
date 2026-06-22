import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewDraft } from "@/lib/ai/reviewTypes";
import type { AiSourceType, InterpretationWarning, SuggestedAction } from "@/lib/ai/types";

export type AiReviewDraftStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Needs Changes";

export type AiReviewDraftExecutionStatus =
  | "Not Executed"
  | "Executed"
  | "Failed";

export type AiReviewDraft = {
  id: string;
  workspaceId: string;
  sourceType: AiSourceType;
  sourceId: string | null;
  sourceLabel: string | null;
  status: AiReviewDraftStatus;
  confidence: number | null;
  warnings: InterpretationWarning[];
  actions: SuggestedAction[];
  rawInput: string | null;
  modelProvider: string | null;
  modelName: string | null;
  createdBy: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  executionStatus: AiReviewDraftExecutionStatus;
  executedAt: string | null;
  executedBy: string | null;
  executionResult: Record<string, unknown>;
  executionError: string | null;
  createdAt: string;
  updatedAt: string;
};

type DbAiReviewDraft = {
  id: string;
  workspace_id: string;
  source_type: AiSourceType;
  source_id: string | null;
  source_label: string | null;
  status: AiReviewDraftStatus;
  confidence: number | null;
  warnings: InterpretationWarning[];
  actions: SuggestedAction[];
  raw_input: string | null;
  model_provider: string | null;
  model_name: string | null;
  created_by: string | null;
  reviewed_by: string | null;
  reviewed_at: string | null;
  approved_at: string | null;
  rejected_at: string | null;
  execution_status?: AiReviewDraftExecutionStatus;
  executed_at?: string | null;
  executed_by?: string | null;
  execution_result?: Record<string, unknown> | null;
  execution_error?: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateAiReviewDraftInput = {
  reviewDraft: ReviewDraft;
  sourceLabel?: string | null;
  rawInput?: string | null;
  modelProvider?: string | null;
  modelName?: string | null;
  createdBy?: string | null;
};

export type UpdateAiReviewDraftStatusInput = {
  id: string;
  workspaceId: string;
  status: AiReviewDraftStatus;
  reviewedBy?: string | null;
};

export type UpdateAiReviewDraftExecutionInput = {
  id: string;
  workspaceId: string;
  executionStatus: AiReviewDraftExecutionStatus;
  executedBy?: string | null;
  executionResult?: Record<string, unknown>;
  executionError?: string | null;
};

function dbToAiReviewDraft(row: DbAiReviewDraft): AiReviewDraft {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    sourceLabel: row.source_label,
    status: row.status,
    confidence: row.confidence,
    warnings: row.warnings ?? [],
    actions: row.actions ?? [],
    rawInput: row.raw_input,
    modelProvider: row.model_provider,
    modelName: row.model_name,
    createdBy: row.created_by,
    reviewedBy: row.reviewed_by,
    reviewedAt: row.reviewed_at,
    approvedAt: row.approved_at,
    rejectedAt: row.rejected_at,
    executionStatus: row.execution_status ?? "Not Executed",
    executedAt: row.executed_at ?? null,
    executedBy: row.executed_by ?? null,
    executionResult: row.execution_result ?? {},
    executionError: row.execution_error ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function createReviewDraft(
  supabase: SupabaseClient,
  input: CreateAiReviewDraftInput
) {
  const { reviewDraft } = input;
  const { data, error } = await supabase
    .from("ai_review_drafts")
    .insert({
      id: reviewDraft.id,
      workspace_id: reviewDraft.workspaceId,
      source_type: reviewDraft.sourceType,
      source_id: reviewDraft.sourceId ?? null,
      source_label: input.sourceLabel ?? null,
      status: "Pending",
      confidence: reviewDraft.confidence,
      warnings: reviewDraft.warnings,
      actions: reviewDraft.actions,
      raw_input: input.rawInput ?? null,
      model_provider: input.modelProvider ?? null,
      model_name: input.modelName ?? null,
      created_by: input.createdBy ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to create AI review draft.");
  }

  return dbToAiReviewDraft(data as DbAiReviewDraft);
}

export async function updateReviewDraftExecution(
  supabase: SupabaseClient,
  input: UpdateAiReviewDraftExecutionInput
) {
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("ai_review_drafts")
    .update({
      execution_status: input.executionStatus,
      executed_at:
        input.executionStatus === "Executed" || input.executionStatus === "Failed"
          ? now
          : null,
      executed_by: input.executedBy ?? null,
      execution_result: input.executionResult ?? {},
      execution_error: input.executionError ?? null,
    })
    .eq("id", input.id)
    .eq("workspace_id", input.workspaceId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to update AI review draft execution.");
  }

  return dbToAiReviewDraft(data as DbAiReviewDraft);
}

export async function getReviewDrafts(
  supabase: SupabaseClient,
  workspaceId: string
) {
  const { data, error } = await supabase
    .from("ai_review_drafts")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message || "Unable to load AI review drafts.");
  return ((data ?? []) as DbAiReviewDraft[]).map(dbToAiReviewDraft);
}

export async function getReviewDraftById(
  supabase: SupabaseClient,
  workspaceId: string,
  id: string
) {
  const { data, error } = await supabase
    .from("ai_review_drafts")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (error) throw new Error(error.message || "Unable to load AI review draft.");
  return data ? dbToAiReviewDraft(data as DbAiReviewDraft) : null;
}

export async function updateReviewDraftStatus(
  supabase: SupabaseClient,
  input: UpdateAiReviewDraftStatusInput
) {
  const now = new Date().toISOString();
  const patch = {
    status: input.status,
    reviewed_by: input.reviewedBy ?? null,
    reviewed_at: now,
    approved_at: input.status === "Approved" ? now : null,
    rejected_at: input.status === "Rejected" ? now : null,
  };

  const { data, error } = await supabase
    .from("ai_review_drafts")
    .update(patch)
    .eq("id", input.id)
    .eq("workspace_id", input.workspaceId)
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to update AI review draft.");
  }

  return dbToAiReviewDraft(data as DbAiReviewDraft);
}
