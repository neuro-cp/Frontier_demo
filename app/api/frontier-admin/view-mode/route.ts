import { NextRequest, NextResponse } from "next/server";

import {
  logAdminAction,
  requirePlatformAdmin,
  serverErrorResponse,
} from "@/lib/platformAdmin/server";

export async function POST(request: NextRequest) {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;

  try {
    const body = (await request.json()) as {
      action?: "enter" | "exit";
      workspaceId?: string | null;
      userId?: string | null;
    };

    if (body.action === "exit") {
      await logAdminAction(admin.context, "exit_admin_view_mode", {
        targetUserId: body.userId ?? null,
        targetWorkspaceId: body.workspaceId ?? null,
      });
      return NextResponse.json({ ok: true });
    }

    if (body.action !== "enter" || !body.workspaceId) {
      return NextResponse.json({ error: "Invalid admin view request." }, { status: 400 });
    }

    const { data: workspace, error } = await admin.context.serviceClient
      .from("workspaces")
      .select("id, name, type, created_by")
      .eq("id", body.workspaceId)
      .single();

    if (error || !workspace) {
      return NextResponse.json({ error: "Workspace not found." }, { status: 404 });
    }

    if (body.userId) {
      const { data: member, error: memberError } = await admin.context.serviceClient
        .from("workspace_members")
        .select("id")
        .eq("workspace_id", body.workspaceId)
        .eq("user_id", body.userId)
        .neq("status", "Removed")
        .maybeSingle();

      if (memberError) throw memberError;
      if (!member) {
        return NextResponse.json(
          { error: "User is not a member of that workspace." },
          { status: 400 }
        );
      }
    }

    await logAdminAction(admin.context, "enter_admin_view_mode", {
      targetUserId: body.userId ?? workspace.created_by,
      targetWorkspaceId: workspace.id,
    });

    return NextResponse.json({
      ok: true,
      workspace: {
        id: workspace.id,
        name: workspace.name,
        type: workspace.type,
      },
      adminUserId: admin.context.adminUserId,
      targetUserId: body.userId ?? workspace.created_by,
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
