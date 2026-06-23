import { NextResponse } from "next/server";

import { isUuid } from "@/lib/db/ids";
import { jsonError, requireWorkspaceAccess } from "@/lib/services/routeProtection";

type MaterialRow = { name?: string; quantity?: number; notes?: string };

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as {
    workspaceId?: string;
    jobId?: string;
    mode?: string;
    materials?: MaterialRow[];
    sourceDocumentId?: string;
    reviewDraftId?: string;
  } | null;

  if (!body?.workspaceId || !isUuid(body.workspaceId)) return jsonError("Workspace is required.", 400);
  if (!body.jobId || !isUuid(body.jobId)) return jsonError("Choose a job for these materials.", 400);
  if (!Array.isArray(body.materials) || body.materials.length === 0) return jsonError("At least one material is required.", 400);
  if (body.sourceDocumentId && !isUuid(body.sourceDocumentId)) return jsonError("Source document is invalid.", 400);
  if (body.reviewDraftId && !isUuid(body.reviewDraftId)) return jsonError("Review draft is invalid.", 400);

  const materials = body.materials.map((material) => ({
    name: typeof material.name === "string" ? material.name.trim() : "",
    quantity: typeof material.quantity === "number" ? material.quantity : 0,
    notes: typeof material.notes === "string" ? material.notes.trim() : "",
  }));
  if (materials.some((material) => !material.name || material.quantity <= 0)) {
    return jsonError("Each material requires a name and positive quantity.", 400);
  }

  const auth = await requireWorkspaceAccess(body.workspaceId);
  if (!auth.ok) return auth.response;

  const { data, error } = await auth.serviceClient.rpc("create_material_allocation_draft", {
    target_workspace_id: body.workspaceId,
    target_job_id: body.jobId,
    allocation_mode: ["Append", "Merge", "Replace"].includes(body.mode ?? "") ? body.mode : "Append",
    material_rows: materials,
    source_document_id: body.sourceDocumentId || null,
    source_review_draft_id: body.reviewDraftId || null,
  });

  if (error) return jsonError(error.message || "Unable to save material allocation draft.", 400);
  return NextResponse.json({ allocations: data ?? [] });
}
