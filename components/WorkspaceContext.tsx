"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

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
  const [workspaces, setWorkspaces] =
    useState<Workspace[]>(defaultWorkspaces);

  const [activeWorkspace, setActiveWorkspace] =
    useState(defaultWorkspaces[0]);

  useEffect(() => {
    const savedWorkspaces =
      localStorage.getItem("frontier-workspaces");

    const savedActiveWorkspace =
      localStorage.getItem("frontier-active-workspace");

    if (savedWorkspaces) {
      try {
        const parsedWorkspaces: Workspace[] =
          JSON.parse(savedWorkspaces);

        setWorkspaces(parsedWorkspaces);

        if (savedActiveWorkspace) {
          const foundWorkspace =
            parsedWorkspaces.find(
              (workspace) =>
                workspace.id === savedActiveWorkspace
            );

          if (foundWorkspace) {
            setActiveWorkspace(foundWorkspace);
          }
        }
      } catch (error) {
        console.error(
          "Failed to load workspaces",
          error
        );
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "frontier-workspaces",
      JSON.stringify(workspaces)
    );
  }, [workspaces]);

  useEffect(() => {
    localStorage.setItem(
      "frontier-active-workspace",
      activeWorkspace.id
    );
  }, [activeWorkspace]);

  function addWorkspace(workspace: Workspace) {
    setWorkspaces((current) => [
      ...current,
      workspace,
    ]);

    setActiveWorkspace(workspace);
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