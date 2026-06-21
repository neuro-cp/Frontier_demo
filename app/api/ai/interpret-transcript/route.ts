import { NextRequest, NextResponse } from "next/server";

import { interpretTranscriptWithAI } from "@/lib/ai/providers/providerFactory";
import { createReviewDraft } from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type InterpretTranscriptRequest = {
  workspaceId?: string;
  transcript?: string;
  sourceLabel?: string;
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

  if (userError || !user) {
    return jsonError("Sign in required to interpret transcripts.", 401);
  }

  let body: InterpretTranscriptRequest;
  try {
    body = (await request.json()) as InterpretTranscriptRequest;
  } catch {
    return jsonError("Invalid transcript interpretation request.", 400);
  }

  if (!isUuid(body.workspaceId)) {
    return jsonError("Workspace is required.", 400);
  }

  const transcript = body.transcript?.trim() ?? "";
  if (!transcript) return jsonError("Transcript is required.", 400);

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

  try {
    const interpretation = await interpretTranscriptWithAI({
      workspaceId: body.workspaceId,
      text: transcript,
    });
    const reviewDraft = await createReviewDraft(supabase, {
      reviewDraft: interpretation.reviewDraft,
      sourceLabel: body.sourceLabel?.trim() || "Transcript",
      rawInput: transcript,
      modelProvider: interpretation.provider,
      modelName: interpretation.model,
      createdBy: user.id,
    });

    return NextResponse.json({ reviewDraft });
  } catch (error) {
    return jsonError(
      error instanceof Error ? error.message : "Unable to interpret transcript.",
      500
    );
  }
}
