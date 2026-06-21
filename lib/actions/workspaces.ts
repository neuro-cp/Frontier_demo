import type { Workspace } from "@/components/WorkspaceContext";
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";

export type WorkspaceActionsRepository = {
  addWorkspace: (workspace: Workspace) => boolean | void | Promise<boolean | void>;
  updateWorkspace?: (workspace: Workspace) => Workspace | Promise<Workspace>;
  deleteWorkspace?: (workspaceId: string) => boolean | Promise<boolean>;
  setActiveWorkspace?: (workspace: Workspace) => void;
};

export async function createWorkspaceAction(
  repository: WorkspaceActionsRepository,
  workspace: Workspace
): Promise<ActionResult<Workspace>> {
  try {
    const normalizedWorkspace = {
      ...workspace,
      name: requireText(workspace.name, "Workspace name"),
      type: requireText(workspace.type, "Workspace type"),
    };
    await repository.addWorkspace(normalizedWorkspace);
    return ok(normalizedWorkspace);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to create workspace.");
  }
}

export async function updateWorkspaceAction(
  repository: WorkspaceActionsRepository,
  workspace: Workspace
): Promise<ActionResult<Workspace>> {
  try {
    const normalizedWorkspace = {
      ...workspace,
      name: requireText(workspace.name, "Workspace name"),
      type: requireText(workspace.type, "Workspace type"),
    };
    const updated = repository.updateWorkspace
      ? await repository.updateWorkspace(normalizedWorkspace)
      : normalizedWorkspace;
    return ok(updated);
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update workspace.");
  }
}

export async function deleteWorkspaceAction(
  repository: WorkspaceActionsRepository,
  workspaceId: string
): Promise<ActionResult<boolean>> {
  try {
    if (!repository.deleteWorkspace) return fail("Workspace deletion is not available here.");
    const deleted = await repository.deleteWorkspace(requireText(workspaceId, "Workspace"));
    return deleted ? ok(true) : fail("Unable to delete workspace.");
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to delete workspace.");
  }
}

export const createWorkspace = createWorkspaceAction;
export const updateWorkspace = updateWorkspaceAction;
export const deleteWorkspace = deleteWorkspaceAction;
