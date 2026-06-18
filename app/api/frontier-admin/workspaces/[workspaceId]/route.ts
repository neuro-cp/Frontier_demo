import { NextRequest, NextResponse } from "next/server";

import {
  logAdminAction,
  requirePlatformAdmin,
  serverErrorResponse,
} from "@/lib/platformAdmin/server";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ workspaceId: string }> }
) {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;

  const { workspaceId } = await params;

  try {
    const { serviceClient } = admin.context;
    const { data: workspace, error: workspaceError } = await serviceClient
      .from("workspaces")
      .select("id, name, type, created_by, created_at, updated_at")
      .eq("id", workspaceId)
      .single();

    if (workspaceError || !workspace) {
      return NextResponse.json(
        { error: "Workspace not found." },
        { status: 404 }
      );
    }

    const [
      membersResult,
      clientsResult,
      jobsResult,
      invoicesResult,
      inventoryResult,
      documentsResult,
      routePlansResult,
      settingsResult,
    ] = await Promise.all([
      serviceClient
        .from("workspace_members")
        .select("id, user_id, role, status, invited_email, created_at, profiles(email, display_name)")
        .eq("workspace_id", workspaceId)
        .neq("status", "Removed")
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("clients")
        .select("id, name, status, email, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("jobs")
        .select("id, name, status, client_name_snapshot, scheduled_date, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("invoices")
        .select("id, invoice_number, status, bill_to_name, bill_to_email, invoice_date, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("inventory_items")
        .select("id, name, current_qty, target_qty, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("documents")
        .select("id, name, file_name, status, extraction_status, detected_type, uploaded_by, mime_type, size_bytes, storage_bucket, storage_path, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("route_plans")
        .select("id, name, total_distance_meters, total_duration_seconds, google_maps_url, created_at")
        .eq("workspace_id", workspaceId)
        .order("created_at", { ascending: false })
        .limit(100),
      serviceClient
        .from("workspace_settings")
        .select("workspace_id, company_name, business_type, workspace_nickname, company_email, created_at, updated_at")
        .eq("workspace_id", workspaceId)
        .maybeSingle(),
    ]);

    const results = [
      membersResult,
      clientsResult,
      jobsResult,
      invoicesResult,
      inventoryResult,
      documentsResult,
      routePlansResult,
      settingsResult,
    ];
    const failed = results.find((result) => result.error);
    if (failed?.error) throw failed.error;

    await logAdminAction(admin.context, "view_workspace", {
      targetUserId: workspace.created_by,
      targetWorkspaceId: workspaceId,
    });

    return NextResponse.json({
      workspace,
      settings: settingsResult.data,
      members: membersResult.data ?? [],
      clients: clientsResult.data ?? [],
      jobs: jobsResult.data ?? [],
      invoices: invoicesResult.data ?? [],
      inventory: inventoryResult.data ?? [],
      documents: documentsResult.data ?? [],
      routePlans: routePlansResult.data ?? [],
    });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
