"use client";

import {
  createContext,
  useContext,
  useMemo,
} from "react";
import {
  storageKeys,
  useStoredJsonState,
  useStoredStringState,
} from "@/lib/clientStorage";

export type Workspace = {
  id: string;
  name: string;
  type: string;
};

const defaultWorkspaces: Workspace[] = [
  {
    id: "landscaping",
    name: "Landscaping",
    type: "Landscaping",
  },
  {
    id: "snow-removal",
    name: "Thompson Snow Removal",
    type: "Snow Removal",
  },
  {
    id: "properties",
    name: "Thompson Properties",
    type: "Property Management",
  },
];

type WorkspaceContextValue = {
  workspaces: Workspace[];
  activeWorkspace: Workspace;
  setActiveWorkspace: (workspace: Workspace) => void;
  addWorkspace: (workspace: Workspace) => void;
};

const WorkspaceContext =
  createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [workspaces, setWorkspaces] = useStoredJsonState<Workspace[]>(
    storageKeys.workspaces,
    defaultWorkspaces
  );
  const [activeWorkspaceId, setActiveWorkspaceId] = useStoredStringState(
    storageKeys.activeWorkspace,
    defaultWorkspaces[0].id
  );

  const activeWorkspace =
    useMemo(
      () =>
        workspaces.find(
          (workspace) => workspace.id === activeWorkspaceId
        ) ?? workspaces[0] ?? defaultWorkspaces[0],
      [activeWorkspaceId, workspaces]
    );

  function addWorkspace(workspace: Workspace) {
    setWorkspaces((current) => [
      ...current,
      workspace,
    ]);

    setActiveWorkspaceId(workspace.id);
  }

  function setActiveWorkspace(workspace: Workspace) {
    setActiveWorkspaceId(workspace.id);
  }

  return (
    <WorkspaceContext.Provider
      value={{
        workspaces,
        activeWorkspace,
        setActiveWorkspace,
        addWorkspace,
      }}
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspace must be used inside WorkspaceProvider"
    );
  }

  return context;
}
