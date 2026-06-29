import { NextRequest, NextResponse } from "next/server";

import { canUseCloudStorage } from "@/lib/plans/capabilities";
import {
  canManageWorkspaceData,
  jsonError,
  managerRequiredError,
  requireWorkspaceAccess,
} from "@/lib/services/routeProtection";
import {
  getR2BucketName,
} from "@/lib/storage/r2Server";
import {
  createDefaultDocumentStorageProvider,
  createStoredDocumentStorageProvider,
} from "@/lib/storage/documentStorageProviderServer";

function validWorkspacePath(workspaceId: string, path: string) {
  return path.startsWith(`${workspaceId}/`) && !path.includes("..") && !path.includes("\\");
}

function cloudStorageUpgradeError() {
  return NextResponse.json(
    {
      error:
        "Cloud document storage isn't included with your current plan. Your documents can still remain available locally on this device. Upgrade any time to securely store and sync documents in the cloud across your devices.",
      code: "cloud_storage_upgrade_required",
    },
    { status: 402 }
  );
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
  if (!canManageWorkspaceData(access.role)) return managerRequiredError("upload documents");
  if (!canUseCloudStorage(access.plan)) return cloudStorageUpgradeError();
  if (!validWorkspacePath(workspaceId, path)) return jsonError("Invalid document storage path.", 400);

  try {
    const provider = createDefaultDocumentStorageProvider({ serviceClient: access.serviceClient });
    await provider.upload({ key: path, file });
    return NextResponse.json({
      stored: true,
      provider: provider.name,
      bucket: provider.name === "r2" ? getR2BucketName() : "workspace-documents",
    });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to upload document.", 500);
  }
}

export async function GET(request: NextRequest) {
  const workspaceId = request.nextUrl.searchParams.get("workspaceId") ?? "";
  const path = request.nextUrl.searchParams.get("path") ?? "";
  const bucket = request.nextUrl.searchParams.get("bucket");
  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;
  if (!canManageWorkspaceData(access.role)) return managerRequiredError("download documents");
  if (!canUseCloudStorage(access.plan)) return cloudStorageUpgradeError();
  if (!validWorkspacePath(workspaceId, path)) return jsonError("Invalid document storage path.", 400);

  try {
    const provider = createStoredDocumentStorageProvider({
      serviceClient: access.serviceClient,
      bucket,
    });
    const url = await provider.getSignedUrl({ key: path });
    return NextResponse.json({ url, provider: provider.name });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to create download link.", 500);
  }
}

export async function DELETE(request: NextRequest) {
  let body: { workspaceId?: string; path?: string; bucket?: string | null };
  try {
    body = (await request.json()) as { workspaceId?: string; path?: string };
  } catch {
    return jsonError("Invalid document deletion request.", 400);
  }

  const workspaceId = body.workspaceId ?? "";
  const path = body.path ?? "";
  const bucket = body.bucket ?? null;
  const access = await requireWorkspaceAccess(workspaceId);
  if (!access.ok) return access.response;
  if (!canManageWorkspaceData(access.role)) return managerRequiredError("delete documents");
  if (!canUseCloudStorage(access.plan)) return cloudStorageUpgradeError();
  if (!validWorkspacePath(workspaceId, path)) return jsonError("Invalid document storage path.", 400);

  try {
    const provider = createStoredDocumentStorageProvider({
      serviceClient: access.serviceClient,
      bucket,
    });
    await provider.delete({ key: path });
    return NextResponse.json({ deleted: true, provider: provider.name });
  } catch (error) {
    return jsonError(error instanceof Error ? error.message : "Unable to delete document file.", 500);
  }
}
