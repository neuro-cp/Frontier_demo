import type { Workspace } from "@/components/WorkspaceContext";
import { fail, ok, requireText, type ActionResult } from "@/lib/actions/shared";

export type WorkspaceActionsRepository = {
  addWorkspace: (workspace: Workspace) => void | Promise<void>;
  setActiveWorkspace?: (workspace: Workspace) => void;
};

export async function createWorkspace(
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

export async function updateWorkspace(
  workspace: Workspace
): Promise<ActionResult<Workspace>> {
  // TODO: Wire this to a DB-backed workspace repository when workspace editing is centralized.
  try {
    return ok({
      ...workspace,
      name: requireText(workspace.name, "Workspace name"),
      type: requireText(workspace.type, "Workspace type"),
    });
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Unable to update workspace.");
  }
}
