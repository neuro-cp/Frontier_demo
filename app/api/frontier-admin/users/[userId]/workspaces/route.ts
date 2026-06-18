import { NextRequest, NextResponse } from "next/server";

import {
  logAdminAction,
  requirePlatformAdmin,
  serverErrorResponse,
} from "@/lib/platformAdmin/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;

  const { userId } = await params;

  try {
    const { data: userData, error: userError } =
      await admin.context.serviceClient.auth.admin.getUserById(userId);

    if (userError || !userData.user) {
      return NextResponse.json({ error: "User not found." }, { status: 404 });
    }

    const { data, error } = await admin.context.serviceClient
      .from("workspace_members")
      .select("role, status, created_at, workspaces(id, name, type, created_at)")
      .eq("user_id", userId)
      .neq("status", "Removed")
      .order("created_at", { ascending: false });

    if (error) throw error;

    await logAdminAction(admin.context, "view_user", {
      targetUserId: userId,
    });

    return NextResponse.json({
      user: {
        id: userData.user.id,
        email: userData.user.email ?? null,
        createdAt: userData.user.created_at,
        lastSignInAt: userData.user.last_sign_in_at ?? null,
      },
      workspaces: (data ?? []).map((membership) => {
        const workspace = Array.isArray(membership.workspaces)
          ? membership.workspaces[0]
          : membership.workspaces;

        return {
          id: workspace?.id ?? "",
          name: workspace?.name ?? "Unknown Workspace",
          type: workspace?.type ?? "Other",
          createdAt: workspace?.created_at ?? null,
          role: membership.role,
          status: membership.status,
        };
      }),
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
