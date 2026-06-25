import { NextRequest, NextResponse } from "next/server";

import { createServiceRoleClient } from "@/lib/platformAdmin/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId");
  if (!workspaceId) return jsonError("Workspace is required.", 400);

  const userClient = await createServerSupabaseClient();
  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) return jsonError("Sign in required.", 401);

  const serviceClient = createServiceRoleClient();
  const { data: member, error: memberError } = await serviceClient
    .from("workspace_members")
    .select("id, role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", user.id)
    .eq("status", "Active")
    .maybeSingle();

  if (memberError) return jsonError(memberError.message, 500);
  if (!member) return jsonError("Access denied.", 403);

  const { data, error } = await serviceClient
    .from("estimates")
    .select(
      "id, workspace_id, client_id, job_id, estimate_number, estimate_date, status, bill_to_name, bill_to_email, converted_invoice_id, approved_at, rejected_at, created_at, estimate_line_items(id, description, quantity, unit_price_cents, sort_order)"
    )
    .eq("workspace_id", workspaceId)
    .order("estimate_date", { ascending: false });

  if (error) return jsonError(error.message || "Unable to load estimates.", 500);

  return NextResponse.json({
    items: data ?? [],
    canManage: member.role === "Owner" || member.role === "Manager",
  });
}
