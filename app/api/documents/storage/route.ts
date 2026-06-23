import { NextRequest, NextResponse } from "next/server";

import { canUseCloudStorage } from "@/lib/plans/capabilities";
import { jsonError, planUpgradeError, requireWorkspaceAccess } from "@/lib/services/routeProtection";
import { DOCUMENT_STORAGE_BUCKET } from "@/lib/storage/documents";

function validWorkspacePath(workspaceId: string, path: string) {
  return path.startsWith(`${workspaceId}/`) && !path.includes("..") && !path.includes("\\");
}

export async function POST(request: NextRequest) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return jsonError("Invalid document upload request.", 400);
  }

  const workspaceId = formData.get("workspaceId");
  const path = formData.get("path");
  const file = formData.get("file");
  if (typeof workspaceId !== "string" || typeof path !== "string" || !(file instanceof File)) {
    return jsonError("Workspace, path, and file are required.", 400);
  }

  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;
  if (!canUseCloudStorage(access.plan)) return planUpgradeError();
  if (!validWorkspacePath(workspaceId, path)) return jsonError("Invalid document storage path.", 400);

  const { error } = await access.serviceClient.storage
    .from(DOCUMENT_STORAGE_BUCKET)
    .upload(path, file, { contentType: file.type || undefined, upsert: false });
  if (error) return jsonError(error.message || "Unable to upload document.", 500);
  return NextResponse.json({ stored: true });
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? "";
  const path = request.nextUrl.searchParams.get("path") ?? "";
  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;
  if (!canUseCloudStorage(access.plan)) return planUpgradeError();
  if (!validWorkspacePath(workspaceId, path)) return jsonError("Invalid document storage path.", 400);

  const { data, error } = await access.serviceClient.storage
    .from(DOCUMENT_STORAGE_BUCKET)
    .createSignedUrl(path, 60);
  if (error || !data) return jsonError(error?.message || "Unable to create download link.", 500);
  return NextResponse.json({ url: data.signedUrl });
}

export async function DELETE(request: NextRequest) {
  let body: { workspaceId?: string; path?: string };
  try {
    body = (await request.json()) as { workspaceId?: string; path?: string };
  } catch {
    return jsonError("Invalid document deletion request.", 400);
  }

  const workspaceId = body.workspaceId ?? "";
  const path = body.path ?? "";
  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;
  if (!canUseCloudStorage(access.plan)) return planUpgradeError();
  if (!validWorkspacePath(workspaceId, path)) return jsonError("Invalid document storage path.", 400);

  const { error } = await access.serviceClient.storage
    .from(DOCUMENT_STORAGE_BUCKET)
    .remove([path]);
  if (error) return jsonError(error.message || "Unable to delete document file.", 500);
  return NextResponse.json({ deleted: true });
}
