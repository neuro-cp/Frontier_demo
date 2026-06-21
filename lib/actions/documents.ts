import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";
import type { StoredDocument } from "@/lib/db/documents";

export type DocumentActionsRepository = {
  createDocument: (document: StoredDocument) => Promise<StoredDocument | null>;
  updateDocument: (document: StoredDocument) => Promise<StoredDocument | null>;
  deleteDocument: (documentId: string, workspaceId?: string) => Promise<boolean>;
};

function validateDocument(document: StoredDocument) {
  return {
    ...document,
    workspaceId: requireText(document.workspaceId, "Workspace"),
    name: requireText(document.name, "Document name"),
  };
}

export async function createDocumentAction(
  repository: DocumentActionsRepository,
  document: StoredDocument
): Promise<ActionResult<StoredDocument>> {
  try {
    const created = await repository.createDocument(validateDocument(document));
    return created ? ok(created) : fail("Unable to create document metadata.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create document metadata.");
  }
}

export async function updateDocumentAction(
  repository: DocumentActionsRepository,
  document: StoredDocument
): Promise<ActionResult<StoredDocument>> {
  try {
    requireText(document.id, "Document");
    const updated = await repository.updateDocument(validateDocument(document));
    return updated ? ok(updated) : fail("Unable to update document metadata.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update document metadata.");
  }
}

export async function deleteDocumentAction(
  repository: DocumentActionsRepository,
  documentId: string,
  workspaceId?: string
): Promise<ActionResult<boolean>> {
  try {
    const deleted = await repository.deleteDocument(
      requireText(documentId, "Document"),
      workspaceId
    );
    return deleted ? ok(true) : fail("Unable to delete document metadata.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete document metadata.");
  }
}

export const uploadDocumentMetadata = createDocumentAction;
export const updateDocumentMetadata = updateDocumentAction;
export const deleteDocumentMetadata = deleteDocumentAction;
