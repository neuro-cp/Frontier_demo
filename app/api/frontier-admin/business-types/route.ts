import { NextRequest, NextResponse } from "next/server";

import {
  logAdminAction,
  requirePlatformAdmin,
  serverErrorResponse,
} from "@/lib/platformAdmin/server";

type ReviewBody = {
  id?: string;
  action?: "approve" | "reject";
  rejectionReason?: string;
};

export async function GET() {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;

  try {
    const { data, error } = await admin.context.serviceClient
      .from("business_type_suggestions")
      .select(
        "id, normalized_name, display_name, status, submitted_by, submitted_at, reviewed_by, reviewed_at, rejection_reason"
      )
      .order("submitted_at", { ascending: false })
      .limit(100);

    if (error) throw new Error(error.message);
    return NextResponse.json({ suggestions: data ?? [] });
  } catch (error) {
    return serverErrorResponse(error);
  }
}

export async function PATCH(request: NextRequest) {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;

  let body: ReviewBody;
  try {
    body = (await request.json()) as ReviewBody;
  } catch {
    return NextResponse.json({ error: "Invalid moderation request." }, { status: 400 });
  }

  if (!body.id || !body.action) {
    return NextResponse.json({ error: "Suggestion and action are required." }, { status: 400 });
  }

  const status = body.action === "approve" ? "approved" : "rejected";
  const rejectionReason =
    status === "rejected" ? body.rejectionReason?.trim() || "Rejected by platform admin." : null;

  try {
    const { data, error } = await admin.context.serviceClient
      .from("business_type_suggestions")
      .update({
        status,
        reviewed_by: admin.context.adminUserId,
        reviewed_at: new Date().toISOString(),
        rejection_reason: rejectionReason,
      })
      .eq("id", body.id)
      .select("id, display_name, status")
      .single();

    if (error || !data) throw new Error(error?.message || "Unable to update suggestion.");

    await logAdminAction(admin.context, `business_type_${status}`, {
      metadata: { suggestionId: data.id, displayName: data.display_name },
    });

    return NextResponse.json({ suggestion: data });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
