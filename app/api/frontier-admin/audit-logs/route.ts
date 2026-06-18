import { NextResponse } from "next/server";

import {
  requirePlatformAdmin,
  serverErrorResponse,
} from "@/lib/platformAdmin/server";

export async function GET() {
  const admin = await requirePlatformAdmin();
  if (!admin.ok) return admin.response;

  try {
    const { data, error } = await admin.context.serviceClient
      .from("admin_audit_logs")
      .select("id, admin_user_id, target_user_id, target_workspace_id, action, metadata, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) throw error;

    return NextResponse.json({ logs: data ?? [] });
  } catch (error) {
    return serverErrorResponse(error);
  }
}
