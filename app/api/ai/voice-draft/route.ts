import { NextRequest, NextResponse } from "next/server";

import { validateSuggestedAction } from "@/lib/ai/validators";
import { createReviewDraft as makeReviewDraft } from "@/lib/ai/reviewTypes";
import type { SuggestedAction } from "@/lib/ai/types";
import { createReviewDraft } from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type VoiceDraftRequest = {
  workspaceId?: string;
  sourceLabel?: string;
  rawInput?: string;
  action?: SuggestedAction;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) return jsonError("Sign in required to create voice drafts.", 401);

  let body: VoiceDraftRequest;
  try {
    body = (await request.json()) as VoiceDraftRequest;
  } catch {
    return jsonError("Invalid voice draft request.", 400);
  }

  if (!body.workspaceId || !isUuid(body.workspaceId)) {
    return jsonError("Workspace is required.", 400);
  }
  if (!body.action) return jsonError("Action draft is required.", 400);

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id")
    .eq("workspace_id", body.workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return jsonError("You do not have access to this workspace.", 403);
  }

  const validation = validateSuggestedAction(body.action);
  if (!validation.ok) {
    return NextResponse.json(
      { error: "Voice draft is missing required fields.", warnings: validation.warnings },
      { status: 400 }
    );
  }

  const reviewDraft = await createReviewDraft(supabase, {
    reviewDraft: makeReviewDraft({
      workspaceId: body.workspaceId,
      sourceType: "transcript",
      confidence: body.action.confidence,
      warnings: validation.warnings,
      actions: [body.action],
    }),
    sourceLabel: body.sourceLabel?.trim() || "Voice command",
    rawInput: body.rawInput ?? null,
    modelProvider: "frontier-voice-clarification",
    modelName: "deterministic-v1",
    createdBy: user.id,
  });

  return NextResponse.json({ reviewDraft });
}
