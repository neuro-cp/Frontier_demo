import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

type CreateWorkspaceRequest = {
  id?: string;
  name?: string;
  type?: string;
};

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required to create a workspace.", 401);
  }

  let body: CreateWorkspaceRequest;
  try {
    body = (await request.json()) as CreateWorkspaceRequest;
  } catch {
    return jsonError("Invalid workspace request.", 400);
  }

  const workspaceId = body.id || crypto.randomUUID();
  const workspaceName = body.name?.trim();
  const workspaceType = body.type?.trim() || "Other";

  if (!workspaceName) {
    return jsonError("Workspace name is required.", 400);
  }

  const serviceClient = createServiceRoleClient();

  const { data: workspace, error: workspaceError } = await serviceClient
    .from("workspaces")
    .insert({
      id: workspaceId,
      name: workspaceName,
      type: workspaceType,
      created_by: user.id,
    })
    .select("id, name, type")
    .single();

  if (workspaceError || !workspace) {
    return jsonError(workspaceError?.message || "Unable to create workspace.", 500);
  }

  const { error: memberError } = await serviceClient
    .from("workspace_members")
    .insert({
      workspace_id: workspace.id,
      user_id: user.id,
      role: "Owner",
      status: "Active",
    });

  if (memberError) {
    await serviceClient.from("workspaces").delete().eq("id", workspace.id);
    return jsonError(memberError.message || "Unable to create owner membership.", 500);
  }

  const { error: settingsError } = await serviceClient
    .from("workspace_settings")
    .insert({
      workspace_id: workspace.id,
      workspace_nickname: workspace.name,
      business_type: workspace.type,
    });

  if (settingsError) {
    await serviceClient.from("workspaces").delete().eq("id", workspace.id);
    return jsonError(settingsError.message || "Unable to initialize workspace settings.", 500);
  }

  return NextResponse.json({ workspace });
}

export async function GET() {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required to load workspaces.", 401);
  }

  const serviceClient = createServiceRoleClient();

  const { data, error } = await serviceClient
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, name, type)")
    .eq("user_id", user.id)
    .eq("status", "Active")
    .order("created_at", { ascending: false });

  if (error) {
    return jsonError(error.message || "Unable to load workspaces.", 500);
  }

  const workspaces = (data ?? [])
    .map((row) => {
      const workspace = Array.isArray(row.workspaces)
        ? row.workspaces[0]
        : row.workspaces;
      return workspace
        ? { id: workspace.id, name: workspace.name, type: workspace.type, role: row.role }
        : null;
    })
    .filter(Boolean);

  return NextResponse.json({ workspaces });
}

export async function DELETE(request: NextRequest) {
  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return jsonError("Sign in required to delete a workspace.", 401);
  }

  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return jsonError("Workspace is required.", 400);

  const serviceClient = createServiceRoleClient();
  const { data: membership, error: membershipError } = await serviceClient
    .from("workspace_members")
    .select("id, role, status")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (membershipError || !membership) {
    return jsonError("You do not have access to this workspace.", 403);
  }

  if (membership.role !== "Owner") {
    return jsonError("Only Owners can delete a workspace.", 403);
  }

  const { error } = await serviceClient
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) return jsonError(error.message || "Unable to delete workspace.", 500);

  return NextResponse.json({ deleted: true });
}
