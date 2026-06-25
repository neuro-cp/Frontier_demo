import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { ReviewDraft } from "@/lib/ai/reviewTypes";
import type { AiSourceType, InterpretationWarning, SuggestedAction } from "@/lib/ai/types";

export type AiReviewDraftStatus =
  | "Pending"
  | "Approved"
  | "Rejected"
  | "Needs Changes"
  | "Archived";

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
  summary: string | null;
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
  archivedAt: string | null;
  archivedBy: string | null;
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
  summary: string | null;
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
  archived_at?: string | null;
  archived_by?: string | null;
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

export type AiReviewDraftRevision = {
  id: string;
  sourceLabel: string | null;
  summary: string | null;
  actions: SuggestedAction[];
  warnings: InterpretationWarning[];
  changedBy: string | null;
  createdAt: string;
};

export type AiReviewDraftAuditEvent = {
  id: string;
  reviewDraftId: string;
  eventType: string;
  actorUserId: string | null;
  metadata: Record<string, unknown>;
  createdAt: string;
};

function dbToAiReviewDraft(row: DbAiReviewDraft): AiReviewDraft {
  return {
    id: row.id,
    workspaceId: row.workspace_id,
    sourceType: row.source_type,
    sourceId: row.source_id,
    sourceLabel: row.source_label,
    summary: row.summary,
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
    archivedAt: row.archived_at ?? null,
    archivedBy: row.archived_by ?? null,
    executionStatus: row.execution_status ?? "Not Executed",
    executedAt: row.executed_at ?? null,
    executedBy: row.executed_by ?? null,
    executionResult: row.execution_result ?? {},
    executionError: row.execution_error ?? null,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

type ReviewDraftStatusPatch = {
  status: AiReviewDraftStatus;
  reviewed_by: string | null;
  reviewed_at: string;
  approved_at?: string;
  rejected_at?: string;
  archived_at?: string;
  archived_by?: string | null;
};

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
      summary: null,
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

export async function updateReviewDraftContent(
  supabase: SupabaseClient,
  input: {
    id: string;
    workspaceId: string;
    sourceLabel: string;
    summary: string;
    actions: SuggestedAction[];
  }
) {
  const { data, error } = await supabase
    .from("ai_review_drafts")
    .update({
      source_label: input.sourceLabel.trim() || null,
      summary: input.summary.trim() || null,
      actions: input.actions,
    })
    .eq("id", input.id)
    .eq("workspace_id", input.workspaceId)
    .in("status", ["Pending", "Needs Changes"])
    .neq("execution_status", "Executed")
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to save review draft changes.");
  }
  return dbToAiReviewDraft(data as DbAiReviewDraft);
}

export async function duplicateReviewDraft(
  supabase: SupabaseClient,
  input: {
    id: string;
    workspaceId: string;
    createdBy?: string | null;
  }
) {
  const source = await getReviewDraftById(supabase, input.workspaceId, input.id);
  if (!source) {
    throw new Error("Review draft not found.");
  }
  const { data, error } = await supabase
    .from("ai_review_drafts")
    .insert({
      id: crypto.randomUUID(),
      workspace_id: input.workspaceId,
      source_type: source.sourceType,
      source_id: source.sourceId,
      source_label: `${source.sourceLabel || "AI Review Draft"} copy`,
      summary: source.summary,
      status: "Pending",
      confidence: source.confidence,
      warnings: source.warnings,
      actions: source.actions,
      raw_input: source.rawInput,
      model_provider: source.modelProvider,
      model_name: source.modelName,
      created_by: input.createdBy ?? null,
    })
    .select("*")
    .single();

  if (error || !data) {
    throw new Error(error?.message || "Unable to duplicate review draft.");
  }

  const duplicated = dbToAiReviewDraft(data as DbAiReviewDraft);
  await supabase.from("ai_review_draft_audit_events").insert({
    workspace_id: input.workspaceId,
    review_draft_id: duplicated.id,
    event_type: "duplicated",
    actor_user_id: input.createdBy ?? null,
    metadata: { sourceDraftId: input.id },
  });
  return duplicated;
}

export async function getReviewDraftRevisions(
  supabase: SupabaseClient,
  workspaceId: string,
  draftId: string
) {
  const { data, error } = await supabase
    .from("ai_review_draft_revisions")
    .select("id, source_label, summary, actions, warnings, changed_by, created_at")
    .eq("workspace_id", workspaceId)
    .eq("review_draft_id", draftId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message || "Unable to load draft revisions.");
  return (data ?? []).map((row) => ({
    id: row.id,
    sourceLabel: row.source_label,
    summary: row.summary,
    actions: (row.actions ?? []) as SuggestedAction[],
    warnings: (row.warnings ?? []) as InterpretationWarning[],
    changedBy: row.changed_by,
    createdAt: row.created_at,
  })) as AiReviewDraftRevision[];
}

export async function getReviewDraftAuditEvents(
  supabase: SupabaseClient,
  workspaceId: string,
  draftId: string
) {
  const { data, error } = await supabase
    .from("ai_review_draft_audit_events")
    .select("id, review_draft_id, event_type, actor_user_id, metadata, created_at")
    .eq("workspace_id", workspaceId)
    .eq("review_draft_id", draftId)
    .order("created_at", { ascending: false });
  if (error) throw new Error(error.message || "Unable to load draft audit history.");
  return (data ?? []).map((row) => ({
    id: row.id,
    reviewDraftId: row.review_draft_id,
    eventType: row.event_type,
    actorUserId: row.actor_user_id,
    metadata: (row.metadata ?? {}) as Record<string, unknown>,
    createdAt: row.created_at,
  })) as AiReviewDraftAuditEvent[];
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
  const patch: ReviewDraftStatusPatch = {
    status: input.status,
    reviewed_by: input.reviewedBy ?? null,
    reviewed_at: now,
  };
  if (input.status === "Approved") patch.approved_at = now;
  if (input.status === "Rejected") patch.rejected_at = now;
  if (input.status === "Archived") {
    patch.archived_at = now;
    patch.archived_by = input.reviewedBy ?? null;
  }

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
