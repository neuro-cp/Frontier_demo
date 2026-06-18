import { NextRequest, NextResponse } from "next/server";

import {
  logAdminAction,
  requirePlatformAdmin,
  serverErrorResponse,
} from "@/lib/platformAdmin/server";

type AuthUserSummary = {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
};

function includesQuery(value: unknown, query: string) {
  return String(value ?? "").toLowerCase().includes(query);
}

export async function GET(request: NextRequest) {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;

  const query = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

  try {
    const { serviceClient } = admin.context;
    const { data: userPage, error: usersError } =
      await serviceClient.auth.admin.listUsers({
        page: 1,
        perPage: 1000,
      });

    if (usersError) throw usersError;

    const { data: workspaces, error: workspacesError } = await serviceClient
      .from("workspaces")
      .select("id, name, type, created_by, created_at, workspace_settings(company_name, business_type)")
      .order("created_at", { ascending: false })
      .limit(500);

    if (workspacesError) throw workspacesError;

    const { data: memberships, error: membershipsError } = await serviceClient
      .from("workspace_members")
      .select("user_id, workspace_id, status")
      .neq("status", "Removed")
      .limit(5000);

    if (membershipsError) throw membershipsError;

    const workspaceCountByUser = new Map<string, number>();
    for (const membership of memberships ?? []) {
      if (!membership.user_id) continue;
      workspaceCountByUser.set(
        membership.user_id,
        (workspaceCountByUser.get(membership.user_id) ?? 0) + 1
      );
    }

    const workspaceMatches = (workspaces ?? []).filter((workspace) => {
      if (!query) return true;
      const settings = Array.isArray(workspace.workspace_settings)
        ? workspace.workspace_settings[0]
        : workspace.workspace_settings;

      return [
        workspace.id,
        workspace.name,
        workspace.type,
        settings?.company_name,
        settings?.business_type,
      ].some((value) => includesQuery(value, query));
    });

    const workspaceUserIds = new Set(
      (memberships ?? [])
        .filter((membership) =>
          workspaceMatches.some(
            (workspace) => workspace.id === membership.workspace_id
          )
        )
        .map((membership) => membership.user_id)
        .filter((userId): userId is string => Boolean(userId))
    );

    const users = (userPage.users as AuthUserSummary[])
      .filter((user) => {
        if (!query) return true;
        return (
          includesQuery(user.email, query) ||
          includesQuery(user.id, query) ||
          workspaceUserIds.has(user.id)
        );
      })
      .map((user) => ({
        id: user.id,
        email: user.email,
        createdAt: user.created_at,
        lastSignInAt: user.last_sign_in_at,
        workspaceCount: workspaceCountByUser.get(user.id) ?? 0,
      }));

    await logAdminAction(admin.context, "user_search", {
      metadata: {
        query,
        userResultCount: users.length,
        workspaceResultCount: workspaceMatches.length,
      },
    });

    return NextResponse.json({
      users,
      workspaces: workspaceMatches.map((workspace) => {
        const settings = Array.isArray(workspace.workspace_settings)
          ? workspace.workspace_settings[0]
          : workspace.workspace_settings;

        return {
          id: workspace.id,
          name: workspace.name,
          type: workspace.type,
          createdBy: workspace.created_by,
          createdAt: workspace.created_at,
          companyName: settings?.company_name ?? null,
          businessType: settings?.business_type ?? workspace.type,
        };
      }),
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
