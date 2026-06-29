import { NextRequest, NextResponse } from "next/server";

import {
  aiRestrictionMessage,
  checkAiInputForAbuse,
  getActiveAiRestriction,
  logAiAbuseEvent,
} from "@/lib/ai/abuseGuard";
import { interpretTranscriptWithAI } from "@/lib/ai/providers/providerFactory";
import { createReviewDraft } from "@/lib/db/aiReviewDrafts";
import { isUuid } from "@/lib/db/ids";
import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { canUseAiDrafts } from "@/lib/plans/capabilities";
import { resolveWorkspacePlanForServiceClient } from "@/lib/plans/server";
import { checkUserAndWorkspaceDailyLimits } from "@/lib/rateLimit/dailyCounters";
import { RateLimitError } from "@/lib/rateLimit/policy";
import { featureDisabledMessage, featureFlags } from "@/lib/services/featureFlags";
import { planUpgradeError } from "@/lib/services/routeProtection";
import { serviceLimits } from "@/lib/services/serviceLimits";
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

  const workspaceId = body.workspaceId;

  if (!workspaceId || !isUuid(workspaceId)) {
    return jsonError("Workspace is required.", 400);
  }

  const transcript = body.transcript?.trim() ?? "";
  if (!transcript) return jsonError("Transcript is required.", 400);
  if (!featureFlags.ai()) return jsonError(featureDisabledMessage("AI draft generation"), 503);

  const { data: membership, error: membershipError } = await supabase
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return jsonError("You do not have access to this workspace.", 403);
  }
  if (membership.role !== "Owner" && membership.role !== "Manager") {
    return jsonError("Only Owners and Managers can generate transcript drafts.", 403);
  }
  const serviceClient = createServiceRoleClient();
  const restriction = await getActiveAiRestriction(serviceClient, user.id);
  if (restriction) return jsonError(aiRestrictionMessage, 403);
  const plan = await resolveWorkspacePlanForServiceClient(serviceClient, workspaceId, user.id);
  if (!canUseAiDrafts(plan)) return planUpgradeError();
  try {
    checkUserAndWorkspaceDailyLimits({
      service: "ai-draft",
      userId: user.id,
      workspaceId,
      userLimit: serviceLimits.aiDrafts.maxRequestsPerUserPerDay(),
      workspaceLimit: serviceLimits.aiDrafts.maxRequestsPerWorkspacePerDay(),
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "AI draft quota exceeded.", error instanceof RateLimitError ? error.status : 429);
  }

  const abuseCheck = checkAiInputForAbuse(transcript);
  if (!abuseCheck.ok) {
    await logAiAbuseEvent({
      serviceClient,
      workspaceId,
      userId: user.id,
      source: "transcript_interpretation",
      text: transcript,
      reason: abuseCheck.reason,
      severity: abuseCheck.severity,
    });
    return jsonError(
      "This request was blocked for safety review. You can request reinstatement from account support.",
      403
    );
  }

  try {
    const interpretation = await interpretTranscriptWithAI({
      workspaceId,
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
