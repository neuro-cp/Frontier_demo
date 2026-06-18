import type { Workspace } from "@/components/WorkspaceContext";

export function getWorkspaceDisplayName(workspace: Workspace) {
  if (
    workspace.id === "local-workspace" ||
    workspace.id === "create-workspace"
  ) {
    return "Create Workspace";
  }

  return workspace.name;
}
